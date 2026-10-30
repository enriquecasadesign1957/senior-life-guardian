import { and, eq } from "drizzle-orm";
import { rescueCheckoutSchema } from "@cuidado/contract";
import { getDb, sites, users } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { buildLemonCheckoutUrl } from "@/lib/lemon-checkout";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = rescueCheckoutSchema.parse(await request.json());
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
    if (site.plan === "cuidado") {
      throw new ApiError("ALREADY_COVERED", "Este sitio ya tiene el Plan Cuidado.", 409);
    }

    const user = (
      await getDb().select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1)
    )[0];
    const url = buildLemonCheckoutUrl({
      purpose: "cuidado",
      siteId: site.id,
      userId,
      email: user?.email,
    });
    if (!url) {
      throw new ApiError(
        "CHECKOUT_UNAVAILABLE",
        "Falta el enlace de Lemon Squeezy. Todavía no se ha cobrado nada.",
        501,
      );
    }
    return NextResponse.json({ url });
  } catch (error) {
    return jsonError(error);
  }
}
