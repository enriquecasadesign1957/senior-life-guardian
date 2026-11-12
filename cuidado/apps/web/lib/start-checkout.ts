import { and, eq } from "drizzle-orm";
import { getDb, paymentIntents, sites, users } from "@cuidado/db";
import { ApiError } from "@/lib/errors";
import { buildLemonCheckoutUrl, type LemonPurpose } from "@/lib/lemon-checkout";
import { planAmountClp, rescueAmountClp, type PayMarket } from "@/lib/market";
import { isOneclickConfigured, startOneclickInscription } from "@/lib/transbank-oneclick";
import {
  createWebpayPlusTransaction,
  generateWebpayBuyOrder,
  generateWebpaySessionId,
  isTransbankConfigured,
  resolveAppUrl,
} from "@/lib/transbank-webpay";

export type CheckoutStartResult =
  | { provider: "lemon"; url: string }
  | { provider: "transbank_webpay"; url: string; token: string }
  | { provider: "transbank_oneclick"; url: string; token: string };

export async function startCheckout(input: {
  purpose: LemonPurpose;
  siteId: string;
  userId: string;
  market: PayMarket;
}): Promise<CheckoutStartResult> {
  const db = getDb();
  const site = (
    await db
      .select({ id: sites.id, plan: sites.plan })
      .from(sites)
      .where(
        and(eq(sites.id, input.siteId), eq(sites.userId, input.userId), eq(sites.status, "connected")),
      )
      .limit(1)
  )[0];
  if (!site) {
    throw new ApiError("SITE_REQUIRED", "Primero conecta el sitio con el código del plugin.", 409);
  }
  if (input.purpose === "rescue" && site.plan !== "none") {
    throw new ApiError("ALREADY_COVERED", "Este sitio ya tiene un plan. No hace falta el pago de $29.", 409);
  }
  if (input.purpose === "cuidado" && site.plan === "cuidado") {
    throw new ApiError("ALREADY_COVERED", "Este sitio ya tiene el Plan Cuidado.", 409);
  }

  if (input.market === "cl") {
    if (input.purpose === "rescue") {
      return startWebpayRescue({ siteId: site.id, userId: input.userId });
    }
    return startOneclickPlan({ siteId: site.id, userId: input.userId });
  }

  const user = (
    await db.select({ email: users.email }).from(users).where(eq(users.id, input.userId)).limit(1)
  )[0];
  const url = buildLemonCheckoutUrl({
    purpose: input.purpose,
    siteId: site.id,
    userId: input.userId,
    email: user?.email,
  });
  if (!url) {
    throw new ApiError(
      "CHECKOUT_UNAVAILABLE",
      "Falta el enlace de Lemon Squeezy. Todavía no se ha cobrado nada.",
      501,
    );
  }
  return { provider: "lemon", url };
}

async function startWebpayRescue(input: {
  siteId: string;
  userId: string;
}): Promise<CheckoutStartResult> {
  if (!isTransbankConfigured()) {
    throw new ApiError(
      "CHECKOUT_UNAVAILABLE",
      "Transbank (Chile) no está configurado. Usa pago internacional o configura TRANSBANK_CC.",
      501,
    );
  }
  const amount = rescueAmountClp();
  const buyOrder = generateWebpayBuyOrder("CWR");
  const intentId = crypto.randomUUID();
  const sessionId = generateWebpaySessionId(intentId);
  const returnUrl = `${resolveAppUrl()}/api/transbank/webpay/return`;

  await getDb().insert(paymentIntents).values({
    id: intentId,
    purpose: "rescue",
    siteId: input.siteId,
    userId: input.userId,
    provider: "transbank_webpay",
    buyOrder,
    amountClp: amount,
    status: "pending",
  });

  const created = await createWebpayPlusTransaction({
    buyOrder,
    sessionId,
    amount,
    returnUrl,
  });

  await getDb()
    .update(paymentIntents)
    .set({ tbkToken: created.token })
    .where(eq(paymentIntents.id, intentId));

  return { provider: "transbank_webpay", url: created.url, token: created.token };
}

async function startOneclickPlan(input: {
  siteId: string;
  userId: string;
}): Promise<CheckoutStartResult> {
  if (!isOneclickConfigured()) {
    // Fallback: Webpay one-shot for first month if Oneclick secrets missing
    if (!isTransbankConfigured()) {
      throw new ApiError(
        "CHECKOUT_UNAVAILABLE",
        "Transbank Chile no está configurado para el Plan Cuidado.",
        501,
      );
    }
    const amount = planAmountClp();
    const buyOrder = generateWebpayBuyOrder("CWP");
    const intentId = crypto.randomUUID();
    const sessionId = generateWebpaySessionId(intentId);
    const returnUrl = `${resolveAppUrl()}/api/transbank/webpay/return`;
    await getDb().insert(paymentIntents).values({
      id: intentId,
      purpose: "cuidado",
      siteId: input.siteId,
      userId: input.userId,
      provider: "transbank_webpay",
      buyOrder,
      amountClp: amount,
      status: "pending",
    });
    const created = await createWebpayPlusTransaction({
      buyOrder,
      sessionId,
      amount,
      returnUrl,
    });
    await getDb()
      .update(paymentIntents)
      .set({ tbkToken: created.token })
      .where(eq(paymentIntents.id, intentId));
    return { provider: "transbank_webpay", url: created.url, token: created.token };
  }

  const user = (
    await getDb()
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1)
  )[0];
  const email = user?.email || "hola@cuidadoweb.com";
  const username = oneclickUsernameForUser(input.userId);
  const amount = planAmountClp();
  const buyOrder = generateWebpayBuyOrder("CWO");
  const intentId = crypto.randomUUID();
  const responseUrl = `${resolveAppUrl()}/api/transbank/oneclick/return`;

  await getDb().insert(paymentIntents).values({
    id: intentId,
    purpose: "cuidado",
    siteId: input.siteId,
    userId: input.userId,
    provider: "transbank_oneclick",
    buyOrder,
    amountClp: amount,
    status: "pending",
  });

  const started = await startOneclickInscription({
    username,
    email,
    responseUrl: `${responseUrl}?intent=${intentId}`,
  });

  await getDb()
    .update(paymentIntents)
    .set({ tbkToken: started.token })
    .where(eq(paymentIntents.id, intentId));

  return { provider: "transbank_oneclick", url: started.urlWebpay, token: started.token };
}

export function oneclickUsernameForUser(userId: string): string {
  return `cw${userId.replace(/-/g, "").slice(0, 12)}`;
}
