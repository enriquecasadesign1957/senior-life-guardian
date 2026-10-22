import { and, eq } from "drizzle-orm";
import { getDb, sites } from "@cuidado/db";
import { rescueWatchUntil } from "./watch";

export type GrantResult =
  | { status: "active"; watchUntil: Date }
  | { status: "duplicate"; watchUntil: Date | null }
  | { status: "rejected" };

function isUniqueViolation(error: unknown): boolean {
  const current = error as { code?: string; cause?: { code?: string } } | null;
  return current?.code === "23505" || current?.cause?.code === "23505";
}

export async function grantPaidRescue(input: {
  siteId: string;
  userId: string;
  checkoutId: string;
  paidAt: Date;
}): Promise<GrantResult> {
  const db = getDb();
  try {
    const updated = await db
      .update(sites)
      .set({
        plan: "rescue",
        watchUntil: rescueWatchUntil(input.paidAt),
        rescueCheckoutId: input.checkoutId,
      })
      .where(
        and(
          eq(sites.id, input.siteId),
          eq(sites.userId, input.userId),
          eq(sites.status, "connected"),
          eq(sites.plan, "none"),
        ),
      )
      .returning({ watchUntil: sites.watchUntil });
    const granted = updated[0]?.watchUntil;
    if (granted) return { status: "active", watchUntil: granted };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }

  const existing = (
    await db
      .select({ plan: sites.plan, watchUntil: sites.watchUntil, checkoutId: sites.rescueCheckoutId })
      .from(sites)
      .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId), eq(sites.status, "connected")))
      .limit(1)
  )[0];
  if (!existing || existing.plan === "none") return { status: "rejected" };
  if (existing.plan === "rescue" && existing.checkoutId && existing.checkoutId !== input.checkoutId) {
    return { status: "duplicate", watchUntil: existing.watchUntil };
  }
  if (existing.plan === "cuidado" || !existing.watchUntil) return { status: "duplicate", watchUntil: existing.watchUntil };
  return { status: "active", watchUntil: existing.watchUntil };
}
