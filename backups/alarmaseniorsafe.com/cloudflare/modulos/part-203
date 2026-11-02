import { f as SITE_ORIGIN, l as lemonCheckoutUrl } from "./index.mjs";
import { e as enumType } from "../_libs/zod.mjs";
const PLAN_KEY = "unico";
const LEGACY_PLAN_KEYS = ["basico", "premium"];
const PLAN = {
  displayName: "Plan Único",
  tagline: "Protección completa para toda la familia.",
  monthly: 8.9,
  yearly: 89,
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
    "Soporte prioritario 24/7"
  ]
};
const planKeySchema = enumType([PLAN_KEY, ...LEGACY_PLAN_KEYS]);
const periodoSchema = enumType(["mensual", "anual"]);
function normalizePlanKey(plan) {
  if (plan === PLAN_KEY || LEGACY_PLAN_KEYS.includes(plan)) {
    return PLAN_KEY;
  }
  throw new Error("Plan inválido");
}
function formatPlanPrice(amount) {
  {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2
    });
  }
}
function planAmount(plan, periodo) {
  normalizePlanKey(plan);
  return periodo === "anual" ? 69e3 : 6900;
}
function yearlyEquivalentMonthly() {
  return 7.42;
}
const ANNUAL_SAVINGS_CRO_CLP = 17.8;
const FAMILY_BUNDLE = {
  label: "Bundle Familiar",
  monthly: 17.8,
  adults: 2
};
function checkoutUrl(opts) {
  const periodo = opts?.periodo ?? "mensual";
  return lemonCheckoutUrl(periodo);
}
function renewalCheckoutUrl(periodo) {
  const url = checkoutUrl({ periodo });
  if (url.startsWith("http")) return url;
  return `${SITE_ORIGIN}${url}`;
}
export {
  ANNUAL_SAVINGS_CRO_CLP as A,
  FAMILY_BUNDLE as F,
  PLAN as P,
  planKeySchema as a,
  PLAN_KEY as b,
  planAmount as c,
  checkoutUrl as d,
  formatPlanPrice as f,
  normalizePlanKey as n,
  periodoSchema as p,
  renewalCheckoutUrl as r,
  yearlyEquivalentMonthly as y
};
