import assert from "node:assert/strict";
import test from "node:test";
import { readReturnPath } from "./pago-destino.ts";

test("solo acepta rutas de informe con siteId opcional", () => {
  assert.equal(
    readReturnPath("/informe/11111111-1111-4111-8111-111111111111?siteId=22222222-2222-4222-8222-222222222222"),
    "/informe/11111111-1111-4111-8111-111111111111?siteId=22222222-2222-4222-8222-222222222222",
  );
  assert.equal(readReturnPath("/informe/11111111-1111-4111-8111-111111111111"), "/informe/11111111-1111-4111-8111-111111111111");
  assert.equal(readReturnPath("/"), null);
  assert.equal(readReturnPath("https://evil.com/informe/11111111-1111-4111-8111-111111111111"), null);
});
