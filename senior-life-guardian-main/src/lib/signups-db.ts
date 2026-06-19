/**
 * Maestro de contratación directa (Plan Único).
 * Reemplaza la tabla eliminada `trial_signups`.
 */
export const CONTRACT_SIGNUPS_TABLE = "contract_signups";

/** Columnas usadas en checkout / Webpay / app. */
export const CONTRACT_SIGNUP_SELECT =
  "id,nombre,email,telefono,plan,periodo,purchase_mode,payment_status,subscription_status,direccion,webpay_buy_order,webpay_session_id,webpay_token,webpay_amount,webpay_environment,renewal_date,last_payment_at,webpay_authorization_code,webpay_response_code,onboarding_completed,whatsapp_activated,discount_code_id,discount_code,discount_partner,discount_percent,list_price,recurring_billing_consented_at,recurring_billing_consent_version,created_at";

export type ContractSignupRow = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  plan: string;
  periodo: string;
  purchase_mode: string;
  payment_status: string;
  subscription_status: string;
  direccion?: string | null;
  webpay_buy_order?: string | null;
  webpay_session_id?: string | null;
  webpay_token?: string | null;
  webpay_amount?: number | null;
  webpay_environment?: string | null;
  renewal_date?: string | null;
  last_payment_at?: string | null;
  webpay_authorization_code?: string | null;
  webpay_response_code?: number | null;
  onboarding_completed?: boolean;
  whatsapp_activated?: boolean;
  discount_code_id?: string | null;
  discount_code?: string | null;
  discount_partner?: string | null;
  discount_percent?: number | null;
  list_price?: number | null;
  created_at?: string;
};

/** Payload al crear o actualizar antes del pago Webpay. */
export function contractSignupPendingPayload(data: {
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string | null;
  plan: string;
  periodo: string;
}) {
  return {
    nombre: data.nombre.trim(),
    email: data.email.trim().toLowerCase(),
    telefono: data.telefono.trim(),
    direccion: data.direccion?.trim() || null,
    plan: data.plan,
    periodo: data.periodo,
    purchase_mode: "contratar",
    payment_status: "pending",
    subscription_status: "pending_payment",
  };
}
