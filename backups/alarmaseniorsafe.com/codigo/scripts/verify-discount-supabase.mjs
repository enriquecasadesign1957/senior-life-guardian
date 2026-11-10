/**
 * Verifica credenciales Supabase locales y lectura de discount_codes.
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
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await supabase
  .from("discount_codes")
  .select("code,percent_off,active")
  .ilike("code", "VECINO-LASCONDES")
  .maybeSingle();

if (error) {
  console.error("Error Supabase API:", error.message);
  process.exit(1);
}

console.log("OK: .env apunta a Supabase válido");
console.log("URL:", url);
console.log("Código VECINO-LASCONDES:", data);
