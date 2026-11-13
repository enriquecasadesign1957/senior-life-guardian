import assert from "node:assert/strict";
import test from "node:test";
import { oneclickEmailForUser, oneclickUsernameForUser } from "./oneclick-user";

test("Oneclick no manda el correo sintético de la sesión", () => {
  assert.equal(
    oneclickEmailForUser("session-11111111-2222-3333-4444-555555555555@users.cuidadoweb.invalid"),
    "enriquecasadesign@gmail.com",
  );
  assert.equal(oneclickEmailForUser("  "), "enriquecasadesign@gmail.com");
  assert.equal(oneclickEmailForUser(null), "enriquecasadesign@gmail.com");
});

test("Oneclick conserva un correo real", () => {
  assert.equal(oneclickEmailForUser("persona@ejemplo.cl"), "persona@ejemplo.cl");
});

test("el username de Oneclick cabe en el límite de Transbank", () => {
  const name = oneclickUsernameForUser("11111111-2222-3333-4444-555555555555");
  assert.equal(name, "cw111111112222");
  assert.ok(name.length <= 40);
});
