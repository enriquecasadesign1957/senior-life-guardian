import assert from "node:assert/strict";
import test from "node:test";
import { formatClp, planAmountClp, readMarketFromCookie, resolvePayMarket, rescueAmountClp } from "./market";

test("precios CLP por defecto son enteros positivos", () => {
  assert.equal(Number.isInteger(rescueAmountClp()), true);
  assert.equal(Number.isInteger(planAmountClp()), true);
  assert.ok(rescueAmountClp() > 0);
  assert.ok(planAmountClp() > 0);
});

test("formatClp incluye símbolo o código CLP", () => {
  const text = formatClp(27000);
  assert.ok(text.includes("27") || text.includes("27000"));
});

test("cookie cw_market define el mercado", () => {
  assert.equal(readMarketFromCookie("cw_market=cl"), "cl");
  assert.equal(readMarketFromCookie("foo=1; cw_market=intl"), "intl");
  assert.equal(readMarketFromCookie(null), null);
});

test("prefer gana sobre cookie", () => {
  assert.equal(resolvePayMarket({ cookieHeader: "cw_market=intl", prefer: "cl" }), "cl");
  assert.equal(resolvePayMarket({ cookieHeader: null, prefer: null }), "intl");
});
