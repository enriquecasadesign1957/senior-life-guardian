const TWILIO_API_VERSION = "2010-04-01";

export type TwilioPostResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
};

/** SID de recurso Twilio (Messages/Calls) con tipado seguro. */
export function twilioResourceSid(data: Record<string, unknown>): string | null {
  const sid = data.sid;
  return typeof sid === "string" ? sid : null;
}

/** Sandbox WhatsApp oficial de Twilio (no usar número chileno para WA). */
export const TWILIO_WHATSAPP_SANDBOX_FROM = "whatsapp:+14155238886";

/**
 * Modo simulación económica: en desarrollo local no se llama a la API de Twilio.
 * Forzar con TWILIO_SIMULATION=true|false.
 */
export function isTwilioSimulationMode(): boolean {
  const forced = process.env.TWILIO_SIMULATION?.toLowerCase();
  if (forced === "true" || forced === "1") return true;
  if (forced === "false" || forced === "0") return false;
  return process.env.NODE_ENV === "development";
}

function getCredentials(): { accountSid: string; authToken: string } | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken) return null;
  return { accountSid, authToken };
}

export function isTwilioConfigured(): boolean {
  return getCredentials() !== null;
}

function simulationKind(path: string): "mensaje" | "llamada" {
  return path.includes("Calls") ? "llamada" : "mensaje";
}

function logSimulation(path: string, body: Record<string, string>): void {
  const kind = simulationKind(path);
  const label = kind === "llamada" ? "Llamada" : "Mensaje";
  console.log(`[SIMULACIÓN TWILIO]: ${label} enviado`, { endpoint: path, ...body });
}

/**
 * POST directo a la REST API de Twilio (Messages.json, Calls.json, etc.).
 */
export async function twilioPost(
  path: string,
  body: Record<string, string>,
): Promise<TwilioPostResult> {
  const creds = getCredentials();
  if (!creds) {
    return { ok: false, status: 0, data: { error: "twilio_not_configured" } };
  }

  const resource = path.startsWith("/") ? path : `/${path}`;

  if (isTwilioSimulationMode()) {
    logSimulation(resource, body);
    return {
      ok: true,
      status: 201,
      data: { sid: `SIM_${Date.now()}`, status: "simulated" },
    };
  }

  const url = `https://api.twilio.com/${TWILIO_API_VERSION}/Accounts/${creds.accountSid}${resource}`;
  const auth = Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64");

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  const data = (await resp.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: resp.ok, status: resp.status, data };
}

export function twilioSmsFrom(): string {
  return process.env.TWILIO_SMS_FROM?.trim() || "";
}

export function twilioVoiceFrom(): string {
  return process.env.TWILIO_VOICE_FROM?.trim() || twilioSmsFrom();
}

export function twilioWhatsappFrom(): string {
  return process.env.TWILIO_WHATSAPP_FROM?.trim() || TWILIO_WHATSAPP_SANDBOX_FROM;
}

/** Número WhatsApp comercial (To) para bifurcar el webhook entrante. */
export function twilioWhatsappCommercialFrom(): string {
  return (
    process.env.TWILIO_WHATSAPP_COMMERCIAL_FROM?.trim() ||
    SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164
  );
}

/**
 * E.164 sin prefijo + para enlaces wa.me comerciales (solo UI).
 * También origen de WhatsApp de emergencia (ver emergency-whatsapp-send.ts).
 * SMS/voz siguen en +56229147733; la red fija no entrega WA proactivo en Meta.
 */
export const SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 = "56971404580";

export function seniorSafeWhatsAppMeUrl(text?: string): string {
  const base = `https://wa.me/${SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export async function sendTwilioMessage(opts: {
  to: string;
  from: string;
  body?: string;
  contentSid?: string;
  contentVariables?: string;
}): Promise<{ ok: boolean; sid?: string | null; error?: string | null }> {
  const params: Record<string, string> = { To: opts.to, From: opts.from };
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
    sid: (r.data.sid as string) ?? null,
    error: r.ok ? null : `Twilio ${r.status}: ${JSON.stringify(r.data)}`,
  };
}

/** Envía SMS o WhatsApp según canal (to ya normalizado E.164). */
export async function sendTwilioChannelMessage(
  to: string,
  body: string,
  channel: "whatsapp" | "sms",
): Promise<{ ok: boolean; sid?: string | null; error?: string | null }> {
  const from =
    channel === "whatsapp" ? twilioWhatsappFrom() : twilioSmsFrom();
  if (!from) return { ok: false, error: `missing_from_${channel}` };
  const To = channel === "whatsapp" ? `whatsapp:${to}` : to;
  return sendTwilioMessage({ to: To, from, body });
}

/** WhatsApp primero; SMS solo si WA falla en Twilio (menor costo, mismo flujo UX). */
export async function sendTwilioWhatsAppWithSmsFallback(
  smsPhoneE164: string,
  body: string,
  whatsappPhoneE164?: string,
): Promise<{ whatsappOk: boolean; smsOk: boolean }> {
  const waPhone = whatsappPhoneE164 ?? smsPhoneE164;
  const wa = await sendTwilioChannelMessage(waPhone, body, "whatsapp");
  if (wa.ok) return { whatsappOk: true, smsOk: false };
  const sms = await sendTwilioChannelMessage(smsPhoneE164, body, "sms");
  return { whatsappOk: false, smsOk: sms.ok };
}
