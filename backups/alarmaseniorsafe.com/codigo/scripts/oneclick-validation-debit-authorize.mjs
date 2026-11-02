/**
 * Intenta finalizar inscripciones débito pendientes y ejecuta authorize.
 */
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const AMOUNT = 6900;
const HOST = "https://webpay3gint.transbank.cl";
const BASE = "/rswebpaytransaction/api/oneclick/v1.2";

const CANDIDATES = [
  { token: "01abec481dae1c3870b9d53fc6df434308be78015620016a5e38432742c5df95", username: "valdebitmqbcv11g" },
  { token: "01ab70ffdde0f4fb283ee4e948c360dbf98c8b0f9921c125b97c9d500ff5b345", username: "valdebitmqbcv11g" },
  { token: "01abd86c9f139b4c36e624fe1a9307ba1e8e85497f353c9670accb00fb302577", username: "valdebitmqbcv11g" },
];

function gen(p) {
  const s = `${Date.now()}${Math.random().toString(36).slice(2, 5)}`.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${p}${s}`.slice(0, 26);
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function finish(token) {
  const res = await fetch(`${HOST}${BASE}/inscriptions/${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: { "Tbk-Api-Key-Id": MALL_CC, "Tbk-Api-Key-Secret": API_KEY, "Content-Type": "application/json" },
    body: "{}",
  });
  return { status: res.status, body: await res.json() };
}

async function authorize(username, tbkUser) {
  const mall = gen("SM");
  let store = gen("ST");
  if (store === mall) store = gen("ST");
  const res = await fetch(`${HOST}${BASE}/transactions`, {
    method: "POST",
    headers: { "Tbk-Api-Key-Id": MALL_CC, "Tbk-Api-Key-Secret": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      tbk_user: tbkUser,
      buy_order: mall,
      details: [{ commerce_code: STORE_CC, buy_order: store, amount: AMOUNT }],
    }),
  });
  const body = await res.json();
  return { mall, store, body, detail: body.details?.[0] };
}

for (const c of CANDIDATES) {
  const f = await finish(c.token);
  console.log("finish", c.token.slice(0, 12) + "...", "=>", f.body.response_code, f.body.card_type ?? "");
  if (f.body.response_code === 0 && f.body.tbk_user) {
    const user = f.body.username || c.username;
    const a = await authorize(user, f.body.tbk_user);
    console.log("\n===== TRANSACCIÓN DÉBITO/PREPAGO APROBADA =====");
    console.log("buy_order PADRE:", a.mall);
    console.log("payment_type_code:", a.detail?.payment_type_code);
    console.log("response_code:", a.detail?.response_code);
    console.log("authorization_code:", a.detail?.authorization_code);
    console.log(JSON.stringify(a.body, null, 2));
    process.exit(0);
  }
}

console.error("\nNo hay inscripción débito finalizada. Completa Webpay:");
console.error("http://localhost:8082/oneclick-debit-inscription.html");
process.exit(1);
