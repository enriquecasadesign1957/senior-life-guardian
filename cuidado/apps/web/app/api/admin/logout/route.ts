import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  try {
    await clearAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
