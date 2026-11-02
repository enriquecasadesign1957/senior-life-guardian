import assert from "node:assert/strict";
import test from "node:test";
import { generateInviteCode, inviteExpiresAt, inviteStatus } from "./admin.ts";

test("genera códigos de agencia con prefijo CW-", () => {
  const code = generateInviteCode();
  assert.match(code, /^CW-[A-Z0-9]{8}$/);
});

test("la vigencia del código suma los días pedidos", () => {
  const now = new Date("2026-11-02T15:00:00.000Z");
  const until = inviteExpiresAt(7, now);
  assert.equal(until.toISOString(), "2026-11-09T15:00:00.000Z");
});

test("marca usado o vencido según el estado del código", () => {
  const now = new Date("2026-11-02T15:00:00.000Z");
  assert.equal(inviteStatus({ usedCount: 1, maxUses: 1, expiresAt: null, now }), "used");
  assert.equal(
    inviteStatus({ usedCount: 0, maxUses: 1, expiresAt: new Date("2026-11-01T15:00:00.000Z"), now }),
    "expired",
  );
  assert.equal(
    inviteStatus({ usedCount: 0, maxUses: 1, expiresAt: new Date("2026-11-09T15:00:00.000Z"), now }),
    "available",
  );
});
