/**
 * Webpay Plus integration (Transbank).
 *
 * Modo por defecto: SANDBOX (integración) con credenciales públicas de prueba.
 * Para producción definir secrets:
 *   - TRANSBANK_COMMERCE_CODE
 *   - TRANSBANK_API_KEY
 *   - WEBPAY_ENVIRONMENT=production
 *
 * Tarjeta de prueba sandbox (VISA): 4051 8856 0044 6623, CVV 123, cualquier fecha.
 * Usuario simulador: 11.111.111-1 / 123.
 *
 * Docs: https://www.transbankdevelopers.cl/documentacion/como_empezar
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SANDBOX_COMMERCE_CODE = "597055555532";
const SANDBOX_API_KEY = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const SANDBOX_HOST = "https://webpay3gint.transbank.cl";
const PRODUCTION_HOST = "https://webpay3g.transbank.cl";

const PLAN_PRICES: Record<string, { mensual: number; anual: number }> = {
  basico: { mensual: 5900, anual: 65000 },
  premium: { mensual: 7900, anual: 85000 },
};

function planAmount(plan: string, periodo: string): number {
  const p = PLAN_PRICES[plan];
  if (!p) throw new Error("Plan inválido");
  return periodo === "anual" ? p.anual : p.mensual;
}

function getConfig() {
  const env = (process.env.WEBPAY_ENVIRONMENT as "sandbox" | "production") || "sandbox";
  const isProd = env === "production";
  return {
    environment: env,
    host: isProd ? PRODUCTION_HOST : SANDBOX_HOST,
    commerceCode: process.env.TRANSBANK_COMMERCE_CODE || (isProd ? "" : SANDBOX_COMMERCE_CODE),
    apiKey: process.env.TRANSBANK_API_KEY || (isProd ? "" : SANDBOX_API_KEY),
  };
}

function tbkHeaders(cfg: ReturnType<typeof getConfig>) {
  return {
    "Tbk-Api-Key-Id": cfg.commerceCode,
    "Tbk-Api-Key-Secret": cfg.apiKey,
    "Content-Type": "application/json",
  };
}

/**
 * Crea una transacción Webpay Plus y devuelve { token, url } para redirección.
 */
