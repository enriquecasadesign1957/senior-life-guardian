import { SENIOR_SAFE_TERMS_CANCELLATION_URL } from "@/lib/subscription-cancellation-policy";

/** Versión del texto de autorización (auditoría). */
export const RECURRING_BILLING_CONSENT_VERSION = "2026-06";

export const RECURRING_BILLING_SUPPORT_EMAIL = "hola@alarmaseniorsafe.cl";

export const RECURRING_BILLING_CONSENT_CHECKBOX_LABEL =
  "Opcional: autorizo los cargos recurrentes automáticos en mi tarjeta inscrita, según el detalle indicado abajo.";

/** Texto visible antes del checkbox (disclosure). */
export const RECURRING_BILLING_DISCLOSURE_BULLETS = [
  "Al inscribir tu tarjeta en Transbank Oneclick pagas el primer período. Si marcas la casilla opcional, autorizas a Senior Safe a debitar automáticamente el valor del plan (mensual o anual) en cada renovación.",
  "Con la casilla marcada no recibirás correos de aviso de vencimiento: el cobro se intentará en la fecha de renovación con la tarjeta inscrita.",
  "Sin la casilla marcada, el primer pago se confirma igual; recibirás avisos por email antes del vencimiento y deberás renovar manualmente en el checkout.",
  "Puedes cancelar la suscripción y los cobros futuros cuando lo desees, escribiendo a hola@alarmaseniorsafe.cl. No hay permanencia ni multa por cancelar.",
  "La cancelación detiene los cobros posteriores; no implica reembolso proporcional del período ya pagado (ver Términos y Condiciones).",
] as const;

export const RECURRING_BILLING_DISCLOSURE_FOOTER =
  "Los pagos son procesados de forma segura por Transbank. Marcar la casilla es voluntario; si la marcas, confirmas que leíste y aceptas la autorización de cobros automáticos.";

export const RECURRING_BILLING_TERMS_LINK_LABEL = "Cancelación y reembolsos (Términos)";

export { SENIOR_SAFE_TERMS_CANCELLATION_URL };
