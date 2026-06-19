/**
 * Oneclick Mall: transacción authorize RECHAZADA por monto ($10.000.000).
 * Uso: validación Transbank integración.
 *
 * node scripts/oneclick-validation-reject-authorize.mjs
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const REJECT_AMOUNT = 10_000_000;
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";

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

function generateBuyOrder(prefix = "SS") {
  const suffix = Date.now().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${prefix}${suffix}`.slice(0, 26);
}

const env = { ...loadEnvFile(), ...process.env };
const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Falta SUPABASE_DB_PASSWORD en .env");
  process.exit(1);
}

const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;
const pgClient = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

try {
  await pgClient.connect();
  const { rows } = await pgClient.query(`
    SELECT id, oneclick_username, oneclick_tbk_user, email
    FROM public.contract_signups
    WHERE payment_provider = 'oneclick_mall'
      AND oneclick_tbk_user IS NOT NULL
      AND oneclick_inscription_status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const signup = rows[0];
  if (!signup?.oneclick_username || !signup.oneclick_tbk_user) {
    console.error("No hay inscripción Oneclick activa. Completa primero una inscripción aprobada.");
    process.exit(1);
  }

  const mallBuyOrder = generateBuyOrder();
  let storeBuyOrder = generateBuyOrder();
  if (storeBuyOrder === mallBuyOrder) storeBuyOrder = generateBuyOrder();

  console.log("Signup:", signup.email, signup.id);
  console.log("Username:", signup.oneclick_username);

  const payload = {
    username: signup.oneclick_username,
    tbk_user: signup.oneclick_tbk_user,
    buy_order: mallBuyOrder,
    details: [
      {
        commerce_code: STORE_CC,
        buy_order: storeBuyOrder,
        amount: REJECT_AMOUNT,
      },
    ],
  };

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

  await pgClient.query(
    `INSERT INTO public.oneclick_transactions
      (contract_signup_id, mall_buy_order, store_buy_order, amount, operation, status, environment, raw_response)
     VALUES ($1, $2, $3, $4, 'authorize', $5, 'sandbox', $6::jsonb)`,
    [
      signup.id,
      mallBuyOrder,
      storeBuyOrder,
      REJECT_AMOUNT,
      res.ok ? "REJECTED" : "ERROR",
      JSON.stringify(body),
    ],
  );

  const detail = Array.isArray(body.details) ? body.details[0] : null;
  const responseCode = detail?.response_code ?? body.response_code ?? null;
  const status = detail?.status ?? body.status ?? null;

  console.log("\n===== TRANSACCIÓN RECHAZADA (validación) =====");
  console.log("HTTP status:", res.status);
  console.log("buy_order PADRE (mall):", mallBuyOrder);
  console.log("buy_order tienda:", storeBuyOrder);
  console.log("Monto:", REJECT_AMOUNT);
  console.log("response_code:", responseCode);
  console.log("status:", status);
  console.log("\n→ Pega en el formulario Transbank el buy_order PADRE:");
  console.log(mallBuyOrder);
  console.log("\nRespuesta completa:");
  console.log(JSON.stringify(body, null, 2));
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await pgClient.end();
}
