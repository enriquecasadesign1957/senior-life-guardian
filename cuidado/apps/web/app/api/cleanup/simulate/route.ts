import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { cleanupSimulateSchema } from "@cuidado/contract";
import { getDb, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

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
    return NextResponse.json({
      simulated: true,
      needsPayment: site.plan === "none",
      batchId: randomUUID(),
      actions: ["purge_transients", "purge_revisions", "purge_spam"],
    });
  } catch (error) {
    return jsonError(error);
  }
}
