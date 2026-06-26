/**
 * Aplica migración install_step en Supabase producción.
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
  path.resolve(process.cwd(), "supabase/migrations/20260626120000_install_step_onboarding.sql"),
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

await client.connect();
await client.query(sql);
await client.query("NOTIFY pgrst, 'reload schema'");
await client.end();
console.log("install_step migration OK");
