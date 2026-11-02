/**
 * Oneclick Mall integración: INICIAR inscripción débito/prepago.
 *
 * POST /inscriptions → imprime token + URL Webpay para el validador Transbank.
 *
 * Uso:
 *   node scripts/oneclick-inscription-start.mjs
 *   node scripts/oneclick-inscription-start.mjs --response-url=http://localhost:8082/oneclick/retorno
 */
const MALL_CC = "597055555541";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
/** Integración REST (no usar https://transbank.cl sin path API). */
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

const EMAIL = "enriquecasadesign@gmail.com";
const DEFAULT_RESPONSE_URL = "http://localhost:8082/checkout/completar";

const CARD_HINTS = {
  debit: {
    label: "Redcompra (débito) aprobada",
    number: "4051 8842 3993 7763",
  },
  prepago: {
    label: "Prepago Mastercard aprobada",
    number: "4051 8860 0005 6590",
    cvv: "123",
  },
};

function parseResponseUrlArg() {
  const flag = process.argv.find((a) => a.startsWith("--response-url="));
  return flag ? flag.slice("--response-url=".length) : DEFAULT_RESPONSE_URL;
}

/**
 * username Transbank: máx. 40, solo alfanumérico (no admite @ ni puntos).
 * Inspirado en debittest_<timestamp>@enriquecasadesign.com → debittest<timestamp>
 */
function buildUsername() {
  return `debittest${Date.now()}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
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
const cardType = process.argv.includes("--prepago") ? "prepago" : "debit";
const card = CARD_HINTS[cardType];

const payload = {
  username,
  email: EMAIL,
  response_url: responseUrl,
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("\nIniciando inscripción Oneclick Mall (integración)…");
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

banner("TOKEN INSCRIPCIÓN — pegar en validador Transbank", body.token);

if (redirectUrl) {
  banner("URL REDIRECCIÓN WEBPAY — abrir para completar inscripción", redirectUrl);
} else {
  console.warn("\nTransbank no devolvió url_webpay en la respuesta.");
}

console.log("\nDatos de la solicitud:");
console.log("  username:", username);
console.log("  email:", EMAIL);
console.log("  response_url:", responseUrl);
console.log(`\nTarjeta prueba (${card.label}):`, card.number);
if (card.cvv) console.log("  CVV:", card.cvv);
console.log("  RUT/clave Webpay integración: 11.111.111-1 / 123");
console.log("\nRespuesta completa Transbank:");
console.log(JSON.stringify(body, null, 2));
