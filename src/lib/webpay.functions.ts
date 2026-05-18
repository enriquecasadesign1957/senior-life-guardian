/**
 * Webpay Plus integration stubs.
 *
 * Estructura preparada para conectar Webpay Plus real (Transbank).
 * Cuando se conecten credenciales reales, leer en `.handler()`:
 *   - process.env.WEBPAY_COMMERCE_CODE
 *   - process.env.WEBPAY_API_KEY
 *   - process.env.WEBPAY_ENVIRONMENT ("sandbox" | "production")
 *
 * Por ahora estos endpoints simulan el flujo y persisten los registros
 * para que toda la UI/UX y la base de datos estén listas.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PLAN_PRICES: Record<string, { mensual: number; anual: number }> = {
  basico: { mensual: 5900, anual: 65000 },
  premium: { mensual: 7900, anual: 85000 },
};

function planAmount(plan: string, periodo: string): number {
  const p = PLAN_PRICES[plan];
  if (!p) throw new Error("Plan inválido");
  return periodo === "anual" ? p.anual : p.mensual;
}

function getEnvironment(): "sandbox" | "production" {
  return (process.env.WEBPAY_ENVIRONMENT as "sandbox" | "production") || "sandbox";
}

/**
 * Inicia una transacción Webpay Plus.
 * En producción: llamar a `POST /rswebpaytransaction/api/webpay/v1.2/transactions`
 * con commerce_code + api_key y devolver { token, url } para redirigir al usuario.
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
    const amount = planAmount(data.plan, data.periodo);
    const env = getEnvironment();
    const buyOrder = `SS-${Date.now().toString(36).toUpperCase()}`;
    const sessionId = `sess-${data.signupId.slice(0, 8)}`;

    // Persistir intento de transacción
    const { error: txError } = await supabaseAdmin
      .from("webpay_transactions")
      .insert({
        trial_signup_id: data.signupId,
        buy_order: buyOrder,
        session_id: sessionId,
        amount,
        status: "INITIATED",
        environment: env,
      });
    if (txError) console.error("[webpay] init insert error", txError);

    // Marcar signup como en proceso de contratación
    await supabaseAdmin
      .from("trial_signups")
      .update({
        purchase_mode: "contratar",
        payment_status: "pending",
        subscription_status: "pending_payment",
        webpay_buy_order: buyOrder,
        webpay_session_id: sessionId,
        webpay_amount: amount,
        webpay_environment: env,
      })
      .eq("id", data.signupId);

    // STUB: cuando exista WEBPAY_COMMERCE_CODE/WEBPAY_API_KEY reales,
    // hacer fetch a Transbank y devolver token+url reales.
    return {
      ok: true,
      stub: true,
      buyOrder,
      sessionId,
      amount,
      environment: env,
      // En producción: token real + url real para redirección
      token: null as string | null,
      url: null as string | null,
      message: "Estructura Webpay preparada. Conectar credenciales Transbank para activar pagos reales.",
    };
  });

/**
 * Confirma una transacción Webpay Plus después del retorno del usuario.
 * En producción: llamar a `PUT /rswebpaytransaction/api/webpay/v1.2/transactions/{token}`
 */
export const confirmWebpayTransaction = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      token: z.string().min(8).max(128),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    // STUB: en producción aquí va el commit real con Transbank.
    return {
      ok: false,
      stub: true,
      message: "Confirmación Webpay no disponible aún. Conectar credenciales Transbank.",
      token: data.token,
    };
  });

/**
 * Activa una suscripción tras un pago confirmado.
 * Calcula la próxima fecha de renovación según el periodo.
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
    if (data.periodo === "anual") {
      renewal.setFullYear(renewal.getFullYear() + 1);
    } else {
      renewal.setMonth(renewal.getMonth() + 1);
    }

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

/**
 * Cancelar suscripción (manual o automática).
 */
export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ signupId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("trial_signups")
      .update({
        subscription_status: "cancelled",
        trial_active: false,
      })
      .eq("id", data.signupId);
    if (error) throw error;
    return { ok: true };
  });
