import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdminPin } from "@/lib/admin-auth";
import { chargeAmountFromSignup } from "@/lib/discount-codes";
import { recordDiscountRedemption, resolveDiscountForCheckout } from "@/lib/discount.functions";
import { CONTRACT_SIGNUPS_TABLE, isSignupPaidAndActive } from "@/lib/signups-db";
import { normalizePlanKey, planKeySchema, periodoSchema } from "@/lib/plans";
import { clearRenewalNoticeFlags } from "@/lib/subscription-renewal-flags";
import { sendPostPaymentInstallNotifications } from "@/lib/post-payment-install-notify";
import { markInstallPaid } from "@/lib/install-step-sync";
import { ensureFirstGuardianAfterPayment } from "@/lib/first-guardian-checkout";
import { attemptOneclickRecurringCharge } from "@/lib/oneclick-renewal-charge";
import {
  authorizeOneclickMallTransaction,
  buildOneclickReturnUrl,
  deleteOneclickMallInscription,
  finishOneclickMallInscription,
  generateOneclickBuyOrders,
  generateOneclickUsername,
  getOneclickMallConfig,
  isOneclickMallPaymentEnabled,
  refundOneclickMallTransaction,
  startOneclickMallInscription,
  statusOneclickMallTransaction,
} from "@/lib/transbank-oneclick-mall";
import { isTransbankLocalValidation } from "@/lib/transbank-webpay";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

function toSupabaseJson(value: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

const VALIDATION_REJECT_AMOUNT = 10_000_000;
const VALIDATION_APPROVED_AMOUNT = 6900;
const VALIDATION_TEST_EMAIL = "enriquecasadesign@gmail.com";

function generateValidationBuyOrders(prefix: string): { mallBuyOrder: string; storeBuyOrder: string } {
  const suffix = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-8);
  let mallBuyOrder = `${prefix}${suffix}`.slice(0, 26);
  let storeBuyOrder = `${mallBuyOrder}S`.slice(0, 26);
  if (storeBuyOrder === mallBuyOrder) {
    return generateOneclickBuyOrders();
  }
  return { mallBuyOrder, storeBuyOrder };
}

