import { createHash } from "node:crypto";
import { and, eq, gt, like } from "drizzle-orm";
import { PAIR_TTL_MS } from "@cuidado/contract";
import { getDb, verificationTokens } from "@cuidado/db";

export function pairTokenId(siteId: string): string {
  return `cuidado-pair:${siteId}`;
}

export function hashPairCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function savePendingPair(siteId: string, pairCode: string): Promise<void> {
  const db = getDb();
  const identifier = pairTokenId(siteId);
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({
    identifier,
    token: hashPairCode(pairCode),
    expires: new Date(Date.now() + PAIR_TTL_MS),
  });
}

export async function takePendingPairByCode(pairCode: string): Promise<string | null> {
  const db = getDb();
  const now = new Date();
  const token = hashPairCode(pairCode);
  const rows = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.token, token), gt(verificationTokens.expires, now), like(verificationTokens.identifier, "cuidado-pair:%")))
    .limit(5);

  for (const row of rows) {
    const siteId = row.identifier.slice("cuidado-pair:".length);
    if (!/^[0-9a-f-]{36}$/i.test(siteId)) continue;
    await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, row.identifier), eq(verificationTokens.token, row.token)));
    return siteId;
  }
  return null;
}

export async function clearPendingPair(siteId: string): Promise<void> {
  await getDb().delete(verificationTokens).where(eq(verificationTokens.identifier, pairTokenId(siteId)));
}
