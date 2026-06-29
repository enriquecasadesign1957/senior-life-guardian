import { resolveChargeAmountForSignup } from "@/lib/discount.functions";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import { normalizePlanKey } from "@/lib/plans";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { clearRenewalNoticeFlags } from "@/lib/subscription-renewal-flags";
import {
  authorizeOneclickMallTransaction,
  generateOneclickBuyOrders,
  getOneclickMallConfig,
  isOneclickMallPaymentEnabled,
} from "@/lib/transbank-oneclick-mall";

function toSupabaseJson(value: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function computeRenewalDate(periodo: "mensual" | "anual", from = new Date()): Date {
  const renewal = new Date(from);
  if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
  else renewal.setMonth(renewal.getMonth() + 1);
  return renewal;
}

export type OneclickRecurringChargeResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  mallBuyOrder?: string;
  storeBuyOrder?: string;
  amount?: number;
  responseCode?: number | null;
  authorizationCode?: string | null;
  status?: string | null;
};

/** Cobro Oneclick Mall para renovación (cron o admin). */
export async function attemptOneclickRecurringCharge(
  signupId: string,
): Promise<OneclickRecurringChargeResult> {
  if (!isOneclickMallPaymentEnabled()) {
    return { ok: false, skipped: true, reason: "Oneclick Mall no está habilitado." };
  }

  const cfg = getOneclickMallConfig();

  const { data: signup, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select(
      "id,email,plan,periodo,discount_code,list_price,discount_percent,payment_status,oneclick_username,oneclick_tbk_user,recurring_billing_consented_at",
    )
    .eq("id", signupId)
    .maybeSingle();

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

  const periodo = (signup.periodo as "mensual" | "anual") || "mensual";
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
    environment: cfg.environment,
  });

  const auth = await authorizeOneclickMallTransaction({
    username: signup.oneclick_username,
    tbkUser: signup.oneclick_tbk_user,
    buyOrder: mallBuyOrder,
    details: [
      {
        commerceCode: cfg.storeCommerceCode,
        buyOrder: storeBuyOrder,
        amount,
      },
    ],
  });

  const primary = auth.details[0];
  await supabaseAdmin
    .from("oneclick_transactions")
    .update({
      status: auth.ok ? "AUTHORIZED" : primary?.status || "REJECTED",
      response_code: primary?.responseCode ?? null,
      authorization_code: primary?.authorizationCode ?? null,
      payment_type_code: primary?.paymentTypeCode ?? null,
      raw_response: toSupabaseJson(auth.raw),
    })
    .eq("mall_buy_order", mallBuyOrder);

  if (auth.ok) {
    const now = new Date();
    const renewal = computeRenewalDate(periodo, now);
    await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        payment_status: "paid",
        subscription_status: "active",
        renewal_date: renewal.toISOString(),
        last_payment_at: now.toISOString(),
        oneclick_mall_buy_order: mallBuyOrder,
        oneclick_store_buy_order: storeBuyOrder,
        webpay_authorization_code: primary?.authorizationCode ?? null,
        webpay_response_code: primary?.responseCode ?? null,
      })
      .eq("id", signup.id);
    await clearRenewalNoticeFlags(signup.id);
  }

  return {
    ok: auth.ok,
    mallBuyOrder,
    storeBuyOrder,
    amount,
    responseCode: primary?.responseCode ?? null,
    authorizationCode: primary?.authorizationCode ?? null,
    status: primary?.status ?? null,
  };
}
