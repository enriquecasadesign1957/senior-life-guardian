import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";
import { grantPaidCuidado } from "@/lib/grant-cuidado";
import { grantPaidRescue } from "@/lib/grant-rescue";
import { readPaidLemonOrder, verifyLemonSignature } from "@/lib/lemon";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: { code: "CHECKOUT_UNAVAILABLE", message: "Lemon Squeezy no está configurado." } },
      { status: 501 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  if (!verifyLemonSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "La firma no coincide." } }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "JSON inválido." } }, { status: 400 });
  }

  const paid = readPaidLemonOrder(payload as Parameters<typeof readPaidLemonOrder>[0]);
  if (!paid) {
    return NextResponse.json({ received: true });
  }

  try {
    if (paid.purpose === "rescue") {
      await grantPaidRescue({
        siteId: paid.siteId,
        userId: paid.userId,
        checkoutId: paid.checkoutId,
        paidAt: paid.paidAt,
      });
    } else {
      await grantPaidCuidado({ siteId: paid.siteId, userId: paid.userId });
    }
  } catch (error) {
    logError("lemon_grant_failed", { name: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: { code: "INTERNAL", message: "No pudimos activar el plan." } }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
