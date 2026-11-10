import { agencyTrialClaimSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { claimAgencySeat } from "@/lib/agency";
import { ApiError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = agencyTrialClaimSchema.parse(await request.json());
    const userId = await requireUserId();
    const result = await claimAgencySeat({ userId, siteId: input.siteId });
    if (!result.granted) {
      throw new ApiError("AGENCY_SEAT_UNAVAILABLE", result.reason ?? "No hay cupo de agencia disponible.", 409);
    }
    return NextResponse.json({ granted: true, ...result.status });
  } catch (error) {
    return jsonError(error);
  }
}
