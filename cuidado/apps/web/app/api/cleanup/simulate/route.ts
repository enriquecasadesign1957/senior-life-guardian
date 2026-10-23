import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { cleanupSimulateSchema } from "@cuidado/contract";
import { getDb, scanRuns, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

type Inventory = {
  revisions?: number | null;
  expiredTransients?: number | null;
  spamComments?: number | null;
  bytes?: number | null;
  overLimit?: boolean;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = cleanupSimulateSchema.parse(await request.json());
    const userId = await requireUserId();
    const db = getDb();
    const site = (
      await db
        .select()
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.userId, userId)))
        .limit(1)
    )[0];
    if (!site || site.status !== "connected") {
      throw new ApiError("SITE_REQUIRED", "Primero conecta el sitio con el código del plugin.", 409);
    }
    const latest = (
      await db
        .select({ summary: scanRuns.summary })
        .from(scanRuns)
        .where(and(eq(scanRuns.siteId, site.id), eq(scanRuns.status, "ready")))
        .orderBy(desc(scanRuns.createdAt))
        .limit(1)
    )[0];
    const inventory = (latest?.summary as { inventory?: Inventory } | null)?.inventory;
    return NextResponse.json({
      simulated: true,
      needsPayment: site.plan === "none",
      measured: Boolean(inventory),
      batchId: randomUUID(),
      actions: ["purge_transients", "purge_revisions", "purge_spam"],
      revisions: inventory?.revisions ?? null,
      expiredTransients: inventory?.expiredTransients ?? null,
      spamComments: inventory?.spamComments ?? null,
      bytes: inventory?.bytes ?? null,
      overLimit: inventory?.overLimit === true,
    });
  } catch (error) {
    return jsonError(error);
  }
}
