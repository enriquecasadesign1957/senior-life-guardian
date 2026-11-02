const ALLOWED_STATUSES = /* @__PURE__ */ new Set(["active"]);
function isSubscriptionServiceAllowed(subscriptionStatus) {
  return ALLOWED_STATUSES.has(subscriptionStatus ?? "");
}
function subscriptionBlockedMessage(subscriptionStatus) {
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
export {
  isSubscriptionServiceAllowed as i,
  subscriptionBlockedMessage as s
};
