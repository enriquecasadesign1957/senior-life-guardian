/**
 * Repara family_members con contract_signup_id obsoleto (cuenta borrada/re-registrada).
 * Uso: node scripts/reconcile-family-portal.mjs [+569...]
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

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const phoneFilter = process.argv[2];

let query = sb.from("family_members").select("id, contract_signup_id, telefono, nombre, activo");
if (phoneFilter) query = query.in("telefono", candidates(phoneFilter));

const { data: members, error } = await query;
if (error) {
  console.error(error.message);
  process.exit(1);
}

async function pickPreferred(signupIds) {
  const unique = [...new Set(signupIds.filter(Boolean))];
  if (unique.length === 0) return null;
  if (unique.length === 1) return unique[0];

  const { data: signups } = await sb
    .from("contract_signups")
    .select("id, subscription_status, payment_status, updated_at")
    .in("id", unique)
    .order("updated_at", { ascending: false });

  const existing = signups ?? [];
  if (!existing.length) return null;

  const { data: devices } = await sb
    .from("device_status")
    .select("contract_signup_id, last_seen_at")
    .in(
      "contract_signup_id",
      existing.map((s) => s.id),
    )
    .order("last_seen_at", { ascending: false });

  const live = (devices ?? []).find((d) => d.last_seen_at);
  if (live?.contract_signup_id) return live.contract_signup_id;

  const paid = existing.find(
    (s) => s.subscription_status === "active" && s.payment_status === "paid",
  );
  return paid?.id ?? existing[0].id;
}

let updated = 0;
for (const member of members ?? []) {
  const cands = candidates(member.telefono);
  const { data: ecs } = await sb
    .from("emergency_contacts")
    .select("contract_signup_id")
    .in("telefono", cands)
    .eq("activo", true);

  const ecIds = [...new Set((ecs ?? []).map((r) => r.contract_signup_id))];
  const { data: current } = await sb
    .from("contract_signups")
    .select("id")
    .eq("id", member.contract_signup_id)
    .maybeSingle();

  const pool = current ? [member.contract_signup_id, ...ecIds] : ecIds;
  const preferred = await pickPreferred(pool);
  if (!preferred || preferred === member.contract_signup_id) {
    console.log(`OK ${member.telefono} → ${member.contract_signup_id}`);
    continue;
  }

  const { error: upErr } = await sb
    .from("family_members")
    .update({ contract_signup_id: preferred, updated_at: new Date().toISOString() })
    .eq("id", member.id);
  if (upErr) {
    console.error(`FAIL ${member.telefono}:`, upErr.message);
    continue;
  }
  updated++;
  console.log(`FIX ${member.telefono}: ${member.contract_signup_id} → ${preferred}`);
}

console.log(`\nReparados: ${updated}`);
