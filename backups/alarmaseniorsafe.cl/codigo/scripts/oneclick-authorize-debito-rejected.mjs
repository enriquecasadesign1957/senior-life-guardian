/**
 * Oneclick Mall integración: authorize DÉBITO RECHAZADA (-98) por monto $10.000.000.
 *
 * node scripts/oneclick-authorize-debito-rejected.mjs
 */
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const REJECT_AMOUNT = 10_000_000;
const EXPECTED_RESPONSE_CODE = -98;
/** Integración REST — no usar https://transbank.cl (sin path API). */
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

const USERNAME = "valdebitmqbdtacn";
const TBK_USER = "b7af9e84-b740-4dd0-8543-f97b0f03941a";

function parentBuyOrder() {
  return `PARENTDEBITOREJ${Date.now()}`.slice(0, 26);
}

function childBuyOrder() {
  return `CHILDDEBITOREJ${Date.now()}`.slice(0, 26);
}

function banner(title, value) {
  const line = "=".repeat(72);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
  console.log(value);
  console.log(line);
}

const mallBuyOrder = parentBuyOrder();
let storeBuyOrder = childBuyOrder();
if (storeBuyOrder === mallBuyOrder) storeBuyOrder = childBuyOrder();

const payload = {
  username: USERNAME,
  tbk_user: TBK_USER,
  buy_order: mallBuyOrder,
  details: [
    {
      commerce_code: STORE_CC,
      buy_order: storeBuyOrder,
      amount: REJECT_AMOUNT,
    },
  ],
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("\n===== INSCRIPCIÓN DÉBITO =====");
console.log("username:", USERNAME);
console.log("tbk_user:", TBK_USER);
console.log("monto rechazo:", REJECT_AMOUNT);

banner("BUY_ORDER PADRE — pegar en validador Transbank", mallBuyOrder);

console.log("POST", `${API_HOST}${ONECLICK_BASE}/transactions`);
console.log("Payload:", JSON.stringify(payload, null, 2));

const res = await fetch(`${API_HOST}${ONECLICK_BASE}/transactions`, {
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

const detail = Array.isArray(body.details) ? body.details[0] : null;
const responseCode = detail?.response_code ?? body.response_code ?? null;
const rejected = responseCode === EXPECTED_RESPONSE_CODE;

console.log("\n===== RESPUESTA TRANSBANK =====");
console.log("HTTP:", res.status);
console.log("response_code:", responseCode, rejected ? `(esperado ${EXPECTED_RESPONSE_CODE} ✓)` : `(esperado ${EXPECTED_RESPONSE_CODE} ✗)`);
console.log("status:", detail?.status ?? null);
console.log("payment_type_code:", detail?.payment_type_code ?? null);
console.log("buy_order tienda:", storeBuyOrder);
console.log("Rechazada -98:", rejected ? "SÍ ✓" : "NO ✗");
console.log("\nRespuesta completa:");
console.log(JSON.stringify(body, null, 2));

if (!rejected) process.exit(1);
