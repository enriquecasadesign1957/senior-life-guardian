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
} from "@/lib/twilio";
import {
  buildEmergencyWhatsAppFallbackParams,
  buildEmergencyWhatsAppRequestParams,
  buildEmergencyWhatsAppSummary,
  twilioWhatsappEmergencyFrom,
} from "@/lib/emergency-whatsapp-send";
import {
  isSubscriptionServiceAllowed,
  subscriptionBlockedMessage,
} from "@/lib/subscription-access";
import {
  emergencyCategoryMessageLine,
  emergencyCategorySchema,
  type EmergencyCategory,
} from "@/lib/emergency-category";
import { MAX_GUARDIANS } from "@/lib/guardian-limits";
import { buildAckAlertUrl, buildConfirmAlertUrl, generateAckToken } from "@/lib/ack-alert";
import {
  ALERT_STATUS_ARMED,
  ALERT_STATUS_CANCELLED,
  ALERT_STATUS_DISPATCHING,
  cancelEmergencyAlertForSignup,
  EMERGENCY_ARM_GRACE_MS,
  isAlertCancelled,
} from "@/lib/emergency-alert-cancel";
import { buildCascadeMetadataPatch } from "@/lib/emergency-cascade-continuation";
import { buildEmergencyVoiceMessage, buildEmergencyVoiceTwiml } from "@/lib/emergency-voice-twiml";
import {
  loadEmergencyContactRows,
} from "@/lib/emergency-recipients";

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

const CancelSchema = z.object({
  signupId: z.string().uuid(),
  alertId: z.string().uuid().optional(),
});

const Schema = z.object({
  signupId: z.string().uuid(),
  gps: GpsInput,
  /** Coordenadas GPS planas (alternativa a `gps`). */
  gpsLat: z.number().finite().optional(),
  gpsLng: z.number().finite().optional(),
  /** Modo entrenamiento: no llama a Twilio (sin costo). */
  trainingMode: z.boolean().optional().default(false),
  /** Tipo de emergencia elegido por el usuario en la app. */
  emergencyCategory: emergencyCategorySchema.optional(),
  /** App: espera en servidor antes del primer SMS para permitir «Estoy bien». */
  graceBeforeSend: z.boolean().optional().default(false),
  /** send = cascada inmediata (webhooks). arm/dispatch = legado interno. */
  intent: z.enum(["send", "arm", "dispatch"]).optional().default("send"),
  /** Requerido cuando intent=dispatch. */
  alertId: z.string().uuid().optional(),
});

/** Espera tras SMS antes de WhatsApp. */
const WHATSAPP_DELAY_AFTER_SMS_MS = 15_000;
/** Llamada automática 60 s después del primer SMS (si nadie confirmó). */
const VOICE_AT_MS = 60_000;
const VOICE_DELAY_AFTER_WHATSAPP_MS = VOICE_AT_MS - WHATSAPP_DELAY_AFTER_SMS_MS;

const ALGORITHM_ID = "ecosystem_v4_cascade_15_60";

async function appendActiveCallSid(alertId: string, callSid: string): Promise<void> {
  const { data: row } = await supabaseAdmin
    .from("alert_logs")
    .select("metadata")
    .eq("id", alertId)
    .maybeSingle();
  const meta = ((row?.metadata ?? {}) as Record<string, unknown>) ?? {};
  const prev = Array.isArray(meta.active_call_sids)
    ? meta.active_call_sids.filter((s): s is string => typeof s === "string")
    : [];
  if (prev.includes(callSid)) return;
  await supabaseAdmin
    .from("alert_logs")
    .update({
      metadata: { ...meta, active_call_sids: [...prev, callSid] },
    } as never)
    .eq("id", alertId);
}

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

async function waitGracePeriodForCancel(alertId: string): Promise<boolean> {
  const end = Date.now() + EMERGENCY_ARM_GRACE_MS;
  while (Date.now() < end) {
    if (await isAlertCancelled(alertId)) return true;
    await sleep(250);
  }
  return isAlertCancelled(alertId);
}

