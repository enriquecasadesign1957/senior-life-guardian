import { agencyAccountSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { registerAgencyAccount } from "@/lib/agency-account";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = agencyAccountSchema.parse(await request.json());
    const account = await registerAgencyAccount(input);
    return NextResponse.json({
      registered: true,
      email: account.email,
      trialActive: account.trialActive,
    });
  } catch (error) {
    return jsonError(error);
  }
}
