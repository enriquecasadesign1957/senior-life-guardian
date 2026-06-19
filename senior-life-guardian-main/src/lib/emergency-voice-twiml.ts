import type { EmergencyCategory } from "@/lib/emergency-category";
import { emergencyCategoryMessageLine } from "@/lib/emergency-category";

export function escapeTwimlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<Response>` +
    `<Say language="es-MX" voice="Polly.Mia">${escapeTwimlText(text)}</Say>` +
    `<Hangup/>` +
    `</Response>`
  );
}

export function buildEmergencyVoiceTwimlHangup(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;
}

export function emergencyOutboundCallUrl(alertId: string): string {
  const base = (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
  return `${base}/api/public/twilio-emergency-call?alertId=${encodeURIComponent(alertId)}`;
}
