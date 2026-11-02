const CONTRACT_SIGNUPS_TABLE = "contract_signups";
const CONTRACT_SIGNUP_SELECT = "id,nombre,email,telefono,plan,periodo,purchase_mode,payment_status,subscription_status,direccion,webpay_buy_order,webpay_session_id,webpay_token,webpay_amount,webpay_environment,renewal_date,last_payment_at,webpay_authorization_code,webpay_response_code,onboarding_completed,whatsapp_activated,install_step,app_opened_at,sos_primed_at,fall_sensor_prompted_at,discount_code_id,discount_code,discount_partner,discount_percent,list_price,recurring_billing_consented_at,recurring_billing_consent_version,created_at";
function contractSignupPendingPayload(data) {
  return {
    nombre: data.nombre.trim(),
    email: data.email.trim().toLowerCase(),
    telefono: data.telefono.trim(),
    direccion: data.direccion?.trim() || null,
    plan: data.plan,
    periodo: data.periodo,
    purchase_mode: "contratar",
    payment_status: "pending",
    subscription_status: "pending_payment"
  };
}
function isSignupPaidAndActive(row) {
  if (row.payment_status === "paid") return true;
  const sub = row.subscription_status ?? "";
  return sub === "active" || sub === "comp";
}
export {
  CONTRACT_SIGNUPS_TABLE as C,
  CONTRACT_SIGNUP_SELECT as a,
  contractSignupPendingPayload as c,
  isSignupPaidAndActive as i
};
