/**
 * Aplica bootstrap emergency_contacts en Supabase producción.
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
  "supabase/migrations/20260607130000_bootstrap_emergency_contacts_production.sql",
);
const sql = fs.readFileSync(sqlPath, "utf8");

const regions = [
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
  "sa-east-1",
  "ap-south-1",
];

const targets = [];
for (const region of regions) {
  for (const prefix of ["aws-0", "aws-1"]) {
    const host = `${prefix}-${region}.pooler.supabase.com`;
    targets.push({ host, port: 6543, user: `postgres.${PROJECT_REF}` });
    targets.push({ host, port: 5432, user: `postgres.${PROJECT_REF}` });
  }
}
targets.push({ host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: "postgres" });

let lastError = null;
for (const { host, port, user } of targets) {
  const client = new pg.Client({
    host,
    port,
    database: "postgres",
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query(sql);
    await client.end();
    console.log(`emergency_contacts OK (${user}@${host}:${port}).`);
    process.exit(0);
  } catch (e) {
    lastError = e;
    console.warn(`falló ${host}:${port} → ${e.message}`);
    try {
      await client.end();
    } catch {
      /* ignore */
    }
  }
}

console.error("No se pudo aplicar la migración:", lastError?.message ?? lastError);
process.exit(1);
