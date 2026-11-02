import { adminCreateInviteSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { createInviteCode, listInviteCodes, requireAdmin } from "@/lib/admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
    const invites = await listInviteCodes();
    return NextResponse.json({ invites });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await requireAdmin();
    const input = adminCreateInviteSchema.parse(await request.json().catch(() => ({})));
    const invite = await createInviteCode({
      note: input.note,
      seats: input.seats,
      validDays: input.validDays,
    });
    return NextResponse.json({ created: true, invite });
  } catch (error) {
    return jsonError(error);
  }
}
