import fs from "node:fs";
import path from "node:path";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Uso: node scripts/lookup-signup-email.mjs email@ejemplo.cl");
  process.exit(1);
}

const envPath = path.resolve(process.cwd(), ".env");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) env[m[1]] = m[2];
  }
}

const base = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const url =
  `${base}/rest/v1/contract_signups?email=eq.${encodeURIComponent(email)}` +
  "&select=id,nombre,email,payment_status,subscription_status,renewal_date,onboarding_completed,created_at&order=created_at.desc&limit=1";

const res = await fetch(url, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const data = await res.json();
if (!res.ok) {
  console.error("ERROR", data?.message ?? res.status);
  process.exit(1);
}
if (!Array.isArray(data) || data.length === 0) {
  console.log(JSON.stringify({ found: false, email }, null, 2));
  process.exit(0);
}

const row = data[0];
console.log(
  JSON.stringify(
    {
      found: true,
      nombre: row.nombre,
      email: row.email,
      payment_status: row.payment_status,
      subscription_status: row.subscription_status,
      renewal_date: row.renewal_date,
      onboarding_completed: row.onboarding_completed,
      created_at: row.created_at,
    },
    null,
    2,
  ),
);
