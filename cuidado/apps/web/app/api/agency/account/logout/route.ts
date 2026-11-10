import { NextResponse } from "next/server";
import { logoutAgencyAccount } from "@/lib/agency-account";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  try {
    await logoutAgencyAccount();
    return NextResponse.json({ loggedOut: true });
  } catch (error) {
    return jsonError(error);
  }
}
