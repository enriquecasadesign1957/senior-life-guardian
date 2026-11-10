import { agencyTrialActivateSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { activateAgencyTrial, AgencyTrialError, getAgencyTrialStatus } from "@/lib/agency";
import { ApiError } from "@/lib/errors";
import { jsonError } from "@/lib/http";
import { currentUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await currentUserId();
    const status = await getAgencyTrialStatus(userId);
    return NextResponse.json(status);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = agencyTrialActivateSchema.parse(await request.json());
    const userId = await currentUserId();
    const status = await activateAgencyTrial(userId, input.code);
    return NextResponse.json({ activated: true, ...status });
  } catch (error) {
    if (error instanceof AgencyTrialError) {
      return jsonError(new ApiError(error.code, error.message, error.status));
    }
    return jsonError(error);
  }
}
