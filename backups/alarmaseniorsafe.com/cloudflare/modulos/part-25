import process from "node:process";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";
import { d as captureWaitUntilFromRequest } from "./index.mjs";
import { b as loadEmergencyContactRows, M as MAX_GUARDIANS } from "./contacts-storage-DdsYD-uQ.mjs";
import { i as isTwilioConfigured, e as twilioVoiceFrom, d as twilioSmsFrom, g as twilioPost, f as twilioResourceSid, S as SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164, b as twilioWhatsappFrom } from "./twilio-DNHuHEFY.mjs";
import { e as enumType } from "../_libs/zod.mjs";
const EMERGENCY_WHATSAPP_TEMPLATE_V6_SID = "HX_PLACEHOLDER_V6";
const EMERGENCY_WHATSAPP_TEMPLATE_V5_SID = "HX7cd48c5f724334d7c14234974d13a727";
function twilioWhatsappEmergencyFrom() {
  const raw = process.env.TWILIO_WHATSAPP_EMERGENCY_FROM?.trim() || process.env.TWILIO_WHATSAPP_COMMERCIAL_FROM?.trim() || SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164;
  const digits = raw.replace(/^whatsapp:/i, "").replace(/\D/g, "");
  if (!digits) return twilioWhatsappFrom();
  return `whatsapp:+${digits}`;
}
function twilioEmergencyWhatsappContentSid() {
  return process.env.TWILIO_EMERGENCY_WHATSAPP_CONTENT_SID?.trim() || process.env.TWILIO_WHATSAPP_EMERGENCY_CONTENT_SID?.trim() || EMERGENCY_WHATSAPP_TEMPLATE_V5_SID;
}
function isEmergencyWhatsAppTemplateV6(contentSid) {
  return contentSid === EMERGENCY_WHATSAPP_TEMPLATE_V6_SID;
}
function isEmergencyWhatsAppTemplateV5(contentSid) {
  return contentSid === EMERGENCY_WHATSAPP_TEMPLATE_V5_SID;
}
function buildEmergencyWhatsAppSummary(opts) {
  const strip = (s) => s.replace(/^[🏷️📍⏰✅🚨\s]+/gu, "").replace(/\n+/g, " · ").replace(/\s+/g, " ").trim();
  const parts = [];
  if (opts.mapsLink) {
    parts.push(`GPS: ${opts.mapsLink}`);
  } else {
    const loc = strip(opts.locationBlock);
    if (loc) parts.push(loc);
  }
  const category = strip(opts.categoryBlock);
  if (category) parts.push(category);
  parts.push(`Hora: ${opts.timestamp}`);
  return parts.filter(Boolean).join(" · ").slice(0, 380);
}
function buildWhatsAppAlertBody(seniorName, alertSummary) {
  const name = seniorName.slice(0, 80).trim();
  const summary = alertSummary.trim();
  return `🚨 *Senior Safe — URGENTE*

${name} necesita ayuda urgente.

` + (summary ? `${summary}

` : "") + `Revisa tu SMS para ver todos los detalles de la alerta y confirmar. También puedes responder *CONFIRMO* aquí. — Senior Safe`;
}
function twilioStatusCallbackUrl(alertId, channel) {
  const base = (process.env.PUBLIC_APP_URL || void 0 || "https://alarmaseniorsafe.cl").replace(/\/$/, "");
  return `${base}/api/public/twilio-status-callback?alertId=${encodeURIComponent(alertId)}&channel=${channel}`;
}
function buildEmergencyWhatsAppFallbackParams(base, seniorName, alertSummary) {
  const { ContentSid: _c, ContentVariables: _v, ...rest } = base;
  return { ...rest, Body: buildWhatsAppAlertBody(seniorName, alertSummary) };
}
function contentVariablesForTemplate(contentSid, seniorName, alertSummary) {
  if (isEmergencyWhatsAppTemplateV6(contentSid) || isEmergencyWhatsAppTemplateV5(contentSid)) {
    return {
      "1": seniorName.slice(0, 80),
      "2": alertSummary.slice(0, 380)
    };
  }
  return {
    "1": seniorName.slice(0, 80),
    "2": alertSummary.slice(0, 380) || "Revisa tu SMS para ubicación y confirmación."
  };
}
function buildEmergencyWhatsAppRequestParams(opts) {
  const from = twilioWhatsappEmergencyFrom();
  const contentSid = twilioEmergencyWhatsappContentSid();
  const params = {
    To: opts.toPhoneE164.startsWith("whatsapp:") ? opts.toPhoneE164 : `whatsapp:${opts.toPhoneE164}`,
    From: from
  };
  {
    params.ContentSid = contentSid;
    params.ContentVariables = JSON.stringify(
      contentVariablesForTemplate(contentSid, opts.seniorName, opts.alertSummary)
    );
  }
  if (opts.alertId) {
    params.StatusCallback = twilioStatusCallbackUrl(opts.alertId, "whatsapp");
  }
  return params;
}
const EMERGENCY_CATEGORY_IDS = ["salud", "accidente", "delincuencia"];
const EMERGENCY_CATEGORY_AUTO_DEFAULT = "salud";
const EMERGENCY_CATEGORY_AUTO_SEND_MS = 1e4;
const emergencyCategorySchema = enumType(EMERGENCY_CATEGORY_IDS);
const EMERGENCY_CATEGORIES = [
  {
    id: "salud",
    label: "Salud",
    subtitle: "Malestar, dolor o enfermedad",
    color: "#dc2626"
  },
  {
    id: "accidente",
    label: "Accidente",
    subtitle: "Caída, golpe o lesión",
    color: "#ea580c"
  },
  {
    id: "delincuencia",
    label: "Delincuencia",
    subtitle: "Robo, intruso o peligro",
    color: "#7c3aed"
  }
];
function emergencyCategoryLabel(category) {
  return EMERGENCY_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
function emergencyCategoryMessageLine(category) {
  switch (category) {
    case "salud":
      return "Salud (malestar o enfermedad)";
    case "accidente":
      return "Accidente (caída o lesión)";
    case "delincuencia":
      return "Delincuencia (robo o peligro)";
    default:
      return emergencyCategoryLabel(category);
  }
}
const ALERT_STATUS_ARMED = "armed";
const ALERT_STATUS_CANCELLED = "cancelled_by_senior";
const ALERT_STATUS_DISPATCHING = "dispatching";
const EMERGENCY_ARM_GRACE_MS = 3e3;
function isAlertCancelledFromRow(row) {
  if (!row) return false;
  if (row.status === ALERT_STATUS_CANCELLED) return true;
  const meta = row.metadata ?? {};
  return typeof meta.cancelled_at === "string" && meta.cancelled_at.length > 0;
}
async function isAlertCancelled(alertId) {
  const { data } = await supabaseAdmin.from("alert_logs").select("status, metadata").eq("id", alertId).maybeSingle();
  return isAlertCancelledFromRow(data);
}
async function markEmergencyAlertCancelled(signupId, alertId) {
  const { data: row, error } = await supabaseAdmin.from("alert_logs").select("id, contract_signup_id, status, metadata").eq("id", alertId).maybeSingle();
  if (error || !row) return { ok: false, error: "not_found" };
  if (row.contract_signup_id !== signupId) return { ok: false, error: "forbidden" };
  if (isAlertCancelledFromRow(row)) {
    return { ok: true, already: true };
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const meta = {
    ...row.metadata ?? {},
    cancelled_at: now,
    cancelled_by: "senior",
    cancel_reason: "estoy_bien"
  };
  const { error: updateErr } = await supabaseAdmin.from("alert_logs").update({
    status: ALERT_STATUS_CANCELLED,
    metadata: meta,
    error_message: null
  }).eq("id", alertId);
  if (updateErr) return { ok: false, error: "update_failed" };
  return { ok: true, already: false };
}
const CANCELLABLE_STATUSES = /* @__PURE__ */ new Set([
  "pending",
  ALERT_STATUS_ARMED,
  ALERT_STATUS_DISPATCHING,
  "partial"
]);
async function findLatestCancellableAlertId(signupId) {
  const since = new Date(Date.now() - 3 * 60 * 1e3).toISOString();
  const { data, error } = await supabaseAdmin.from("alert_logs").select("id, status, metadata, created_at").eq("contract_signup_id", signupId).gte("created_at", since).order("created_at", { ascending: false }).limit(8);
  if (error || !data?.length) return null;
  for (const row of data) {
    if (isAlertCancelledFromRow(row)) continue;
    const status = row.status ?? "";
    if (CANCELLABLE_STATUSES.has(status)) return row.id;
  }
  return null;
}
async function cancelEmergencyAlertForSignup(signupId, alertId) {
  const resolvedId = alertId ?? await findLatestCancellableAlertId(signupId);
  if (!resolvedId) return { ok: false, error: "not_found" };
  const result = await markEmergencyAlertCancelled(signupId, resolvedId);
  if (!result.ok) return result;
  return { ok: true, already: result.already, alertId: resolvedId };
}
const TWILIO_EMERGENCY_SAY_LANGUAGE = "es-MX";
const TWILIO_EMERGENCY_SAY_VOICE = "alice";
function escapeTwimlText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function buildEmergencyVoiceMessage(seniorName, emergencyCategory) {
  const categoryLine = emergencyCategory ? ` Motivo: ${emergencyCategoryMessageLine(emergencyCategory)}.` : "";
  return `Urgente. Alerta Senior. ${seniorName} necesita ayuda inmediata.${categoryLine} Revisa el mensaje de texto que recibiste.`;
}
function buildEmergencyVoiceTwiml(text) {
  const safe = escapeTwimlText(text);
  const sayAttrs = `language="${TWILIO_EMERGENCY_SAY_LANGUAGE}" voice="${TWILIO_EMERGENCY_SAY_VOICE}"`;
  return `<Response><Say ${sayAttrs}>${safe}</Say><Hangup/></Response>`;
}
function buildEmergencyVoiceTwimlHangup() {
  return `<Response><Hangup/></Response>`;
}
function emergencyOutboundCallUrl(alertId) {
  const base = (process.env.PUBLIC_APP_URL || void 0 || "https://alarmaseniorsafe.cl").replace(/\/$/, "");
  return `${base}/api/public/twilio-emergency-call?alertId=${encodeURIComponent(alertId)}`;
}
const CASCADE_WHATSAPP_AFTER_SMS_MS = 15e3;
const CASCADE_VOICE_AFTER_SMS_MS = 6e4;
const CASCADE_VOICE_AFTER_WHATSAPP_MS = CASCADE_VOICE_AFTER_SMS_MS - CASCADE_WHATSAPP_AFTER_SMS_MS;
const CASCADE_ALGORITHM_ID = "ecosystem_v4_cascade_15_60";
const CASCADE_MARKETING_SUMMARY = "SMS al instante, WhatsApp a los 15 s y llamada a los 60 s si nadie confirma.";
const CASCADE_ACK_HINT = "evita la llamada a los 60 s";
const CASCADE_WHATSAPP_AT_MS = CASCADE_WHATSAPP_AFTER_SMS_MS;
const CASCADE_VOICE_AT_MS = CASCADE_VOICE_AFTER_SMS_MS;
const ALGORITHM_ID = CASCADE_ALGORITHM_ID;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function normalizePhone(raw) {
  const trimmed = (raw ?? "").replace(/[^\d+]/g, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("+")) return trimmed;
  if (/^\d{8,9}$/.test(trimmed)) return `+56${trimmed}`;
  return `+${trimmed}`;
}
function toRecipient(row) {
  const phone = normalizePhone(row.telefono);
  const whatsappPhone = normalizePhone(row.whatsapp ?? row.telefono);
  if (!phone || !whatsappPhone) return null;
  return {
    id: row.id,
    phone,
    whatsappPhone,
    recibe_sms: row.recibe_sms !== false,
    recibe_whatsapp: row.recibe_whatsapp !== false,
    recibe_llamada: row.recibe_llamada !== false
  };
}
async function isAlertEngaged(logId) {
  const { data: row } = await supabaseAdmin.from("alert_logs").select("acknowledged_at, metadata").eq("id", logId).maybeSingle();
  if (!row) return false;
  if (row.acknowledged_at) return true;
  const meta = row.metadata ?? {};
  if (typeof meta.acknowledged_at === "string" && meta.acknowledged_at.length > 0) return true;
  return typeof meta.whatsapp_read_at === "string" && meta.whatsapp_read_at.length > 0;
}
async function continueEmergencyCascade(alertId) {
  captureWaitUntilFromRequest();
  if (!isTwilioConfigured()) return;
  const { data: alert } = await supabaseAdmin.from("alert_logs").select("id, contract_signup_id, created_at, status, metadata").eq("id", alertId).maybeSingle();
  if (!alert) return;
  if (await isAlertCancelled(alertId)) {
    await markCascadeComplete(alertId, alert.metadata ?? {}, ALERT_STATUS_CANCELLED, [], "cancelled_by_senior");
    return;
  }
  const meta = alert.metadata ?? {};
  if (meta.phase === "complete") return;
  await supabaseAdmin.from("alert_logs").update({
    metadata: {
      ...meta,
      cascade_started_at: (/* @__PURE__ */ new Date()).toISOString(),
      cascade_runner: "continueEmergencyCascade"
    }
  }).eq("id", alertId);
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
  await runWhatsappPhase(alertId, alert.contract_signup_id, meta);
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
async function resolveAlertTextMessage(alertId, meta) {
  if (typeof meta.text_message === "string" && meta.text_message.length > 0) {
    return meta.text_message;
  }
  const { data: row } = await supabaseAdmin.from("alert_logs").select("metadata").eq("id", alertId).maybeSingle();
  const fresh = row?.metadata ?? {};
  return typeof fresh.text_message === "string" && fresh.text_message.length > 0 ? fresh.text_message : null;
}
async function runWhatsappPhase(alertId, signupId, meta, textMessage) {
  if (await isAlertCancelled(alertId)) return;
  const { data: user } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select("nombre").eq("id", signupId).maybeSingle();
  const seniorName = user?.nombre ?? "Usuario";
  const ackToken = typeof meta.ack_token === "string" ? meta.ack_token : typeof meta.ack_url === "string" ? meta.ack_url.match(/\/a\/([a-f0-9]{24})(?:\?|$|\/)/i)?.[1] ?? meta.ack_url.match(/\/a\/[^/]+\/([a-f0-9]{24})/i)?.[1] ?? "" : "";
  const timestamp = typeof meta.timestamp === "string" ? meta.timestamp : (/* @__PURE__ */ new Date()).toLocaleString("es-CL", { timeZone: "America/Santiago" });
  const mapsLink = typeof meta.maps_link === "string" ? meta.maps_link : null;
  const categoryBlock = typeof meta.emergency_category === "string" && meta.emergency_category ? emergencyCategoryMessageLine(meta.emergency_category) : "";
  const locationBlock = mapsLink ? `Ubicación GPS: ${mapsLink}` : "Ubicación: GPS no disponible al momento de la alerta.";
  const waSummary = buildEmergencyWhatsAppSummary({
    categoryBlock,
    locationBlock,
    timestamp,
    mapsLink
  });
  twilioWhatsappEmergencyFrom();
  const contactRows = await loadEmergencyContactRows(signupId);
  const topContacts = contactRows.map((row) => toRecipient(row)).filter((r) => r !== null).slice(0, MAX_GUARDIANS);
  const results = Array.isArray(meta.results) ? [...meta.results] : [];
  const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
  for (const c of topContacts) {
    if (!c.recibe_whatsapp) continue;
    if (!ackToken) continue;
    const waBody = buildEmergencyWhatsAppRequestParams({
      toPhoneE164: c.whatsappPhone,
      seniorName,
      alertSummary: waSummary,
      alertId
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
        at: nowIso()
      });
    } catch (e) {
      results.push({
        channel: "whatsapp",
        to: c.whatsappPhone,
        status: "failed",
        error: String(e?.message ?? e),
        event: "whatsapp_failed",
        at: nowIso()
      });
    }
  }
  await supabaseAdmin.from("alert_logs").update({
    metadata: { ...meta, phase: "whatsapp_complete", results }
  }).eq("id", alertId);
}
async function runVoiceEscalation(alertId) {
  const results = [];
  const nowIso = () => (/* @__PURE__ */ new Date()).toISOString();
  if (await isAlertCancelled(alertId)) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "cancelled_by_senior",
      event: "call_escalation_skipped",
      at: nowIso()
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
      at: nowIso()
    });
    return results;
  }
  const { data: alert } = await supabaseAdmin.from("alert_logs").select("contract_signup_id, metadata").eq("id", alertId).maybeSingle();
  if (!alert) return results;
  const voiceFrom = twilioVoiceFrom();
  const callUrl = emergencyOutboundCallUrl(alertId);
  if (!voiceFrom) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "missing TWILIO_VOICE_FROM",
      event: "call_skipped",
      at: nowIso()
    });
    return results;
  }
  const contactRows = await loadEmergencyContactRows(alert.contract_signup_id);
  const callContacts = contactRows.map((row) => toRecipient(row)).filter((r) => r !== null && r.recibe_llamada).slice(0, MAX_GUARDIANS);
  if (callContacts.length === 0) {
    results.push({
      channel: "call",
      to: "-",
      status: "skipped",
      error: "no_call_recipients",
      event: "call_escalation_skipped",
      at: nowIso()
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
        at: nowIso()
      });
      break;
    }
    try {
      const r = await twilioPost("/Calls.json", {
        To: c.phone,
        From: voiceFrom,
        Url: callUrl,
        Method: "GET",
        Timeout: "25"
      });
      results.push({
        channel: "call",
        to: c.phone,
        status: r.ok ? "sent" : "failed",
        sid: twilioResourceSid(r.data),
        error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
        event: r.ok ? "call_started" : "call_failed",
        at: nowIso()
      });
    } catch (e) {
      results.push({
        channel: "call",
        to: c.phone,
        status: "failed",
        error: String(e?.message ?? e),
        event: "call_failed",
        at: nowIso()
      });
    }
    if (await isAlertEngaged(alertId)) break;
  }
  return results;
}
async function markCascadeComplete(alertId, meta, prevStatus, callResults, phase) {
  const { data: fresh } = await supabaseAdmin.from("alert_logs").select("metadata, status").eq("id", alertId).maybeSingle();
  const latestMeta = fresh?.metadata ?? meta;
  const prevResults = Array.isArray(latestMeta.results) ? latestMeta.results : [];
  const results = [...prevResults, ...callResults];
  const anySent = results.some((r) => r.status === "sent");
  const finalStatus = anySent ? results.some((r) => r.status === "failed") ? "partial" : "delivered" : prevStatus === "partial" ? "partial" : "failed";
  await supabaseAdmin.from("alert_logs").update({
    status: finalStatus,
    metadata: {
      ...latestMeta,
      phase,
      results,
      cascade_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
      from: {
        waFrom: twilioWhatsappEmergencyFrom(),
        smsFrom: twilioSmsFrom(),
        voiceFrom: twilioVoiceFrom()
      }
    },
    error_message: anySent ? null : results.map((r) => r.error).filter(Boolean).join(" | ").slice(0, 500) || null
  }).eq("id", alertId);
}
function buildCascadeMetadataPatch(opts) {
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
      voice_at_ms: CASCADE_VOICE_AT_MS
    }
  };
}
export {
  ALERT_STATUS_CANCELLED as A,
  CASCADE_VOICE_AFTER_SMS_MS as C,
  EMERGENCY_ARM_GRACE_MS as E,
  buildEmergencyVoiceTwimlHangup as a,
  buildEmergencyVoiceTwiml as b,
  continueEmergencyCascade as c,
  buildEmergencyVoiceMessage as d,
  emergencyCategorySchema as e,
  emergencyCategoryMessageLine as f,
  CASCADE_WHATSAPP_AFTER_SMS_MS as g,
  CASCADE_ALGORITHM_ID as h,
  isAlertCancelled as i,
  ALERT_STATUS_ARMED as j,
  ALERT_STATUS_DISPATCHING as k,
  CASCADE_VOICE_AFTER_WHATSAPP_MS as l,
  buildCascadeMetadataPatch as m,
  buildEmergencyWhatsAppSummary as n,
  buildEmergencyWhatsAppRequestParams as o,
  buildEmergencyWhatsAppFallbackParams as p,
  emergencyOutboundCallUrl as q,
  cancelEmergencyAlertForSignup as r,
  EMERGENCY_CATEGORIES as s,
  twilioWhatsappEmergencyFrom as t,
  emergencyCategoryLabel as u,
  EMERGENCY_CATEGORY_AUTO_DEFAULT as v,
  EMERGENCY_CATEGORY_AUTO_SEND_MS as w,
  CASCADE_MARKETING_SUMMARY as x,
  CASCADE_ACK_HINT as y
};
