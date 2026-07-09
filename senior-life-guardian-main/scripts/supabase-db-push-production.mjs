/**
 * supabase db push → producción (cgcnjnhifdmornedzpid) usando SUPABASE_DB_PASSWORD.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

const dbUrl = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`;

console.log("[supabase] db push → producción", PROJECT_REF);
const result = spawnSync(
  "npx",
  ["supabase", "db", "push", "--db-url", dbUrl, "--yes"],
  { stdio: "inherit", shell: true, cwd: process.cwd() },
);

process.exit(result.status ?? 1);
