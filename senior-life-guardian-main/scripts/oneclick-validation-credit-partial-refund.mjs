/**
 * Oneclick: transacción crédito aprobada + anulación parcial (PARTIALLY_NULLIFIED).
 * node scripts/oneclick-validation-credit-partial-refund.mjs
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const TOTAL_AMOUNT = 6900;
const PARTIAL_REFUND = 1000;
const HOST = "https://webpay3gint.transbank.cl";
const BASE = "/rswebpaytransaction/api/oneclick/v1.2";
const META_PATH = "public/oneclick-credit-inscription.json";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) vars[m[1]] = m[2];
  }
  return vars;
}

function gen(p) {
  const s = `${Date.now()}${Math.random().toString(36).slice(2, 5)}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${p}${s}`.slice(0, 26);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let username = process.env.ONECLICK_USERNAME?.trim();
let tbkUser = process.env.TBK_USER?.trim();

if (!username || !tbkUser) {
  const env = { ...loadEnvFile(), ...process.env };
  const password = env.SUPABASE_DB_PASSWORD;
  if (password) {
    const pgClient = new pg.Client({
      connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
      ssl: { rejectUnauthorized: false },
    });
    await pgClient.connect();
    const { rows } = await pgClient.query(`
      SELECT oneclick_username, oneclick_tbk_user, email
      FROM public.contract_signups
      WHERE oneclick_tbk_user IS NOT NULL
        AND oneclick_inscription_status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    await pgClient.end();
    if (rows[0]?.oneclick_username && rows[0]?.oneclick_tbk_user) {
      username = rows[0].oneclick_username;
      tbkUser = rows[0].oneclick_tbk_user;
      console.log("Inscripción crédito:", rows[0].email);
    }
  }
}

if (!username || !tbkUser) {
  console.error("No hay tbk_user crédito activo. Completa checkout o inscripción Visa primero.");
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
    details: [{ commerce_code: STORE_CC, buy_order: storeBuyOrder, amount: TOTAL_AMOUNT }],
  }),
});

const authBody = await authRes.json();
const detail = authBody.details?.[0];

console.log("\n===== TRANSACCIÓN CRÉDITO APROBADA =====");
console.log("buy_order PADRE:", mallBuyOrder);
console.log("response_code:", detail?.response_code);
console.log("payment_type_code:", detail?.payment_type_code);

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
      amount: PARTIAL_REFUND,
    }),
  },
);

const refundBody = await refundRes.json();

console.log("\n===== ANULACIÓN PARCIAL CRÉDITO =====");
console.log("Monto total:", TOTAL_AMOUNT);
console.log("Monto anulado:", PARTIAL_REFUND);
console.log("type:", refundBody.type);
console.log("\n→ Pega buy_order PADRE en formulario Transbank:");
console.log(mallBuyOrder);
console.log(JSON.stringify(refundBody, null, 2));

if (!refundRes.ok || refundBody.type !== "NULLIFIED" || refundBody.balance <= 0) {
  console.error("Se esperaba anulación parcial (type NULLIFIED con balance > 0).");
  process.exit(1);
}

const statusRes = await fetch(`${HOST}/transactions/${encodeURIComponent(mallBuyOrder)}`, {
  method: "GET",
  headers: { "Tbk-Api-Key-Id": MALL_CC, "Tbk-Api-Key-Secret": API_KEY },
});
const statusBody = await statusRes.json();
const statusDetail = statusBody.details?.[0];
console.log("status transacción:", statusDetail?.status ?? "—");