async function loadValidationOneclickSignup(email: string) {
  const { data: signup, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select(
      "id,email,oneclick_username,oneclick_tbk_user,oneclick_inscription_status,payment_status,last_payment_at",
    )
    .eq("email", email.toLowerCase())
    .not("oneclick_tbk_user", "is", null)
    .not("oneclick_username", "is", null)
    .order("last_payment_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!signup?.oneclick_tbk_user || !signup.oneclick_username) {
    throw new Error(
      `No hay inscripci?n Oneclick activa para ${email}. Completa primero una inscripci?n aprobada en /checkout.`,
    );
  }
  return signup;
}

async function runValidationAuthorize(
  signup: { id: string; email: string | null; oneclick_username: string },
  tbkUser: string,
  amount: number,
  buyOrders: { mallBuyOrder: string; storeBuyOrder: string },
) {
  const cfg = getOneclickMallConfig();
  const { mallBuyOrder, storeBuyOrder } = buyOrders;

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
    tbkUser,
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

  return { auth, primary, mallBuyOrder, storeBuyOrder, amount };
}

async function resolveCheckoutAmount(
  signup: {
    plan: string | null;
    periodo: string | null;
    discount_code: string | null;
    list_price: number | null;
    discount_percent: number | null;
  },
  plan: string,
  periodo: "mensual" | "anual",
): Promise<number> {
  let amount = chargeAmountFromSignup(plan, periodo, {
    list_price: signup.list_price,
    discount_percent: signup.discount_percent,
  });

  if (signup.discount_code) {
    const resolved = await resolveDiscountForCheckout(signup.discount_code, plan, periodo);
    amount = resolved.finalPrice;
  }

  return amount;
}

function computeRenewalDate(periodo: "mensual" | "anual", from = new Date()): Date {
  const renewal = new Date(from);
  if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
  else renewal.setMonth(renewal.getMonth() + 1);
  return renewal;
}

/** Monto fijo de prueba producci?n (Transbank pide ~$50). Quitar env tras validar. */
function resolveProdTestCheckoutAmount(): number | null {
  if (getOneclickMallConfig().environment !== "production") return null;
  const raw = process.env.TRANSBANK_PROD_TEST_AMOUNT?.trim();
  if (!raw) return null;
  const amount = Number.parseInt(raw, 10);
  if (!Number.isInteger(amount) || amount < 50) return null;
  return amount;
}

/** Inicia inscripci?n Oneclick Mall + registra orden de primer cobro. */
export const initOneclickCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        signupId: z.string().uuid(),
        plan: planKeySchema,
        periodo: periodoSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (!isOneclickMallPaymentEnabled()) {
      throw new Error("Oneclick Mall no est? habilitado. Configura TRANSBANK_PAYMENT_MODE=oneclick_mall.");
    }

    const cfg = getOneclickMallConfig();

    const { data: signup, error: signupErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(
        "id,email,plan,periodo,discount_code,discount_code_id,discount_percent,list_price,payment_status",
      )
      .eq("id", data.signupId)
      .maybeSingle();

    if (signupErr) throw signupErr;
    if (!signup) {
      throw new Error("No encontramos tu registro de contrataci?n. Vuelve a completar el checkout.");
    }
    const periodo = (signup.periodo as "mensual" | "anual") || data.periodo;
    const plan = normalizePlanKey(signup.plan || data.plan);
    let amount = await resolveCheckoutAmount(signup, plan, periodo);
    const prodTestAmount = resolveProdTestCheckoutAmount();
    if (prodTestAmount != null) amount = prodTestAmount;
    const username = generateOneclickUsername(data.signupId);
    const { mallBuyOrder, storeBuyOrder } = generateOneclickBuyOrders();
    const responseUrl = buildOneclickReturnUrl();

    const { error: txInsertErr } = await supabaseAdmin.from("oneclick_transactions").insert({
      contract_signup_id: data.signupId,
      mall_buy_order: mallBuyOrder,
      store_buy_order: storeBuyOrder,
      amount,
      operation: "authorize",
      status: "INITIATED",
      environment: cfg.environment,
    });

    if (txInsertErr) {
      throw new Error(`No se pudo registrar la orden Oneclick: ${txInsertErr.message}`);
    }

    const inscription = await startOneclickMallInscription({
      username,
      email: signup.email,
      responseUrl,
    });

    const { error: signupUpdErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        purchase_mode: "contratar",
        payment_provider: "oneclick_mall",
        payment_status: "pending",
        subscription_status: "pending_payment",
        oneclick_username: username,
        oneclick_inscription_token: inscription.token,
        oneclick_inscription_status: "pending",
        oneclick_mall_buy_order: mallBuyOrder,
        oneclick_store_buy_order: storeBuyOrder,
        webpay_amount: amount,
        webpay_environment: cfg.environment,
      })
      .eq("id", data.signupId);

    if (signupUpdErr) {
      throw new Error(`No se pudo actualizar la contrataci?n: ${signupUpdErr.message}`);
    }

    await supabaseAdmin
      .from("oneclick_transactions")
      .update({
        status: "INSCRIPTION_STARTED",
        raw_response: toSupabaseJson(inscription.raw),
      })
      .eq("mall_buy_order", mallBuyOrder);

    return {
      ok: true,
      token: inscription.token,
      url: inscription.urlWebpay,
      tbkToken: inscription.token,
      mallBuyOrder,
      storeBuyOrder,
      amount,
      environment: cfg.environment,
      responseUrl,
    };
  });

