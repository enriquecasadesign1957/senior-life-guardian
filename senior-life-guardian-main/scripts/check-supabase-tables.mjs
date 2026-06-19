import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
console.log("url:", env.SUPABASE_URL);

for (const table of ["alert_logs", "contract_signups", "family_members"]) {
  const { data, error } = await sb.from(table).select("id").limit(1);
  console.log(table + ":", error?.message ?? `ok (${data?.length ?? 0} row sample)`);
}
