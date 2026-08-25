import type { SupabaseClient } from "@supabase/supabase-js";
import { sendResendTextEmail, type ResendMailEnv } from "./resend-mail";

export type ReceiptEnv = ResendMailEnv;

type BillingProduct = "chile" | "basic";
type BillingPeriod = "monthly" | "annual";

function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function planLabel(product: BillingProduct, period: BillingPeriod): string {
  if (product === "basic") {
    return period === "annual" ? "Plan Basic (anual)" : "Plan Basic (mensual)";
  }
  return period === "annual" ? "Plan Pro Chile (anual)" : "Plan Pro Chile (mensual)";
}

function billingNote(period: BillingPeriod): string {
  return period === "annual"
    ? "Facturación anual (10 meses por adelantado)."
    : "Facturación mensual.";
}

export async function sendTransbankReceiptOnce(
  env: ReceiptEnv,
  supabase: SupabaseClient,
  input: {
    email: string;
    usuarioId: string;
    mallBuyOrder: string;
    amountClp: number;
    product: BillingProduct;
    period: BillingPeriod;
    credits: number;
    authorizationCode?: string | null;
    cuponCodigo?: string | null;
  }
): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) return;

  if (!env.RESEND_API_KEY?.trim()) {
    console.warn("receipt_skipped", { reason: "missing_resend_key" });
    return;
  }

  const { error: dedupeErr } = await supabase.from("billing_events").insert({
    provider: "transbank",
    event_id: `receipt:${input.mallBuyOrder}`,
    event_type: "customer_receipt",
    usuario_id: input.usuarioId,
    creditos: 1,
  });
  if (dedupeErr?.code === "23505") return;
  if (dedupeErr) {
    console.error("receipt_dedupe_failed", {
      code: dedupeErr.code,
      message: dedupeErr.message,
    });
  }

  const plan = planLabel(input.product, input.period);
  const subject = `Recibo WakeUp Dev — ${plan} — ${formatClp(input.amountClp)}`;
  const lines = [
    "Gracias por tu compra en WakeUp Dev.",
    "",
    `Plan: ${plan}`,
    `Monto pagado: ${formatClp(input.amountClp)}`,
    `Créditos acreditados: ${input.credits}`,
    billingNote(input.period),
    "",
    `Orden: ${input.mallBuyOrder}`,
  ];
  if (input.authorizationCode) {
    lines.push(`Código autorización Transbank: ${input.authorizationCode}`);
  }
  if (input.cuponCodigo) {
    lines.push(`Cupón aplicado: ${input.cuponCodigo}`);
  }
  lines.push(
    "",
    "Panel: https://wakeupdev.com/dashboard",
    "Webhook: POST https://api.wakeupdev.com/v1/alert (header x-api-key)",
    "",
    "— WakeUp Dev"
  );

  const result = await sendResendTextEmail(env, {
    to: [email],
    subject,
    text: lines.join("\n"),
  });
  if (!result.ok) {
    console.error("receipt_resend_failed", {
      http: result.status,
      body: result.body.slice(0, 240),
      to: email,
    });
    return;
  }
  console.info("receipt_sent", { to: email, order: input.mallBuyOrder });
}
