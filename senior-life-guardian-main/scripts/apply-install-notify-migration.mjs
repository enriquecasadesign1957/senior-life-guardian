/**
 * Aplica migración install_instructions_sent_at en Supabase producción.
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
  console.error("Falta SUPABASE_DB_PASSWORD en .env.");
  process.exit(1);
}

const sqlPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260624120000_install_instructions_sent.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");
const pooler = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Migración install_instructions_sent_at aplicada correctamente.");
} catch (e) {
  console.error("No se pudo aplicar la migración:", e instanceof Error ? e.message : e);
  try {
    await client.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
}
