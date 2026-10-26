import { timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { DIAGNOSIS_TTL_MS, snapshotSchema } from "@cuidado/contract";
import { getDb, siteSecrets, sites, scanRuns } from "@cuidado/db";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { normalizeSiteUrl } from "@/lib/urls";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = snapshotSchema.extend({
  siteId: z.string().uuid(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError("UNAUTHORIZED", "No autorizado.", 401);
    }
    const bearer = header.slice("Bearer ".length);
    const input = bodySchema.parse(await request.json());
    const homeUrl = normalizeSiteUrl(input.homeUrl);
    const db = getDb();
    const site = (
      await db
        .select()
        .from(sites)
        .where(and(eq(sites.id, input.siteId), eq(sites.baseUrl, homeUrl)))
        .limit(1)
    )[0];
    if (!site || site.status !== "connected") {
      throw new ApiError("UNAUTHORIZED", "No autorizado.", 401);
    }
    const secretRow = (await db.select().from(siteSecrets).where(eq(siteSecrets.siteId, site.id)).limit(1))[0];
    if (!secretRow) throw new ApiError("UNAUTHORIZED", "No autorizado.", 401);
    const expected = decryptSecret(secretRow.ciphertext, secretRow.iv);
    if (!sameText(bearer, expected)) {
      throw new ApiError("UNAUTHORIZED", "No autorizado.", 401);
    }

    const bytesTotal = input.bytes.revisions + input.bytes.expiredTransients + input.bytes.spamComments;
    const inserted = await db
      .insert(scanRuns)
      .values({
        siteId: site.id,
        requestedUrl: homeUrl,
        status: "ready",
        performanceScore: null,
        lcpMs: null,
        inpMs: null,
        clsMilli: null,
        summary: {
          wordpress: true,
          gate: false,
          innodb: input.innodb,
          overLimit: false,
          text: "Lectura del conector recibida. Ya puedes ver si la base está saturada.",
          inventory: {
            revisions: input.counts.revisions,
            expiredTransients: input.counts.expiredTransients,
            spamComments: input.counts.spamComments,
            bytes: bytesTotal,
            overLimit: false,
          },
        },
        expiresAt: new Date(Date.now() + DIAGNOSIS_TTL_MS),
      })
      .returning({ id: scanRuns.id });

    return NextResponse.json({ scanId: inserted[0]?.id ?? null });
  } catch (error) {
    return jsonError(error);
  }
}

function sameText(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
