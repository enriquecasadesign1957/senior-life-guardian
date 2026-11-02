import { and, eq } from "drizzle-orm";
import { cleanupUndoSchema } from "@cuidado/contract";
import { cleanupBatches, getDb, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { undoCleanup } from "@/lib/plugin-client";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = cleanupUndoSchema.parse(await request.json());
    const userId = await requireUserId();
    const db = getDb();
    const site = (
      await db
        .select()
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.userId, userId), eq(sites.status, "connected")))
        .limit(1)
    )[0];
    if (!site) {
      throw new ApiError("SITE_REQUIRED", "Primero conecta el sitio con el código del plugin.", 409);
    }

    const batch = (
      await db
        .select()
        .from(cleanupBatches)
        .where(
          and(
            eq(cleanupBatches.siteId, site.id),
            eq(cleanupBatches.pluginBatchId, input.batchId),
            eq(cleanupBatches.status, "applied"),
          ),
        )
        .limit(1)
    )[0];
    if (!batch) {
      throw new ApiError("UNDO_UNAVAILABLE", "No hay un lote que se pueda deshacer.", 409);
    }
    if (batch.undoUntil.getTime() <= Date.now()) {
      throw new ApiError("UNDO_EXPIRED", "El plazo de 7 días ya pasó.", 409);
    }

    const secretRow = (
      await db.select().from(siteSecrets).where(eq(siteSecrets.siteId, site.id)).limit(1)
    )[0];
    if (!secretRow) {
      throw new ApiError("SITE_REQUIRED", "Vuelve a conectar el sitio con el plugin.", 409);
    }
    const secret = decryptSecret(secretRow.ciphertext, secretRow.iv);
    const result = await undoCleanup(site.baseUrl, secret, batch.pluginBatchId);
    if (!result.ok) {
      throw new ApiError(result.code, result.message, result.code === "UNAUTHORIZED" ? 401 : 409);
    }

    await db
      .update(cleanupBatches)
      .set({ status: "undone", undoneAt: new Date() })
      .where(eq(cleanupBatches.id, batch.id));

    return NextResponse.json({ undone: true, batchId: batch.pluginBatchId });
  } catch (error) {
    return jsonError(error);
  }
}
