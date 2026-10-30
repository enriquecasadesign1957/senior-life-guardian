import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  buildLemonCheckoutUrl,
  isLemonCheckoutUrl,
  readPaidLemonOrder,
  verifyLemonSignature,
  type LemonOrderFacts,
} from "./lemon.ts";

const siteId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";

test("solo acepta enlaces https de Lemon Squeezy", () => {
  assert.equal(
    isLemonCheckoutUrl("https://cuidadoweb.lemonsqueezy.com/checkout/buy/35068710-f9df-4e18-9b56-0799919ebeb7"),
    true,
  );
  assert.equal(isLemonCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test"), false);
  assert.equal(isLemonCheckoutUrl("http://cuidadoweb.lemonsqueezy.com/checkout/buy/abc"), false);
});

test("el checkout lleva site_id, user_id y purpose", () => {
  const url = buildLemonCheckoutUrl({ purpose: "rescue", siteId, userId, email: "a@b.cl" });
  assert.ok(url);
  const parsed = new URL(url!);
  assert.equal(parsed.searchParams.get("checkout[custom][purpose]"), "rescue");
  assert.equal(parsed.searchParams.get("checkout[custom][site_id]"), siteId);
  assert.equal(parsed.searchParams.get("checkout[custom][user_id]"), userId);
  assert.equal(parsed.searchParams.get("checkout[email]"), "a@b.cl");
});

function paidOrder(overrides: Partial<LemonOrderFacts> = {}): LemonOrderFacts {
  return {
    meta: {
      event_name: "order_created",
      custom_data: { purpose: "rescue", site_id: siteId, user_id: userId },
    },
    data: {
      id: 99,
      attributes: {
        status: "paid",
        total_usd: 2900,
        created_at: "2026-10-30T18:00:00.000Z",
        first_order_item: { variant_id: 2318074, product_name: "Rescate CuidadoWeb", price: 2900 },
      },
    },
    ...overrides,
  };
}

test("un order_created de $29 activa el rescate", () => {
  assert.deepEqual(readPaidLemonOrder(paidOrder()), {
    purpose: "rescue",
    siteId,
    userId,
    checkoutId: "ls_order_99",
    paidAt: new Date("2026-10-30T18:00:00.000Z"),
  });
  assert.equal(readPaidLemonOrder(paidOrder({ data: { id: 99, attributes: { status: "pending", total_usd: 2900 } } })), null);
  assert.equal(
    readPaidLemonOrder(
      paidOrder({
        data: {
          id: 99,
          attributes: {
            status: "paid",
            total_usd: 1900,
            first_order_item: { variant_id: 2318074 },
          },
        },
      }),
    ),
    null,
  );
});

test("un order_created de $19 activa el plan", () => {
  const order = paidOrder({
    meta: {
      event_name: "order_created",
      custom_data: { purpose: "cuidado", site_id: siteId, user_id: userId },
    },
    data: {
      id: 100,
      attributes: {
        status: "paid",
        total_usd: 1900,
        created_at: "2026-10-30T18:00:00.000Z",
        first_order_item: { variant_id: 2318120, product_name: "Plan Cuidado", price: 1900 },
      },
    },
  });
  assert.equal(readPaidLemonOrder(order)?.purpose, "cuidado");
  assert.equal(readPaidLemonOrder(order)?.checkoutId, "ls_order_100");
});

test("la firma HMAC del webhook debe coincidir", () => {
  const body = '{"ok":true}';
  const secret = "test-secret";
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyLemonSignature(body, signature, secret), true);
  assert.equal(verifyLemonSignature(body, "deadbeef", secret), false);
  assert.equal(verifyLemonSignature(body, null, secret), false);
});