function waitUntilCascadeMs(startMs: number, targetMs: number): Promise<void> {
  const remaining = targetMs - (Date.now() - startMs);
  return remaining > 0 ? sleep(remaining) : Promise.resolve();
}

type AlertEngagementRow = {
  acknowledged_at: string | null;
  metadata: Record<string, unknown> | null;
};

function isAlertEngagedFromRow(row: AlertEngagementRow | null): boolean {
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  if (typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0) return true;
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

/** Destinatario activo de emergencia. */
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

function buildEmergencyAlertMessage(opts: {
  seniorName: string;
  categoryBlock: string;
  locationBlock: string;
  timestamp: string;
  ackUrl: string;
}): string {
  const confirmBlock =
    `✅ CONFIRMA QUE RECIBISTE ESTA ALERTA\n` +
    `Toca este enlace (evita la llamada a los 60 s):\n` +
    opts.ackUrl;

  const details = [
    opts.categoryBlock.trim(),
    opts.locationBlock,
    `⏰ Hora:\n${opts.timestamp}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    `🚨 URGENTE ALERTA SENIOR\n\n` +
    `${opts.seniorName} necesita ayuda.\n\n` +
    `${confirmBlock}\n\n` +
    `────────────────────\n` +
    `Detalle\n\n` +
    `${details}\n\n` +
    `Contacta de inmediato al usuario.`
  );
}

/**
 *  Fase 1 (s 0): SMS a los 3 guardianes prioritarios.
 *  Fase 2 (s 15): WhatsApp a los mismos 3 guardianes.
 *  Fase 3 (s 30): Llamada solo si nadie confirmó ni leyó los mensajes anteriores.
 * Registra cada canal en alert_logs.
 */
export const sendEmergencyAlert = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    const waFrom = twilioWhatsappEmergencyFrom();
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

    const contactRows = await loadEmergencyContactRows(data.signupId);

    const recipients: EmergencyRecipient[] = contactRows
      .map((row) => toEmergencyRecipient(row as EmergencyContactRow))
      .filter((r): r is EmergencyRecipient => r !== null);

    const ts = new Date();
    const timestamp = ts.toLocaleString("es-CL", { timeZone: "America/Santiago" });
    const resolvedGps = resolveGpsFromInput(data);
    const topContacts = recipients.slice(0, MAX_GUARDIANS);
    const callEscalationContacts = topContacts.filter((r) => r.recibe_llamada);
    const mapsLink = resolvedGps
      ? `https://maps.google.com/?q=${resolvedGps.lat},${resolvedGps.lng}`
      : null;

    // Acknowledgement token (link de un solo uso, expira en 24h)
    const ackToken = generateAckToken();
    const ackExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const locationBlock = mapsLink
      ? `📍 Ubicación (GPS preciso):\n${mapsLink}`
      : `📍 Ubicación: el usuario activó la alerta, pero el GPS del celular no se pudo sincronizar a tiempo. Por favor contáctalo de inmediato.`;

    const categoryBlock = data.emergencyCategory
      ? `🏷️ Tipo de emergencia:\n${emergencyCategoryMessageLine(data.emergencyCategory)}`
      : "";

    const voiceText = buildEmergencyVoiceMessage(user.nombre, data.emergencyCategory ?? null);
    const callTwiml = buildEmergencyVoiceTwiml(voiceText);

    const baseMetadata = {
      maps_link: mapsLink,
      timestamp,
      ack_token: ackToken,
      ack_expires_at: ackExpiresAt,
      emergency_category: data.emergencyCategory ?? null,
      gps_source: resolvedGps?.source ?? "unavailable",
      algorithm: ALGORITHM_ID,
      max_guardians: MAX_GUARDIANS,
      training: data.trainingMode === true,
      cascade: {
        sms_at_ms: 0,
        whatsapp_at_ms: WHATSAPP_DELAY_AFTER_SMS_MS,
        voice_at_ms: VOICE_AT_MS,
      },
    };

    let logRow: { id: string } | null = null;
    let alertId: string | null = null;
    let ackUrl = buildConfirmAlertUrl(ackToken);
    let textMessage = buildEmergencyAlertMessage({
      seniorName: user.nombre,
      categoryBlock,
      locationBlock,
      timestamp,
      ackUrl,
    });

    if (data.intent === "dispatch") {
      if (!data.alertId) {
        return { ok: false, error: "missing_alert_id", results: [] as ChannelResult[] };
      }
      const { data: armedRow, error: armedErr } = await supabaseAdmin
        .from("alert_logs")
        .select("id, contract_signup_id, status, metadata, acknowledgement_token")
        .eq("id", data.alertId)
        .maybeSingle();
      if (armedErr || !armedRow || armedRow.contract_signup_id !== data.signupId) {
        return { ok: false, error: "alert_not_found", results: [] as ChannelResult[] };
      }
      if (await isAlertCancelled(data.alertId)) {
        return { ok: false, status: ALERT_STATUS_CANCELLED, results: [] as ChannelResult[], alertId: data.alertId };
      }
      if (armedRow.status !== ALERT_STATUS_ARMED) {
        return { ok: false, error: "invalid_alert_state", results: [] as ChannelResult[] };
      }
      await supabaseAdmin
        .from("alert_logs")
        .update({ status: ALERT_STATUS_DISPATCHING } as never)
        .eq("id", data.alertId);
      logRow = { id: data.alertId };
      alertId = data.alertId;
      const armedMeta = (armedRow.metadata ?? {}) as Record<string, unknown>;
      if (typeof armedMeta.text_message === "string" && armedMeta.text_message.length > 0) {
        textMessage = armedMeta.text_message;
      }
      if (typeof armedMeta.ack_url === "string") ackUrl = armedMeta.ack_url;
      if (typeof armedMeta.ack_token === "string") ackToken = armedMeta.ack_token;
      else if (armedRow.acknowledgement_token) ackToken = armedRow.acknowledgement_token;
      if (armedMeta.training === true) {
        (data as { trainingMode?: boolean }).trainingMode = true;
      }
    } else {
      const logInsertBase = {
        contract_signup_id: user.id,
        event_type: "emergency_pressed",
        status: "pending",
        gps_lat: resolvedGps?.lat ?? null,
        gps_lng: resolvedGps?.lng ?? null,
        gps_accuracy: resolvedGps?.accuracy ?? null,
        recipients: recipients.map((r) => ({ id: r.id, nombre: r.nombre, telefono: r.phone, parentesco: r.parentesco })),
        metadata: baseMetadata,
        acknowledgement_token: ackToken,
        acknowledgement_expires_at: ackExpiresAt,
      };

      const { data: insertedLog, error: logErr } = await supabaseAdmin
        .from("alert_logs")
        .insert(logInsertBase as never)
        .select("id")
        .single();

      if (logErr) {
        console.error("[emergency] alert_logs insert with ack columns failed:", logErr.message);
        const { data: retryLog, error: retryErr } = await supabaseAdmin
          .from("alert_logs")
          .insert({
            contract_signup_id: logInsertBase.contract_signup_id,
            event_type: logInsertBase.event_type,
            status: logInsertBase.status,
            gps_lat: logInsertBase.gps_lat,
            gps_lng: logInsertBase.gps_lng,
            gps_accuracy: logInsertBase.gps_accuracy,
            recipients: logInsertBase.recipients,
            metadata: logInsertBase.metadata,
          } as never)
          .select("id")
          .single();
        if (retryErr) {
          console.error("[emergency] alert_logs retry insert failed:", retryErr.message);
        } else {
          logRow = retryLog;
        }
      } else {
        logRow = insertedLog;
      }

      alertId = logRow?.id ?? null;
      const shortAckUrl = buildConfirmAlertUrl(ackToken);
      ackUrl = shortAckUrl;
      textMessage = buildEmergencyAlertMessage({
        seniorName: user.nombre,
        categoryBlock,
        locationBlock,
        timestamp,
        ackUrl: shortAckUrl,
      });

      if (alertId) {
        await supabaseAdmin
          .from("alert_logs")
          .update({
            metadata: {
              ...baseMetadata,
              ack_url: shortAckUrl,
              ack_url_long: buildAckAlertUrl(alertId, ackToken),
              text_message: textMessage,
            },
            acknowledgement_token: ackToken,
            acknowledgement_expires_at: ackExpiresAt,
          } as never)
          .eq("id", alertId);
      }

      if (data.graceBeforeSend && alertId) {
        const cancelledDuringGrace = await waitGracePeriodForCancel(alertId);
        if (cancelledDuringGrace) {
          return {
            ok: false,
            status: ALERT_STATUS_CANCELLED,
            alertId,
            recipients: recipients.length,
            results: [] as ChannelResult[],
          };
        }
      } else if (data.intent === "arm") {
        return {
          ok: !!alertId,
          status: alertId ? ALERT_STATUS_ARMED : "failed",
          alertId,
          graceMs: EMERGENCY_ARM_GRACE_MS,
          training: data.trainingMode === true,
          recipients: recipients.length,
          results: [] as ChannelResult[],
          ...(alertId ? {} : { error: "alert_log_insert_failed" }),
        };
      }
    }

    const results: ChannelResult[] = [];

    if (alertId && (await isAlertCancelled(alertId))) {
      return {
        ok: false,
        status: ALERT_STATUS_CANCELLED,
        recipients: recipients.length,
        results,
        alertId,
      };
    }

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
          results.push({ channel: "whatsapp", to: c.whatsappPhone, status: "sent", sid: "TRAINING_SIM", error: null, event: "whatsapp_simulated", at: simAt(WHATSAPP_DELAY_AFTER_SMS_MS) });
        }
      }
      for (const c of callEscalationContacts) {
        if (c.recibe_llamada) {
          results.push({ channel: "call", to: c.phone, status: "sent", sid: "TRAINING_SIM", error: null, event: "call_simulated", at: simAt(WHATSAPP_DELAY_AFTER_SMS_MS + VOICE_DELAY_AFTER_WHATSAPP_MS) });
        }
      }
      if (recipients.length === 0) {
        results.push(
          { channel: "whatsapp", to: "-", status: "skipped", error: "no_recipients", event: "training_no_recipients", at: simAt(0) },
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
              message: "Entrenamiento: cascada SMS (0s) → WhatsApp (15s) → llamada (30s) sin Twilio",
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

      if (!alertId) {
        pushSkipped("sms", "-", "alert_log_missing", "sms_skipped");
        pushSkipped("whatsapp", "-", "alert_log_missing", "whatsapp_skipped");
        pushSkipped("call", "-", "alert_log_missing", "call_skipped");
        return {
          ok: false,
          error: "alert_log_insert_failed",
          status: "failed",
          recipients: recipients.length,
          results,
          message: "No pudimos registrar la alerta. Reintenta o llama directamente.",
        };
      }

      if (alertId && (await isAlertCancelled(alertId))) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId,
        };
      }

      // ── FASE 1: SMS inmediato (máx. 3 guardianes) ──
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
            metadata: buildCascadeMetadataPatch({
              mapsLink,
              timestamp,
              ackUrl,
              ackToken,
              ackExpiresAt,
              gpsSource: resolvedGps?.source ?? "unavailable",
              textMessage,
              emergencyCategory: data.emergencyCategory,
              topContactIds: topContacts.map((c) => c.id),
              results: [...results],
            }),
          } as never)
          .eq("id", alertId);
      }

      // ── FASE 2: WhatsApp (espera fija, misma petición — fiable en Cloudflare) ──
      if (alertId && (await isAlertCancelled(alertId))) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId,
        };
      }

      await sleep(WHATSAPP_DELAY_AFTER_SMS_MS);

      const waSummary = buildEmergencyWhatsAppSummary({
        categoryBlock,
        locationBlock,
        timestamp,
        mapsLink,
      });

      const waTasks: Promise<ChannelResult>[] = [];
      for (const c of topContacts) {
        if (c.recibe_whatsapp) {
          waTasks.push(
            (async () => {
              const waBody = buildEmergencyWhatsAppRequestParams({
                toPhoneE164: c.whatsappPhone,
                seniorName: user.nombre,
                ackToken,
                alertSummary: waSummary,
                textMessage,
                alertId,
              });
              let r = await twilioPost("/Messages.json", waBody);
              if (!r.ok) {
                r = await twilioPost(
                  "/Messages.json",
                  buildEmergencyWhatsAppFallbackParams(waBody, user.nombre, waSummary),
                );
              }
              return {
                channel: "whatsapp" as const,
                to: c.whatsappPhone,
                status: r.ok ? ("sent" as const) : ("failed" as const),
                sid: twilioResourceSid(r.data),
                error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
                event: r.ok ? "whatsapp_sent" : "whatsapp_failed",
                at: nowIso(),
              };
            })().catch((e: unknown) => ({
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
              ack_token: ackToken,
              text_message: textMessage,
              gps_source: resolvedGps?.source ?? "unavailable",
              algorithm: ALGORITHM_ID,
              phase: "whatsapp_complete",
              sms_contacts: topContacts.map((c) => c.id),
              whatsapp_contacts: topContacts.map((c) => c.id),
              results: [...results],
            },
          } as never)
          .eq("id", alertId);
      }

      // ── FASE 3: llamada si nadie confirmó ──
      if (alertId && (await isAlertCancelled(alertId))) {
        return {
          ok: false,
          status: ALERT_STATUS_CANCELLED,
          recipients: recipients.length,
          results,
          alertId,
        };
      }

      await sleep(VOICE_DELAY_AFTER_WHATSAPP_MS);

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
          if (alertId && ((await isAlertEngaged(alertId)) || (await isAlertCancelled(alertId)))) {
            pushSkipped("call", c.phone, "engaged_during_escalation", "call_escalation_stopped");
            break;
          }
          try {
            const r = await twilioPost("/Calls.json", {
              To: c.phone,
              From: voiceFrom,
              Twiml: callTwiml,
              Timeout: "25",
            });
            const callSid = twilioResourceSid(r.data);
            if (alertId && r.ok && callSid) {
              await appendActiveCallSid(alertId, callSid);
            }
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
          if (alertId && (await isAlertEngaged(alertId))) break;
        }
      }

      const anySent = results.some((r) => r.status === "sent");
      const finalStatus =
        recipients.length === 0
          ? "no_recipients"
          : anySent
            ? results.some((r) => r.status === "failed")
              ? "partial"
              : "delivered"
            : "failed";

      if (alertId) {
        await supabaseAdmin
          .from("alert_logs")
          .update({
            status: finalStatus,
            metadata: {
              maps_link: mapsLink,
              timestamp,
              ack_url: ackUrl,
              ack_token: ackToken,
              text_message: textMessage,
              gps_source: resolvedGps?.source ?? "unavailable",
              algorithm: ALGORITHM_ID,
              phase: "complete",
              sms_contacts: topContacts.map((c) => c.id),
              whatsapp_contacts: topContacts.map((c) => c.id),
              call_escalation_contacts: callEscalationContacts.map((c) => c.id),
              results,
              from: { waFrom, smsFrom, voiceFrom },
            },
            error_message: anySent
              ? null
              : results
                  .map((r) => r.error)
                  .filter(Boolean)
                  .join(" | ")
                  .slice(0, 500) || null,
          } as never)
          .eq("id", alertId);
      }

      return {
        ok: anySent || recipients.length === 0,
        status: finalStatus,
        recipients: recipients.length,
        results,
        ack_url: ackUrl,
        alertId,
      };
    }
  });

export const cancelEmergencyAlert = createServerFn({ method: "POST" })
  .inputValidator((input) => CancelSchema.parse(input))
  .handler(async ({ data }) => {
    const result = await cancelEmergencyAlertForSignup(data.signupId, data.alertId);
    if (!result.ok) return { ok: false as const, error: result.error };
    return { ok: true as const, already: result.already, alertId: result.alertId };
  });
