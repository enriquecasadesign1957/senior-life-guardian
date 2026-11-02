import { z } from "zod";
import { SITE_ORIGIN, isInternational, lemonCheckoutUrl } from "@/lib/market";

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
  monthly: isInternational ? 8.9 : 6900,
  yearly: isInternational ? 89 : 69000,
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
  if (isInternational) {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }
  return amount.toLocaleString("es-CL");
}

/** Monto en CLP para Webpay. El sitio .com no cobra por Transbank. */
export function planAmount(plan: string, periodo: string): number {
  normalizePlanKey(plan);
  return periodo === "anual" ? 69000 : 6900;
}

/** Ahorro en pesos al elegir anual vs 12 meses mensuales. */
export function annualSavingsClp(): number {
  return PLAN.monthly * 12 - PLAN.yearly;
}

/** Equivalente mensual del plan anual (para copy en tarjetas). */
export function yearlyEquivalentMonthly(): number {
  if (isInternational) return 7.42;
  return Math.round(PLAN.yearly / 12);
}

/** Ahorro anual que se muestra en la portada. Chile: $15.000. Internacional: $17.80 USD. */
export const ANNUAL_SAVINGS_CRO_CLP = isInternational ? 17.8 : 15000;

/** Bundle familiar — 2 adultos mayores (marketing / upsell). En .com son dos planes mensuales. */
export const FAMILY_BUNDLE = {
  label: "Bundle Familiar",
  monthly: isInternational ? 17.8 : 10900,
  /** Ahorro vs contratar 2 planes mensuales. En .com no hay descuento inventado. */
  monthlySavingsVsTwo: isInternational ? 0 : 2900,
  adults: 2,
} as const;

export function checkoutUrl(opts?: {
  periodo?: BillingPeriod;
}): string {
  const periodo = opts?.periodo ?? "mensual";
  if (isInternational) return lemonCheckoutUrl(periodo);
  return `/checkout?mode=contratar&plan=${PLAN_KEY}&periodo=${periodo}`;
}

/** Enlace absoluto para renovar (emails de vencimiento). */
export function renewalCheckoutUrl(periodo: BillingPeriod): string {
  const url = checkoutUrl({ periodo });
  if (url.startsWith("http")) return url;
  return `${SITE_ORIGIN}${url}`;
}
