import { and, eq } from "drizzle-orm";
import { getDb, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new ApiError("NOT_FOUND", "No encontramos ese sitio.", 404);
    }
    const userId = await requireUserId();
    const db = getDb();
    const updated = await db
      .update(sites)
      .set({ status: "revoked" })
      .where(and(eq(sites.id, id), eq(sites.userId, userId), eq(sites.status, "connected")))
      .returning({ id: sites.id });
    if (!updated[0]) {
      throw new ApiError("SITE_REQUIRED", "Ese sitio no está conectado a tu cuenta.", 404);
    }
    return NextResponse.json({ revoked: true });
  } catch (error) {
    return jsonError(error);
  }
}
