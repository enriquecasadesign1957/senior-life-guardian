/**
 * Elimina cuentas activas EXCEPTO las que conservan estos móviles (últimos 9 dígitos).
 * Uso: node scripts/delete-test-signups-keep-phones.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";

const KEEP_SUFFIXES = new Set(["989027491", "963524252", "993634042"]);
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function phoneSuffix(raw) {
  return String(raw ?? "").replace(/\D/g, "").slice(-9);
}

const env = loadEnv();
const base = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const listRes = await fetch(
  `${base}/rest/v1/contract_signups?subscription_status=eq.active&select=id,nombre,email,telefono,payment_status,comp_reason,created_at`,
  { headers },
);
const rows = await listRes.json();
if (!listRes.ok) {
  console.error("LIST ERROR", rows);
  process.exit(1);
}

const toKeep = [];
const toDelete = [];
for (const row of rows) {
  const suffix = phoneSuffix(row.telefono);
  if (KEEP_SUFFIXES.has(suffix)) toKeep.push({ ...row, suffix });
  else toDelete.push({ ...row, suffix });
}

console.log(`Activas: ${rows.length} | Conservar: ${toKeep.length} | Borrar: ${toDelete.length}`);
console.log("\nCONSERVAR:");
for (const r of toKeep) {
  console.log(`  ${r.suffix}  ${r.email}  ${r.id}`);
}
console.log("\nBORRAR:");
for (const r of toDelete) {
  console.log(`  ${r.suffix || "(sin tel)"}  ${r.email}  ${r.id}`);
}

if (toKeep.length !== 3) {
  console.error(`\nAbortado: se esperaban exactamente 3 cuentas a conservar (hay ${toKeep.length}).`);
  process.exit(1);
}
if (toDelete.length === 0) {
  console.log("\nNada que borrar.");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\n--dry-run: no se borró nada.");
  process.exit(0);
}

const ids = toDelete.map((r) => r.id);
const delRes = await fetch(
  `${base}/rest/v1/contract_signups?id=in.(${ids.join(",")})`,
  { method: "DELETE", headers },
);
const deleted = await delRes.json().catch(() => null);
if (!delRes.ok) {
  console.error("DELETE ERROR", deleted ?? delRes.status);
  process.exit(1);
}

console.log(`\nEliminadas ${Array.isArray(deleted) ? deleted.length : ids.length} cuentas.`);

const verifyRes = await fetch(
  `${base}/rest/v1/contract_signups?subscription_status=eq.active&select=id,email,telefono`,
  { headers },
);
const remaining = await verifyRes.json();
console.log(`\nQuedan activas: ${remaining.length}`);
for (const r of remaining) {
  console.log(`  ${phoneSuffix(r.telefono)}  ${r.email}  ${r.id}`);
}
