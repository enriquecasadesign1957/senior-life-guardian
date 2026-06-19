/**
 * Crea public.alert_logs en Supabase (producción).
 * Requiere SUPABASE_DB_PASSWORD en .env
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";

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

const env = { ...loadEnvFile(), ...process.env };
const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Falta SUPABASE_DB_PASSWORD en .env");
  process.exit(1);
}

const sqlPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260613190000_alert_logs_contract_signups.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  host: "aws-1-us-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${PROJECT_REF}`,
  password,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

await client.connect();

const before = await client.query(`SELECT to_regclass('public.alert_logs') AS reg`);
console.log("alert_logs before:", before.rows[0]?.reg ?? "missing");

await client.query(sql);
await client.query("NOTIFY pgrst, 'reload schema'");

const cols = await client.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name='alert_logs'
   ORDER BY 1`,
);
console.log("columns:", cols.rows.map((r) => r.column_name).join(", "));

const count = await client.query(`SELECT count(*)::int AS n FROM public.alert_logs`);
console.log("row count:", count.rows[0]?.n ?? 0);

await client.end();
console.log("alert_logs listo. Dispara un SOS nuevo para probar el enlace /c/...");
