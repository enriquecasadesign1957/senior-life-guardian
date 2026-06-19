/**
 * Oneclick Mall integración: authorize CRÉDITO + anulación parcial.
 *
 * node scripts/oneclick-authorize-and-refund-partial.mjs
 */
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const TOTAL_AMOUNT = 15000;
const PARTIAL_REFUND = 5000;
/** Integración REST — no usar https://transbank.cl (sin path API). */
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

const USERNAME = "27eaa7b94d9942e89317252f084597a8";
const TBK_USER = "a6ab4af8-fecf-4ca8-9ab3-23fcbfc9e88f";

function parentBuyOrder() {
  return `PADRECREF${Date.now()}`.slice(0, 26);
}

function childBuyOrder() {
  return `HIJOCREF${Date.now()}`.slice(0, 26);
}

function banner(title, value) {
  const line = "=".repeat(72);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
  console.log(value);
  console.log(line);
}

function isPartialRefundOk(body) {
  if (body.type === "PARTIALLY_NULLIFIED") return true;
  if (body.type === "NULLIFIED" && typeof body.balance === "number" && body.balance > 0) {
    return true;
  }
  return false;
}

const mallBuyOrder = parentBuyOrder();
let storeBuyOrder = childBuyOrder();
if (storeBuyOrder === mallBuyOrder) storeBuyOrder = childBuyOrder();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("\n===== PASO 1 · AUTORIZACIÓN CRÉDITO =====");
console.log("username:", USERNAME);
console.log("tbk_user:", TBK_USER);
console.log("monto total:", TOTAL_AMOUNT);

banner("BUY_ORDER PADRE — pegar en validador Transbank (anulación parcial)", mallBuyOrder);

const authPayload = {
  username: USERNAME,
  tbk_user: TBK_USER,
  buy_order: mallBuyOrder,
  details: [
    {
      commerce_code: STORE_CC,
      buy_order: storeBuyOrder,
      amount: TOTAL_AMOUNT,
    },
  ],
};

console.log("POST", `${API_HOST}${ONECLICK_BASE}/transactions`);
console.log("Payload:", JSON.stringify(authPayload, null, 2));

const authRes = await fetch(`${API_HOST}${ONECLICK_BASE}/transactions`, {
  method: "POST",
  headers: {
    "Tbk-Api-Key-Id": MALL_CC,
    "Tbk-Api-Key-Secret": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(authPayload),
});

const authText = await authRes.text();
let authBody = {};
try {
  authBody = JSON.parse(authText);
} catch {
  authBody = { raw: authText };
}

const authDetail = Array.isArray(authBody.details) ? authBody.details[0] : null;
const authOk =
  authRes.ok &&
  authDetail?.response_code === 0 &&
  (authDetail?.status === "AUTHORIZED" || authDetail?.status === "APPROVED");

console.log("\n----- Respuesta AUTORIZACIÓN -----");
console.log("HTTP:", authRes.status);
console.log("response_code:", authDetail?.response_code ?? null, authOk ? "(0 ✓)" : "(✗)");
console.log("status:", authDetail?.status ?? null);
console.log("payment_type_code:", authDetail?.payment_type_code ?? null);
console.log("authorization_code:", authDetail?.authorization_code ?? null);
console.log("buy_order hijo:", storeBuyOrder);
console.log("\nRespuesta completa autorización:");
console.log(JSON.stringify(authBody, null, 2));

if (!authOk) {
  console.error("\nAutorización fallida — no se ejecuta refund parcial.");
  process.exit(1);
}

console.log("\n===== PASO 2 · ANULACIÓN PARCIAL (REFUND) =====");
console.log("Monto total venta:", TOTAL_AMOUNT);
console.log("Monto anulación parcial:", PARTIAL_REFUND);

const refundPayload = {
  commerce_code: STORE_CC,
  detail_buy_order: storeBuyOrder,
  amount: PARTIAL_REFUND,
};

console.log(
  "POST",
  `${API_HOST}${ONECLICK_BASE}/transactions/${encodeURIComponent(mallBuyOrder)}/refunds`,
);
console.log("Payload:", JSON.stringify(refundPayload, null, 2));

const refundRes = await fetch(
  `${API_HOST}${ONECLICK_BASE}/transactions/${encodeURIComponent(mallBuyOrder)}/refunds`,
  {
    method: "POST",
    headers: {
      "Tbk-Api-Key-Id": MALL_CC,
      "Tbk-Api-Key-Secret": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(refundPayload),
  },
);

const refundText = await refundRes.text();
let refundBody = {};
try {
  refundBody = JSON.parse(refundText);
} catch {
  refundBody = { raw: refundText };
}

const partialOk = refundRes.ok && isPartialRefundOk(refundBody);

console.log("\n----- Respuesta REFUND PARCIAL -----");
console.log("HTTP:", refundRes.status);
console.log("type:", refundBody.type ?? null);
if (typeof refundBody.balance === "number") {
  console.log("balance:", refundBody.balance);
}
console.log(
  "Anulación parcial OK:",
  partialOk ? "SÍ ✓" : "NO ✗",
  refundBody.type === "PARTIALLY_NULLIFIED"
    ? "(PARTIALLY_NULLIFIED)"
    : refundBody.type === "NULLIFIED" && refundBody.balance > 0
      ? "(NULLIFIED con balance > 0)"
      : "",
);
console.log("\nRespuesta completa refund:");
console.log(JSON.stringify(refundBody, null, 2));

console.log("\n===== RESUMEN VALIDACIÓN =====");
console.log("buy_order PADRE:", mallBuyOrder);
console.log("buy_order HIJO:", storeBuyOrder);
console.log("monto autorizado:", TOTAL_AMOUNT);
console.log("monto anulado parcial:", PARTIAL_REFUND);

if (!partialOk) process.exit(1);
