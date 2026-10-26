import { eq } from "drizzle-orm";
import { findings, getDb, scanRuns } from "@cuidado/db";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new ApiError("NOT_FOUND", "No encontramos ese informe.", 404);
    }
    const db = getDb();
    const scan = (await db.select().from(scanRuns).where(eq(scanRuns.id, id)).limit(1))[0];
    if (!scan) throw new ApiError("NOT_FOUND", "No encontramos ese informe.", 404);
    const issues = await db.select().from(findings).where(eq(findings.scanRunId, scan.id));
    const summary = scan.summary as { text?: string; wordpress?: boolean | null; gate?: boolean } | null;
    return NextResponse.json({
      id: scan.id,
      url: scan.requestedUrl,
      siteId: scan.siteId,
      performanceScore: summary?.gate ? null : scan.performanceScore,
      lcpMs: summary?.gate ? null : scan.lcpMs,
      inpMs: summary?.gate ? null : scan.inpMs,
      clsMilli: summary?.gate ? null : scan.clsMilli,
      summary: summary?.text ?? "",
      wordpress: summary?.wordpress ?? null,
      gate: summary?.gate === true,
      expiresAt: scan.expiresAt,
      findings: issues.map((issue) => ({
        code: issue.code,
        severity: issue.severity,
        plainTitle: issue.plainTitle,
        whatItMeans: issue.whatItMeans,
        ifIgnored: issue.ifIgnored,
        actionId: issue.actionId,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
