import { and, eq } from "drizzle-orm";
import { pairRequestSchema } from "@cuidado/contract";
import { getDb, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { encryptSecret, newSiteSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { probeSite, redeemPairCode } from "@/lib/plugin-client";
import { withUrlLock } from "@/lib/locks";
import { currentUserId } from "@/lib/session";
import { assertPublicUrl, normalizeSiteUrl } from "@/lib/urls";

export const runtime = "nodejs";

type StoredSecret = {
  ciphertext: string;
  iv: string;
  keyVersion: number;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = pairRequestSchema.parse(await request.json());
    const baseUrl = normalizeSiteUrl(input.baseUrl);
    await assertPublicUrl(baseUrl);
    const probe = await probeSite(baseUrl);
    if (probe.gate) {
      throw new ApiError(
        "UNREACHABLE",
        "El hosting mostró una pantalla de espera. No pudimos confirmar WordPress ni hablar con el conector.",
        502,
      );
    }
    if (probe.wordpress !== true) {
      throw new ApiError("NOT_WORDPRESS", "La reparación solo está disponible para WordPress.", 422);
    }

    const userId = await currentUserId();
    const secret = newSiteSecret();
    const sealed = encryptSecret(secret);

    const paired = await withUrlLock(baseUrl, async () => {
      const db = getDb();
      const saved = await db
      .insert(sites)
      .values({
        userId,
        baseUrl,
        status: "pending",
        plan: "none",
        watchUntil: null,
      })
      .onConflictDoUpdate({
        target: [sites.userId, sites.baseUrl],
        set: { baseUrl },
      })
      .returning({ id: sites.id, plan: sites.plan });
    const site = saved[0];
    if (!site) throw new ApiError("INTERNAL", "No pudimos guardar el sitio.", 500);

    const previousRow = (
      await db.select().from(siteSecrets).where(eq(siteSecrets.siteId, site.id)).limit(1)
    )[0];
    const previous: StoredSecret | null = previousRow
      ? {
          ciphertext: previousRow.ciphertext,
          iv: previousRow.iv,
          keyVersion: previousRow.keyVersion,
        }
      : null;

    if (previousRow) {
      await db
        .update(siteSecrets)
        .set({ ciphertext: sealed.ciphertext, iv: sealed.iv, keyVersion: 1, updatedAt: new Date() })
        .where(eq(siteSecrets.siteId, site.id));
    } else {
      await db.insert(siteSecrets).values({
        siteId: site.id,
        ciphertext: sealed.ciphertext,
        iv: sealed.iv,
      });
    }

    let redeemed: { siteName: string };
    try {
      redeemed = await redeemPairCode(baseUrl, input.pairCode, secret);
    } catch (error) {
      if (previous) {
        await db
          .update(siteSecrets)
          .set({
            ciphertext: previous.ciphertext,
            iv: previous.iv,
            keyVersion: previous.keyVersion,
            updatedAt: new Date(),
          })
          .where(eq(siteSecrets.siteId, site.id));
      } else {
        await db.delete(siteSecrets).where(eq(siteSecrets.siteId, site.id));
      }
      throw error;
    }

      await db
        .update(sites)
        .set({ status: "connected", connectedAt: new Date() })
        .where(and(eq(sites.id, site.id), eq(sites.userId, userId)));

      return { siteId: site.id, siteName: redeemed.siteName, plan: site.plan };
    });

    return NextResponse.json(paired);
  } catch (error) {
    return jsonError(error);
  }
}
