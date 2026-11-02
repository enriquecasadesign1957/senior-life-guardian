import assert from "node:assert/strict";
import test from "node:test";
import { generateInviteCode } from "./admin.ts";

test("genera códigos de agencia con prefijo CW-", () => {
  const code = generateInviteCode();
  assert.match(code, /^CW-[A-Z0-9]{8}$/);
});
