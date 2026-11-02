import assert from "node:assert/strict";
import test from "node:test";
import { AGENCY_TRIAL_SEATS } from "@cuidado/contract";
import { normalizeAgencyInviteCode } from "./agency.ts";

test("el cupo de prueba de agencia es 5 sitios", () => {
  assert.equal(AGENCY_TRIAL_SEATS, 5);
});

test("normaliza el código de agencia sin espacios y en mayúsculas", () => {
  assert.equal(normalizeAgencyInviteCode("  cw-agencia-5 "), "CW-AGENCIA-5");
  assert.equal(normalizeAgencyInviteCode("cw agencia 5"), "CWAGENCIA5");
});
