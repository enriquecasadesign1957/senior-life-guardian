import { z } from "zod";

/** Clave canónica del Plan Único (BD, checkout, Webpay). */
export const PLAN_KEY = "unico" as const;

export type PlanKey = typeof PLAN_KEY;

/** Claves legacy aceptadas en URLs/BD; cobran el mismo precio del plan único. */
export const LEGACY_PLAN_KEYS = ["basico", "premium"] as const;

export type LegacyPlanKey = (typeof LEGACY_PLAN_KEYS)[number];

export type AnyPlanKey = PlanKey | LegacyPlanKey;

export const PLAN = {
  key: PLAN_KEY,
  name: "Senior Safe",
  displayName: "Plan Único",
  tagline: "Protección completa para toda la familia.",
  monthly: 6900,
  yearly: 69000,
  /** Texto oficial del beneficio anual */
  yearlySavingsLabel: "Ahorras 2 meses",
  features: [
    "Botón de emergencia",
    "Alertas por WhatsApp + SMS",
    "Llamada automática",
    "Ubicación GPS en tiempo real",
    "Múltiples familiares conectados",
    "Monitoreo de inactividad",
    "Historial completo de alertas",
    "Soporte prioritario 24/7",
  ],
} as const;

export const planKeySchema = z.enum([PLAN_KEY, ...LEGACY_PLAN_KEYS]);

export const periodoSchema = z.enum(["mensual", "anual"]);

export type BillingPeriod = z.infer<typeof periodoSchema>;

/** Normaliza claves legacy al plan único. */
export function normalizePlanKey(plan: string): PlanKey {
  if (plan === PLAN_KEY || (LEGACY_PLAN_KEYS as readonly string[]).includes(plan)) {
    return PLAN_KEY;
  }
  throw new Error("Plan inválido");
}

export function formatPlanPrice(amount: number): string {
  return amount.toLocaleString("es-CL");
}

/** Monto en CLP para Webpay / UI (independiente de la clave legacy en BD). */
export function planAmount(plan: string, periodo: string): number {
  normalizePlanKey(plan);
  return periodo === "anual" ? PLAN.yearly : PLAN.monthly;
}

/** Ahorro en pesos al elegir anual vs 12 meses mensuales. */
export function annualSavingsClp(): number {
  return PLAN.monthly * 12 - PLAN.yearly;
}

/** Equivalente mensual del plan anual (para copy en tarjetas). */
export function yearlyEquivalentMonthly(): number {
  return Math.round(PLAN.yearly / 12);
}

export function checkoutUrl(opts?: {
  periodo?: BillingPeriod;
}): string {
  const periodo = opts?.periodo ?? "mensual";
  return `/checkout?mode=contratar&plan=${PLAN_KEY}&periodo=${periodo}`;
}
