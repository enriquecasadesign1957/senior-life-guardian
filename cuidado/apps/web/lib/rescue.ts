import { isLemonCheckoutUrl } from "./lemon-checkout";

export const RESCUE_AMOUNT_CENTS = 2900;
export const RESCUE_CURRENCY = "usd";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RescueCheckoutFacts = {
  id?: string | null;
  mode?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: {
    siteId?: string;
    userId?: string;
    purpose?: string;
  } | null;
};

export type PaidRescue = {
  siteId: string;
  userId: string;
  checkoutId: string;
};

export function isStripeCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

export function isAllowedCheckoutUrl(value: string): boolean {
  return isLemonCheckoutUrl(value) || isStripeCheckoutUrl(value);
}

export function readPaidRescue(session: RescueCheckoutFacts): PaidRescue | null {
  if (!session.id || !session.id.startsWith("cs_")) return null;
  if (session.mode !== "payment") return null;
  if (session.payment_status !== "paid") return null;
  if (session.amount_total !== RESCUE_AMOUNT_CENTS) return null;
  if (session.currency !== RESCUE_CURRENCY) return null;
  if (session.metadata?.purpose !== "rescue") return null;
  const siteId = session.metadata.siteId ?? "";
  const userId = session.metadata.userId ?? "";
  if (!UUID.test(siteId) || !UUID.test(userId)) return null;
  return { siteId, userId, checkoutId: session.id };
}
