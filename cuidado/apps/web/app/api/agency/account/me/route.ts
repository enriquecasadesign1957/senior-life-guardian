import { NextResponse } from "next/server";
import { getAgencyAccount, isAnonymousEmail } from "@/lib/agency-account";
import { jsonError } from "@/lib/http";
import { optionalUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await optionalUserId();
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }
    const account = await getAgencyAccount(userId);
    if (!account || !account.hasPassword || isAnonymousEmail(account.email)) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      email: account.email,
      trialActive: account.trialActive,
      trialSeats: account.trialSeats,
    });
  } catch (error) {
    return jsonError(error);
  }
}
