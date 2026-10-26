import assert from "node:assert/strict";
import test from "node:test";
import {
  headersLookLikeWordPress,
  htmlLooksLikeWaitingGate,
  htmlLooksLikeWordPress,
} from "./plugin-client.ts";

test("detecta WordPress en el HTML del sitio", () => {
  assert.equal(htmlLooksLikeWordPress('<link rel="stylesheet" href="/wp-content/themes/x/style.css">'), true);
  assert.equal(htmlLooksLikeWordPress('<script src="/wp-includes/js/jquery.min.js"></script>'), true);
  assert.equal(htmlLooksLikeWordPress('<meta name="generator" content="WordPress 6.7">'), true);
  assert.equal(htmlLooksLikeWordPress("<title>One moment, please...</title>"), false);
  assert.equal(
    htmlLooksLikeWordPress("M='https%3A%2F%2Fwww.casadesign.cl%2Fwp-json%2F',X='/z0f76a1d'"),
    false,
  );
});

test("detecta la pantalla de espera del hosting", () => {
  assert.equal(htmlLooksLikeWaitingGate("<title>One moment, please...</title>"), true);
  assert.equal(htmlLooksLikeWaitingGate("Checking if the site connection is secure"), true);
  assert.equal(htmlLooksLikeWaitingGate('<html><body class="home">hola</body></html>'), false);
});

test("detecta WordPress en cabeceras Link", () => {
  const headers = new Headers({
    link: '<https://example.com/wp-json/>; rel="https://api.w.org/"',
  });
  assert.equal(headersLookLikeWordPress(headers), true);
  assert.equal(headersLookLikeWordPress(new Headers()), false);
});
