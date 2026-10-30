export const LEMON_RESCATE_BUY_URL_DEFAULT =
  "https://cuidadoweb.lemonsqueezy.com/checkout/buy/35068710-f9df-4e18-9b56-0799919ebeb7";
export const LEMON_PLAN_BUY_URL_DEFAULT =
  "https://cuidadoweb.lemonsqueezy.com/checkout/buy/863035d4-2383-4db7-a162-b2409e600ef4";
export const LEMON_RESCATE_VARIANT_ID_DEFAULT = "2318074";
export const LEMON_PLAN_VARIANT_ID_DEFAULT = "2318120";

export type LemonPurpose = "rescue" | "cuidado";

export function lemonBuyUrl(purpose: LemonPurpose): string | null {
  const raw =
    purpose === "rescue"
      ? process.env.LEMON_RESCATE_BUY_URL || LEMON_RESCATE_BUY_URL_DEFAULT
      : process.env.LEMON_PLAN_BUY_URL || LEMON_PLAN_BUY_URL_DEFAULT;
  if (!isLemonCheckoutUrl(raw)) return null;
  return raw;
}

export function lemonVariantId(purpose: LemonPurpose): string {
  if (purpose === "rescue") {
    return process.env.LEMON_RESCATE_VARIANT_ID || LEMON_RESCATE_VARIANT_ID_DEFAULT;
  }
  return process.env.LEMON_PLAN_VARIANT_ID || LEMON_PLAN_VARIANT_ID_DEFAULT;
}

export function isLemonCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "cuidadoweb.lemonsqueezy.com" || url.hostname.endsWith(".lemonsqueezy.com")) &&
      url.pathname.startsWith("/checkout/buy/")
    );
  } catch {
    return false;
  }
}

export function buildLemonCheckoutUrl(input: {
  purpose: LemonPurpose;
  siteId: string;
  userId: string;
  email?: string | null;
}): string | null {
  const base = lemonBuyUrl(input.purpose);
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set("checkout[custom][purpose]", input.purpose);
  url.searchParams.set("checkout[custom][site_id]", input.siteId);
  url.searchParams.set("checkout[custom][user_id]", input.userId);
  if (input.email) url.searchParams.set("checkout[email]", input.email);
  return url.toString();
}
