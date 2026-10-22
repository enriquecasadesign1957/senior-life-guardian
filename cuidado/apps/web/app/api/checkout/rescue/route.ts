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
    const site = (
      await getDb()
        .select({ id: sites.id, plan: sites.plan })
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.userId, userId), eq(sites.status, "connected")))
        .limit(1)
    )[0];
    if (!site) {
      throw new ApiError("SITE_REQUIRED", "Primero conecta el sitio con el código del plugin.", 409);
    }
    if (site.plan !== "none") {
      throw new ApiError("ALREADY_COVERED", "Este sitio ya tiene un plan. No hace falta el pago de $29.", 409);
    }
    throw new ApiError(
      "CHECKOUT_UNAVAILABLE",
      "El cobro de $29 se abre con Stripe en el siguiente paso. Todavía no se ha cobrado nada.",
      501,
    );
  } catch (error) {
    return jsonError(error);
  }
}
