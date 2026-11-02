import { n as normalizePlanKey, c as planAmount } from "./plans-BJeLFmLc.mjs";
function normalizeDiscountCodeInput(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
function applyPercentDiscount(listPrice, percentOff) {
  const safePercent = Math.min(100, Math.max(0, percentOff));
  return Math.max(1, Math.round(listPrice * (100 - safePercent) / 100));
}
function buildResolvedDiscount(row, plan, periodo) {
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
    finalPrice
  };
}
function assertDiscountCodeUsable(row, periodo, now = /* @__PURE__ */ new Date()) {
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
function toPublicDiscountPreview(resolved) {
  return {
    code: resolved.code,
    label: resolved.label,
    partnerSlug: resolved.partnerSlug,
    percentOff: resolved.percentOff,
    listPrice: resolved.listPrice,
    discountAmount: resolved.discountAmount,
    finalPrice: resolved.finalPrice
  };
}
function discountSignupFields(resolved) {
  return {
    discount_code_id: resolved.id,
    discount_code: resolved.code,
    discount_partner: resolved.partnerSlug,
    discount_percent: resolved.percentOff,
    list_price: resolved.listPrice
  };
}
function clearDiscountSignupFields() {
  return {
    discount_code_id: null,
    discount_code: null,
    discount_partner: null,
    discount_percent: null,
    list_price: null
  };
}
export {
  assertDiscountCodeUsable as a,
  buildResolvedDiscount as b,
  clearDiscountSignupFields as c,
  discountSignupFields as d,
  normalizeDiscountCodeInput as n,
  toPublicDiscountPreview as t
};
