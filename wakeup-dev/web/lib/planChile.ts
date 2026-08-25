export const PLAN_CHILE_CLP = 25_000;
export const PLAN_INTL_USD_CENTS = 2_900;
/** Basic plan list price in USD cents ($10.00). */
export const PLAN_BASIC_USD_CENTS = 1_000;
/** Basic plan list price in CLP when locale is Spanish. */
export const PLAN_BASIC_CLP = 9_500;
/** Annual billing shows 20% off the monthly list (frontend display). */
export const ANNUAL_DISCOUNT_FACTOR = 0.8;

export type CuponPlan = "chile" | "internacional";
export type BillingPeriod = "monthly" | "annual";

export function withBillingPeriod(
  amount: number,
  period: BillingPeriod
): number {
  return period === "annual"
    ? Math.round(amount * ANNUAL_DISCOUNT_FACTOR)
    : amount;
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

export function lemonCheckoutUrl(discountCode?: string | null): string {
  const raw = (
    process.env.NEXT_PUBLIC_LEMON_CHECKOUT_URL ||
    "https://wakeupdev.lemonsqueezy.com/checkout/buy/23db93a7-936d-48d2-992f-c796d61c64a6"
  ).trim();
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
