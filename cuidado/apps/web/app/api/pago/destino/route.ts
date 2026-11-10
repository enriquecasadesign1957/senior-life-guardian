import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { findPagoInformeHref, type PagoPurpose } from "@/lib/pago-destino";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const userId = await requireUserId();
    const url = new URL(request.url);
    const purposeRaw = url.searchParams.get("purpose");
    const purpose: PagoPurpose | null =
      purposeRaw === "rescue" || purposeRaw === "cuidado" ? purposeRaw : null;
    if (!purpose) {
      throw new ApiError("INVALID_INPUT", "Falta el tipo de pago.", 400);
    }
    const preferredPath = url.searchParams.get("returnPath");
    const href = await findPagoInformeHref({
      userId,
      purpose,
      preferredPath,
    });
    if (!href) {
      return NextResponse.json({ ready: false });
    }
    return NextResponse.json({ ready: true, href });
  } catch (error) {
    return jsonError(error);
  }
}
