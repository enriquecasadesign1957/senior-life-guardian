/** Otorga cortesía (comp) a un email existente. Uso interno admin. */
import fs from "node:fs";
import path from "node:path";

const email = process.argv[2]?.trim().toLowerCase();
const reason = process.argv[3]?.trim() || "Cortesía administrador";
if (!email) {
  console.error("Uso: node scripts/grant-comp-email.mjs email@ejemplo.cl [motivo]");
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
if (!base || !key) process.exit(1);

const lookupUrl =
  `${base}/rest/v1/contract_signups?email=eq.${encodeURIComponent(email)}` +
  "&select=id,nombre,email&order=created_at.desc&limit=1";

const lookupRes = await fetch(lookupUrl, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
const rows = await lookupRes.json();
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("Cuenta no encontrada:", email);
  process.exit(1);
}

const row = rows[0];
const now = new Date().toISOString();

const patchRes = await fetch(`${base}/rest/v1/contract_signups?id=eq.${row.id}`, {
  method: "PATCH",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    payment_status: "comp",
    subscription_status: "active",
    renewal_date: null,
    comp_reason: reason,
    comp_granted_at: now,
    comp_granted_by: "script-admin",
    renewal_reminder_7d_for: null,
    renewal_reminder_1d_for: null,
    suspended_at: null,
    suspension_email_sent_at: null,
  }),
});

const updated = await patchRes.json();
if (!patchRes.ok) {
  console.error("ERROR", updated?.message ?? patchRes.status);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      nombre: row.nombre,
      email: row.email,
      payment_status: "comp",
      subscription_status: "active",
      app_url: "https://alarmaseniorsafe.cl/app",
    },
    null,
    2,
  ),
);
