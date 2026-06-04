import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizePlanKey, planAmount, planKeySchema, periodoSchema } from "@/lib/plans";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import {
  buildWebpayReturnUrl,
  confirmWebpayPlusTransaction,
  createWebpayPlusTransaction,
  generateWebpayBuyOrder,
  generateWebpaySessionId,
  getTransbankConfig,
} from "@/lib/transbank-webpay";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * 1) INICIAR TRANSACCIÓN WEBPAY PLUS
 * Registra la orden en Supabase y conecta con Transbank en Producción.
 */
export const initWebpayTransaction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      signupId: z.string().uuid(),
      plan: planKeySchema,
      periodo: periodoSchema,
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = getTransbankConfig();

    const { data: signup, error: signupErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id")
      .eq("id", data.signupId)
      .maybeSingle();

    if (signupErr) throw signupErr;
    if (!signup) {
      throw new Error("No encontramos tu registro de contratación. Vuelve a completar el checkout.");
    }

    const amount = planAmount(data.plan, data.periodo);
    const buyOrder = generateWebpayBuyOrder();
    const sessionId = generateWebpaySessionId(data.signupId);
    const returnUrl = buildWebpayReturnUrl();

    const { error: txInsertErr } = await supabaseAdmin.from("webpay_transactions").insert({
      contract_signup_id: data.signupId,
      buy_order: buyOrder,
      session_id: sessionId,
      amount,
      status: "INITIATED",
      environment: cfg.environment,
    });
    
    if (txInsertErr) {
      console.error("[webpay] error webpay_transactions insert:", txInsertErr);
      throw new Error(`No se pudo registrar la orden de pago: ${txInsertErr.message}`);
    }

    const { error: signupUpdErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        purchase_mode: "contratar",
        payment_status: "pending",
        subscription_status: "pending_payment",
        webpay_buy_order: buyOrder,
        webpay_session_id: sessionId,
        webpay_amount: amount,
        webpay_environment: cfg.environment,
      })
      .eq("id", data.signupId);

    if (signupUpdErr) {
      console.error("[webpay] error contract_signups update:", signupUpdErr);
      throw new Error(`No se pudo actualizar la contratación: ${signupUpdErr.message}`);
    }

    const tb = await createWebpayPlusTransaction({
      buyOrder,
      sessionId,
      amount,
      returnUrl,
    });

    const { error: txTokenErr } = await supabaseAdmin
      .from("webpay_transactions")
      .update({ token: tb.token, status: "TOKEN_ISSUED", raw_response: tb.raw })
      .eq("buy_order", buyOrder);

    if (txTokenErr) {
      console.error("[webpay] error al guardar el token:", txTokenErr);
    }

    await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({ webpay_token: tb.token })
      .eq("id", data.signupId);

    return {
      ok: true,
      token: tb.token,
      url: tb.url,
      token_ws: tb.token,
      buyOrder: tb.buyOrder,
      amount: tb.amount,
      environment: cfg.environment,
      returnUrl,
    };
  });

/**
 * 2) CONFIRMAR TRANSACCIÓN WEBPAY PLUS
 * Se ejecuta cuando Transbank nos devuelve al usuario con el token de pago exitoso o rechazado.
 */
export const confirmWebpayTransaction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await confirmWebpayPlusTransaction(data.token);

    const { data: tx } = await supabaseAdmin
      .from("webpay_transactions")
      .select("id, contract_signup_id, buy_order")
      .eq("token", data.token)
      .maybeSingle();

    await supabaseAdmin
      .from("webpay_transactions")
      .update({
        status: result.ok ? "AUTHORIZED" : result.status || "REJECTED",
        response_code: result.responseCode,
        authorization_code: result.authorizationCode,
        card_last4: result.cardLast4,
        payment_type_code:
          typeof result.raw.payment_type_code === "string"
            ? result.raw.payment_type_code
            : null,
        raw_response: result.raw,
      })
      .eq("token", data.token);

    if (tx?.contract_signup_id) {
      if (result.ok) {
        const { data: signup } = await supabaseAdmin
          .from(CONTRACT_SIGNUPS_TABLE)
          .select("periodo")
          .eq("id", tx.contract_signup_id)
          .maybeSingle();

        const periodo = (signup?.periodo as "mensual" | "anual") || "mensual";
        const now = new Date();
        const renewal = new Date(now);
        if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
        else renewal.setMonth(renewal.getMonth() + 1);

        await supabaseAdmin
          .from(CONTRACT_SIGNUPS_TABLE)
          .update({
            payment_status: "paid",
            subscription_status: "active",
            renewal_date: renewal.toISOString(),
            last_payment_at: now.toISOString(),
            webpay_authorization_code: result.authorizationCode,
            webpay_response_code: result.responseCode,
          })
          .eq("id", tx.contract_signup_id);
      } else {
        await supabaseAdmin
          .from(CONTRACT_SIGNUPS_TABLE)
          .update({
            payment_status: "failed",
            subscription_status: "payment_failed",
            webpay_response_code: result.responseCode,
          })
          .eq("id", tx.contract_signup_id);
      }
    }

    return {
      ok: result.ok,
      status: result.status,
      responseCode: result.responseCode,
      authorizationCode: result.authorizationCode,
      amount: result.amount,
      buyOrder: result.buyOrder ?? tx?.buy_order ?? null,
      cardLast4: result.cardLast4,
      signupId: tx?.contract_signup_id ?? null,
    };
  });

