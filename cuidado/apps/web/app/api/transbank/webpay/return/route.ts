import { eq } from "drizzle-orm";
import { getDb, paymentIntents, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { grantPaidCuidado } from "@/lib/grant-cuidado";
import { grantPaidRescue } from "@/lib/grant-rescue";
import { confirmWebpayPlusTransaction, resolveAppUrl } from "@/lib/transbank-webpay";

export const runtime = "nodejs";

async function handleReturn(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  let token = url.searchParams.get("token_ws") ?? "";
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const fromForm = form?.get("token_ws");
    if (typeof fromForm === "string" && fromForm) token = fromForm;
  }
  const app = resolveAppUrl();
  if (!token) {
    return NextResponse.redirect(`${app}/?pago=cancelado`);
  }

  const confirmed = await confirmWebpayPlusTransaction(token);
  if (!confirmed.ok || !confirmed.buyOrder) {
    return NextResponse.redirect(`${app}/?pago=rechazado`);
  }

  const intent = (
    await getDb()
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.buyOrder, confirmed.buyOrder))
      .limit(1)
  )[0];
  if (!intent || intent.status === "paid") {
    const dest = intent?.purpose === "cuidado" ? "/pago/plan" : "/pago/rescate";
    return NextResponse.redirect(`${app}${dest}`);
  }

  if (intent.purpose === "rescue") {
    await grantPaidRescue({
      siteId: intent.siteId,
      userId: intent.userId,
      checkoutId: `tbk_${intent.buyOrder}`,
      paidAt: new Date(),
    });
  } else {
    await grantPaidCuidado({ siteId: intent.siteId, userId: intent.userId });
    const renewal = new Date();
    renewal.setUTCMonth(renewal.getUTCMonth() + 1);
    await getDb()
      .update(sites)
      .set({ planRenewalAt: renewal })
      .where(eq(sites.id, intent.siteId));
  }

  await getDb()
    .update(paymentIntents)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(paymentIntents.id, intent.id));

  const dest = intent.purpose === "cuidado" ? "/pago/plan" : "/pago/rescate";
  return NextResponse.redirect(`${app}${dest}`);
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleReturn(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleReturn(request);
}
