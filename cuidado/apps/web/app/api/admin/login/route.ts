import { adminLoginSchema } from "@cuidado/contract";
import { NextResponse } from "next/server";
import { assertAdminSecret, writeAdminCookie } from "@/lib/admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = adminLoginSchema.parse(await request.json());
    assertAdminSecret(input.secret);
    await writeAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
