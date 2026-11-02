import { and, eq, gt } from "drizzle-orm";
import { cleanupApplySchema } from "@cuidado/contract";
import { cleanupBatches, getDb, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { applyCleanup } from "@/lib/plugin-client";
import { requireUserId } from "@/lib/session";
import { isWatchActive } from "@/lib/watch";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = cleanupApplySchema.parse(await request.json());
    const userId = await requireUserId();
    const db = getDb();
    const now = new Date();
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
    if (!isWatchActive({ plan: site.plan, watchUntil: site.watchUntil }, now)) {
      throw new ApiError(
        "PAYMENT_REQUIRED",
        "Necesitas el Rescate o el Plan Cuidado activo para limpiar la base.",
        402,
      );
    }

    const openBatch = (
      await db
        .select({ id: cleanupBatches.id })
        .from(cleanupBatches)
        .where(
          and(
            eq(cleanupBatches.siteId, site.id),
            eq(cleanupBatches.status, "applied"),
            gt(cleanupBatches.undoUntil, now),
          ),
        )
        .limit(1)
    )[0];
    if (openBatch) {
      throw new ApiError(
        "UNDO_PENDING",
        "Ya hay una limpieza pendiente de deshacer. Revierte o espera a que venzan los 7 días.",
        409,
      );
    }

    const secretRow = (
      await db.select().from(siteSecrets).where(eq(siteSecrets.siteId, site.id)).limit(1)
    )[0];
    if (!secretRow) {
      throw new ApiError("SITE_REQUIRED", "Vuelve a conectar el sitio con el plugin.", 409);
    }
    const secret = decryptSecret(secretRow.ciphertext, secretRow.iv);
    const result = await applyCleanup(site.baseUrl, secret);
    if (!result.ok) {
      const status =
        result.code === "UNAUTHORIZED"
          ? 401
          : result.code === "INNODB_REQUIRED"
            ? 422
            : result.code === "PAYLOAD_LIMIT" || result.code === "UNDO_PENDING"
              ? 409
              : 502;
      throw new ApiError(result.code, result.message, status);
    }

    const undoUntil = new Date(result.undoUntil);
    if (Number.isNaN(undoUntil.getTime())) {
      throw new ApiError("CLEANUP_FAILED", "El conector no devolvió una fecha de deshacer válida.", 502);
    }
    const bytes =
      (result.bytes?.revisions ?? 0) +
      (result.bytes?.expiredTransients ?? 0) +
      (result.bytes?.spamComments ?? 0);

    await db.insert(cleanupBatches).values({
      siteId: site.id,
      pluginBatchId: result.batchId,
      status: "applied",
      revisions: result.counts.revisions,
      expiredTransients: result.counts.expiredTransients,
      spamComments: result.counts.spamComments,
      bytes,
      undoUntil,
    });

    return NextResponse.json({
      applied: true,
      batchId: result.batchId,
      undoUntil: undoUntil.toISOString(),
      counts: result.counts,
      bytes,
    });
  } catch (error) {
    return jsonError(error);
  }
}
