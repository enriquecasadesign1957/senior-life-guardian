import { and, eq } from "drizzle-orm";
import { pairRequestSchema } from "@cuidado/contract";
import { getDb, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { encryptSecret, newSiteSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { clearPendingPair, savePendingPair } from "@/lib/pair-pending";
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
    if (probe.wordpress === false && !probe.gate) {
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
          set: { baseUrl, status: "pending" },
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

      await savePendingPair(site.id, input.pairCode);

      if (!probe.gate) {
        try {
          const redeemed = await redeemPairCode(baseUrl, input.pairCode, secret);
          await clearPendingPair(site.id);
          await db
            .update(sites)
            .set({ status: "connected", connectedAt: new Date() })
            .where(and(eq(sites.id, site.id), eq(sites.userId, userId)));
          return {
            status: "connected" as const,
            siteId: site.id,
            siteName: redeemed.siteName,
            plan: site.plan,
          };
        } catch (error) {
          if (!(error instanceof ApiError) || error.code !== "UNREACHABLE") {
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
            await clearPendingPair(site.id);
            throw error;
          }
        }
      }

      return {
        status: "awaiting_plugin" as const,
        siteId: site.id,
        plan: site.plan,
        message:
          "El hosting bloquea la entrada desde CuidadoWeb. En WordPress abre Ajustes → Cuidado Conector y pulsa Completar conexión.",
      };
    });

    return NextResponse.json(paired);
  } catch (error) {
    return jsonError(error);
  }
}
