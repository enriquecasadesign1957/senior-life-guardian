/**
 * Limpia registros de portal familia para teléfonos de prueba.
 *
 * Uso:
 *   node scripts/cleanup-family-portal-phone.mjs +56912345678
 *   node scripts/cleanup-family-portal-phone.mjs +56911111111 +56922222222
 *   node scripts/cleanup-family-portal-phone.mjs --all-test
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SYSTEM_PHONES = new Set([
  "+56229147733",
  "56229147733",
  "+56971404580",
  "56971404580",
]);

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

function expandPhones(list) {
  const out = new Set();
  for (const p of list) for (const c of candidates(p)) out.add(c);
  return [...out];
}

function isSystemPhone(phone) {
  const variants = candidates(phone);
  return variants.some((p) => SYSTEM_PHONES.has(p));
}

const args = process.argv.slice(2);
const cleanAll = args.includes("--all-test");
const phoneArgs = args.filter((a) => !a.startsWith("--"));

if (!cleanAll && phoneArgs.length === 0) {
  console.error("Uso:");
  console.error("  node scripts/cleanup-family-portal-phone.mjs +56912345678 [+569...]");
  console.error("  node scripts/cleanup-family-portal-phone.mjs --all-test");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"/);
  if (m) env[m[1]] = m[2];
}

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

let phonesToClean = expandPhones(phoneArgs);

if (cleanAll) {
  const discovered = new Set();
  for (const table of ["family_members", "family_login_codes"]) {
    const { data, error } = await sb.from(table).select("telefono");
    if (error) {
      console.error(`${table} list:`, error.message);
      continue;
    }
    for (const row of data ?? []) {
      if (row.telefono && !isSystemPhone(row.telefono)) discovered.add(row.telefono);
    }
  }
  phonesToClean = expandPhones([...discovered]);
  console.log("Modo --all-test: teléfonos únicos encontrados (sin números Twilio oficiales):");
  for (const p of [...discovered].sort()) console.log(" ", p);
  if (discovered.size === 0) {
    console.log("Nada que limpiar.");
    process.exit(0);
  }
}

console.log("\nVariantes a limpiar:", phonesToClean.join(", "));

for (const table of ["family_login_codes", "family_members"]) {
  const { data, error } = await sb.from(table).delete().in("telefono", phonesToClean).select("id, telefono");
  if (error) {
    console.error(`${table}:`, error.message);
  } else {
    console.log(`${table}: eliminados ${data?.length ?? 0}`);
    for (const row of data ?? []) console.log(`  - ${row.telefono}`);
  }
}

console.log("\nListo. Los guardianes se recrearán al pedir código en /familia.");
