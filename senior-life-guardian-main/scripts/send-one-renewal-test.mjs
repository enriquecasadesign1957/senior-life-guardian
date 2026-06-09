/** Envía solo el aviso 7d con plantilla nueva y restaura cuenta. */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const EMAIL = "edrack.lasvegas@gmail.com";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) vars[m[1]] = m[2];
  }
  return { ...vars, ...process.env };
}

function addChileDays(days) {
  const k = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = k.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 15)).toISOString();
}

const env = loadEnv();
const client = new pg.Client({
  connectionString: `postgresql://postgres.cgcnjnhifdmornedzpid:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const { rows } = await client.query(
  `SELECT id, renewal_date, subscription_status, renewal_reminder_7d_for
   FROM contract_signups WHERE lower(email)=lower($1)`,
  [EMAIL],
);
const backup = rows[0];
await client.query(
  `UPDATE contract_signups SET renewal_date=$2, subscription_status='active',
   renewal_reminder_7d_for=NULL, renewal_reminder_1d_for=NULL,
   suspended_at=NULL, suspension_email_sent_at=NULL, payment_status='paid'
   WHERE id=$1`,
  [backup.id, addChileDays(7)],
);

const cron = await fetch("https://alarmaseniorsafe.cl/api/cron/process-subscription-renewals", {
  method: "POST",
  headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
});
const body = await cron.json();

await client.query(
  `UPDATE contract_signups SET renewal_date=$2, subscription_status=$3, renewal_reminder_7d_for=$4 WHERE id=$1`,
  [backup.id, backup.renewal_date, backup.subscription_status, backup.renewal_reminder_7d_for],
);

console.log(JSON.stringify({ status: cron.status, body }, null, 2));
await client.end();
