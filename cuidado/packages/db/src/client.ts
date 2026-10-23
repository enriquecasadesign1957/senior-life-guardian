import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

type Store = {
  cuidadoPool?: Pool;
  cuidadoDb?: Database;
};

const globalStore = globalThis as unknown as Store;

export function getPool(): Pool {
  const existing = globalStore.cuidadoPool;
  if (existing) return existing;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
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
