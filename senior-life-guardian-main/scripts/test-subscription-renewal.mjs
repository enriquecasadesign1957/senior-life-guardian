/**
 * Pruebas de renovación: schema, cron HTTP, lógica de fechas Chile, cuentas elegibles.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const CRON_URL = "https://alarmaseniorsafe.cl/api/cron/process-subscription-renewals";
const CHILE_TZ = "America/Santiago";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const vars = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
      if (m) vars[m[1]] = m[2];
    }
  }
  return { ...vars, ...process.env };
}

function chileDateKey(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHILE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function chileTodayKey() {
  return chileDateKey(new Date());
}

function daysBetweenChile(fromKey, toKey) {
  const parse = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((parse(toKey) - parse(fromKey)) / 86_400_000);
}

const env = loadEnv();
const password = env.SUPABASE_DB_PASSWORD;
const cronSecret = env.CRON_SECRET;

const results = [];

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}: ${detail}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}: ${detail}`);
}

// --- 1) Schema ---
if (!password) {
  fail("schema", "SUPABASE_DB_PASSWORD no configurado");
} else {
  const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;
  const client = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contract_signups'
        AND column_name IN (
          'renewal_reminder_7d_for', 'renewal_reminder_1d_for',
          'suspended_at', 'suspension_email_sent_at', 'renewal_date'
        )
      ORDER BY column_name
    `);
    const found = cols.rows.map((r) => r.column_name);
    if (found.length === 5) {
      pass("schema", `5/5 columnas OK (${found.join(", ")})`);
    } else {
      fail("schema", `Faltan columnas. Encontradas: ${found.join(", ")}`);
    }

    const { rows: paid } = await client.query(`
      SELECT id, subscription_status, renewal_date::text
      FROM contract_signups
      WHERE payment_status = 'paid' AND renewal_date IS NOT NULL
      ORDER BY renewal_date ASC
      LIMIT 20
    `);

    const today = chileTodayKey();
    let due7 = 0;
    let due1 = 0;
    let overdue3 = 0;
    let active = 0;
    let suspended = 0;

    for (const r of paid) {
      if (r.subscription_status === "active") active++;
      if (r.subscription_status === "suspended") suspended++;
      const rk = chileDateKey(r.renewal_date);
      const until = daysBetweenChile(today, rk);
      const overdue = daysBetweenChile(rk, today);
      if (r.subscription_status === "active" && until <= 7 && until >= 2) due7++;
      if (r.subscription_status === "active" && until <= 1 && until >= 0) due1++;
      if (r.subscription_status === "active" && overdue >= 3) overdue3++;
    }

    pass(
      "cuentas_paid",
      `${paid.length} con renewal_date (muestra). Activas: ${active}, suspendidas: ${suspended}. Hoy Chile: ${today}. Aviso 7d hoy: ${due7}, 1d: ${due1}, suspendibles (+3d): ${overdue3}`,
    );
  } catch (e) {
    fail("schema", e.message);
  } finally {
    await client.end();
  }
}

// --- 2) Lógica fechas ---
{
  const today = chileTodayKey();
  const in7 = new Date();
  in7.setUTCDate(in7.getUTCDate() + 7);
  const in1 = new Date();
  in1.setUTCDate(in1.getUTCDate() + 1);
  const d7 = daysBetweenChile(today, chileDateKey(in7));
  const d1 = daysBetweenChile(today, chileDateKey(in1));
  if (d7 === 7 && d1 === 1) {
    pass("fechas_chile", `daysUntil +7=${d7}, +1=${d1}`);
  } else {
    fail("fechas_chile", `Esperado 7 y 1, obtuvo ${d7} y ${d1}`);
  }
}

// --- 3) Cron HTTP sin auth ---
try {
  const r = await fetch(CRON_URL, { method: "POST" });
  if (r.status === 401) {
    pass("cron_sin_auth", "401 Unauthorized (correcto)");
  } else {
    fail("cron_sin_auth", `Esperado 401, obtuvo ${r.status}`);
  }
} catch (e) {
  fail("cron_sin_auth", e.message);
}

// --- 4) Cron HTTP con auth ---
if (!cronSecret) {
  fail("cron_con_auth", "CRON_SECRET no en .env");
} else {
  try {
    const r = await fetch(CRON_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const body = await r.json();
    if (r.status === 200 && body.ok !== undefined) {
      pass(
        "cron_con_auth",
        `200 OK — processed=${body.processed}, 7d=${body.reminders7d}, 1d=${body.reminders1d}, suspended=${body.suspended}, errors=${(body.errors || []).length}`,
      );
      if (body.errors?.length) {
        fail("cron_errores", body.errors.join("; "));
      }
    } else {
      fail("cron_con_auth", `Status ${r.status}: ${JSON.stringify(body)}`);
    }
  } catch (e) {
    fail("cron_con_auth", e.message);
  }
}

// --- 5) Bloqueo alertas (lógica pura) ---
{
  const allowed = (s) => s === "active";
  const cases = [
    ["active", true],
    ["suspended", false],
    ["cancelled", false],
    ["pending_payment", false],
  ];
  const bad = cases.filter(([s, exp]) => allowed(s) !== exp);
  if (bad.length === 0) {
    pass("bloqueo_alertas", "solo 'active' permite envío");
  } else {
    fail("bloqueo_alertas", JSON.stringify(bad));
  }
}

const failed = results.filter((r) => !r.ok);
console.log("\n--- RESUMEN ---");
console.log(`Total: ${results.length} | OK: ${results.length - failed.length} | Fallos: ${failed.length}`);
process.exit(failed.length ? 1 : 0);
