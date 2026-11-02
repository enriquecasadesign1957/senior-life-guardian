import fs from "node:fs";
import pg from "pg";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const sql = fs.readFileSync(
  "supabase/migrations/20260618120000_recurring_billing_consent.sql",
  "utf8",
);

const client = new pg.Client({
  connectionString: `postgresql://postgres.cgcnjnhifdmornedzpid:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
console.log("Migration recurring_billing_consent OK");
await client.end();
