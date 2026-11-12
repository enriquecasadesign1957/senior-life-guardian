#!/usr/bin/env node
/**
 * Valida que DATABASE_URL sea apta para CuidadoWeb (candados advisory + drizzle).
 * Uso: DATABASE_URL=... node scripts/check-database-url.mjs
 */
const raw = process.env.DATABASE_URL ?? "";
if (!raw) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(raw);
} catch {
  console.error("DATABASE_URL no es una URI válida");
  process.exit(1);
}

const host = parsed.hostname;
const port = parsed.port || "5432";
const isSupabase =
  host.includes("supabase.co") || host.includes("pooler.supabase.com");
const isNeon = host.includes("neon.tech");
const isTransactionPooler =
  port === "6543" ||
  raw.includes("pgbouncer=true") ||
  (isSupabase && host.includes("pooler") && port === "6543");
const isSessionPooler =
  isSupabase && host.includes("pooler") && port === "5432";
const isDirectSupabase =
  isSupabase && host.startsWith("db.") && port === "5432";

const warnings = [];
const errors = [];

if (isTransactionPooler) {
  errors.push(
    "Pooler en modo transacción (puerto 6543 / pgbouncer=true). " +
      "CuidadoWeb usa pg_advisory_xact_lock en el diagnóstico: usa URI directa (db.*.supabase.co:5432) " +
      "o Session pooler (*.pooler.supabase.com:5432).",
  );
}

if (!raw.includes("sslmode=require") && !raw.includes("sslmode=verify-full")) {
  warnings.push("Añade ?sslmode=require al final de la URI.");
}

if (isDirectSupabase) {
  warnings.push(
    "URI directa Supabase (db.*) es IPv6-only en el plan free. En Vercel/IPv4 usa Session pooler :5432 con user postgres.<ref>.",
  );
}

if (isSessionPooler) {
  const user = decodeURIComponent(parsed.username || "");
  if (user === "postgres" || !user.includes(".")) {
    errors.push(
      "Session pooler requiere usuario postgres.<project-ref> (no solo postgres). Copia la URI del panel Supabase → Session pooler.",
    );
  }
}

if (isNeon) {
  warnings.push(
    "Sigue apuntando a Neon. Tras el cutover debe ser Supabase (proyecto cuidadoweb).",
  );
}

if (
  isSupabase &&
  !isDirectSupabase &&
  !isSessionPooler &&
  !isTransactionPooler
) {
  warnings.push(`Host Supabase poco habitual: ${host}:${port}`);
}

console.log(
  JSON.stringify(
    {
      ok: errors.length === 0,
      provider: isSupabase ? "supabase" : isNeon ? "neon" : "other",
      host,
      port,
      mode: isTransactionPooler
        ? "transaction-pooler"
        : isSessionPooler
          ? "session-pooler"
          : isDirectSupabase
            ? "direct"
            : "unknown",
      errors,
      warnings,
    },
    null,
    2,
  ),
);

process.exit(errors.length === 0 ? 0 : 2);
