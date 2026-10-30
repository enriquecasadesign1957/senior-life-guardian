import { and, eq, inArray } from "drizzle-orm";
import { getDb, sites } from "@cuidado/db";

export type GrantCuidadoResult = { status: "active" } | { status: "duplicate" } | { status: "rejected" };

export async function grantPaidCuidado(input: {
  siteId: string;
  userId: string;
}): Promise<GrantCuidadoResult> {
  const db = getDb();
  const updated = await db
    .update(sites)
    .set({
      plan: "cuidado",
      watchUntil: null,
    })
    .where(
      and(
        eq(sites.id, input.siteId),
        eq(sites.userId, input.userId),
        eq(sites.status, "connected"),
        inArray(sites.plan, ["none", "rescue"]),
      ),
    )
    .returning({ id: sites.id });
  if (updated[0]?.id) return { status: "active" };

  const existing = (
    await db
      .select({ plan: sites.plan })
      .from(sites)
      .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId), eq(sites.status, "connected")))
      .limit(1)
  )[0];
  if (!existing) return { status: "rejected" };
  if (existing.plan === "cuidado") return { status: "duplicate" };
  return { status: "rejected" };
}