/** Finaliza inscripci?n y autoriza el primer cobro (checkout). */
export const finishOneclickCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = getOneclickMallConfig();

    const { data: signup } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(
        "id,periodo,payment_status,subscription_status,discount_code_id,oneclick_username,oneclick_mall_buy_order,oneclick_store_buy_order,webpay_amount,webpay_authorization_code,webpay_response_code",
      )
      .eq("oneclick_inscription_token", data.token)
      .maybeSingle();

    const alreadyActive = signup ? isSignupPaidAndActive(signup) : false;

    if (alreadyActive) {
      await ensureFirstGuardianAfterPayment(signup!.id).catch((e) => {
        console.error("[oneclick] first guardian (alreadyActive):", e);
      });
      return {
        ok: true,
        status: "AUTHORIZED",
        responseCode: signup?.webpay_response_code ?? 0,
        authorizationCode: signup?.webpay_authorization_code ?? null,
        amount: signup?.webpay_amount ?? 0,
        mallBuyOrder: signup?.oneclick_mall_buy_order ?? null,
        storeBuyOrder: signup?.oneclick_store_buy_order ?? null,
        cardLast4: null,
        signupId: signup?.id ?? null,
        alreadyConfirmed: true,
      };
    }

    const finish = await finishOneclickMallInscription(data.token);

    if (signup?.id) {
      await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update({
          oneclick_inscription_status: finish.ok ? "active" : "failed",
          oneclick_tbk_user: finish.tbkUser,
          oneclick_card_last4: finish.cardLast4,
          webpay_response_code: finish.responseCode,
        })
        .eq("id", signup.id);
    }

    if (!finish.ok || !finish.tbkUser || !signup?.oneclick_username) {
      if (signup?.id) {
        await supabaseAdmin
          .from(CONTRACT_SIGNUPS_TABLE)
          .update({
            payment_status: "failed",
            subscription_status: "payment_failed",
          })
          .eq("id", signup.id);
      }
      return {
        ok: false,
        status: "INSCRIPTION_FAILED",
        responseCode: finish.responseCode,
        signupId: signup?.id ?? null,
      };
    }

    const amount = signup.webpay_amount ?? 0;
    const mallBuyOrder = signup.oneclick_mall_buy_order;
    const storeBuyOrder = signup.oneclick_store_buy_order;

    if (!mallBuyOrder || !storeBuyOrder || amount <= 0) {
      throw new Error("Faltan datos de la orden Oneclick para autorizar el cobro.");
    }

    const auth = await authorizeOneclickMallTransaction({
      username: signup.oneclick_username,
      tbkUser: finish.tbkUser,
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

    let installNotify: Awaited<ReturnType<typeof sendPostPaymentInstallNotifications>> | undefined;

    if (auth.ok && signup.id) {
      await recordDiscountRedemption({
        discount_code_id: signup.discount_code_id ?? null,
        payment_status: signup.payment_status ?? null,
      });

      const periodo = (signup.periodo as "mensual" | "anual") || "mensual";
      const now = new Date();
      const renewal = computeRenewalDate(periodo, now);

      await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update({
          payment_status: "paid",
          subscription_status: "active",
          renewal_date: renewal.toISOString(),
          last_payment_at: now.toISOString(),
          webpay_authorization_code: primary?.authorizationCode ?? null,
          webpay_response_code: primary?.responseCode ?? null,
          oneclick_card_last4: auth.cardLast4 ?? finish.cardLast4,
        })
        .eq("id", signup.id);
      await markInstallPaid(signup.id).catch((e) => {
        console.warn("[oneclick] install_step paid", e);
      });
      await clearRenewalNoticeFlags(signup.id);
      await ensureFirstGuardianAfterPayment(signup.id).catch((e) => {
        console.error("[oneclick] first guardian:", e);
      });
      installNotify = await sendPostPaymentInstallNotifications(signup.id).catch((e) => {
        console.error("[oneclick] install notify:", e);
        return {
          sent: false,
          emailSent: false,
          whatsappSent: false,
          smsSent: false,
          skippedReason: "error",
        };
      });
    } else if (signup.id) {
      await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update({
          payment_status: "failed",
          subscription_status: "payment_failed",
          webpay_response_code: primary?.responseCode ?? null,
        })
        .eq("id", signup.id);
    }

    return {
      ok: auth.ok,
      status: primary?.status ?? "UNKNOWN",
      responseCode: primary?.responseCode ?? null,
      authorizationCode: primary?.authorizationCode ?? null,
      amount,
      mallBuyOrder,
      storeBuyOrder,
      cardLast4: auth.cardLast4 ?? finish.cardLast4,
      signupId: signup.id,
      installNotify,
    };
  });

/** Prueba validaci?n Transbank: authorize cr?dito aprobado ($6.900, 1 cuota). */
export const authorizeOneclickApprovedValidation = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().email().optional(), pin: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    if (getOneclickMallConfig().environment === "production" && !isTransbankLocalValidation()) {
      throw new Error("Esta prueba solo est? disponible en integraci?n local (npm run dev:demo).");
    }

    const email = (data.email ?? VALIDATION_TEST_EMAIL).toLowerCase();
    const signup = await loadValidationOneclickSignup(email);
    const buyOrders = generateValidationBuyOrders("SSMQAPRO");
    const { auth, primary, mallBuyOrder, storeBuyOrder, amount } = await runValidationAuthorize(
      signup,
      signup.oneclick_tbk_user!,
      VALIDATION_APPROVED_AMOUNT,
      buyOrders,
    );

    return {
      approved: auth.ok,
      mallBuyOrder,
      storeBuyOrder,
      amount,
      responseCode: primary?.responseCode ?? null,
      status: primary?.status ?? null,
      authorizationCode: primary?.authorizationCode ?? null,
      paymentTypeCode: primary?.paymentTypeCode ?? null,
      cardLast4: auth.cardLast4,
      email: signup.email,
      username: signup.oneclick_username,
      raw: auth.raw,
    };
  });

/** Prueba validaci?n Transbank: authorize $10.000.000 ? rechazo sandbox (-98). */
export const authorizeOneclickTenMillionRejectValidation = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().email().optional(), pin: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    if (getOneclickMallConfig().environment === "production" && !isTransbankLocalValidation()) {
      throw new Error("Esta prueba solo est? disponible en integraci?n local (npm run dev:demo).");
    }

    const email = (data.email ?? VALIDATION_TEST_EMAIL).toLowerCase();
    const signup = await loadValidationOneclickSignup(email);
    const buyOrders = generateValidationBuyOrders("SSMQRECH");
    const { auth, primary, mallBuyOrder, storeBuyOrder, amount } = await runValidationAuthorize(
      signup,
      signup.oneclick_tbk_user!,
      VALIDATION_REJECT_AMOUNT,
      buyOrders,
    );

    return {
      rejected: !auth.ok,
      mallBuyOrder,
      storeBuyOrder,
      amount,
      responseCode: primary?.responseCode ?? null,
      status: primary?.status ?? null,
      email: signup.email,
      username: signup.oneclick_username,
      raw: auth.raw,
    };
  });

/** Cobro recurrente con tbk_user (validaci?n + renovaciones futuras). */

export const authorizeOneclickRenewal = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: z.string().uuid(), pin: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const charge = await attemptOneclickRecurringCharge(data.signupId);
    if (charge.skipped) {
      throw new Error(charge.reason ?? "No se pudo intentar el cobro recurrente.");
    }
    return {
      ok: charge.ok,
      mallBuyOrder: charge.mallBuyOrder,
      storeBuyOrder: charge.storeBuyOrder,
      amount: charge.amount,
      responseCode: charge.responseCode ?? null,
      authorizationCode: charge.authorizationCode ?? null,
      status: charge.status ?? null,
    };
  });

export const statusOneclickPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ mallBuyOrder: z.string().min(4).max(26), pin: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const status = await statusOneclickMallTransaction(data.mallBuyOrder);
    return {
      ok: true,
      buyOrder: status.buyOrder,
      cardLast4: status.cardLast4,
      details: status.details,
      raw: status.raw,
    };
  });

export const refundOneclickPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        mallBuyOrder: z.string().min(4).max(26),
        storeBuyOrder: z.string().min(4).max(26),
        amount: z.number().int().positive(),
        pin: z.string().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const cfg = getOneclickMallConfig();
    const refund = await refundOneclickMallTransaction({
      mallBuyOrder: data.mallBuyOrder,
      storeCommerceCode: cfg.storeCommerceCode,
      storeBuyOrder: data.storeBuyOrder,
      amount: data.amount,
    });

    await supabaseAdmin.from("oneclick_transactions").insert({
      contract_signup_id: null,
      mall_buy_order: data.mallBuyOrder,
      store_buy_order: data.storeBuyOrder,
      amount: data.amount,
      operation: "refund",
      status: refund.ok ? "REFUNDED" : "REFUND_FAILED",
      environment: cfg.environment,
      raw_response: toSupabaseJson(refund.raw),
    });

    return { ok: refund.ok, type: refund.type, raw: refund.raw };
  });

export const removeOneclickInscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: z.string().uuid(), pin: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const { data: signup, error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id,oneclick_username,oneclick_tbk_user")
      .eq("id", data.signupId)
      .maybeSingle();

    if (error) throw error;
    if (!signup?.oneclick_username || !signup.oneclick_tbk_user) {
      throw new Error("No hay inscripci?n Oneclick activa para esta cuenta.");
    }

    await deleteOneclickMallInscription(signup.oneclick_tbk_user, signup.oneclick_username);

    await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        oneclick_inscription_status: "deleted",
        oneclick_tbk_user: null,
      })
      .eq("id", signup.id);

    return { ok: true };
  });

export const getOneclickValidationInfo = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ pin: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    const cfg = getOneclickMallConfig();
    const isSandbox = cfg.environment !== "production";
    return {
      enabled: isOneclickMallPaymentEnabled(),
      environment: cfg.environment,
      mallCommerceCode: cfg.mallCommerceCode,
      storeCommerceCode: cfg.storeCommerceCode,
      returnUrl: buildOneclickReturnUrl(),
      testCards: isSandbox
        ? {
            approvedVisa: "4051885600446623",
            approvedAmex: "370000000002032",
            rejectedCreditMastercard: "5186059559590568",
            rejectedRedcompra: "5186008541233829",
            approvedRedcompra: "4051884239937763",
            rejectedPrepaidMastercard: "5186174110629480",
            rut: "11.111.111-1",
            password: "123",
            cvv: "123",
            amexCvv: "1234",
          }
        : null,
      validationCases: [
        "Inscripci?n aprobada (tarjeta de prueba aprobada)",
        "Inscripci?n rechazada (tarjeta de prueba rechazada)",
        "Cobro autorizado (primer pago tras inscripci?n)",
        "Consulta estado de transacci?n (GET status)",
        "Anulaci?n / reverso (refund)",
        "Eliminar inscripci?n (DELETE inscription)",
      ],
      formUrl: "https://www.transbankdevelopers.cl/documentacion/como_empezar",
    };
  });

export const lookupOneclickSignup = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().optional(),
        signupId: z.string().uuid().optional(),
        pin: z.string().min(1).max(64),
      })
      .refine((v) => v.email || v.signupId, "Indica email o signupId")
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertAdminPin(data.pin);
    let query = supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select(
        "id,nombre,email,payment_provider,payment_status,subscription_status,oneclick_username,oneclick_tbk_user,oneclick_inscription_status,oneclick_mall_buy_order,oneclick_store_buy_order,oneclick_card_last4,webpay_amount,webpay_authorization_code,renewal_date,created_at",
      )
      .eq("payment_provider", "oneclick_mall")
      .order("created_at", { ascending: false })
      .limit(5);

    if (data.signupId) query = query.eq("id", data.signupId);
    else if (data.email) query = query.eq("email", data.email.toLowerCase());

    const { data: rows, error } = await query;
    if (error) throw error;
    return { rows: rows ?? [] };
  });
