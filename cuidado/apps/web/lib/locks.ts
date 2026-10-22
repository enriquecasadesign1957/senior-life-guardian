import { createHash } from "node:crypto";
import { getPool } from "@cuidado/db";

export async function withUrlLock<T>(url: string, fn: () => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  const key = createHash("sha256").update(url).digest().readInt32BE(0);
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [key]);
    const result = await fn();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
