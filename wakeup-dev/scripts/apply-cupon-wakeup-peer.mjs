/**
 * Aplica 20260901140000_cupon_wakeup_peer.sql en el proyecto WakeUp Dev.
 * No imprime secretos.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_REF = "tnauozhexefyjeicytmc";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    let key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

function tokenFromCli() {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const candidates = [
    path.join(home, ".supabase", "access-token"),
    path.join(home, "AppData", "Roaming", "supabase", "access-token"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const value = fs.readFileSync(file, "utf8").trim();
    if (value) return value;
  }
  return "";
}

const env = {
  ...parseEnvFile(path.join(root, ".dev.vars")),
  ...parseEnvFile(path.join(root, ".env")),
  ...parseEnvFile(path.resolve(root, "..", ".env")),
  ...parseEnvFile(path.resolve(root, "..", "senior-life-guardian-main", ".env")),
  ...process.env,
};

const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20260901140000_cupon_wakeup_peer.sql"),
  "utf8"
);

async function applyViaPostgres(password) {
  const { default: pg } = await import(
    pathToFileURL(
      path.resolve(
        root,
        "..",
        "senior-life-guardian-main",
        "node_modules",
        "pg",
        "lib",
        "index.js"
      )
    ).href
  );
  const hosts = [
    "aws-1-us-east-1.pooler.supabase.com",
    "aws-0-us-east-1.pooler.supabase.com",
  ];
  let lastError = "";
  for (const host of hosts) {
    const client = new pg.Client({
      connectionString: `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@${host}:6543/postgres`,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      await client.query(sql);
      const { rows } = await client.query(
        "select codigo, porcentaje, plan, activo from public.oncall_cupones where codigo = 'WAKEUP-PEER'"
      );
      await client.end();
      console.log("PG_OK");
      console.log(JSON.stringify(rows[0] ?? {}));
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  console.log("PG_FAIL");
  console.log(lastError.slice(0, 200));
  return false;
}

const token = env.SUPABASE_ACCESS_TOKEN || tokenFromCli();
const password = env.SUPABASE_DB_PASSWORD || env.WAKEUP_SUPABASE_DB_PASSWORD || "";

if (!token && password) {
  const ok = await applyViaPostgres(password);
  process.exit(ok ? 0 : 1);
}

if (!token) {
  console.log("NEED_ACCESS_TOKEN");
  process.exit(2);
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);
const text = await res.text();
console.log(`STATUS=${res.status}`);
if (!res.ok) {
  console.log(text.slice(0, 400));
  process.exit(1);
}

const check = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query:
        "select codigo, porcentaje, plan, activo, valido_hasta from public.oncall_cupones where codigo = 'WAKEUP-PEER'",
    }),
  }
);
const checkText = await check.text();
console.log(`VERIFY=${check.status}`);
console.log(checkText.slice(0, 500));
process.exit(res.ok && check.ok ? 0 : 1);
