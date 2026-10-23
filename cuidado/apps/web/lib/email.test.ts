import assert from "node:assert/strict";
import test from "node:test";
import { renderDiagnosisEmail } from "./render-email.ts";

const reportUrl = "https://cuidadoweb.com/informe/11111111-1111-1111-1111-111111111111";

test("el correo muestra el puntaje y las copias, y no promete un PDF", () => {
  const html = renderDiagnosisEmail({
    name: "Ana",
    siteUrl: "https://ejemplo.com",
    reportUrl,
    performanceScore: 42,
    revisions: 1240,
  });
  assert.match(html, /Hola, Ana\./);
  assert.match(html, /42 de 100/);
  assert.match(html, /1\.240/);
  assert.match(html, /Copias viejas de tus páginas/);
  assert.match(html, /Ver el informe/);
  assert.match(html, new RegExp(reportUrl.replace(/\//g, "\\/")));
  assert.match(html, /CuidadoWeb/);
  assert.doesNotMatch(html, /PDF|Cuidado WP|parches|Reparar|revocar/i);
});

test("sin medición del plugin no inventa copias ni parches", () => {
  const html = renderDiagnosisEmail({
    name: "  ",
    siteUrl: "https://ejemplo.com",
    reportUrl,
    performanceScore: null,
    revisions: null,
    securityPatches: null,
  });
  assert.match(html, /Hola\./);
  assert.match(html, /sin medición esta vez/);
  assert.doesNotMatch(html, /Copias viejas|Parches de seguridad/);
});

test("un enlace que no es http no se vuelve el botón", () => {
  const html = renderDiagnosisEmail({
    siteUrl: "https://ejemplo.com",
    reportUrl: "javascript:alert(1)",
    performanceScore: 10,
    revisions: 0,
  });
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /Ver el informe/);
});

test("el nombre no puede inyectar HTML", () => {
  const html = renderDiagnosisEmail({
    name: "<script>alert(1)</script>",
    siteUrl: "https://ejemplo.com/?q=<b>",
    reportUrl,
    performanceScore: 80,
  });
  assert.doesNotMatch(html, /<script>/i);
  assert.match(html, /&lt;script&gt;/);
});
