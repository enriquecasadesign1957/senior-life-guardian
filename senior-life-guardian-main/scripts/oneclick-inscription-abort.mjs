/**
 * Oneclick Mall integración: INICIAR inscripción para abandonar en Webpay.
 *
 * Caso validación Transbank: el usuario presiona «Abandonar y volver al comercio».
 *
 * Uso:
 *   node scripts/oneclick-inscription-abort.mjs
 *   node scripts/oneclick-inscription-abort.mjs --response-url=http://localhost:8082/oneclick/retorno
 */
const MALL_CC = "597055555541";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
/** Integración REST — no usar https://transbank.cl (sin path API). */
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

const EMAIL = "enriquecasadesign@gmail.com";
const DEFAULT_RESPONSE_URL = "http://localhost:8082/checkout/completar";

function parseResponseUrlArg() {
  const flag = process.argv.find((a) => a.startsWith("--response-url="));
  return flag ? flag.slice("--response-url=".length) : DEFAULT_RESPONSE_URL;
}

/** username Transbank: máx. 40, alfanumérico. */
function buildUsername() {
  return `aborttest${Date.now()}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
}

function banner(title, value) {
  const line = "=".repeat(72);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
  console.log(value);
  console.log(line);
}

const responseUrl = parseResponseUrlArg();
const username = buildUsername();

const payload = {
  username,
  email: EMAIL,
  response_url: responseUrl,
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("\nInscripción Oneclick — caso ABANDONAR / cancelar");
console.log("POST", `${API_HOST}${ONECLICK_BASE}/inscriptions`);
console.log("Payload:", JSON.stringify(payload, null, 2));

const res = await fetch(`${API_HOST}${ONECLICK_BASE}/inscriptions`, {
  method: "POST",
  headers: {
    "Tbk-Api-Key-Id": MALL_CC,
    "Tbk-Api-Key-Secret": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await res.text();
let body = {};
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text };
}

if (!res.ok || typeof body.token !== "string" || !body.token) {
  console.error("\nError Transbank HTTP", res.status);
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const redirectUrl =
  typeof body.url_webpay === "string"
    ? body.url_webpay
    : typeof body.url === "string"
      ? body.url
      : null;

banner("TOKEN INSCRIPCIÓN — pegar en validador Transbank (creación)", body.token);

if (redirectUrl) {
  banner("URL WEBPAY — abrir y pulsar «Abandonar y volver al comercio»", redirectUrl);
} else {
  console.warn("\nTransbank no devolvió url_webpay en la respuesta.");
}

console.log("\nDatos de la solicitud:");
console.log("  username:", username);
console.log("  email:", EMAIL);
console.log("  response_url:", responseUrl);
console.log("\nPasos:");
console.log("  1. Pega el TOKEN en el formulario Transbank (inscripción abandonada).");
console.log("  2. Abre la URL Webpay (POST con TBK_TOKEN = token de arriba).");
console.log("  3. En pantalla Transbank: «Abandonar y volver al comercio» (NO pagues).");
console.log("\nRespuesta completa Transbank:");
console.log(JSON.stringify(body, null, 2));
