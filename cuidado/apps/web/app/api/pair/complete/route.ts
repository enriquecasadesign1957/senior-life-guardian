import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { takePendingPairByCode } from "@/lib/pair-pending";

export const runtime = "nodejs";

const bodySchema = z.object({
  homeUrl: z.string().trim().min(4).max(300).optional(),
  code: z.string().trim().regex(/^[a-f0-9]{32}$/),
});

const hits = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    assertRate(ip);
    const input = bodySchema.parse(await request.json());
    const siteId = await takePendingPairByCode(input.code);
    if (!siteId) {
      throw new ApiError("PAIR_INVALID", "El código no sirve o ya venció.", 401);
    }
    const db = getDb();
    const site = (await db.select().from(sites).where(eq(sites.id, siteId)).limit(1))[0];
    if (!site || site.status !== "pending") {
      throw new ApiError("PAIR_INVALID", "El código no sirve o ya venció.", 401);
    }
    const secretRow = (await db.select().from(siteSecrets).where(eq(siteSecrets.siteId, site.id)).limit(1))[0];
    if (!secretRow) {
      throw new ApiError("PAIR_INVALID", "El código no sirve.", 401);
    }
    const secret = decryptSecret(secretRow.ciphertext, secretRow.iv);
    await db
      .update(sites)
      .set({ status: "connected", connectedAt: new Date() })
      .where(eq(sites.id, site.id));
    return NextResponse.json({ siteId: site.id, secret, baseUrl: site.baseUrl });
  } catch (error) {
    return jsonError(error);
  }
}

function assertRate(ip: string): void {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || current.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return;
  }
  current.count += 1;
  if (current.count > 30) {
    throw new ApiError("PAIR_INVALID", "Demasiados intentos.", 429);
  }
}
