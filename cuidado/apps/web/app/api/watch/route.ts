import { timingSafeEqual } from "node:crypto";
import { and, eq, gt, or } from "drizzle-orm";
import { getDb, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { assertPublicUrl } from "@/lib/urls";
import { isWatchActive } from "@/lib/watch";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const secret = process.env.CRON_SECRET;
    const header = request.headers.get("authorization");
    if (!secret || !sameSecret(header, `Bearer ${secret}`)) {
      throw new ApiError("UNAUTHORIZED", "No autorizado.", 401);
    }
    const now = new Date();
    const db = getDb();
    const rows = await db
      .select({
        id: sites.id,
        baseUrl: sites.baseUrl,
        plan: sites.plan,
        watchUntil: sites.watchUntil,
      })
      .from(sites)
      .where(
        and(
          eq(sites.status, "connected"),
          or(eq(sites.plan, "cuidado"), and(eq(sites.plan, "rescue"), gt(sites.watchUntil, now))),
        ),
      )
      .limit(50);

    const checked: Array<{ id: string; active: boolean; status: number | null }> = [];
    for (const site of rows) {
      const active = isWatchActive({ plan: site.plan, watchUntil: site.watchUntil }, now);
      if (!active) {
        checked.push({ id: site.id, active: false, status: null });
        continue;
      }
      let status: number | null = null;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const url = await assertPublicUrl(site.baseUrl);
        const response = await fetch(url, { redirect: "manual", signal: controller.signal });
        status = response.status;
        await response.body?.cancel().catch(() => undefined);
      } catch {
        status = null;
      } finally {
        clearTimeout(timer);
      }
      checked.push({ id: site.id, active: true, status });
    }
    return NextResponse.json({ checked: checked.length, sites: checked });
  } catch (error) {
    return jsonError(error);
  }
}

function sameSecret(header: string | null, expected: string): boolean {
  const left = Buffer.from(header ?? "");
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