/**
 * 3) SIMULADOR DE PAGO (MOCK) EN ENTRENAMIENTO
 * Disponible únicamente en ambiente de desarrollo local.
 */
export const mockApproveWebpay = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      signupId: z.string().uuid().optional(),
      token: z.string().min(4).max(128).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = getTransbankConfig();
    if (cfg.environment === "production") {
      throw new Error("Mock approval no está disponible en producción.");
    }
    if (!data.signupId && !data.token) {
      throw new Error("Se requiere signupId o token.");
    }

    let tx: { id: string; contract_signup_id: string | null; buy_order: string; amount: number } | null =
      null;
    if (data.token) {
      const { data: row } = await supabaseAdmin
        .from("webpay_transactions")
        .select("id, contract_signup_id, buy_order, amount")
        .eq("token", data.token)
        .maybeSingle();
      tx = row ?? null;
    }
    if (!tx && data.signupId) {
      const { data: row } = await supabaseAdmin
        .from("webpay_transactions")
        .select("id, contract_signup_id, buy_order, amount")
        .eq("contract_signup_id", data.signupId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      tx = row ?? null;
    }

    const signupId = data.signupId ?? tx?.contract_signup_id ?? null;
    if (!signupId) throw new Error("No se encontró la suscripción a aprobar.");

    const authCode = `MOCK${Date.now().toString().slice(-6)}`;
    const buyOrder = tx?.buy_order ?? generateWebpayBuyOrder();

    if (tx?.id) {
      await supabaseAdmin
        .from("webpay_transactions")
        .update({
          status: "AUTHORIZED",
          response_code: 0,
          authorization_code: authCode,
          card_last4: "6623",
          payment_type_code: "VN",
          raw_response: { mock: true, approved_at: new Date().toISOString() },
        })
        .eq("id", tx.id);
    } else {
      await supabaseAdmin.from("webpay_transactions").insert({
        contract_signup_id: signupId,
        buy_order: buyOrder,
        amount: 0,
        status: "AUTHORIZED",
        environment: cfg.environment,
        response_code: 0,
        authorization_code: authCode,
        card_last4: "6623",
        payment_type_code: "VN",
        raw_response: { mock: true, approved_at: new Date().toISOString() },
      });
    }

    const { data: signup } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("periodo")
      .eq("id", signupId)
      .maybeSingle();
    const periodo = (signup?.periodo as "mensual" | "anual") || "mensual";

    const now = new Date();
    const renewal = new Date(now);
    if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
    else renewal.setMonth(renewal.getMonth() + 1);

    await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        payment_status: "paid",
        subscription_status: "active",
        renewal_date: renewal.toISOString(),
        last_payment_at: now.toISOString(),
        webpay_authorization_code: authCode,
        webpay_response_code: 0,
      })
      .eq("id", signupId);

    return {
      ok: true,
      mock: true,
      status: "AUTHORIZED",
      authorizationCode: authCode,
      buyOrder,
      signupId,
    };
  });

/**
 * 4) ACTIVAR SUSCRIPCIÓN MANUALMENTE
 */
export const activateSubscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        signupId: z.string().uuid(),
        periodo: z.enum(["mensual", "anual"]),
        authorizationCode: z.string().max(64).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const now = new Date();
    const renewal = new Date(now);
    if (data.periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
    else renewal.setMonth(renewal.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({
        payment_status: "paid",
        subscription_status: "active",
        renewal_date: renewal.toISOString(),
        last_payment_at: now.toISOString(),
        webpay_authorization_code: data.authorizationCode ?? null,
      })
      .eq("id", data.signupId);

    if (error) throw error;
    return { ok: true, renewalDate: renewal.toISOString() };
  });

/**
 * 5) CANCELAR SUSCRIPCIÓN (OPT-OUT)
 */
export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ signupId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .update({ subscription_status: "cancelled" })
      .eq("id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });
