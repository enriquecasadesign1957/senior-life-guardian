import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import {
  isTwilioConfigured,
  twilioPost,
  twilioResourceSid,
  twilioSmsFrom,
  twilioVoiceFrom,
  twilioWhatsappFrom,
} from "@/lib/twilio";
import {
  isSubscriptionServiceAllowed,
  subscriptionBlockedMessage,
} from "@/lib/subscription-access";

// Acepta el formato { lat, lng } y también el formato nativo de
// @capacitor/geolocation: { latitude, longitude, accuracy } o
// { coords: { latitude, longitude, accuracy } }. Mapeamos todo a {lat,lng}.
const GpsInput = z
  .any()
  .transform((raw) => {
    if (raw == null) return null;
    const src: any =
      raw && typeof raw === "object" && raw.coords && typeof raw.coords === "object"
        ? raw.coords
        : raw;
    const lat =
      typeof src?.lat === "number"
        ? src.lat
        : typeof src?.latitude === "number"
          ? src.latitude
          : typeof src?.lat === "string"
            ? parseFloat(src.lat)
            : typeof src?.latitude === "string"
              ? parseFloat(src.latitude)
              : NaN;
    const lng =
      typeof src?.lng === "number"
        ? src.lng
        : typeof src?.longitude === "number"
          ? src.longitude
          : typeof src?.lon === "number"
            ? src.lon
            : typeof src?.lng === "string"
              ? parseFloat(src.lng)
              : typeof src?.longitude === "string"
                ? parseFloat(src.longitude)
                : typeof src?.lon === "string"
                  ? parseFloat(src.lon)
                  : NaN;
    const accRaw = src?.accuracy;
    const accuracy =
      typeof accRaw === "number"
        ? accRaw
        : typeof accRaw === "string"
          ? parseFloat(accRaw)
          : undefined;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng, accuracy: Number.isFinite(accuracy as number) ? (accuracy as number) : undefined };
  })
  .nullable()
  .optional();

const Schema = z.object({
  signupId: z.string().uuid(),
  gps: GpsInput,
  /** Coordenadas GPS planas (alternativa a `gps`). */
  gpsLat: z.number().finite().optional(),
  gpsLng: z.number().finite().optional(),
  /** Modo entrenamiento: no llama a Twilio (sin costo). */
  trainingMode: z.boolean().optional().default(false),
});

const MAX_INITIAL_CONTACTS = 3;
/** SMS inmediato; WhatsApp 10 s después. */
const WHATSAPP_CASCADE_DELAY_MS = 10_000;
/** Llamada 10 s después del envío de WhatsApp si no hay confirmación. */
const VOICE_ESCALATION_AFTER_WHATSAPP_MS = 10_000;

const ALGORITHM_ID = "ecosystem_v3_cascade";

function twilioStatusCallbackUrl(alertId: string, channel: "sms" | "whatsapp"): string {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  return `${base}/api/public/twilio-status-callback?alertId=${encodeURIComponent(alertId)}&channel=${channel}`;
}

type ResolvedGps = {
  lat: number;
  lng: number;
  accuracy?: number;
  source: "device" | "params";
};

function resolveGpsFromInput(data: z.infer<typeof Schema>): ResolvedGps | null {
  if (data.gps) {
    return {
      lat: data.gps.lat,
      lng: data.gps.lng,
      accuracy: data.gps.accuracy,
      source: "device",
    };
  }
  if (
    data.gpsLat != null &&
    data.gpsLng != null &&
    data.gpsLat >= -90 &&
    data.gpsLat <= 90 &&
    data.gpsLng >= -180 &&
    data.gpsLng <= 180
  ) {
    return { lat: data.gpsLat, lng: data.gpsLng, source: "params" };
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type AlertEngagementRow = {
  acknowledged_at: string | null;
  metadata: Record<string, unknown> | null;
};

function isAlertEngagedFromRow(row: AlertEngagementRow | null): boolean {
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return typeof meta.whatsapp_read_at === "string" && meta.whatsapp_read_at.length > 0;
}

async function getAlertEngagement(logId: string): Promise<AlertEngagementRow | null> {
  const { data: row } = await supabaseAdmin
    .from("alert_logs")
    .select("acknowledged_at, metadata")
    .eq("id", logId)
    .maybeSingle();
  return (row as AlertEngagementRow | null) ?? null;
}

async function isAlertEngaged(logId: string): Promise<boolean> {
  return isAlertEngagedFromRow(await getAlertEngagement(logId));
}




function normalizePhone(raw: string): string | null {
  const trimmed = (raw ?? "").replace(/[^\d+]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`;
  return `+${trimmed}`;
}

type ChannelResult = {
  channel: "whatsapp" | "sms" | "call";
  to: string;
  status: "sent" | "failed" | "skipped";
  sid?: string | null;
  error?: string | null;
  event: string;
  at: string;
};

type EmergencyContactRow = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string | null;
  parentesco: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
};

/** Destinatario activo de emergencia (fuente: emergency_contacts). */
type EmergencyRecipient = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
  parentesco: string;
  /** E.164 normalizado para SMS y llamadas (compat. envío actual). */
  phone: string;
  /** E.164 normalizado para WhatsApp (fallback a telefono). */
  whatsappPhone: string;
};

function toEmergencyRecipient(row: EmergencyContactRow): EmergencyRecipient | null {
  const phone = normalizePhone(row.telefono);
  if (!phone) return null;

  const whatsapp = row.whatsapp ?? row.telefono;
  const whatsappPhone = normalizePhone(whatsapp);
  if (!whatsappPhone) return null;

  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    whatsapp,
    recibe_sms: row.recibe_sms,
    recibe_whatsapp: row.recibe_whatsapp,
    recibe_llamada: row.recibe_llamada,
    parentesco: row.parentesco,
    phone,
    whatsappPhone,
  };
}

/**
 * Algoritmo de emergencia — cascada:
 *  Fase 1: SMS inmediato (máx. 3 contactos activos por prioridad).
 *  Fase 2: WhatsApp siempre 10 s después del SMS (aunque ya haya confirmación por SMS).
 *  Fase 3: Llamada 10 s después del WhatsApp solo si no hubo confirmación ni lectura de WA.
 * Registra cada canal en alert_logs.
 */
export const sendEmergencyAlert = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    const waFrom = twilioWhatsappFrom();
    const smsFrom = twilioSmsFrom();
    const voiceFrom = twilioVoiceFrom();


    // Resolver usuario + familiares
    const { data: user, error: userErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id, nombre, telefono, subscription_status")
      .eq("id", data.signupId)
      .maybeSingle();

    if (userErr || !user) {
      return { ok: false, error: "user_not_found", results: [] as ChannelResult[] };
    }

    if (!data.trainingMode && !isSubscriptionServiceAllowed(user.subscription_status)) {
      return {
        ok: false,
        error: "subscription_inactive",
        message: subscriptionBlockedMessage(user.subscription_status),
        results: [] as ChannelResult[],
      };
    }

    const extendedContacts = await supabaseAdmin
      .from("emergency_contacts")
      .select(
        "id, nombre, telefono, whatsapp, parentesco, recibe_sms, recibe_whatsapp, recibe_llamada",
      )
      .eq("contract_signup_id", data.signupId)
      .eq("activo", true)
      .order("prioridad", { ascending: true })
      .order("created_at", { ascending: true });

    let contactRows = extendedContacts.data;
    if (extendedContacts.error) {
      const missingColumn = /column .* does not exist/i.test(extendedContacts.error.message ?? "");
      if (missingColumn) {
        const basicContacts = await supabaseAdmin
          .from("emergency_contacts")
          .select("id, nombre, telefono, parentesco")
          .eq("contract_signup_id", data.signupId)
          .order("created_at", { ascending: true });
        contactRows = (basicContacts.data ?? []).map((row) => ({
          ...row,
          whatsapp: null,
          recibe_sms: true,
          recibe_whatsapp: true,
          recibe_llamada: true,
        }));
        if (basicContacts.error) {
          console.error("[sendEmergencyAlert] emergency_contacts:", basicContacts.error.message);
        }
      } else {
        console.error("[sendEmergencyAlert] emergency_contacts:", extendedContacts.error.message);
      }
    }

    const recipients: EmergencyRecipient[] = (contactRows ?? [])
      .map((row) => toEmergencyRecipient(row as EmergencyContactRow))
      .filter((r): r is EmergencyRecipient => r !== null);

    const ts = new Date();
    const timestamp = ts.toLocaleString("es-CL", { timeZone: "America/Santiago" });
    const resolvedGps = resolveGpsFromInput(data);
    const topContacts = recipients.slice(0, MAX_INITIAL_CONTACTS);
    const callEscalationContacts = recipients.filter((r) => r.recibe_llamada);
    const mapsLink = resolvedGps
      ? `https://maps.google.com/?q=${resolvedGps.lat},${resolvedGps.lng}`
      : null;

    // Acknowledgement token (link de un solo uso, expira en 24h)
    const ackToken = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      .replace(/-/g, "") + Math.random().toString(36).slice(2, 10);
    const ackExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const ackUrl = `https://alarmaseniorsafe.cl/familia/ack/${ackToken}`;

    const locationBlock = mapsLink
      ? `📍 Ubicación (GPS preciso):\n${mapsLink}`
      : `📍 Ubicación: el usuario activó la alerta, pero el GPS del celular no se pudo sincronizar a tiempo. Por favor contáctalo de inmediato.`;

    const textMessage =
      `🚨 URGENTE ALERTA SENIOR\n\n` +
      `${user.nombre} necesita ayuda.\n\n` +
      `${locationBlock}\n\n` +
      `⏰ Hora:\n${timestamp}\n\n` +
      `Por favor contacta inmediatamente al usuario.\n\n` +
      `Confirma que recibiste esta alerta:\n${ackUrl}`;

    const voiceText =
      `Urgente. Alerta Senior. ${user.nombre} necesita ayuda inmediata. Repito: Urgente. Alerta Senior. ${user.nombre} necesita ayuda inmediata.`;
    const twiml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<Response><Pause length="1"/>` +
      `<Say language="es-MX" voice="Polly.Mia">${voiceText}</Say>` +
      `<Pause length="1"/>` +
      `<Say language="es-MX" voice="Polly.Mia">${voiceText}</Say>` +
      `</Response>`;


    // Crear log inicial (pending)
    const { data: logRow } = await supabaseAdmin
      .from("alert_logs")
      .insert({
        contract_signup_id: user.id,
        event_type: "emergency_pressed",
        status: "pending",
        gps_lat: resolvedGps?.lat ?? null,
        gps_lng: resolvedGps?.lng ?? null,
        gps_accuracy: resolvedGps?.accuracy ?? null,
        recipients: recipients.map((r) => ({ id: r.id, nombre: r.nombre, telefono: r.phone, parentesco: r.parentesco })),
        metadata: {
          maps_link: mapsLink,
          timestamp,
          ack_url: ackUrl,
          gps_source: resolvedGps?.source ?? "unavailable",
          algorithm: ALGORITHM_ID,
          max_initial_contacts: MAX_INITIAL_CONTACTS,
          cascade: {
            whatsapp_delay_ms: WHATSAPP_CASCADE_DELAY_MS,
            voice_delay_after_whatsapp_ms: VOICE_ESCALATION_AFTER_WHATSAPP_MS,
          },
        },


        acknowledgement_token: ackToken,
        acknowledgement_expires_at: ackExpiresAt,
      } as never)
      .select("id")
      .single();

    const results: ChannelResult[] = [];

    if (data.trainingMode) {
      const baseMs = Date.now();
      const simAt = (offsetMs: number) => new Date(baseMs + offsetMs).toISOString();
      for (const c of topContacts) {
        if (c.recibe_sms) {
          results.push({ channel: "sms", to: c.phone, status: "sent", sid: "TRAINING_SIM", error: null, event: "sms_simulated", at: simAt(0) });
        }
      }
      for (const c of topContacts) {
        if (c.recibe_whatsapp) {
          results.push({ channel: "whatsapp", to: c.whatsappPhone, status: "sent", sid: "TRAINING_SIM", error: null, event: "whatsapp_simulated", at: simAt(WHATSAPP_CASCADE_DELAY_MS) });
        }
      }
      for (const c of callEscalationContacts) {
        if (c.recibe_llamada) {
          results.push({ channel: "call", to: c.phone, status: "sent", sid: "TRAINING_SIM", error: null, event: "call_simulated", at: simAt(WHATSAPP_CASCADE_DELAY_MS + VOICE_ESCALATION_AFTER_WHATSAPP_MS) });
        }
      }
      if (recipients.length === 0) {
        results.push(
          { channel: "whatsapp", to: "-", status: "skipped", error: "no_recipients", event: "training_no_recipients", at: simulatedAt },
        );
      }

      const finalStatus =
        recipients.length === 0 ? "no_recipients" : "simulated";

      if (logRow?.id) {
        await supabaseAdmin
          .from("alert_logs")
          .update({
            event_type: "training_simulation",
            status: finalStatus,
            metadata: {
              maps_link: mapsLink,
              timestamp,
              training: true,
              results,
              message: "Entrenamiento: cascada SMS → WhatsApp (+10s) → llamada (+10s) sin Twilio",
              algorithm: ALGORITHM_ID,
            },
            error_message: null,
          })
          .eq("id", logRow.id);
      }

      return {
        ok: true,
        status: finalStatus,
        training: true,
        recipients: recipients.length,
        results,
      };
    }

    if (!isTwilioConfigured()) {
      const err = "twilio_not_configured";
      const at = new Date().toISOString();
      results.push({ channel: "whatsapp", to: "-", status: "failed", error: err, event: "whatsapp_failed", at });
      results.push({ channel: "sms", to: "-", status: "failed", error: err, event: "sms_failed", at });
      results.push({ channel: "call", to: "-", status: "failed", error: err, event: "call_failed", at });
    } else {
      const nowIso = () => new Date().toISOString();

      const pushSkipped = (
        channel: ChannelResult["channel"],
        to: string,
        error: string,
        event: string,
      ) => {
        results.push({ channel, to, status: "skipped", error, event, at: nowIso() });
      };

      const alertId = logRow?.id ?? null;

      // ── FASE 1: SMS inmediato (máx. 3 contactos) ──
      const smsTasks: Promise<ChannelResult>[] = [];

      for (const c of topContacts) {
        if (c.recibe_sms) {
          if (!smsFrom) {
            pushSkipped("sms", c.phone, "missing TWILIO_SMS_FROM", "sms_skipped");
          } else {
            const smsBody: Record<string, string> = { To: c.phone, From: smsFrom, Body: textMessage };
            if (alertId) {
              smsBody.StatusCallback = twilioStatusCallbackUrl(alertId, "sms");
            }
            smsTasks.push(
              twilioPost("/Messages.json", smsBody)
                .then((r) => ({
                  channel: "sms" as const,
                  to: c.phone,
                  status: r.ok ? ("sent" as const) : ("failed" as const),
                  sid: twilioResourceSid(r.data),
                  error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
                  event: r.ok ? "sms_sent" : "sms_failed",
                  at: nowIso(),
                }))
                .catch((e: unknown) => ({
                  channel: "sms" as const,
                  to: c.phone,
                  status: "failed" as const,
                  error: String((e as Error)?.message ?? e),
                  event: "sms_failed",
                  at: nowIso(),
                })),
            );
          }
        } else {
          pushSkipped("sms", c.phone, "recibe_sms_disabled", "sms_skipped");
        }
      }

      const smsSettled = await Promise.allSettled(smsTasks);
      for (const outcome of smsSettled) {
        if (outcome.status === "fulfilled") results.push(outcome.value);
      }

      if (alertId) {
        const smsSent = results.filter((r) => r.channel === "sms" && r.status === "sent");
        await supabaseAdmin
          .from("alert_logs")
          .update({
            status: smsSent.length > 0 ? "partial" : "pending",
            metadata: {
              maps_link: mapsLink,
              timestamp,
              ack_url: ackUrl,
              gps_source: resolvedGps?.source ?? "unavailable",
              algorithm: ALGORITHM_ID,
              phase: "sms_complete",
              sms_contacts: topContacts.map((contact) => contact.id),
              results: [...results],
            },
          } as never)
          .eq("id", alertId);
      }

      await sleep(WHATSAPP_CASCADE_DELAY_MS);

      // ── FASE 2: WhatsApp siempre 10 s después del SMS ──
      const waTasks: Promise<ChannelResult>[] = [];

      for (const c of topContacts) {
        if (c.recibe_whatsapp) {
          const waBody: Record<string, string> = {
            To: `whatsapp:${c.whatsappPhone}`,
            From: waFrom,
            Body: textMessage,
          };
          if (alertId) {
            waBody.StatusCallback = twilioStatusCallbackUrl(alertId, "whatsapp");
          }
          waTasks.push(
            twilioPost("/Messages.json", waBody)
              .then((r) => ({
                channel: "whatsapp" as const,
                to: c.whatsappPhone,
                status: r.ok ? ("sent" as const) : ("failed" as const),
                sid: twilioResourceSid(r.data),
                error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
                event: r.ok ? "whatsapp_sent" : "whatsapp_failed",
                at: nowIso(),
              }))
              .catch((e: unknown) => ({
                channel: "whatsapp" as const,
                to: c.whatsappPhone,
                status: "failed" as const,
                error: String((e as Error)?.message ?? e),
                event: "whatsapp_failed",
                at: nowIso(),
              })),
          );
        } else {
          pushSkipped("whatsapp", c.whatsappPhone, "recibe_whatsapp_disabled", "whatsapp_skipped");
        }
      }

      const waSettled = await Promise.allSettled(waTasks);
      for (const outcome of waSettled) {
        if (outcome.status === "fulfilled") results.push(outcome.value);
      }

      if (alertId) {
        await supabaseAdmin
          .from("alert_logs")
          .update({
            metadata: {
              maps_link: mapsLink,
              timestamp,
              ack_url: ackUrl,
              gps_source: resolvedGps?.source ?? "unavailable",
              algorithm: ALGORITHM_ID,
              phase: "whatsapp_complete",
              sms_contacts: topContacts.map((contact) => contact.id),
              whatsapp_contacts: topContacts.map((contact) => contact.id),
              results: [...results],
            },
          } as never)
          .eq("id", alertId);
      }

      // ── FASE 3: llamada solo si no hubo confirmación ni lectura de WhatsApp ──
      await sleep(VOICE_ESCALATION_AFTER_WHATSAPP_MS);

      const engagedBeforeCalls = alertId ? await isAlertEngaged(alertId) : false;

      if (engagedBeforeCalls) {
        pushSkipped("call", "-", "engaged_before_escalation", "call_escalation_skipped");
      } else if (!voiceFrom) {
        for (const c of callEscalationContacts) {
          pushSkipped("call", c.phone, "missing TWILIO_VOICE_FROM", "call_skipped");
        }
      } else if (callEscalationContacts.length === 0) {
        pushSkipped("call", "-", "no_call_recipients", "call_escalation_skipped");
      } else {
        for (const c of callEscalationContacts) {
          if (alertId && (await isAlertEngaged(alertId))) {
            pushSkipped("call", c.phone, "engaged_during_escalation", "call_escalation_stopped");
            break;
          }

          try {
            const r = await twilioPost("/Calls.json", { To: c.phone, From: voiceFrom, Twiml: twiml });
            results.push({
              channel: "call",
              to: c.phone,
              status: r.ok ? "sent" : "failed",
              sid: twilioResourceSid(r.data),
              error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
              event: r.ok ? "call_started" : "call_failed",
              at: nowIso(),
            });
          } catch (e: unknown) {
            results.push({
              channel: "call",
              to: c.phone,
              status: "failed",
              error: String((e as Error)?.message ?? e),
              event: "call_failed",
              at: nowIso(),
            });
          }

          if (alertId && (await isAlertEngaged(alertId))) {
            break;
          }
        }
      }
    }



    const anySent = results.some((r) => r.status === "sent");
    const finalStatus = recipients.length === 0
      ? "no_recipients"
      : anySent
        ? (results.some((r) => r.status === "failed") ? "partial" : "delivered")
        : "failed";

    // Actualizar log con resultados finales
    if (logRow?.id) {
      await supabaseAdmin
        .from("alert_logs")
        .update({
          status: finalStatus,
          metadata: {
            maps_link: mapsLink,
            timestamp,
            ack_url: ackUrl,
            gps_source: resolvedGps?.source ?? "unavailable",
            algorithm: ALGORITHM_ID,
            phase: "complete",
            sms_contacts: topContacts.map((c) => c.id),
            whatsapp_contacts: topContacts.map((c) => c.id),
            call_escalation_contacts: callEscalationContacts.map((c) => c.id),
            results,
            from: { waFrom, smsFrom, voiceFrom },
          },
          error_message: anySent ? null : results.map((r) => r.error).filter(Boolean).join(" | ").slice(0, 500) || null,
        })
        .eq("id", logRow.id);
    }

    return {
      ok: anySent || recipients.length === 0,
      status: finalStatus,
      recipients: recipients.length,
      results,
    };
  });
