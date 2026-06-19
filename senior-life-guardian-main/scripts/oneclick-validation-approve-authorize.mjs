/**
 * Oneclick Mall: transacción authorize APROBADA ($6.900).
 * Uso: validación Transbank integración.
 *
 * node scripts/oneclick-validation-approve-authorize.mjs
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const AMOUNT = 6900;
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

function generateBuyOrder(prefix) {
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
  const testEmail = (process.argv[2] ?? "enriquecasadesign@gmail.com").toLowerCase();
  const { rows } = await pgClient.query(
    `
    SELECT id, oneclick_username, oneclick_tbk_user, email
    FROM public.contract_signups
    WHERE LOWER(email) = $1
      AND oneclick_tbk_user IS NOT NULL
      AND oneclick_username IS NOT NULL
    ORDER BY last_payment_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  `,
    [testEmail],
  );

  const signup = rows[0];
  if (!signup?.oneclick_username || !signup.oneclick_tbk_user) {
    console.error("No hay inscripción Oneclick activa.");
    process.exit(1);
  }

  const mallBuyOrder = generateBuyOrder("SSMQAPRO");
  let storeBuyOrder = `${mallBuyOrder}S`.slice(0, 26);
  if (storeBuyOrder === mallBuyOrder) storeBuyOrder = generateBuyOrder("ST");

  console.log("Signup:", signup.email);

  const payload = {
    username: signup.oneclick_username,
    tbk_user: signup.oneclick_tbk_user,
    buy_order: mallBuyOrder,
    details: [
      {
        commerce_code: STORE_CC,
        buy_order: storeBuyOrder,
        amount: AMOUNT,
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

  const body = await res.json();
  const detail = Array.isArray(body.details) ? body.details[0] : null;
  const approved =
    res.ok &&
    detail?.response_code === 0 &&
    (detail?.status === "AUTHORIZED" || detail?.status === "APPROVED");

  await pgClient.query(
    `INSERT INTO public.oneclick_transactions
      (contract_signup_id, mall_buy_order, store_buy_order, amount, operation, status, response_code, authorization_code, payment_type_code, environment, raw_response)
     VALUES ($1, $2, $3, $4, 'authorize', $5, $6, $7, $8, 'sandbox', $9::jsonb)`,
    [
      signup.id,
      mallBuyOrder,
      storeBuyOrder,
      AMOUNT,
      detail?.status ?? "UNKNOWN",
      detail?.response_code ?? null,
      detail?.authorization_code ?? null,
      detail?.payment_type_code ?? null,
      JSON.stringify(body),
    ],
  );

  console.log("\n===== TRANSACCIÓN APROBADA (validación) =====");
  console.log("Aprobada:", approved ? "SÍ" : "NO");
  console.log("buy_order PADRE (mall):", mallBuyOrder);
  console.log("buy_order tienda:", storeBuyOrder);
  console.log("Monto:", AMOUNT);
  console.log("response_code:", detail?.response_code ?? null);
  console.log("status:", detail?.status ?? null);
  console.log("authorization_code:", detail?.authorization_code ?? null);
  console.log("\n→ Pega en el formulario Transbank el buy_order PADRE:");
  console.log(mallBuyOrder);
  console.log("\nRespuesta completa:");
  console.log(JSON.stringify(body, null, 2));

  if (!approved) process.exit(1);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await pgClient.end();
}
