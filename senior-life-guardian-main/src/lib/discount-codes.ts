import { normalizePlanKey, planAmount, type BillingPeriod } from "@/lib/plans";

export type DiscountCodeRow = {
  id: string;
  code: string;
  label: string;
  partner_slug: string;
  percent_off: number;
  applies_monthly: boolean;
  applies_annual: boolean;
  active: boolean;
  max_redemptions: number | null;
  redemption_count: number;
  valid_from: string | null;
  valid_until: string | null;
  notes: string | null;
};

export type ResolvedDiscount = {
  id: string;
  code: string;
  label: string;
  partnerSlug: string;
  percentOff: number;
  listPrice: number;
  discountAmount: number;
  finalPrice: number;
};

/** Normaliza el código ingresado por el usuario (mayúsculas, sin espacios extra). */
export function normalizeDiscountCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Aplica un descuento porcentual en CLP (entero, mínimo $1). */
export function applyPercentDiscount(listPrice: number, percentOff: number): number {
  const safePercent = Math.min(100, Math.max(0, percentOff));
  return Math.max(1, Math.round((listPrice * (100 - safePercent)) / 100));
}

export function buildResolvedDiscount(
  row: DiscountCodeRow,
  plan: string,
  periodo: BillingPeriod,
): ResolvedDiscount {
  normalizePlanKey(plan);
  const listPrice = planAmount(plan, periodo);
  const finalPrice = applyPercentDiscount(listPrice, row.percent_off);
  return {
    id: row.id,
    code: normalizeDiscountCodeInput(row.code),
    label: row.label,
    partnerSlug: row.partner_slug,
    percentOff: row.percent_off,
    listPrice,
    discountAmount: listPrice - finalPrice,
    finalPrice,
  };
}

export function assertDiscountCodeUsable(
  row: DiscountCodeRow,
  periodo: BillingPeriod,
  now = new Date(),
): void {
  if (!row.active) {
    throw new Error("Este código de convenio no está activo.");
  }
  if (periodo === "mensual" && !row.applies_monthly) {
    throw new Error("Este código no aplica al plan mensual.");
  }
  if (periodo === "anual" && !row.applies_annual) {
    throw new Error("Este código no aplica al plan anual.");
  }
  if (row.valid_from && now < new Date(row.valid_from)) {
    throw new Error("Este código aún no está vigente.");
  }
  if (row.valid_until && now > new Date(row.valid_until)) {
    throw new Error("Este código expiró.");
  }
  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) {
    throw new Error("Este código alcanzó el límite de usos.");
  }
}

/** Payload público para el checkout (sin datos internos sensibles). */
export function toPublicDiscountPreview(resolved: ResolvedDiscount) {
  return {
    code: resolved.code,
    label: resolved.label,
    partnerSlug: resolved.partnerSlug,
    percentOff: resolved.percentOff,
    listPrice: resolved.listPrice,
    discountAmount: resolved.discountAmount,
    finalPrice: resolved.finalPrice,
  };
}

export type PublicDiscountPreview = ReturnType<typeof toPublicDiscountPreview>;

/** Campos de descuento persistidos en contract_signups. */
export function discountSignupFields(resolved: ResolvedDiscount) {
  return {
    discount_code_id: resolved.id,
    discount_code: resolved.code,
    discount_partner: resolved.partnerSlug,
    discount_percent: resolved.percentOff,
    list_price: resolved.listPrice,
  };
}

export function clearDiscountSignupFields() {
  return {
    discount_code_id: null,
    discount_code: null,
    discount_partner: null,
    discount_percent: null,
    list_price: null,
  };
}

/**
 * Monto a cobrar en Webpay según signup (con o sin descuento guardado).
 * Revalida que el descuento siga siendo coherente con list_price almacenado.
 */
export function chargeAmountFromSignup(
  plan: string,
  periodo: BillingPeriod,
  signup: {
    list_price: number | null;
    discount_percent: number | null;
  },
): number {
  const listPrice = planAmount(plan, periodo);
  if (signup.discount_percent != null && signup.list_price === listPrice) {
    return applyPercentDiscount(listPrice, signup.discount_percent);
  }
  return listPrice;
}
