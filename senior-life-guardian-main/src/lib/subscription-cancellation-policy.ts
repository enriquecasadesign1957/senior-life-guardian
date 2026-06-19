/** Política de cancelación y reembolsos — Senior Safe (texto legal acordado). */

export const CANCELLATION_POLICY_GENERAL =
  "En caso de cancelación de los planes no existe reembolso proporcional.";

export const CANCELLATION_POLICY_MONTHLY =
  "Plan mensual: no hay reembolso ni cargo extra después de cancelar el plan.";

export const CANCELLATION_POLICY_ANNUAL =
  "Plan anual: por ser un plan con descuento adicional, no hay reembolso ni cargo adicional después de cancelar o dar de baja el plan.";

export const CANCELLATION_POLICY_BULLETS = [
  CANCELLATION_POLICY_GENERAL,
  CANCELLATION_POLICY_MONTHLY,
  CANCELLATION_POLICY_ANNUAL,
] as const;

export const CANCELLATION_POLICY_SUMMARY = CANCELLATION_POLICY_BULLETS.join(" ");

export const CANCELLATION_POLICY_FAQ_ANSWER =
  "No hay permanencia ni multas. " +
  CANCELLATION_POLICY_GENERAL +
  " " +
  CANCELLATION_POLICY_MONTHLY +
  " " +
  CANCELLATION_POLICY_ANNUAL +
  " Para dar de baja escribe a hola@alarmaseniorsafe.cl.";

/** Enlace al apartado legal de cancelación (Términos y Condiciones). */
export const SENIOR_SAFE_TERMS_CANCELLATION_URL = "https://alarmaseniorsafe.cl/terminos#cancelacion";

/** Respuesta WhatsApp: derivar a Términos y Condiciones (reembolsos / cancelación). */
export const CANCELLATION_TERMS_WHATSAPP_REPLY =
  "Para reembolsos, cancelación o baja del plan (mensual o anual), revisa el apartado «Cancelación y reembolsos» en nuestros Términos y Condiciones: " +
  SENIOR_SAFE_TERMS_CANCELLATION_URL;
