/** Diagnóstico de avisos de renovación para un email o todas las cuentas paid. */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const CHILE_TZ = "America/Santiago";
const emailArg = process.argv[2]?.trim().toLowerCase();

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
if (!password) {
  console.error("Falta SUPABASE_DB_PASSWORD");
  process.exit(1);
}

const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;
const client = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });
await client.connect();

const today = chileTodayKey();
console.log("Hoy (Chile):", today);
console.log("ZOHO_SMTP:", env.ZOHO_SMTP_USER ? "configurado" : "NO configurado");
console.log("CRON_SECRET:", env.CRON_SECRET ? "configurado" : "NO configurado");
console.log("");

const cols = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='contract_signups'
    AND column_name IN ('renewal_reminder_7d_for','renewal_reminder_1d_for','suspended_at','suspension_email_sent_at')
  ORDER BY column_name
`);
console.log("Columnas aviso:", cols.rows.map((r) => r.column_name).join(", ") || "(faltan — aplicar migración renewal)");

const query = emailArg
  ? {
      text: `SELECT id,email,nombre,payment_status,subscription_status,renewal_date,
             renewal_reminder_7d_for,renewal_reminder_1d_for,suspended_at,suspension_email_sent_at,last_payment_at
             FROM contract_signups WHERE lower(email)=lower($1) ORDER BY created_at DESC`,
      values: [emailArg],
    }
  : {
      text: `SELECT id,email,nombre,payment_status,subscription_status,renewal_date,
             renewal_reminder_7d_for,renewal_reminder_1d_for,suspended_at,suspension_email_sent_at
             FROM contract_signups WHERE renewal_date IS NOT NULL ORDER BY renewal_date ASC`,
      values: [],
    };

const { rows } = await client.query(query.text, query.values);

for (const r of rows) {
  const rk = r.renewal_date ? chileDateKey(r.renewal_date) : null;
  const until = rk ? daysBetweenChile(today, rk) : null;
  const overdue = rk ? daysBetweenChile(rk, today) : null;
  const eligible = r.payment_status === "paid" && r.renewal_date && ["active", "suspended"].includes(r.subscription_status);

  console.log("---");
  console.log("Email:", r.email);
  console.log("Nombre:", r.nombre);
  console.log("payment_status:", r.payment_status);
  console.log("subscription_status:", r.subscription_status);
  console.log("renewal_date:", r.renewal_date, "→ Chile:", rk);
  console.log("Días hasta vencimiento:", until);
  console.log("Días vencido:", overdue);
  console.log("Elegible cron (paid+renewal):", eligible ? "SÍ" : "NO");
  if (!eligible) {
    console.log("  → Motivo: solo cuentas payment_status=paid reciben avisos 7d/1d");
  }
  if (eligible && r.subscription_status === "active") {
    const win7 = until <= 7 && until >= 2;
    const win1 = until <= 1 && until >= 0;
    console.log("Ventana aviso 7d (2-7 días):", win7 ? "ACTIVA" : `no (until=${until})`);
    console.log("Ventana aviso 1d (0-1 días):", win1 ? "ACTIVA" : `no (until=${until})`);
    console.log("Suspender hoy (+3d):", overdue >= 3 ? "SÍ" : `no (overdue=${overdue})`);
  }
  console.log("renewal_reminder_7d_for:", r.renewal_reminder_7d_for);
  console.log("renewal_reminder_1d_for:", r.renewal_reminder_1d_for);
  console.log("suspension_email_sent_at:", r.suspension_email_sent_at);
}

await client.end();
