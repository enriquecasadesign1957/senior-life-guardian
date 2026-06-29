/**
 * Aplica one_per_customer + código PRIMER50 en Supabase producción.
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

const sql = fs.readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260627120000_discount_one_per_customer_primer50.sql"),
  "utf8",
);

const client = new pg.Client({
  host: "aws-1-us-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${PROJECT_REF}`,
  password,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  await client.query("NOTIFY pgrst, 'reload schema'");
  const { rows } = await client.query(
    `SELECT code, label, percent_off, one_per_customer, active
     FROM public.discount_codes
     WHERE upper(trim(code)) = 'PRIMER50'`,
  );
  console.log("OK: migración one_per_customer + PRIMER50 aplicada");
  console.log("Código:", rows[0] ?? "(no encontrado)");
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
