import process from "node:process";
import { Buffer } from "node:buffer";
const TWILIO_API_VERSION = "2010-04-01";
function twilioResourceSid(data) {
  const sid = data.sid;
  return typeof sid === "string" ? sid : null;
}
const TWILIO_WHATSAPP_SANDBOX_FROM = "whatsapp:+14155238886";
function isTwilioSimulationMode() {
  const forced = process.env.TWILIO_SIMULATION?.toLowerCase();
  if (forced === "true" || forced === "1") return true;
  if (forced === "false" || forced === "0") return false;
  return false;
}
function getCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) return null;
  return { accountSid, authToken };
}
function isTwilioConfigured() {
  return getCredentials() !== null;
}
function simulationKind(path) {
  return path.includes("Calls") ? "llamada" : "mensaje";
}
function logSimulation(path, body) {
  const kind = simulationKind(path);
  const label = kind === "llamada" ? "Llamada" : "Mensaje";
  console.log(`[SIMULACIÓN TWILIO]: ${label} enviado`, { endpoint: path, ...body });
}
async function twilioPost(path, body) {
  const creds = getCredentials();
  if (!creds) {
    return { ok: false, status: 0, data: { error: "twilio_not_configured" }, durationMs: 0 };
  }
  const resource = path.startsWith("/") ? path : `/${path}`;
  const startedAt = Date.now();
  if (isTwilioSimulationMode()) {
    logSimulation(resource, body);
    return {
      ok: true,
      status: 201,
      data: { sid: `SIM_${Date.now()}`, status: "simulated" },
      durationMs: Date.now() - startedAt
    };
  }
  const url = `https://api.twilio.com/${TWILIO_API_VERSION}/Accounts/${creds.accountSid}${resource}`;
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(body)
  });
  const data = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, data, durationMs: Date.now() - startedAt };
}
function twilioSmsFrom() {
  return process.env.TWILIO_SMS_FROM?.trim() || "";
}
function twilioVoiceFrom() {
  return process.env.TWILIO_VOICE_FROM?.trim() || twilioSmsFrom();
}
function twilioWhatsappFrom() {
  return process.env.TWILIO_WHATSAPP_FROM?.trim() || TWILIO_WHATSAPP_SANDBOX_FROM;
}
function twilioWhatsappCommercialFrom() {
  return process.env.TWILIO_WHATSAPP_COMMERCIAL_FROM?.trim() || SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164;
}
const SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 = "56971404580";
function seniorSafeWhatsAppMeUrl(text) {
  const base = `https://wa.me/${SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
async function sendTwilioMessage(opts) {
  const params = { To: opts.to, From: opts.from };
  if (opts.contentSid) {
    params.ContentSid = opts.contentSid;
    if (opts.contentVariables) params.ContentVariables = opts.contentVariables;
  } else if (opts.body) {
    params.Body = opts.body;
  } else {
    return { ok: false, error: "missing_body_or_content_sid" };
  }
  const r = await twilioPost("/Messages.json", params);
  return {
    ok: r.ok,
    sid: r.data.sid ?? null,
    error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`
  };
}
async function sendTwilioChannelMessage(to, body, channel) {
  const from = channel === "whatsapp" ? twilioWhatsappFrom() : twilioSmsFrom();
  if (!from) return { ok: false, error: `missing_from_${channel}` };
  const To = channel === "whatsapp" ? `whatsapp:${to}` : to;
  return sendTwilioMessage({ to: To, from, body });
}
async function sendTwilioWhatsAppWithSmsFallback(smsPhoneE164, body, whatsappPhoneE164) {
  const waPhone = whatsappPhoneE164 ?? smsPhoneE164;
  const wa = await sendTwilioChannelMessage(waPhone, body, "whatsapp");
  if (wa.ok) return { whatsappOk: true, smsOk: false };
  const sms = await sendTwilioChannelMessage(smsPhoneE164, body, "sms");
  return { whatsappOk: false, smsOk: sms.ok };
}
export {
  SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 as S,
  sendTwilioMessage as a,
  twilioWhatsappFrom as b,
  sendTwilioWhatsAppWithSmsFallback as c,
  twilioSmsFrom as d,
  twilioVoiceFrom as e,
  twilioResourceSid as f,
  twilioPost as g,
  seniorSafeWhatsAppMeUrl as h,
  isTwilioConfigured as i,
  sendTwilioChannelMessage as s,
  twilioWhatsappCommercialFrom as t
};
