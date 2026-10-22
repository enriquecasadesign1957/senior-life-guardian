import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { logError } from "@/lib/errors";
import { grantPaidRescue } from "@/lib/grant-rescue";
import { readPaidRescue } from "@/lib/rescue";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: { code: "CHECKOUT_UNAVAILABLE", message: "Stripe no está configurado." } },
      { status: 501 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Falta la firma." } }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: { code: "INVALID_INPUT", message: "La firma no coincide." } }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const paid = readPaidRescue(event.data.object);
    if (paid) {
      try {
        await grantPaidRescue({ ...paid, paidAt: new Date() });
      } catch (error) {
        logError("rescue_grant_failed", { name: error instanceof Error ? error.name : "unknown" });
        return NextResponse.json({ error: { code: "INTERNAL", message: "No pudimos activar el rescate." } }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
