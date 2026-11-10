import { PLAN, formatPlanPrice } from "@/lib/plans";
import { lasCondesCheckoutPath, LAS_CONDES_AM_CODE, LAS_CONDES_CODE } from "@/lib/tarjeta-vecino";

/** Precios del convenio sobre el Plan Único: 15% y 20%. */
export const CONVENIO_LAS_CONDES = {
  listMonthly: PLAN.monthly,
  listYearly: PLAN.yearly,
  vecino: {
    code: LAS_CONDES_CODE,
    percent: 15,
    monthly: 5865,
    yearly: 58650,
    label: "Tarjeta Vecino",
  },
  adultoMayor: {
    code: LAS_CONDES_AM_CODE,
    percent: 20,
    monthly: 5520,
    yearly: 55200,
    label: "Tarjeta Vecino Adulto Mayor",
  },
} as const;

export const CONVENIO_LAS_CONDES_PATH = "/las-condes";
export const CONVENIO_LAS_CONDES_URL = "https://alarmaseniorsafe.cl/las-condes";

export function convenioPrecio(amount: number): string {
  return `$${formatPlanPrice(amount)}`;
}

export function convenioCheckoutPath(code: string, periodo: "mensual" | "anual"): string {
  return lasCondesCheckoutPath(code, periodo);
}
