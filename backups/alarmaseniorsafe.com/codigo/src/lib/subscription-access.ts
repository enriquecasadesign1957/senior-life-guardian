/** Estados que permiten usar el servicio (alertas, app). */
const ALLOWED_STATUSES = new Set(["active"]);

export function isSubscriptionServiceAllowed(
  subscriptionStatus: string | null | undefined,
): boolean {
  return ALLOWED_STATUSES.has(subscriptionStatus ?? "");
}

export function subscriptionBlockedMessage(
  subscriptionStatus: string | null | undefined,
): string {
  if (subscriptionStatus === "suspended") {
    return "Tu plan está suspendido por falta de pago. Renueva en alarmaseniorsafe.cl/checkout para reactivar las alertas.";
  }
  if (subscriptionStatus === "cancelled") {
    return "Tu suscripción fue cancelada. Contrata nuevamente en alarmaseniorsafe.cl para reactivar el servicio.";
  }
  if (subscriptionStatus === "pending_payment" || subscriptionStatus === "payment_failed") {
    return "Completa el pago de tu plan para activar las alertas de emergencia.";
  }
  return "Tu plan no está activo. Contacta a hola@alarmaseniorsafe.cl";
}
