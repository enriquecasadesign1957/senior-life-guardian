import assert from "node:assert/strict";
import test from "node:test";
import { reuseNotice } from "./reuse-notice.ts";

test("el aviso dice la hora de Chile en que se puede pedir otro informe", () => {
  const now = new Date("2026-10-29T15:00:00.000Z");
  const again = new Date("2026-10-30T18:00:00.000Z");
  const notice = reuseNotice(again, now);
  assert.equal(notice.title, "Este dominio ya tiene un informe");
  assert.match(notice.body, /24 horas por dominio/);
  assert.match(notice.body, /30 de octubre/);
  assert.match(notice.body, /hora de Chile/);
  assert.match(notice.body, /el que ya está/);
});

test("si las 24 horas ya pasaron, el aviso deja pedir el siguiente", () => {
  const now = new Date("2026-10-30T18:00:00.000Z");
  const notice = reuseNotice(now, now);
  assert.match(notice.body, /Ya puedes pedir el siguiente/);
});
