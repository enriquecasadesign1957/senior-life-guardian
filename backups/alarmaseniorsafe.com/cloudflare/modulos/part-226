import { a as resolveChargeAmountForSignup } from "./discount.functions-CbzrjeJP.mjs";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.mjs";
import { n as normalizePlanKey } from "./plans-BJeLFmLc.mjs";
import { C as CONTRACT_SIGNUPS_TABLE } from "./signups-db-JWUtXpaW.mjs";
import { c as clearRenewalNoticeFlags } from "./transactional-email-html-C_kx3NhX.mjs";
import { i as isOneclickMallPaymentEnabled, g as getOneclickMallConfig, a as generateOneclickBuyOrders, b as authorizeOneclickMallTransaction } from "./transbank-oneclick-mall-CC5wwzFZ.mjs";
function toSupabaseJson(value) {
  return JSON.parse(JSON.stringify(value));
}
function computeRenewalDate(periodo, from = /* @__PURE__ */ new Date()) {
  const renewal = new Date(from);
  if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
  else renewal.setMonth(renewal.getMonth() + 1);
  return renewal;
}
async function attemptOneclickRecurringCharge(signupId) {
  if (!isOneclickMallPaymentEnabled()) {
    return { ok: false, skipped: true, reason: "Oneclick Mall no está habilitado." };
  }
  const cfg = getOneclickMallConfig();
  const { data: signup, error } = await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).select(
    "id,email,plan,periodo,discount_code,list_price,discount_percent,payment_status,oneclick_username,oneclick_tbk_user,recurring_billing_consented_at"
  ).eq("id", signupId).maybeSingle();
  if (error) throw error;
  if (!signup?.recurring_billing_consented_at) {
    return { ok: false, skipped: true, reason: "Sin consentimiento de cobros recurrentes." };
  }
  if (!signup.oneclick_username || !signup.oneclick_tbk_user) {
    return { ok: false, skipped: true, reason: "Sin tarjeta inscrita en Oneclick." };
  }
  if (signup.payment_status === "comp") {
    return { ok: false, skipped: true, reason: "Cuenta en gratuidad." };
  }
  const periodo = signup.periodo || "mensual";
  const plan = normalizePlanKey(signup.plan);
  const amount = await resolveChargeAmountForSignup(signup, plan, periodo);
  const { mallBuyOrder, storeBuyOrder } = generateOneclickBuyOrders();
  await supabaseAdmin.from("oneclick_transactions").insert({
    contract_signup_id: signup.id,
    mall_buy_order: mallBuyOrder,
    store_buy_order: storeBuyOrder,
    amount,
    operation: "authorize",
    status: "INITIATED",
    environment: cfg.environment
  });
  const auth = await authorizeOneclickMallTransaction({
    username: signup.oneclick_username,
    tbkUser: signup.oneclick_tbk_user,
    buyOrder: mallBuyOrder,
    details: [
      {
        commerceCode: cfg.storeCommerceCode,
        buyOrder: storeBuyOrder,
        amount
      }
    ]
  });
  const primary = auth.details[0];
  await supabaseAdmin.from("oneclick_transactions").update({
    status: auth.ok ? "AUTHORIZED" : primary?.status || "REJECTED",
    response_code: primary?.responseCode ?? null,
    authorization_code: primary?.authorizationCode ?? null,
    payment_type_code: primary?.paymentTypeCode ?? null,
    raw_response: toSupabaseJson(auth.raw)
  }).eq("mall_buy_order", mallBuyOrder);
  if (auth.ok) {
    const now = /* @__PURE__ */ new Date();
    const renewal = computeRenewalDate(periodo, now);
    await supabaseAdmin.from(CONTRACT_SIGNUPS_TABLE).update({
      payment_status: "paid",
      subscription_status: "active",
      renewal_date: renewal.toISOString(),
      last_payment_at: now.toISOString(),
      oneclick_mall_buy_order: mallBuyOrder,
      oneclick_store_buy_order: storeBuyOrder,
      webpay_authorization_code: primary?.authorizationCode ?? null,
      webpay_response_code: primary?.responseCode ?? null
    }).eq("id", signup.id);
    await clearRenewalNoticeFlags(signup.id);
  }
  return {
    ok: auth.ok,
    mallBuyOrder,
    storeBuyOrder,
    amount,
    responseCode: primary?.responseCode ?? null,
    authorizationCode: primary?.authorizationCode ?? null,
    status: primary?.status ?? null
  };
}
export {
  attemptOneclickRecurringCharge as a
};
