import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedCheckoutUrl, isStripeCheckoutUrl, readPaidRescue, type RescueCheckoutFacts } from "./rescue.ts";

const siteId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";

function paid(overrides: Partial<RescueCheckoutFacts> = {}): RescueCheckoutFacts {
  return {
    id: "cs_test_rescue",
    mode: "payment",
    payment_status: "paid",
    amount_total: 2900,
    currency: "usd",
    metadata: { purpose: "rescue", siteId, userId },
    ...overrides,
  };
}

test("solo un cobro de 2900 centavos activa el rescate", () => {
  assert.deepEqual(readPaidRescue(paid()), { siteId, userId, checkoutId: "cs_test_rescue" });
  assert.equal(readPaidRescue(paid({ payment_status: "unpaid" })), null);
  assert.equal(readPaidRescue(paid({ amount_total: 1900 })), null);
  assert.equal(readPaidRescue(paid({ currency: "clp" })), null);
  assert.equal(readPaidRescue(paid({ metadata: { purpose: "cuidado", siteId, userId } })), null);
  assert.equal(readPaidRescue(paid({ id: "pi_123" })), null);
});

test("el navegador solo sigue un enlace de checkout de Lemon o Stripe", () => {
  assert.equal(isStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_rescue"), true);
  assert.equal(
    isAllowedCheckoutUrl("https://cuidadoweb.lemonsqueezy.com/checkout/buy/35068710-f9df-4e18-9b56-0799919ebeb7"),
    true,
  );
  assert.equal(isAllowedCheckoutUrl("https://cuidadoweb.com/pago/rescate"), false);
  assert.equal(isStripeCheckoutUrl("http://checkout.stripe.com/c/pay/cs_test_rescue"), false);
});
