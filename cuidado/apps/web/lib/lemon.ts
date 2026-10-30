import { createHmac, timingSafeEqual } from "node:crypto";

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

export function verifyLemonSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  if (digest.length !== received.length) return false;
  return timingSafeEqual(digest, received);
}

export type LemonOrderFacts = {
  meta?: {
    event_name?: string;
    custom_data?: {
      purpose?: string;
      site_id?: string;
      user_id?: string;
    } | null;
  } | null;
  data?: {
    id?: string | number;
    attributes?: {
      status?: string | null;
      total_usd?: number | null;
      created_at?: string | null;
      first_order_item?: {
        variant_id?: number | string | null;
        product_name?: string | null;
        price?: number | null;
      } | null;
    } | null;
  } | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PaidLemonOrder = {
  purpose: LemonPurpose;
  siteId: string;
  userId: string;
  checkoutId: string;
  paidAt: Date;
};

export function readPaidLemonOrder(payload: LemonOrderFacts): PaidLemonOrder | null {
  if (payload.meta?.event_name && payload.meta.event_name !== "order_created") return null;
  const attrs = payload.data?.attributes;
  if (!attrs || attrs.status !== "paid") return null;
  const custom = payload.meta?.custom_data;
  const purposeRaw = custom?.purpose;
  const purpose: LemonPurpose | null =
    purposeRaw === "rescue" || purposeRaw === "cuidado"
      ? purposeRaw
      : matchPurposeByVariant(attrs.first_order_item?.variant_id);
  if (!purpose) return null;

  const siteId = custom?.site_id ?? "";
  const userId = custom?.user_id ?? "";
  if (!UUID.test(siteId) || !UUID.test(userId)) return null;

  // total_usd includes tax (Lemon is MoR). Validate the line item price, not the taxed total.
  const expectedCents = purpose === "rescue" ? 2900 : 1900;
  const itemPrice = attrs.first_order_item?.price;
  if (typeof itemPrice === "number" && itemPrice !== expectedCents) return null;

  const variant = String(attrs.first_order_item?.variant_id ?? "");
  if (!variant || variant !== lemonVariantId(purpose)) return null;

  const orderId = payload.data?.id;
  if (orderId === undefined || orderId === null || orderId === "") return null;

  return {
    purpose,
    siteId,
    userId,
    checkoutId: `ls_order_${orderId}`,
    paidAt: attrs.created_at ? new Date(attrs.created_at) : new Date(),
  };
}

function matchPurposeByVariant(variantId: number | string | null | undefined): LemonPurpose | null {
  const value = String(variantId ?? "");
  if (!value) return null;
  if (value === lemonVariantId("rescue")) return "rescue";
  if (value === lemonVariantId("cuidado")) return "cuidado";
  return null;
}
