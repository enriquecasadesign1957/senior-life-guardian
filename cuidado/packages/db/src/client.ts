import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

type Store = {
  cuidadoPool?: Pool;
  cuidadoDb?: Database;
};

const globalStore = globalThis as unknown as Store;

export type DatabaseUrlInfo = {
  provider: "supabase" | "neon" | "other";
  mode: "direct" | "session-pooler" | "transaction-pooler" | "unknown";
  host: string;
  port: string;
  user: string;
};

export function describeDatabaseUrl(connectionString: string): DatabaseUrlInfo {
  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error(
      "DATABASE_URL no es una URI válida. Si la password tiene @ # [ ] % etc., percent-encódala o pega la URI Session pooler del panel Supabase.",
    );
  }

  const host = parsed.hostname;
  const port = parsed.port || "5432";
  const user = decodeURIComponent(parsed.username || "");
  const isSupabase =
    host.includes("supabase.co") || host.includes("pooler.supabase.com");
  const isNeon = host.includes("neon.tech");
  const isTransactionPooler =
    port === "6543" ||
    connectionString.includes("pgbouncer=true") ||
    (isSupabase && host.includes("pooler") && port === "6543");
  const isSessionPooler =
    isSupabase && host.includes("pooler") && port === "5432";
  const isDirectSupabase = isSupabase && host.startsWith("db.") && port === "5432";

  return {
    provider: isSupabase ? "supabase" : isNeon ? "neon" : "other",
    mode: isTransactionPooler
      ? "transaction-pooler"
      : isSessionPooler
        ? "session-pooler"
        : isDirectSupabase || (isNeon && !host.includes("-pooler"))
          ? "direct"
          : "unknown",
    host,
    port,
    user,
  };
}

function assertUsableDatabaseUrl(info: DatabaseUrlInfo): void {
  if (info.mode === "transaction-pooler") {
    throw new Error(
      "DATABASE_URL apunta a un pooler en modo transacción. Usa Session pooler :5432 (Vercel/IPv4) o URI directa si hay IPv6.",
    );
  }
  // Session pooler de Supabase exige user postgres.<project-ref>
  if (
    info.provider === "supabase" &&
    info.mode === "session-pooler" &&
    (info.user === "postgres" || !info.user.includes("."))
  ) {
    throw new Error(
      "Session pooler Supabase requiere usuario postgres.<project-ref>, no solo postgres. Copia la URI Session pooler del panel.",
    );
  }
  // Free-tier db.* es IPv6-only; las Functions de Vercel salen por IPv4.
  if (process.env.VERCEL && info.provider === "supabase" && info.mode === "direct") {
    throw new Error(
      "En Vercel, DATABASE_URL debe ser Session pooler :5432 (user postgres.<ref>). El host directo db.* es IPv6-only.",
    );
  }
}

function poolOptions(connectionString: string, info: DatabaseUrlInfo) {
  const onVercel = Boolean(process.env.VERCEL);
  // withUrlLock retiene 1 conexión en transacción mientras fn() usa getDb()
  // (otra del pool). Con max:1 eso hace deadlock/timeout en /api/diagnose.
  const max = onVercel ? 3 : 10;
  const options: ConstructorParameters<typeof Pool>[0] = {
    connectionString,
    max,
    idleTimeoutMillis: onVercel ? 5_000 : 20_000,
    connectionTimeoutMillis: 10_000,
  };
  // Supabase (pooler) a veces presenta cadena que node-pg 8 marca como
  // SELF_SIGNED_CERT_IN_CHAIN. Forzamos TLS sin verificar CA para no depender
  // de sslmode=no-verify en la URI de Vercel.
  if (info.provider === "supabase") {
    options.ssl = { rejectUnauthorized: false };
  }
  return options;
}

export function getPool(): Pool {
  const existing = globalStore.cuidadoPool;
  if (existing) return existing;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const info = describeDatabaseUrl(connectionString);
  assertUsableDatabaseUrl(info);

  // Diagnóstico usa pg_advisory_xact_lock: URI directa o session pooler.
  // No usar pooler transacción (Supabase :6543). Ver MIGRATE-NEON-SUPABASE.md.
  const pool = new Pool(poolOptions(connectionString, info));
  pool.on("error", (err) => {
    console.error(
      JSON.stringify({
        event: "pg_pool_error",
        provider: info.provider,
        mode: info.mode,
        host: info.host,
        port: info.port,
        name: err.name,
        code: (err as NodeJS.ErrnoException).code,
        message: err.message.slice(0, 200),
      }),
    );
  });
  globalStore.cuidadoPool = pool;
  return pool;
}

export function getDb(): Database {
  const existing = globalStore.cuidadoDb;
  if (existing) return existing;
  const database = drizzle(getPool(), { schema });
  globalStore.cuidadoDb = database;
  return database;
}
