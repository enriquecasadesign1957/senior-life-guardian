import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

type Store = {
  cuidadoPool?: Pool;
  cuidadoDb?: Database;
};

const globalStore = globalThis as unknown as Store;

function isTransactionPooler(connectionString: string): boolean {
  try {
    const u = new URL(connectionString);
    const port = u.port || "5432";
    return (
      port === "6543" ||
      connectionString.includes("pgbouncer=true") ||
      (u.hostname.includes("pooler") && port === "6543")
    );
  } catch {
    return false;
  }
}

export function getPool(): Pool {
  const existing = globalStore.cuidadoPool;
  if (existing) return existing;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Diagnóstico usa pg_advisory_xact_lock: URI directa o session pooler.
  // No usar pooler transacción (Supabase :6543). Ver MIGRATE-NEON-SUPABASE.md.
  if (isTransactionPooler(connectionString)) {
    throw new Error(
      "DATABASE_URL apunta a un pooler en modo transacción. Usa db.*.supabase.co:5432 o session pooler :5432.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
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
