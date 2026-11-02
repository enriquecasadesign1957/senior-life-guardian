/**
 * Oneclick: transacción débito aprobada + reversa inmediata (refund total).
 * node scripts/oneclick-validation-debit-refund.mjs
 */
import fs from "node:fs";

const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const AMOUNT = 6900;
const HOST = "https://webpay3gint.transbank.cl";
const BASE = "/rswebpaytransaction/api/oneclick/v1.2";

function gen(p) {
  const s = `${Date.now()}${Math.random().toString(36).slice(2, 5)}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${p}${s}`.slice(0, 26);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const meta = JSON.parse(fs.readFileSync("public/oneclick-debit-inscription.json", "utf8"));
const { username, tbk_user: tbkUser } = meta;

if (!username || !tbkUser) {
  console.error("Falta tbk_user. Completa inscripción débito primero.");
  process.exit(2);
}

const mallBuyOrder = gen("SM");
let storeBuyOrder = gen("ST");
if (storeBuyOrder === mallBuyOrder) storeBuyOrder = gen("ST");

const authRes = await fetch(`${HOST}${BASE}/transactions`, {
  method: "POST",
  headers: {
    "Tbk-Api-Key-Id": MALL_CC,
    "Tbk-Api-Key-Secret": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username,
    tbk_user: tbkUser,
    buy_order: mallBuyOrder,
    details: [{ commerce_code: STORE_CC, buy_order: storeBuyOrder, amount: AMOUNT }],
  }),
});

const authBody = await authRes.json();
const detail = authBody.details?.[0];

console.log("\n===== TRANSACCIÓN DÉBITO APROBADA =====");
console.log("buy_order PADRE:", mallBuyOrder);
console.log("buy_order tienda:", storeBuyOrder);
console.log("response_code:", detail?.response_code);
console.log("payment_type_code:", detail?.payment_type_code);
console.log("authorization_code:", detail?.authorization_code);

if (detail?.response_code !== 0) {
  console.error(JSON.stringify(authBody, null, 2));
  process.exit(1);
}

const refundRes = await fetch(
  `${HOST}${BASE}/transactions/${encodeURIComponent(mallBuyOrder)}/refunds`,
  {
    method: "POST",
    headers: {
      "Tbk-Api-Key-Id": MALL_CC,
      "Tbk-Api-Key-Secret": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commerce_code: STORE_CC,
      detail_buy_order: storeBuyOrder,
      amount: AMOUNT,
    }),
  },
);

const refundBody = await refundRes.json();

console.log("\n===== ANULACIÓN / REVERSA DÉBITO =====");
console.log("type:", refundBody.type);
console.log("HTTP:", refundRes.status);
console.log("\n→ Pega buy_order PADRE en formulario Transbank (anulación):");
console.log(mallBuyOrder);
console.log(JSON.stringify(refundBody, null, 2));

if (!refundRes.ok || refundBody.type !== "REVERSED") process.exit(1);
