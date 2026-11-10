import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const tables = ["alert_logs", "contract_signups", "emergency_contacts"];
for (const t of tables) {
  const { error } = await sb.from(t).select("id").limit(1);
  console.log(t, error?.code ?? "ok", error?.message ?? "");
}
