import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb, type Database } from "@cuidado/db";

/**
 * Serializa trabajo por URL con pg_advisory_xact_lock en la misma
 * transacción/conexión que usa el callback (evita deadlock del pool).
 */
export async function withUrlLock<T>(url: string, fn: (db: Database) => Promise<T>): Promise<T> {
  const key = createHash("sha256").update(url).digest().readInt32BE(0);
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${key})`);
    return fn(tx as unknown as Database);
  });
}
