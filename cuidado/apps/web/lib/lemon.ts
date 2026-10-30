import { createHmac, timingSafeEqual } from "node:crypto";
import { lemonVariantId, type LemonPurpose } from "./lemon-checkout";

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
