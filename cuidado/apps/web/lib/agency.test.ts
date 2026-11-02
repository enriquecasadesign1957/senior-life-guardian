import assert from "node:assert/strict";
import test from "node:test";
import { AGENCY_TRIAL_SEATS } from "@cuidado/contract";
import { agencyTrialInviteCode } from "./agency.ts";

test("el cupo de prueba de agencia es 5 sitios", () => {
  assert.equal(AGENCY_TRIAL_SEATS, 5);
});

test("sin variable de entorno usa el código de prueba por defecto", () => {
  const previous = process.env.AGENCY_TRIAL_CODE;
  delete process.env.AGENCY_TRIAL_CODE;
  assert.equal(agencyTrialInviteCode(), "CW-AGENCIA-5");
  if (previous === undefined) delete process.env.AGENCY_TRIAL_CODE;
  else process.env.AGENCY_TRIAL_CODE = previous;
});

test("respeta AGENCY_TRIAL_CODE cuando está definido", () => {
  const previous = process.env.AGENCY_TRIAL_CODE;
  process.env.AGENCY_TRIAL_CODE = "codigo-agencia-demo";
  assert.equal(agencyTrialInviteCode(), "codigo-agencia-demo");
  if (previous === undefined) delete process.env.AGENCY_TRIAL_CODE;
  else process.env.AGENCY_TRIAL_CODE = previous;
});
