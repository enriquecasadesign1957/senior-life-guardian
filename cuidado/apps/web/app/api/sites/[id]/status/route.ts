import { and, eq } from "drizzle-orm";
import { getDb, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new ApiError("NOT_FOUND", "No encontramos ese sitio.", 404);
    }
    const userId = await requireUserId();
    const site = (
      await getDb()
        .select({ id: sites.id, status: sites.status, baseUrl: sites.baseUrl })
        .from(sites)
        .where(and(eq(sites.id, id), eq(sites.userId, userId)))
        .limit(1)
    )[0];
    if (!site) throw new ApiError("NOT_FOUND", "No encontramos ese sitio.", 404);
    return NextResponse.json(site);
  } catch (error) {
    return jsonError(error);
  }
}
