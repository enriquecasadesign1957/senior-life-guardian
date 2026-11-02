/**
 * Diagnóstico Portal Familia para un teléfono guardián.
 * Uso: node scripts/diagnose-family-portal.mjs +56972189727
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function candidates(raw) {
  const s = String(raw).replace(/[^\d+]/g, "");
  const out = new Set([s]);
  if (s.startsWith("+")) out.add(s.slice(1));
  if (/^\+56\d{9}$/.test(s)) out.add(s.slice(3));
  if (/^9\d{8}$/.test(s)) {
    out.add(`+56${s}`);
    out.add(`56${s}`);
  }
  if (/^56\d{9}$/.test(s)) out.add(`+${s}`);
  return [...out];
}

const phoneArg = process.argv[2] ?? "+56972189727";
const phones = candidates(phoneArg);

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const phoneOr = phones.map((p) => `telefono.eq.${p}`).join(",");

const { data: signups, error: signupsErr } = await sb
  .from("contract_signups")
  .select("id,nombre,telefono,subscription_status,payment_status,created_at,updated_at")
  .or(phoneOr);
console.log("=== contract_signups (senior phone) ===");
if (signupsErr) console.log("err", signupsErr.message);
console.log(JSON.stringify(signups, null, 2));

const { data: ec } = await sb
  .from("emergency_contacts")
  .select("id,contract_signup_id,nombre,telefono,parentesco,activo,created_at")
  .or(phoneOr);
console.log("\n=== emergency_contacts (guardian phone) ===");
console.log(JSON.stringify(ec, null, 2));

const { data: fm } = await sb.from("family_members").select("*").in("telefono", phones);
console.log("\n=== family_members ===");
console.log(JSON.stringify(fm, null, 2));

const signupIds = new Set([
  ...(signups ?? []).map((s) => s.id),
  ...(ec ?? []).map((r) => r.contract_signup_id),
  ...(fm ?? []).map((r) => r.contract_signup_id),
]);

for (const id of signupIds) {
  const { data: senior } = await sb
    .from("contract_signups")
    .select("id,nombre,telefono,subscription_status,payment_status")
    .eq("id", id)
    .maybeSingle();
  const { data: ds } = await sb.from("device_status").select("*").eq("contract_signup_id", id).maybeSingle();
  const { data: alerts } = await sb
    .from("alert_logs")
    .select("id,created_at,event_type,status")
    .eq("contract_signup_id", id)
    .order("created_at", { ascending: false })
    .limit(5);
  console.log(`\n--- signup ${id} ---`);
  console.log("senior", JSON.stringify(senior));
  console.log("device_status", JSON.stringify(ds));
  console.log("alerts", JSON.stringify(alerts));
}
