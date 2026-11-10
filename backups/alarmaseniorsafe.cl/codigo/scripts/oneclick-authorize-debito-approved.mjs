/**
 * Oneclick Mall integración: authorize DÉBITO/PREPAGO APROBADA ($9.900, sin cuotas).
 *
 * node scripts/oneclick-authorize-debito-approved.mjs
 * node scripts/oneclick-authorize-debito-approved.mjs --username=debittest1781720817546 --tbk-user=<uuid>
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MALL_CC = "597055555541";
const STORE_CC = "597055555542";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const AMOUNT = 9900;
const DEFAULT_DEBIT_USERNAME = "debittest1781720817546";
const API_HOST = "https://webpay3gint.transbank.cl";
const ONECLICK_BASE = "/rswebpaytransaction/api/oneclick/v1.2";
const DEBIT_JSON = path.resolve("public/oneclick-debit-inscription.json");

function loadEnvFile() {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) vars[m[1]] = m[2];
  }
  return vars;
}

function argValue(name) {
  const hit = process.argv.find((a) => a.startsWith(`${name}=`));
  return hit ? hit.slice(name.length + 1) : null;
}

function parentBuyOrder() {
  return `PARENTDEBITO${Date.now()}`.slice(0, 26);
}

function childBuyOrder() {
  return `CHILDDEBITO${Date.now()}`.slice(0, 26);
}

function banner(title, value) {
  const line = "=".repeat(72);
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
  console.log(value);
  console.log(line);
}

async function loadFromSupabase(pgClient, preferredUsername) {
  if (preferredUsername) {
    const { rows } = await pgClient.query(
      `
      SELECT id, oneclick_username, oneclick_tbk_user, email
      FROM public.contract_signups
      WHERE oneclick_username = $1
        AND oneclick_tbk_user IS NOT NULL
      LIMIT 1
    `,
      [preferredUsername],
    );
    if (rows[0]?.oneclick_tbk_user) return rows[0];
  }

  const { rows } = await pgClient.query(`
    SELECT id, oneclick_username, oneclick_tbk_user, email
    FROM public.contract_signups
    WHERE oneclick_tbk_user IS NOT NULL
      AND (oneclick_username LIKE 'debittest%' OR oneclick_username LIKE 'valdebit%')
    ORDER BY last_payment_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  `);
  return rows[0] ?? null;
}

function loadFromDebitJson() {
  if (!fs.existsSync(DEBIT_JSON)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(DEBIT_JSON, "utf8"));
    if (data.username && data.tbk_user) {
      return {
        id: null,
        oneclick_username: data.username,
        oneclick_tbk_user: data.tbk_user,
        email: data.email ?? null,
        source: DEBIT_JSON,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

const env = { ...loadEnvFile(), ...process.env };
const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Falta SUPABASE_DB_PASSWORD en .env");
  process.exit(1);
}

const cliUsername = argValue("--username");
const cliTbkUser = argValue("--tbk-user");
const preferredUsername = cliUsername ?? DEFAULT_DEBIT_USERNAME;

const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;
const pgClient = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

try {
  let signup = null;

  if (cliUsername && cliTbkUser) {
    signup = {
      id: null,
      oneclick_username: cliUsername,
      oneclick_tbk_user: cliTbkUser,
      email: null,
      source: "CLI",
    };
  } else {
    await pgClient.connect();
    signup = await loadFromSupabase(pgClient, preferredUsername);
    if (!signup) {
      signup = loadFromDebitJson();
    }
  }

  if (!signup?.oneclick_username || !signup.oneclick_tbk_user) {
    console.error(
      `\nNo hay inscripción débito finalizada para "${preferredUsername}".\n` +
        "Completa Webpay con tarjeta Redcompra 4051 8842 3993 7763 tras:\n" +
        "  node scripts/oneclick-inscription-start.mjs\n" +
        "O pasa credenciales:\n" +
        "  node scripts/oneclick-authorize-debito-approved.mjs --username=... --tbk-user=...\n",
    );
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
      },
    ],
  };

  console.log("\n===== INSCRIPCIÓN DÉBITO USADA =====");
  console.log("Fuente:", signup.source ?? "Supabase");
  console.log("username:", signup.oneclick_username);
  console.log("tbk_user:", signup.oneclick_tbk_user);
  if (signup.email) console.log("email:", signup.email);

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
  const approved =
    res.ok &&
    detail?.response_code === 0 &&
    (detail?.status === "AUTHORIZED" || detail?.status === "APPROVED");
  const isDebit = detail?.payment_type_code === "VD";

  if (signup.id) {
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
  }

  console.log("\n===== RESPUESTA TRANSBANK =====");
  console.log("HTTP:", res.status);
  console.log("response_code:", detail?.response_code ?? null);
  console.log("payment_type_code:", detail?.payment_type_code ?? null, isDebit ? "(VD ✓)" : "(esperado VD)");
  console.log("status:", detail?.status ?? null);
  console.log("authorization_code:", detail?.authorization_code ?? null);
  console.log("Aprobada:", approved ? "SÍ ✓" : "NO ✗");
  console.log("\nRespuesta completa:");
  console.log(JSON.stringify(body, null, 2));

  if (!approved || !isDebit) process.exit(1);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await pgClient.end().catch(() => {});
}
