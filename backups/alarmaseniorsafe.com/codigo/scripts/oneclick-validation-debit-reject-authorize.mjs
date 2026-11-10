/**
 * Oneclick: authorize débito RECHAZADA (-98) monto $10.000.000
 *
 * node scripts/oneclick-validation-debit-reject-authorize.mjs
 * TBK_USER=... ONECLICK_USERNAME=... node scripts/oneclick-validation-debit-reject-authorize.mjs
 */
import fs from "node:fs";

const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const REJECT_AMOUNT = 10_000_000;
const HOST = "https://webpay3gint.transbank.cl";
const BASE = "/rswebpaytransaction/api/oneclick/v1.2";
const META_PATH = "public/oneclick-debit-inscription.json";
const POLL_MS = 5000;
const POLL_MAX = 36; // 3 min

function gen(p) {
  const s = `${Date.now()}${Math.random().toString(36).slice(2, 5)}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${p}${s}`.slice(0, 26);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function finish(token) {
  const res = await fetch(`${HOST}${BASE}/inscriptions/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: {
      "Tbk-Api-Key-Id": MALL_CC,
      "Tbk-Api-Key-Secret": API_KEY,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  return res.json();
}

async function rejectAuthorize(username, tbkUser) {
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
      details: [{ commerce_code: STORE_CC, buy_order: storeBuyOrder, amount: REJECT_AMOUNT }],
    }),
  });

  const body = await authRes.json();
  const detail = body.details?.[0];

  console.log("\n===== TRANSACCIÓN DÉBITO RECHAZADA (-98) =====");
  console.log("buy_order PADRE:", mallBuyOrder);
  console.log("buy_order tienda:", storeBuyOrder);
  console.log("response_code:", detail?.response_code);
  console.log("status:", detail?.status);
  console.log("payment_type_code:", detail?.payment_type_code);
  console.log("\n→ Pega buy_order PADRE en Transbank:");
  console.log(mallBuyOrder);
  console.log(JSON.stringify(body, null, 2));

  if (detail?.response_code !== -98) process.exit(1);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let username = process.env.ONECLICK_USERNAME?.trim();
let tbkUser = process.env.TBK_USER?.trim();

if (!tbkUser || !username) {
  let meta = {};
  try {
    meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));
  } catch {
    console.error("Falta", META_PATH, "- ejecuta: node scripts/oneclick-validation-start-debit-inscription.mjs");
    process.exit(2);
  }
  username = username || meta.username;
  tbkUser = tbkUser || meta.tbk_user;

  if (!tbkUser && meta.token) {
    console.log("Abre http://localhost:8082/oneclick-debit-inscription.html");
    console.log("Tarjeta Redcompra: 4051 8842 3993 7763 · RUT 11.111.111-1 / 123");
    console.log("Esperando inscripción (máx. 3 min)…");

    for (let i = 0; i < POLL_MAX; i++) {
      const finishBody = await finish(meta.token);
      if (finishBody.response_code === 0 && finishBody.tbk_user) {
        tbkUser = finishBody.tbk_user;
        username = finishBody.username || username;
        fs.writeFileSync(
          META_PATH,
          JSON.stringify({ ...meta, tbk_user: tbkUser, username }, null, 2),
        );
        console.log("\nInscripción débito OK · tbk_user guardado.");
        break;
      }
      process.stdout.write(".");
      await sleep(POLL_MS);
    }
    console.log("");
  }
}

if (!tbkUser || !username) {
  console.error("Sin tbk_user débito. Completa Webpay y reintenta.");
  console.error("O abre: http://localhost:8082/oneclick/debit-reject-validacion");
  process.exit(2);
}

await rejectAuthorize(username, tbkUser);
