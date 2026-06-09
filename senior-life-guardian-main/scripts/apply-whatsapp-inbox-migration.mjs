/**
 * Aplica tabla whatsapp_inbox_messages en Supabase (producción).
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
  "supabase/migrations/20260609120000_whatsapp_inbox_messages.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");

const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("OK: migración whatsapp_inbox_messages aplicada");
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
