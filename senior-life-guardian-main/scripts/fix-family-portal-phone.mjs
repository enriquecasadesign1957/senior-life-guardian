/**
 * Limpia family_members huérfanos y crea filas faltantes desde emergency_contacts.
 * Uso: node scripts/fix-family-portal-phone.mjs +56972189727
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

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

const phone = process.argv[2];
if (!phone) {
  console.error("Uso: node scripts/fix-family-portal-phone.mjs +569...");
  process.exit(1);
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const cands = candidates(phone);

const { data: members } = await sb.from("family_members").select("*").in("telefono", cands);
const { data: signups } = await sb
  .from("contract_signups")
  .select("id")
  .in(
    "id",
    (members ?? []).map((m) => m.contract_signup_id),
  );
const valid = new Set((signups ?? []).map((s) => s.id));

for (const m of members ?? []) {
  if (valid.has(m.contract_signup_id)) continue;
  const { error } = await sb.from("family_members").update({ activo: false }).eq("id", m.id);
  console.log(
    error ? `FAIL deactivate ${m.id}` : `deactivated orphan ${m.id} → ${m.contract_signup_id}`,
  );
}

const { data: ecs } = await sb
  .from("emergency_contacts")
  .select("contract_signup_id, nombre, parentesco, telefono")
  .in("telefono", cands)
  .eq("activo", true);

for (const ec of ecs ?? []) {
  const { data: existing } = await sb
    .from("family_members")
    .select("id, activo")
    .eq("contract_signup_id", ec.contract_signup_id)
    .in("telefono", cands)
    .maybeSingle();
  if (existing?.activo) {
    console.log(`OK member for ${ec.contract_signup_id}`);
    continue;
  }
  if (existing && !existing.activo) {
    await sb
      .from("family_members")
      .update({ activo: true, nombre: ec.nombre, parentesco: ec.parentesco })
      .eq("id", existing.id);
    console.log(`reactivated ${existing.id} for ${ec.contract_signup_id}`);
    continue;
  }
  const { error } = await sb.from("family_members").insert({
    contract_signup_id: ec.contract_signup_id,
    nombre: ec.nombre,
    telefono: ec.telefono,
    parentesco: ec.parentesco,
    activo: true,
  });
  console.log(error ? `FAIL insert ${ec.contract_signup_id}: ${error.message}` : `created for ${ec.contract_signup_id}`);
}

console.log("Listo.");
