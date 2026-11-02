import type { EmergencyCategory } from "@/lib/emergency-category";
import { emergencyCategoryMessageLine } from "@/lib/emergency-category";

/** Voz básica Twilio: más compatible en rutas PSTN Chile que Polly en algunas cuentas. */
export const TWILIO_EMERGENCY_SAY_LANGUAGE = "es-MX";
export const TWILIO_EMERGENCY_SAY_VOICE = "alice";

export function escapeTwimlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildEmergencyVoiceMessage(
  seniorName: string,
  emergencyCategory?: EmergencyCategory | null,
): string {
  const categoryLine = emergencyCategory
    ? ` Motivo: ${emergencyCategoryMessageLine(emergencyCategory)}.`
    : "";
  return (
    `Urgente. Alerta Senior. ${seniorName} necesita ayuda inmediata.${categoryLine} ` +
    `Revisa el mensaje de texto que recibiste.`
  );
}

/** Un solo mensaje de voz (sin repetición) para reducir costo Twilio. */
export function buildEmergencyVoiceTwiml(text: string): string {
  const safe = escapeTwimlText(text);
  const sayAttrs = `language="${TWILIO_EMERGENCY_SAY_LANGUAGE}" voice="${TWILIO_EMERGENCY_SAY_VOICE}"`;
  return (
    `<Response>` +
    `<Say ${sayAttrs}>${safe}</Say>` +
    `<Hangup/>` +
    `</Response>`
  );
}

export function buildEmergencyVoiceTwimlHangup(): string {
  return `<Response><Hangup/></Response>`;
}

export function emergencyOutboundCallUrl(alertId: string): string {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  return `${base}/api/public/twilio-emergency-call?alertId=${encodeURIComponent(alertId)}`;
}
