/**
 * Aplica SQL de metricas_latencia y registra la versión en historial Supabase CLI.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";

const PROJECT_REF = "cgcnjnhifdmornedzpid";
const MIGRATION_VERSION = "20260705180000";

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

const dbUrl = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;

const sql = fs.readFileSync(
  path.resolve(process.cwd(), "supabase/migrations/20260705180000_metricas_latencia.sql"),
  "utf8",
);

console.log("[1/3] Aplicando SQL metricas_latencia…");
const client = new pg.Client({
  host: "aws-1-us-east-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: `postgres.${PROJECT_REF}`,
  password,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(sql);
await client.query("NOTIFY pgrst, 'reload schema'");
const verify = await client.query(`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'metricas_latencia'
  ) AS ok
`);
await client.end();
if (!verify.rows[0]?.ok) {
  console.error("ERROR: tabla metricas_latencia no existe tras migración");
  process.exit(1);
}
console.log("OK — tabla metricas_latencia verificada");

console.log("[2/3] Registrando versión en historial Supabase CLI…");
const repair = spawnSync(
  "npx",
  ["supabase", "migration", "repair", "--status", "applied", "--db-url", dbUrl, "--yes", MIGRATION_VERSION],
  { stdio: "inherit", shell: true, cwd: process.cwd() },
);
if ((repair.status ?? 1) !== 0) {
  console.error("ERROR: migration repair falló");
  process.exit(repair.status ?? 1);
}
console.log("OK — versión", MIGRATION_VERSION, "marcada como applied");

console.log("[3/3] Listo para deploy del servidor");
