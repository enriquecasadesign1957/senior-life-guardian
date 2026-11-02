/**
 * Oneclick Mall integración: authorize APROBADA en 3 cuotas ($24.000).
 *
 * node scripts/oneclick-authorize-cuotas-approved.mjs [email]
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
/** API Key integración — intenta la del formulario y cae a la sandbox pública. */
const API_KEYS = [
  "579B532A7440BB0C9079DED94D31EA1615B1192594D355E2EE18F109E3436F21",
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
];
const AMOUNT = 24000;
const INSTALLMENTS = 3;
/** Integración REST — no usar https://transbank.cl (sin path API). */
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

/** buy_order: máx. 26 alfanumérico (Transbank no acepta guiones bajos). */
function parentBuyOrder() {
  const ts = Date.now().toString();
  return `PARENTCUOTAS${ts}`.slice(0, 26);
}

function childBuyOrder() {
  const ts = Date.now().toString();
  return `CHILDCUOTAS${ts}`.slice(0, 26);
}

const testEmail = (process.argv[2] ?? "enriquecasadesign@gmail.com").toLowerCase();
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
  const { rows } = await pgClient.query(
    `
    SELECT id, oneclick_username, oneclick_tbk_user, email, oneclick_inscription_status
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
    console.error(`No hay inscripción Oneclick activa para ${testEmail}.`);
    process.exit(1);
  }

  const mallBuyOrder = parentBuyOrder();
  let storeBuyOrder = childBuyOrder();
  if (storeBuyOrder === mallBuyOrder) storeBuyOrder = childBuyOrder();

  const payload = {
    username: signup.oneclick_username,
    tbk_user: signup.oneclick_tbk_user,
    buy_order: mallBuyOrder,
    details: [
      {
        commerce_code: STORE_CC,
        buy_order: storeBuyOrder,
        amount: AMOUNT,
        installments_number: INSTALLMENTS,
      },
    ],
  };

  console.log("\n===== DATOS INSCRIPCIÓN (Supabase) =====");
  console.log("email:", signup.email);
  console.log("username:", signup.oneclick_username);
  console.log("tbk_user:", signup.oneclick_tbk_user);
  console.log("inscription_status:", signup.oneclick_inscription_status);

  console.log("\n===== BUY_ORDER PADRE (pegar en Transbank) =====");
  console.log(mallBuyOrder);
  console.log("===============================================\n");

  console.log("POST", `${API_HOST}${ONECLICK_BASE}/transactions`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  let res;
  let body = {};
  let usedKeyIndex = -1;

  for (let i = 0; i < API_KEYS.length; i += 1) {
    res = await fetch(`${API_HOST}${ONECLICK_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Tbk-Api-Key-Id": MALL_CC,
        "Tbk-Api-Key-Secret": API_KEYS[i],
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }

    if (res.status !== 401) {
      usedKeyIndex = i;
      break;
    }
    console.warn(`API key #${i + 1} → HTTP 401 Not Authorized, probando siguiente…`);
  }

  if (usedKeyIndex < 0) {
    console.error("Todas las API keys devolvieron 401. Revisa credenciales Mall integración.");
    process.exit(1);
  }
  if (usedKeyIndex > 0) {
    console.log(`Autenticación OK con API key alternativa (#${usedKeyIndex + 1}).`);
  }

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

  console.log("\n===== RESPUESTA TRANSBANK =====");
  console.log("HTTP:", res.status);
  console.log("response_code:", detail?.response_code ?? body.response_code ?? null);
  console.log("status:", detail?.status ?? null);
  console.log("authorization_code:", detail?.authorization_code ?? null);
  console.log("payment_type_code:", detail?.payment_type_code ?? null);
  console.log("installments_number:", detail?.installments_number ?? INSTALLMENTS);
  console.log("Aprobada:", approved ? "SÍ ✓" : "NO ✗");
  console.log("\nRespuesta completa:");
  console.log(JSON.stringify(body, null, 2));

  if (!approved) process.exit(1);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await pgClient.end();
}
