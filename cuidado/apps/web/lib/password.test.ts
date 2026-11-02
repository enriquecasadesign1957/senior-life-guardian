import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";

test("verifica la contraseña de agencia", () => {
  const stored = hashPassword("agencia-segura");
  assert.equal(verifyPassword("agencia-segura", stored), true);
  assert.equal(verifyPassword("otra", stored), false);
});
