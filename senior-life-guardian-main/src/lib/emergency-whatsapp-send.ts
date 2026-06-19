import {
  SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164,
  twilioWhatsappFrom,
} from "@/lib/twilio";

/** Plantilla Meta: nombre + detalle/GPS + revisar SMS. */
export const EMERGENCY_WHATSAPP_TEMPLATE_V6_SID = "HX_PLACEHOLDER_V6";

export const EMERGENCY_WHATSAPP_TEMPLATE_V5_SID = "HX7cd48c5f724334d7c14234974d13a727";

export const EMERGENCY_WHATSAPP_TEMPLATE_V1_SID = "HXf4293668f9faf1b75e5283c57f1345b5";

export function twilioWhatsappEmergencyFrom(): string {
  const raw =
    process.env.TWILIO_WHATSAPP_EMERGENCY_FROM?.trim() ||
    process.env.TWILIO_WHATSAPP_COMMERCIAL_FROM?.trim() ||
    SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164;
  const digits = raw.replace(/^whatsapp:/i, "").replace(/\D/g, "");
  if (!digits) return twilioWhatsappFrom();
  return `whatsapp:+${digits}`;
}

export function twilioEmergencyWhatsappContentSid(): string | null {
  return (
    process.env.TWILIO_EMERGENCY_WHATSAPP_CONTENT_SID?.trim() ||
    process.env.TWILIO_WHATSAPP_EMERGENCY_CONTENT_SID?.trim() ||
    EMERGENCY_WHATSAPP_TEMPLATE_V5_SID
  );
}

export function isEmergencyWhatsAppTemplateV6(contentSid: string): boolean {
  return contentSid === EMERGENCY_WHATSAPP_TEMPLATE_V6_SID;
}

export function isEmergencyWhatsAppTemplateV5(contentSid: string): boolean {
  return contentSid === EMERGENCY_WHATSAPP_TEMPLATE_V5_SID;
}

/** Resumen para WhatsApp: GPS + tipo + hora (misma info clave que el SMS). */
export function buildEmergencyWhatsAppSummary(opts: {
  categoryBlock: string;
  locationBlock: string;
  timestamp: string;
  mapsLink: string | null;
}): string {
  const strip = (s: string) =>
    s
      .replace(/^[🏷️📍⏰✅🚨\s]+/gu, "")
      .replace(/\n+/g, " · ")
      .replace(/\s+/g, " ")
      .trim();

  const parts: string[] = [];
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

function buildWhatsAppAlertBody(seniorName: string, alertSummary: string): string {
  const name = seniorName.slice(0, 80).trim();
  const summary = alertSummary.trim();
  return (
    `🚨 *Senior Safe — URGENTE*\n\n` +
    `${name} necesita ayuda urgente.\n\n` +
    (summary ? `${summary}\n\n` : "") +
    `Revisa tu SMS para ver todos los detalles de la alerta y confirmar. ` +
    `También puedes responder *CONFIRMO* aquí. — Senior Safe`
  );
}

function twilioStatusCallbackUrl(alertId: string, channel: "sms" | "whatsapp"): string {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  return `${base}/api/public/twilio-status-callback?alertId=${encodeURIComponent(alertId)}&channel=${channel}`;
}

/** Texto libre si la plantilla Meta falla o está rechazada. */
export function buildEmergencyWhatsAppFallbackParams(
  base: Record<string, string>,
  seniorName: string,
  alertSummary: string,
): Record<string, string> {
  const { ContentSid: _c, ContentVariables: _v, ...rest } = base;
  return { ...rest, Body: buildWhatsAppAlertBody(seniorName, alertSummary) };
}

function contentVariablesForTemplate(
  contentSid: string,
  seniorName: string,
  alertSummary: string,
): Record<string, string> {
  if (isEmergencyWhatsAppTemplateV6(contentSid) || isEmergencyWhatsAppTemplateV5(contentSid)) {
    return {
      "1": seniorName.slice(0, 80),
      "2": alertSummary.slice(0, 380),
    };
  }
  return {
    "1": seniorName.slice(0, 80),
    "2": alertSummary.slice(0, 380) || "Revisa tu SMS para ubicación y confirmación.",
  };
}

export function buildEmergencyWhatsAppRequestParams(opts: {
  toPhoneE164: string;
  seniorName: string;
  ackToken: string;
  alertSummary: string;
  textMessage: string;
  alertId?: string | null;
}): Record<string, string> {
  const from = twilioWhatsappEmergencyFrom();
  const contentSid = twilioEmergencyWhatsappContentSid();
  const params: Record<string, string> = {
    To: opts.toPhoneE164.startsWith("whatsapp:")
      ? opts.toPhoneE164
      : `whatsapp:${opts.toPhoneE164}`,
    From: from,
  };

  if (contentSid) {
    params.ContentSid = contentSid;
    params.ContentVariables = JSON.stringify(
      contentVariablesForTemplate(contentSid, opts.seniorName, opts.alertSummary),
    );
  } else {
    params.Body = buildWhatsAppAlertBody(opts.seniorName, opts.alertSummary);
  }

  if (opts.alertId) {
    params.StatusCallback = twilioStatusCallbackUrl(opts.alertId, "whatsapp");
  }

  return params;
}
