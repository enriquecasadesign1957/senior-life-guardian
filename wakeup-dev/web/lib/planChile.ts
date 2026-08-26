export const PLAN_CHILE_CLP = 25_000;
export const PLAN_INTL_USD_CENTS = 2_900;
/** Basic plan list price in USD cents ($15.00). */
export const PLAN_BASIC_USD_CENTS = 1_500;
/** Basic plan list price in CLP (Transbank Chile). */
export const PLAN_BASIC_CLP = 12_000;
/** Basic plan included voice credits. */
export const PLAN_BASIC_CREDITS = 10;
/** Annual prepaid months (pay 10, get 12). */
export const ANNUAL_BILLED_MONTHS = 10;
/** Pro Chile annual Oneclick charge: 10 × $25.000. */
export const PLAN_CHILE_ANNUAL_CLP = PLAN_CHILE_CLP * ANNUAL_BILLED_MONTHS;
/** Basic annual Oneclick charge: 10 × $12.000. */
export const PLAN_BASIC_ANNUAL_CLP = PLAN_BASIC_CLP * ANNUAL_BILLED_MONTHS;

export type CuponPlan = "chile" | "internacional";
export type BillingPeriod = "monthly" | "annual";
export type TransbankProduct = "chile" | "basic";

/** Monthly-equivalent display when annual is selected (amount × 10 / 12). */
export function withBillingPeriod(
  amount: number,
  period: BillingPeriod
): number {
  return period === "annual"
    ? Math.round((amount * ANNUAL_BILLED_MONTHS) / 12)
    : amount;
}

export function transbankListClp(
  product: TransbankProduct,
  period: BillingPeriod = "monthly"
): number {
  if (period === "annual") {
    return product === "basic" ? PLAN_BASIC_ANNUAL_CLP : PLAN_CHILE_ANNUAL_CLP;
  }
  return product === "basic" ? PLAN_BASIC_CLP : PLAN_CHILE_CLP;
}

export function formatClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function normalizeCuponCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

const LEMON_CHECKOUT_MONTHLY_DEFAULT =
  "https://wakeupdev.lemonsqueezy.com/checkout/buy/60991a0c-9735-4c5d-a877-21abf809d5bd";
const LEMON_CHECKOUT_ANNUAL_DEFAULT =
  "https://wakeupdev.lemonsqueezy.com/checkout/buy/23db93a7-936d-48d2-992f-c796d61c64a6";

export function lemonCheckoutUrl(
  discountCode?: string | null,
  period: BillingPeriod = "monthly"
): string {
  const monthly = (
    process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ||
    LEMON_CHECKOUT_MONTHLY_DEFAULT
  ).trim();
  const annual = (
    process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL_ANNUAL ||
    LEMON_CHECKOUT_ANNUAL_DEFAULT
  ).trim();
  const raw =
    period === "annual" && annual.length > 0 ? annual : monthly;
  try {
    const url = new URL(raw);
    if (discountCode) {
      url.searchParams.set("checkout[discount_code]", discountCode);
    }
    return url.toString();
  } catch {
    return raw;
  }
}

export type CuponQuote = {
  valido: boolean;
  codigo: string | null;
  porcentaje: number | null;
  monto_clp: number;
};
