import assert from "node:assert/strict";
import test from "node:test";
import { dictionaries, interpolate, type MsgKey } from "./i18n";

test("es y en tienen las mismas claves", () => {
  const esKeys = Object.keys(dictionaries.es).sort();
  const enKeys = Object.keys(dictionaries.en).sort();
  assert.deepEqual(enKeys, esKeys);
});

test("interpolate reemplaza variables", () => {
  assert.equal(
    interpolate("Usados: {used} · Disponibles: {remaining} de {seats}", {
      used: 1,
      remaining: 4,
      seats: 5,
    }),
    "Usados: 1 · Disponibles: 4 de 5",
  );
});

test("claves de navegación existen en ambos idiomas", () => {
  const keys: MsgKey[] = ["languageToggle", "navAnalyze", "heroTitle", "howTitle"];
  for (const key of keys) {
    assert.ok(dictionaries.es[key].length > 0);
    assert.ok(dictionaries.en[key].length > 0);
    assert.notEqual(dictionaries.es[key], dictionaries.en[key]);
  }
});
