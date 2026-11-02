/**
 * Diagnóstico local: env + fetch Supabase (mismo stack que server functions).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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
console.log("NODE_OPTIONS:", process.env.NODE_OPTIONS ?? "(none)");
console.log("SUPABASE_URL set:", Boolean(env.SUPABASE_URL));
console.log("SERVICE_ROLE set:", Boolean(env.SUPABASE_SERVICE_ROLE_KEY));

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltan variables en .env");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

try {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("code,percent_off")
    .ilike("code", "VECINO-LASCONDES")
    .maybeSingle();
  if (error) throw error;
  console.log("OK fetch:", data);
} catch (e) {
  console.error("FAIL fetch:", e?.message ?? e);
  process.exit(1);
}