export const initWebpayTransaction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      signupId: z.string().uuid(),
      plan: z.enum(["basico", "premium"]),
      periodo: z.enum(["mensual", "anual"]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = getConfig();
    if (!cfg.commerceCode || !cfg.apiKey) {
      throw new Error("Webpay no está configurado (faltan credenciales)");
    }

    const amount = planAmount(data.plan, data.periodo);
    const buyOrder = `SS-${Date.now().toString(36).toUpperCase()}`.slice(0, 26);
    const sessionId = `sess-${data.signupId.slice(0, 20)}`;

    // returnUrl absoluto requerido por Transbank
    const baseUrl =
      process.env.PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "https://alarmaseniorsafe.cl";
    const returnUrl = `${baseUrl.replace(/\/$/, "")}/webpay/retorno`;

    // Persistir intento ANTES de llamar a Transbank
    await supabaseAdmin.from("webpay_transactions").insert({
      trial_signup_id: data.signupId,
      buy_order: buyOrder,
      session_id: sessionId,
      amount,
      status: "INITIATED",
      environment: cfg.environment,
    });

    await supabaseAdmin
      .from("trial_signups")
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

    // Llamada real a Transbank
    const res = await fetch(
      `${cfg.host}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        method: "POST",
        headers: tbkHeaders(cfg),
        body: JSON.stringify({
          buy_order: buyOrder,
          session_id: sessionId,
          amount,
          return_url: returnUrl,
        }),
      },
    );

    const body = await res.json().catch(() => ({}));

    if (!res.ok || !body?.token || !body?.url) {
      console.error("[webpay] init failed", res.status, body);
      await supabaseAdmin
        .from("webpay_transactions")
        .update({ status: "INIT_FAILED", raw_response: body })
        .eq("buy_order", buyOrder);
      throw new Error(
        `No se pudo iniciar Webpay (${res.status}). ${body?.error_message || ""}`,
      );
    }

    await supabaseAdmin
      .from("webpay_transactions")
      .update({ token: body.token, raw_response: body })
      .eq("buy_order", buyOrder);

    await supabaseAdmin
      .from("trial_signups")
      .update({ webpay_token: body.token })
      .eq("id", data.signupId);

    return {
      ok: true,
      token: body.token as string,
      url: body.url as string,
      buyOrder,
      amount,
      environment: cfg.environment,
    };
  });

/**
 * Confirma (commit) la transacción tras el retorno del usuario desde Webpay.
 * Si la respuesta es exitosa, activa la suscripción.
 */
export const confirmWebpayTransaction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ token: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data }) => {
    const cfg = getConfig();

    const res = await fetch(
      `${cfg.host}/rswebpaytransaction/api/webpay/v1.2/transactions/${data.token}`,
      { method: "PUT", headers: tbkHeaders(cfg) },
    );

    const body = await res.json().catch(() => ({}));

    // Buscar transacción/signup por token (insertado en init)
    const { data: tx } = await supabaseAdmin
      .from("webpay_transactions")
      .select("id, trial_signup_id, buy_order")
      .eq("token", data.token)
      .maybeSingle();

    const approved =
      res.ok &&
      body?.response_code === 0 &&
      (body?.status === "AUTHORIZED" || body?.status === "APPROVED");

    await supabaseAdmin
      .from("webpay_transactions")
      .update({
        status: approved ? "AUTHORIZED" : (body?.status || "REJECTED"),
        response_code: body?.response_code ?? null,
        authorization_code: body?.authorization_code ?? null,
        card_last4: body?.card_detail?.card_number ?? null,
        payment_type_code: body?.payment_type_code ?? null,
        raw_response: body,
      })
      .eq("token", data.token);

    if (tx?.trial_signup_id) {
      if (approved) {
        // Determinar periodo desde el signup
        const { data: signup } = await supabaseAdmin
          .from("trial_signups")
          .select("periodo")
          .eq("id", tx.trial_signup_id)
          .maybeSingle();

        const periodo = (signup?.periodo as "mensual" | "anual") || "mensual";
        const now = new Date();
        const renewal = new Date(now);
        if (periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
        else renewal.setMonth(renewal.getMonth() + 1);

        await supabaseAdmin
          .from("trial_signups")
          .update({
            payment_status: "paid",
            subscription_status: "active",
            trial_active: false,
            renewal_date: renewal.toISOString(),
            last_payment_at: now.toISOString(),
            webpay_authorization_code: body?.authorization_code ?? null,
            webpay_response_code: body?.response_code ?? null,
          })
          .eq("id", tx.trial_signup_id);
      } else {
        await supabaseAdmin
          .from("trial_signups")
          .update({
            payment_status: "failed",
            subscription_status: "payment_failed",
            webpay_response_code: body?.response_code ?? null,
          })
          .eq("id", tx.trial_signup_id);
      }
    }

    return {
      ok: approved,
      status: body?.status || (res.ok ? "UNKNOWN" : "ERROR"),
      responseCode: body?.response_code ?? null,
      authorizationCode: body?.authorization_code ?? null,
      amount: body?.amount ?? null,
      buyOrder: body?.buy_order ?? tx?.buy_order ?? null,
      cardLast4: body?.card_detail?.card_number ?? null,
      signupId: tx?.trial_signup_id ?? null,
    };
  });

/**
 * Activación manual de suscripción (uso administrativo / renovaciones).
 */
export const activateSubscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      signupId: z.string().uuid(),
      periodo: z.enum(["mensual", "anual"]),
      authorizationCode: z.string().max(64).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const now = new Date();
    const renewal = new Date(now);
    if (data.periodo === "anual") renewal.setFullYear(renewal.getFullYear() + 1);
    else renewal.setMonth(renewal.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from("trial_signups")
      .update({
        payment_status: "paid",
        subscription_status: "active",
        trial_active: false,
        renewal_date: renewal.toISOString(),
        last_payment_at: now.toISOString(),
        webpay_authorization_code: data.authorizationCode ?? null,
      })
      .eq("id", data.signupId);

    if (error) throw error;
    return { ok: true, renewalDate: renewal.toISOString() };
  });

export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("trial_signups")
      .update({ subscription_status: "cancelled", trial_active: false })
      .eq("id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });
