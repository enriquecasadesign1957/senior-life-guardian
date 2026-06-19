import fs from "node:fs";
import pg from "pg";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const client = new pg.Client({
  connectionString: `postgresql://postgres.cgcnjnhifdmornedzpid:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const { rows } = await client.query(`
  SELECT id, email, oneclick_username, oneclick_tbk_user, oneclick_inscription_token,
         oneclick_inscription_status, oneclick_card_last4, created_at
  FROM public.contract_signups
  WHERE oneclick_tbk_user IS NOT NULL OR oneclick_username LIKE 'val%'
  ORDER BY created_at DESC
`);
console.log(JSON.stringify(rows, null, 2));
await client.end();
