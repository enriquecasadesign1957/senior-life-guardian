import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { captureWaitUntilFromRequest, runInBackground } from "@/lib/cloudflare-context";
import { isAlertCancelled, ALERT_STATUS_CANCELLED } from "@/lib/emergency-alert-cancel";
import {
  emergencyCategoryMessageLine,
  type EmergencyCategory,
} from "@/lib/emergency-category";
import { loadEmergencyContactRows } from "@/lib/emergency-recipients";
import {
  buildEmergencyWhatsAppRequestParams,
  buildEmergencyWhatsAppSummary,
  twilioWhatsappEmergencyFrom,
} from "@/lib/emergency-whatsapp-send";
import { MAX_GUARDIANS } from "@/lib/guardian-limits";
import {
  isTwilioConfigured,
  twilioPost,
  twilioResourceSid,
  twilioSmsFrom,
  twilioVoiceFrom,
} from "@/lib/twilio";
import {
  buildEmergencyVoiceMessage,
  buildEmergencyVoiceTwiml,
} from "@/lib/emergency-voice-twiml";

const CASCADE_WHATSAPP_AT_MS = 15_000;
const CASCADE_VOICE_AT_MS = 60_000;
const ALGORITHM_ID = "ecosystem_v4_cascade_15_60";

type ChannelResult = {
  channel: "whatsapp" | "sms" | "call";
  to: string;
  status: "sent" | "failed" | "skipped";
  sid?: string | null;
  error?: string | null;
  event: string;
  at: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function twilioStatusCallbackUrl(alertId: string, channel: "sms" | "whatsapp"): string {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  return `${base}/api/public/twilio-status-callback?alertId=${encodeURIComponent(alertId)}&channel=${channel}`;
}

function normalizePhone(raw: string): string | null {
  const trimmed = (raw ?? "").replace(/[^\d+]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`;
  return `+${trimmed}`;
}

type EmergencyRecipient = {
  id: string;
  phone: string;
  whatsappPhone: string;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
};

function toRecipient(row: {
  id: string;
  telefono: string;
  whatsapp: string | null;
  recibe_sms: boolean;
  recibe_whatsapp: boolean;
  recibe_llamada: boolean;
}): EmergencyRecipient | null {
  const phone = normalizePhone(row.telefono);
  const whatsappPhone = normalizePhone(row.whatsapp ?? row.telefono);
  if (!phone || !whatsappPhone) return null;
  return {
    id: row.id,
    phone,
    whatsappPhone,
    recibe_sms: row.recibe_sms !== false,
    recibe_whatsapp: row.recibe_whatsapp !== false,
    recibe_llamada: row.recibe_llamada !== false,
  };
}

async function isAlertEngaged(logId: string): Promise<boolean> {
  const { data: row } = await supabaseAdmin
    .from("alert_logs")
    .select("acknowledged_at, metadata")
    .eq("id", logId)
    .maybeSingle();
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  if (typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0) return true;
  return typeof meta.whatsapp_read_at === "string" && meta.whatsapp_read_at.length > 0;
}

async function dispatchCascadeHttp(alertId: string): Promise<void> {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new Error("CRON_SECRET missing");
  }
  const res = await fetch(`${base}/api/internal/emergency-cascade/${alertId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`cascade HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
}

/** Dispara WhatsApp (15s) + llamada (30s) en background. */
export function triggerCascadeContinuation(alertId: string): void {
  const task = (async () => {
    try {
      await dispatchCascadeHttp(alertId);
    } catch (httpErr) {
      console.warn("[emergency] cascade HTTP fallback to in-process", alertId, httpErr);
      await continueEmergencyCascade(alertId);
    }
  })().catch((err) => console.error("[emergency] cascade failed", alertId, err));

  if (runInBackground(task)) return;

  console.error("[emergency] waitUntil unavailable; trying direct cascade", alertId);
  void task;
}

/** Continúa cascada tras SMS (fases 2 y 3). */
export async function continueEmergencyCascade(alertId: string): Promise<void> {
  captureWaitUntilFromRequest();
  if (!isTwilioConfigured()) return;

  const { data: alert } = await supabaseAdmin
    .from("alert_logs")
    .select("id, contract_signup_id, created_at, status, metadata")
    .eq("id", alertId)
    .maybeSingle();

  if (!alert) return;

  if (await isAlertCancelled(alertId)) {
    await markCascadeComplete(alertId, (alert.metadata ?? {}) as Record<string, unknown>, ALERT_STATUS_CANCELLED, [], "cancelled_by_senior");
    return;
  }

  const meta = (alert.metadata ?? {}) as Record<string, unknown>;
  if (meta.phase === "complete") return;

  await supabaseAdmin
    .from("alert_logs")
    .update({
      metadata: {
        ...meta,
        cascade_started_at: new Date().toISOString(),
        cascade_runner: "continueEmergencyCascade",
      },
    } as never)
    .eq("id", alertId);

  const textMessage = await resolveAlertTextMessage(alertId, meta);
  if (!textMessage) {
    console.error("[continueEmergencyCascade] missing text_message", alertId);
    return;
  }

  const cascadeStartMs = new Date(alert.created_at).getTime();
  const msUntilWa = Math.max(0, CASCADE_WHATSAPP_AT_MS - (Date.now() - cascadeStartMs));
  await sleep(msUntilWa);

  if (await isAlertCancelled(alertId)) {
    await markCascadeComplete(alertId, meta, ALERT_STATUS_CANCELLED, [], "cancelled_by_senior");
    return;
  }

  if (await isAlertEngaged(alertId)) {
    await markCascadeComplete(alertId, meta, alert.status, [], "engaged_before_whatsapp");
    return;
  }

  await runWhatsappPhase(alertId, alert.contract_signup_id, meta, textMessage);

  if (await isAlertCancelled(alertId)) {
    await markCascadeComplete(alertId, meta, ALERT_STATUS_CANCELLED, [], "cancelled_by_senior");
    return;
  }

  const msUntilCall = Math.max(0, CASCADE_VOICE_AT_MS - (Date.now() - cascadeStartMs));
  await sleep(msUntilCall);

  if (await isAlertCancelled(alertId)) {
    await markCascadeComplete(alertId, meta, ALERT_STATUS_CANCELLED, [], "cancelled_by_senior");
    return;
  }

  const callResults = await runVoiceEscalation(alertId);
  await markCascadeComplete(alertId, meta, alert.status, callResults, "complete");
}

async function resolveAlertTextMessage(
  alertId: string,
  meta: Record<string, unknown>,
): Promise<string | null> {
  if (typeof meta.text_message === "string" && meta.text_message.length > 0) {
    return meta.text_message;
  }
  const { data: row } = await supabaseAdmin
    .from("alert_logs")
    .select("metadata")
    .eq("id", alertId)
    .maybeSingle();
  const fresh = (row?.metadata ?? {}) as Record<string, unknown>;
  return typeof fresh.text_message === "string" && fresh.text_message.length > 0
    ? fresh.text_message
    : null;
}

async function runWhatsappPhase(
  alertId: string,
  signupId: string,
  meta: Record<string, unknown>,
  textMessage: string,
): Promise<void> {
  if (await isAlertCancelled(alertId)) return;
  const { data: user } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("nombre")
    .eq("id", signupId)
    .maybeSingle();
  const seniorName = user?.nombre ?? "Usuario";
  const ackToken =
    typeof meta.ack_token === "string"
      ? meta.ack_token
      : typeof meta.ack_url === "string"
        ? (meta.ack_url.match(/\/a\/([a-f0-9]{24})(?:\?|$|\/)/i)?.[1] ??
          meta.ack_url.match(/\/a\/[^/]+\/([a-f0-9]{24})/i)?.[1] ??
          "")
        : "";
  const timestamp =
    typeof meta.timestamp === "string"
      ? meta.timestamp
      : new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });
  const mapsLink = typeof meta.maps_link === "string" ? meta.maps_link : null;
  const categoryBlock =
    typeof meta.emergency_category === "string" && meta.emergency_category
      ? emergencyCategoryMessageLine(meta.emergency_category as EmergencyCategory)
      : "";
  const locationBlock = mapsLink
    ? `Ubicación GPS: ${mapsLink}`
    : "Ubicación: GPS no disponible al momento de la alerta.";
  const waSummary = buildEmergencyWhatsAppSummary({
    categoryBlock,
    locationBlock,
    timestamp,
    mapsLink,
  });
  const waFrom = twilioWhatsappEmergencyFrom();

  const contactRows = await loadEmergencyContactRows(signupId);
  const topContacts = contactRows
    .map((row) => toRecipient(row))
    .filter((r): r is EmergencyRecipient => r !== null)
    .slice(0, MAX_GUARDIANS);

  const results: ChannelResult[] = Array.isArray(meta.results)
    ? ([...(meta.results as ChannelResult[])] as ChannelResult[])
    : [];
  const nowIso = () => new Date().toISOString();

  for (const c of topContacts) {
    if (!c.recibe_whatsapp) continue;
    if (!ackToken) continue;
    const waBody = buildEmergencyWhatsAppRequestParams({
      toPhoneE164: c.whatsappPhone,
      seniorName,
      ackToken,
      alertSummary: waSummary,
      textMessage,
      alertId,
    });
    try {
      const r = await twilioPost("/Messages.json", waBody);
      results.push({
        channel: "whatsapp",
        to: c.whatsappPhone,
        status: r.ok ? "sent" : "failed",
        sid: twilioResourceSid(r.data),
        error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
        event: r.ok ? "whatsapp_sent" : "whatsapp_failed",
        at: nowIso(),
      });
    } catch (e: unknown) {
      results.push({
        channel: "whatsapp",
        to: c.whatsappPhone,
        status: "failed",
        error: String((e as Error)?.message ?? e),
        event: "whatsapp_failed",
        at: nowIso(),
      });
    }
  }

  await supabaseAdmin
    .from("alert_logs")
    .update({
      metadata: { ...meta, phase: "whatsapp_complete", results },
    } as never)
    .eq("id", alertId);
}

async function runVoiceEscalation(alertId: string): Promise<ChannelResult[]> {
  const results: ChannelResult[] = [];
  const nowIso = () => new Date().toISOString();

  if (await isAlertCancelled(alertId)) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "cancelled_by_senior",
      event: "call_escalation_skipped",
      at: nowIso(),
    });
    return results;
  }

  if (await isAlertEngaged(alertId)) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "engaged_before_escalation",
      event: "call_escalation_skipped",
      at: nowIso(),
    });
    return results;
  }

  const { data: alert } = await supabaseAdmin
    .from("alert_logs")
    .select("contract_signup_id, metadata")
    .eq("id", alertId)
    .maybeSingle();
  if (!alert) return results;

  const meta = (alert.metadata ?? {}) as Record<string, unknown>;
  const { data: user } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("nombre")
    .eq("id", alert.contract_signup_id)
    .maybeSingle();

  const category = meta.emergency_category as EmergencyCategory | null | undefined;
  const voiceText = buildEmergencyVoiceMessage(user?.nombre ?? "el usuario", category ?? null);
  const callTwiml = buildEmergencyVoiceTwiml(voiceText);

  const voiceFrom = twilioVoiceFrom();
  if (!voiceFrom) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "missing TWILIO_VOICE_FROM",
      event: "call_skipped",
      at: nowIso(),
    });
    return results;
  }

  const contactRows = await loadEmergencyContactRows(alert.contract_signup_id);
  const callContacts = contactRows
    .map((row) => toRecipient(row))
    .filter((r): r is EmergencyRecipient => r !== null && r.recibe_llamada)
    .slice(0, MAX_GUARDIANS);

  if (callContacts.length === 0) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "no_call_recipients",
      event: "call_escalation_skipped",
      at: nowIso(),
    });
    return results;
  }

  for (const c of callContacts) {
    if (await isAlertEngaged(alertId)) {
      results.push({
        channel: "call",
        to: c.phone,
        status: "skipped",
        error: "engaged_during_escalation",
        event: "call_escalation_stopped",
        at: nowIso(),
      });
      break;
    }
    try {
      const r = await twilioPost("/Calls.json", {
        To: c.phone,
        From: voiceFrom,
        Twiml: callTwiml,
        Timeout: "25",
      });
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
    if (await isAlertEngaged(alertId)) break;
  }

  return results;
}

async function markCascadeComplete(
  alertId: string,
  meta: Record<string, unknown>,
  prevStatus: string,
  callResults: ChannelResult[],
  phase: string,
): Promise<void> {
  const { data: fresh } = await supabaseAdmin
    .from("alert_logs")
    .select("metadata, status")
    .eq("id", alertId)
    .maybeSingle();
  const latestMeta = (fresh?.metadata ?? meta) as Record<string, unknown>;
  const prevResults = Array.isArray(latestMeta.results)
    ? (latestMeta.results as ChannelResult[])
    : [];
  const results = [...prevResults, ...callResults];
  const anySent = results.some((r) => r.status === "sent");
  const finalStatus = anySent
    ? results.some((r) => r.status === "failed")
      ? "partial"
      : "delivered"
    : prevStatus === "partial"
      ? "partial"
      : "failed";

  await supabaseAdmin
    .from("alert_logs")
    .update({
      status: finalStatus,
      metadata: {
        ...latestMeta,
        phase,
        results,
        cascade_completed_at: new Date().toISOString(),
        from: {
          waFrom: twilioWhatsappEmergencyFrom(),
          smsFrom: twilioSmsFrom(),
          voiceFrom: twilioVoiceFrom(),
        },
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

/** Metadatos mínimos para continuar la cascada tras responder al cliente. */
export function buildCascadeMetadataPatch(opts: {
  mapsLink: string | null;
  timestamp: string;
  ackUrl: string;
  ackToken: string;
  ackExpiresAt?: string;
  gpsSource: string;
  textMessage: string;
  emergencyCategory?: EmergencyCategory;
  topContactIds: string[];
  results: ChannelResult[];
}) {
  return {
    maps_link: opts.mapsLink,
    timestamp: opts.timestamp,
    ack_url: opts.ackUrl,
    ack_token: opts.ackToken,
    ack_expires_at: opts.ackExpiresAt ?? null,
    gps_source: opts.gpsSource,
    algorithm: ALGORITHM_ID,
    emergency_category: opts.emergencyCategory ?? null,
    text_message: opts.textMessage,
    phase: "sms_complete",
    sms_contacts: opts.topContactIds,
    results: opts.results,
    cascade: {
      sms_at_ms: 0,
      whatsapp_at_ms: CASCADE_WHATSAPP_AT_MS,
      voice_at_ms: CASCADE_VOICE_AT_MS,
    },
  };
}
