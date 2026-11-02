/**
 * Aplica migración user_pins en Supabase producción.
 * Requiere SUPABASE_DB_PASSWORD en .env (Settings → Database en Supabase).
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
  console.error(
    "Falta SUPABASE_DB_PASSWORD en .env. Obtén la contraseña en Supabase → Settings → Database.",
  );
  process.exit(1);
}

const sqlPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260603120000_ensure_user_pins_production.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");

const hosts = [
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-sa-east-1.pooler.supabase.com`,
];

let lastError = null;
for (const host of hosts) {
  const client = new pg.Client({
    host,
    port: 6543,
    database: "postgres",
    user: `postgres.${PROJECT_REF}`,
    password,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log(`Migración aplicada correctamente (${host}).`);
    process.exit(0);
  } catch (e) {
    lastError = e;
    try { await client.end(); } catch { /* ignore */ }
  }
}

console.error("No se pudo aplicar la migración:", lastError?.message ?? lastError);
process.exit(1);
