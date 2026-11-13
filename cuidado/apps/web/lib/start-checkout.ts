import { and, eq, inArray } from "drizzle-orm";
import { getDb, paymentIntents, sites, users } from "@cuidado/db";
import { ApiError } from "@/lib/errors";
import { buildLemonCheckoutUrl, type LemonPurpose } from "@/lib/lemon-checkout";
import { planAmountClp, rescueAmountClp, type PayMarket } from "@/lib/market";
import { oneclickEmailForUser, oneclickUsernameForUser } from "@/lib/oneclick-user";
import { assertPublicUrl, normalizeSiteUrl } from "@/lib/urls";
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

export async function ensureCheckoutSite(input: {
  userId: string;
  siteId?: string;
  url?: string;
}): Promise<string> {
  const db = getDb();
  if (input.siteId) {
    const owned = (
      await db
        .select({ id: sites.id })
        .from(sites)
        .where(
          and(
            eq(sites.id, input.siteId),
            eq(sites.userId, input.userId),
            inArray(sites.status, ["pending", "connected"]),
          ),
        )
        .limit(1)
    )[0];
    if (owned) return owned.id;
  }
  const rawUrl = input.url?.trim() ?? "";
  if (rawUrl.length < 4) {
    throw new ApiError("SITE_REQUIRED", "Escribe la dirección del sitio para abrir el cobro.", 400);
  }
  const baseUrl = normalizeSiteUrl(rawUrl);
  await assertPublicUrl(baseUrl);
  const existing = (
    await db
      .select({ id: sites.id, status: sites.status })
      .from(sites)
      .where(and(eq(sites.userId, input.userId), eq(sites.baseUrl, baseUrl)))
      .limit(1)
  )[0];
  if (existing?.status === "pending" || existing?.status === "connected") return existing.id;
  if (existing) {
    throw new ApiError("SITE_REQUIRED", "Este sitio ya no está disponible para un cobro nuevo.", 409);
  }
  try {
    const created = (
      await db
        .insert(sites)
        .values({ userId: input.userId, baseUrl, status: "pending", plan: "none" })
        .returning({ id: sites.id })
    )[0];
    if (!created) throw new ApiError("INTERNAL", "No pudimos guardar el sitio.", 500);
    return created.id;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const again = (
      await db
        .select({ id: sites.id })
        .from(sites)
        .where(and(eq(sites.userId, input.userId), eq(sites.baseUrl, baseUrl)))
        .limit(1)
    )[0];
    if (!again) throw error;
    return again.id;
  }
}

function isUniqueViolation(error: unknown): boolean {
  const current = error as { code?: string; cause?: { code?: string } } | null;
  return current?.code === "23505" || current?.cause?.code === "23505";
}

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
        and(
          eq(sites.id, input.siteId),
          eq(sites.userId, input.userId),
          inArray(sites.status, ["pending", "connected"]),
        ),
      )
      .limit(1)
  )[0];
  if (!site) {
    throw new ApiError("SITE_REQUIRED", "Escribe la dirección del sitio para abrir el cobro.", 409);
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
    email: oneclickEmailForUser(user?.email),
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
  const email = oneclickEmailForUser(user?.email);
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

export { oneclickEmailForUser, oneclickUsernameForUser };
