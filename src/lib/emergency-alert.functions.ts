import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TWILIO_GATEWAY = "https://connector-gateway.lovable.dev/twilio";

const Schema = z.object({
  signupId: z.string().uuid(),
  gps: z
    .object({
      lat: z.number().refine((v) => Number.isFinite(v) && v >= -90 && v <= 90, "lat inválida"),
      lng: z.number().refine((v) => Number.isFinite(v) && v >= -180 && v <= 180, "lng inválida"),
      accuracy: z.number().optional(),
    })
    .nullable()
    .optional(),
});



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

async function twilioPost(path: string, body: Record<string, string>, lovableKey: string, twilioKey: string) {
  const resp = await fetch(`${TWILIO_GATEWAY}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data: any = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, data };
}

/**
 * Envía alerta de emergencia REAL multicanal:
 *  - WhatsApp (Twilio)
 *  - SMS (Twilio)
 *  - Llamada automática con voz (Twilio TwiML inline)
 * Ejecuta TODOS los canales aunque alguno falle. Registra todo en alert_logs.
 */
export const sendEmergencyAlert = createServerFn({ method: "POST" })
  .inputValidator((input) => Schema.parse(input))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const twilioKey = process.env.TWILIO_API_KEY;
    // WhatsApp SIEMPRE desde el sandbox oficial Twilio. Nunca usar número chileno.
    const waFrom = "whatsapp:+14155238886";
    const smsFrom = process.env.TWILIO_SMS_FROM || "";
    const voiceFrom = process.env.TWILIO_VOICE_FROM || smsFrom;


    // Resolver usuario + familiares
    const { data: user, error: userErr } = await supabaseAdmin
      .from("trial_signups")
      .select("id, nombre, telefono")
      .eq("id", data.signupId)
      .maybeSingle();

    if (userErr || !user) {
      return { ok: false, error: "user_not_found", results: [] as ChannelResult[] };
    }

    const { data: contacts } = await supabaseAdmin
      .from("emergency_contacts")
      .select("id, nombre, telefono, parentesco")
      .eq("trial_signup_id", user.id);

    const recipients = (contacts ?? [])
      .map((c) => ({ ...c, phone: normalizePhone(c.telefono) }))
      .filter((c) => c.phone) as Array<{ id: string; nombre: string; telefono: string; parentesco: string; phone: string }>;

    const ts = new Date();
    const timestamp = ts.toLocaleString("es-CL", { timeZone: "America/Santiago" });

    // GPS obligatorio: solo coordenadas reales y precisas del APK/dispositivo.
    const resolvedGps = {
      lat: data.gps.lat,
      lng: data.gps.lng,
      accuracy: data.gps.accuracy,
      source: "device" as const,
    };
    const sourceNote = "(GPS preciso)";
    const mapsLink = `https://maps.google.com/?q=${resolvedGps.lat},${resolvedGps.lng}`;

    // Acknowledgement token (link de un solo uso, expira en 24h)
    const ackToken = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      .replace(/-/g, "") + Math.random().toString(36).slice(2, 10);
    const ackExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const ackUrl = `https://alarmaseniorsafe.cl/familia/ack/${ackToken}`;

    const textMessage =
      `🚨 URGENTE ALERTA SENIOR\n\n` +
      `${user.nombre} necesita ayuda.\n\n` +
      `📍 Ubicación ${sourceNote}:\n${mapsLink}\n\n` +
      `⏰ Hora:\n${timestamp}\n\n` +

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
        trial_signup_id: user.id,
        event_type: "emergency_pressed",
        status: "pending",
        gps_lat: resolvedGps.lat,
        gps_lng: resolvedGps.lng,
        gps_accuracy: resolvedGps.accuracy ?? null,
        recipients: recipients.map((r) => ({ id: r.id, nombre: r.nombre, telefono: r.phone, parentesco: r.parentesco })),
        metadata: { maps_link: mapsLink, timestamp, ack_url: ackUrl, gps_source: resolvedGps.source },

        acknowledgement_token: ackToken,
        acknowledgement_expires_at: ackExpiresAt,
      } as never)
      .select("id")
      .single();

    const results: ChannelResult[] = [];

    if (!lovableKey || !twilioKey) {
      const err = "twilio_not_configured";
      results.push({ channel: "whatsapp", to: "-", status: "failed", error: err, event: "whatsapp_failed", at: new Date().toISOString() });
      results.push({ channel: "sms", to: "-", status: "failed", error: err, event: "sms_failed", at: new Date().toISOString() });
      results.push({ channel: "call", to: "-", status: "failed", error: err, event: "call_failed", at: new Date().toISOString() });
    } else {
      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      // FASE 1 — SMS inmediato a todos los guardianes
      for (const c of recipients) {
        const to = c.phone;
        if (!smsFrom) {
          results.push({ channel: "sms", to, status: "skipped", error: "missing TWILIO_SMS_FROM", event: "sms_skipped", at: new Date().toISOString() });
          continue;
        }
        try {
          const r = await twilioPost(
            "/Messages.json",
            { To: to, From: smsFrom, Body: textMessage },
            lovableKey,
            twilioKey,
          );
          results.push({
            channel: "sms",
            to,
            status: r.ok ? "sent" : "failed",
            sid: r.data?.sid ?? null,
            error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
            event: r.ok ? "sms_sent" : "sms_failed",
            at: new Date().toISOString(),
          });
        } catch (e: any) {
          results.push({ channel: "sms", to, status: "failed", error: String(e?.message ?? e), event: "sms_failed", at: new Date().toISOString() });
        }
      }

      // Espera 15s antes de WhatsApp
      if (recipients.length > 0) await sleep(15000);

      // FASE 2 — WhatsApp
      for (const c of recipients) {
        const to = c.phone;
        try {
          const r = await twilioPost(
            "/Messages.json",
            { To: `whatsapp:${to}`, From: waFrom, Body: textMessage },
            lovableKey,
            twilioKey,
          );
          results.push({
            channel: "whatsapp",
            to,
            status: r.ok ? "sent" : "failed",
            sid: r.data?.sid ?? null,
            error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
            event: r.ok ? "whatsapp_sent" : "whatsapp_failed",
            at: new Date().toISOString(),
          });
        } catch (e: any) {
          results.push({ channel: "whatsapp", to, status: "failed", error: String(e?.message ?? e), event: "whatsapp_failed", at: new Date().toISOString() });
        }
      }

      // Espera 20s antes de la llamada
      if (recipients.length > 0) await sleep(20000);

      // FASE 3 — Llamada automática
      for (const c of recipients) {
        const to = c.phone;
        if (!voiceFrom) {
          results.push({ channel: "call", to, status: "skipped", error: "missing TWILIO_VOICE_FROM", event: "call_skipped", at: new Date().toISOString() });
          continue;
        }
        try {
          const r = await twilioPost(
            "/Calls.json",
            { To: to, From: voiceFrom, Twiml: twiml },
            lovableKey,
            twilioKey,
          );
          results.push({
            channel: "call",
            to,
            status: r.ok ? "sent" : "failed",
            sid: r.data?.sid ?? null,
            error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
            event: r.ok ? "call_started" : "call_failed",
            at: new Date().toISOString(),
          });
        } catch (e: any) {
          results.push({ channel: "call", to, status: "failed", error: String(e?.message ?? e), event: "call_failed", at: new Date().toISOString() });
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
          metadata: { maps_link: mapsLink, timestamp, results, from: { waFrom, smsFrom, voiceFrom } },
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
