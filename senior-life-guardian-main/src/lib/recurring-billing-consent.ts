import { SENIOR_SAFE_TERMS_CANCELLATION_URL } from "@/lib/subscription-cancellation-policy";

/** Versión del texto de autorización (auditoría). */
export const RECURRING_BILLING_CONSENT_VERSION = "2026-06";

export const RECURRING_BILLING_SUPPORT_EMAIL = "hola@alarmaseniorsafe.cl";

export const RECURRING_BILLING_CONSENT_CHECKBOX_LABEL =
  "Opcional: autorizo los cargos recurrentes automáticos en mi tarjeta inscrita, según el detalle indicado abajo.";

/** Texto visible antes del checkbox (disclosure). */
export const RECURRING_BILLING_DISCLOSURE_BULLETS = [
  "Al inscribir tu tarjeta en Transbank Oneclick pagas el primer período. Si marcas la casilla opcional, autorizas a Senior Safe a debitar automáticamente el valor del plan (mensual o anual) en cada renovación.",
] as const;

export const RECURRING_BILLING_DISCLOSURE_FOOTER = "";

export const RECURRING_BILLING_TERMS_LINK_LABEL = "Cancelación y reembolsos (Términos)";

export { SENIOR_SAFE_TERMS_CANCELLATION_URL };
