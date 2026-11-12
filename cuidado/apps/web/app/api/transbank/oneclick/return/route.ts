import { eq } from "drizzle-orm";
import { getDb, paymentIntents, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { grantPaidCuidado } from "@/lib/grant-cuidado";
import { oneclickUsernameForUser } from "@/lib/start-checkout";
import {
  authorizeOneclickMall,
  finishOneclickInscription,
} from "@/lib/transbank-oneclick";
import { resolveAppUrl } from "@/lib/transbank-webpay";

export const runtime = "nodejs";

async function handleReturn(request: Request): Promise<NextResponse> {
  const app = resolveAppUrl();
  const url = new URL(request.url);
  let token = url.searchParams.get("TBK_TOKEN") ?? url.searchParams.get("token_ws") ?? "";
  const intentId = url.searchParams.get("intent") ?? "";
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const fromForm = form?.get("TBK_TOKEN") ?? form?.get("token_ws");
    if (typeof fromForm === "string" && fromForm) token = fromForm;
  }
  if (!token || !intentId) {
    return NextResponse.redirect(`${app}/?pago=cancelado`);
  }

  const intent = (
    await getDb().select().from(paymentIntents).where(eq(paymentIntents.id, intentId)).limit(1)
  )[0];
  if (!intent) return NextResponse.redirect(`${app}/?pago=rechazado`);
  if (intent.status === "paid") return NextResponse.redirect(`${app}/pago/plan`);

  const finished = await finishOneclickInscription(token);
  if (!finished.ok || !finished.tbkUser) {
    return NextResponse.redirect(`${app}/?pago=rechazado`);
  }

  const username = oneclickUsernameForUser(intent.userId);
  const authorized = await authorizeOneclickMall({
    username,
    tbkUser: finished.tbkUser,
    buyOrder: intent.buyOrder,
    amount: intent.amountClp ?? 0,
  });
  if (!authorized.ok) {
    return NextResponse.redirect(`${app}/?pago=rechazado`);
  }

  await grantPaidCuidado({ siteId: intent.siteId, userId: intent.userId });
  const renewal = new Date();
  renewal.setUTCMonth(renewal.getUTCMonth() + 1);
  await getDb()
    .update(sites)
    .set({
      tbkUser: finished.tbkUser,
      tbkUsername: username,
      planRenewalAt: renewal,
    })
    .where(eq(sites.id, intent.siteId));

  await getDb()
    .update(paymentIntents)
    .set({ status: "paid", paidAt: new Date(), tbkUser: finished.tbkUser })
    .where(eq(paymentIntents.id, intent.id));

  return NextResponse.redirect(`${app}/pago/plan`);
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleReturn(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleReturn(request);
}
