/** Tiempos reales de la cascada de emergencia (SMS → WhatsApp → llamada). */
export const CASCADE_WHATSAPP_AFTER_SMS_MS = 15_000;
export const CASCADE_VOICE_AFTER_SMS_MS = 60_000;
export const CASCADE_VOICE_AFTER_WHATSAPP_MS =
  CASCADE_VOICE_AFTER_SMS_MS - CASCADE_WHATSAPP_AFTER_SMS_MS;

export const CASCADE_ALGORITHM_ID = "ecosystem_v4_cascade_15_60";

/** Texto corto para UI y marketing (alineado con producción). */
export const CASCADE_MARKETING_SUMMARY =
  "SMS al instante, WhatsApp a los 15 s y llamada a los 60 s si nadie confirma.";

export const CASCADE_ACK_HINT = "evita la llamada a los 60 s";
