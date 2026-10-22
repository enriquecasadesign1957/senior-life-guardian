import { and, desc, eq, gt, lte } from "drizzle-orm";
import { DIAGNOSIS_TTL_MS, diagnoseRequestSchema } from "@cuidado/contract";
import { findings, getDb, scanRuns, siteSecrets, sites } from "@cuidado/db";
import { NextResponse } from "next/server";
import { decryptSecret } from "@/lib/crypto";
import { buildDrafts, explainFindings } from "@/lib/explain";
import { jsonError } from "@/lib/http";
import { ApiError } from "@/lib/errors";
import { withUrlLock } from "@/lib/locks";
import { polishSummary } from "@/lib/llm";
import { detectWordPress, readSnapshot, type PluginFailure } from "@/lib/plugin-client";
import { fetchMobileMetrics, type MobileMetrics } from "@/lib/psi";
import { currentUserId } from "@/lib/session";
import { assertPublicUrl, normalizeSiteUrl } from "@/lib/urls";

export const runtime = "nodejs";

const STALE_MS = 70_000;

type Claim =
  | { mode: "ready"; id: string }
  | { mode: "wait"; id: string }
  | { mode: "mine"; id: string; donorId: string | null };

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const input = diagnoseRequestSchema.parse(await request.json());
    const requestedUrl = normalizeSiteUrl(input.url);
    await assertPublicUrl(requestedUrl);
    const userId = await currentUserId();
    const claim = await claimScan(requestedUrl, userId);
    const scanId = claim.mode === "ready" ? claim.id : claim.mode === "wait" ? await waitForScan(claim.id) : await finishScan(claim.id, requestedUrl, userId, claim.donorId);
    return NextResponse.json({ scanId, url: requestedUrl });
  } catch (error) {
    return jsonError(error);
  }
}

async function claimScan(requestedUrl: string, userId: string): Promise<Claim> {
  return withUrlLock(requestedUrl, async () => {
    const db = getDb();
    const now = new Date();
    const site = await connectedSite(userId, requestedUrl);
    const readyRows = await db
      .select()
      .from(scanRuns)
      .where(
        and(eq(scanRuns.requestedUrl, requestedUrl), eq(scanRuns.status, "ready"), gt(scanRuns.expiresAt, now)),
      )
      .orderBy(desc(scanRuns.createdAt))
      .limit(5);

    const reusable = readyRows.find((row) => canReuse(row.siteId, site?.id));
    if (reusable) return { mode: "ready", id: reusable.id };

    const donor = readyRows.find((row) => row.performanceScore !== null);
    const staleBefore = new Date(now.getTime() - STALE_MS);
    const activeRows = await db
      .select({ id: scanRuns.id, siteId: scanRuns.siteId })
      .from(scanRuns)
      .where(
        and(
          eq(scanRuns.requestedUrl, requestedUrl),
          eq(scanRuns.status, "running"),
          gt(scanRuns.createdAt, staleBefore),
        ),
      )
      .limit(5);
    const waitable = activeRows.find((row) => canReuse(row.siteId, site?.id));
    if (waitable) return { mode: "wait", id: waitable.id };

    await db
      .update(scanRuns)
      .set({ status: "failed", error: "stale" })
      .where(
        and(eq(scanRuns.requestedUrl, requestedUrl), eq(scanRuns.status, "running"), lte(scanRuns.createdAt, staleBefore)),
      );

    const inserted = await db
      .insert(scanRuns)
      .values({
        siteId: site?.id ?? null,
        requestedUrl,
        strategy: "mobile",
        status: "running",
        expiresAt: new Date(now.getTime() + DIAGNOSIS_TTL_MS),
      })
      .returning({ id: scanRuns.id });
    const row = inserted[0];
    if (!row) throw new ApiError("INTERNAL", "No pudimos guardar el informe.", 500);
    return { mode: "mine", id: row.id, donorId: donor?.id ?? null };
  });
}

async function finishScan(scanId: string, requestedUrl: string, userId: string, donorId: string | null): Promise<string> {
  try {
    const db = getDb();
    const metrics = await metricsFor(donorId, requestedUrl);
    const wordpress = await detectWordPress(requestedUrl);
    const site = await connectedSite(userId, requestedUrl);
    const plugin = await pluginInventory(requestedUrl, site?.id);
    const explained = await explainFindings(
      buildDrafts({
        heavyImages: metrics.heavyImages,
        renderBlocking: metrics.renderBlocking,
        lcpMs: metrics.lcpMs,
        inpMs: metrics.inpMs,
        clsMilli: metrics.clsMilli,
        revisions: plugin.revisions,
        expiredTransients: plugin.expiredTransients,
        spamComments: plugin.spamComments,
        innodb: plugin.innodb,
        overLimit: plugin.overLimit,
      }),
      polishSummary,
    );

    await db.transaction(async (tx) => {
      await tx
        .update(scanRuns)
        .set({
          siteId: site?.id ?? null,
          status: "ready",
          performanceScore: metrics.performanceScore,
          lcpMs: metrics.lcpMs,
          inpMs: metrics.inpMs,
          clsMilli: metrics.clsMilli,
          summary: {
            wordpress,
            innodb: plugin.innodb,
            overLimit: plugin.overLimit,
            text: explained.summary,
            heavyImages: metrics.heavyImages,
            renderBlocking: metrics.renderBlocking,
          },
          expiresAt: new Date(Date.now() + DIAGNOSIS_TTL_MS),
          error: null,
        })
        .where(eq(scanRuns.id, scanId));
      if (explained.issues.length > 0) {
        await tx.insert(findings).values(
          explained.issues.map((issue) => ({
            scanRunId: scanId,
            code: issue.code,
            severity: issue.severity,
            plainTitle: issue.plainTitle,
            whatItMeans: issue.whatItMeans,
            ifIgnored: issue.ifIgnored,
            actionId: issue.actionId,
            source: issue.source,
          })),
        );
      }
    });
    return scanId;
  } catch (error) {
    await getDb()
      .update(scanRuns)
      .set({ status: "failed", error: "failed" })
      .where(eq(scanRuns.id, scanId))
      .catch(() => undefined);
    throw error;
  }
}

async function waitForScan(scanId: string): Promise<string> {
  const db = getDb();
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await delay(1000);
    const row = (await db.select({ status: scanRuns.status }).from(scanRuns).where(eq(scanRuns.id, scanId)).limit(1))[0];
    if (row?.status === "ready") return scanId;
    if (row?.status === "failed") break;
  }
  throw new ApiError("PSI_FAILED", "Google no pudo medir la página en este momento.", 502);
}

async function metricsFor(donorId: string | null, requestedUrl: string): Promise<MobileMetrics> {
  if (donorId) {
    const donor = (await getDb().select().from(scanRuns).where(eq(scanRuns.id, donorId)).limit(1))[0];
    const summary = donor?.summary as { heavyImages?: boolean; renderBlocking?: boolean } | null;
    if (donor && (donor.performanceScore !== null || donor.lcpMs !== null)) {
      return {
        performanceScore: donor.performanceScore,
        lcpMs: donor.lcpMs,
        inpMs: donor.inpMs,
        clsMilli: donor.clsMilli,
        heavyImages: summary?.heavyImages === true,
        renderBlocking: summary?.renderBlocking === true,
      };
    }
  }
  try {
    return await fetchMobileMetrics(requestedUrl);
  } catch {
    throw new ApiError("PSI_FAILED", "Google no pudo medir la página en este momento.", 502);
  }
}

async function connectedSite(userId: string, requestedUrl: string) {
  return (
    await getDb()
      .select()
      .from(sites)
      .where(and(eq(sites.userId, userId), eq(sites.baseUrl, requestedUrl), eq(sites.status, "connected")))
      .limit(1)
  )[0];
}

function canReuse(scanSiteId: string | null, connectedId: string | undefined): boolean {
  if (scanSiteId) return connectedId === scanSiteId;
  return connectedId === undefined;
}

async function pluginInventory(requestedUrl: string, siteId: string | undefined) {
  const empty = {
    revisions: null as number | null,
    expiredTransients: null as number | null,
    spamComments: null as number | null,
    innodb: null as boolean | null,
    overLimit: false,
  };
  if (!siteId) return empty;
  const secretRow = (await getDb().select().from(siteSecrets).where(eq(siteSecrets.siteId, siteId)).limit(1))[0];
  if (!secretRow) return empty;
  const secret = decryptSecret(secretRow.ciphertext, secretRow.iv);
  const snapshot = await readSnapshot(requestedUrl, secret);
  if ("ok" in snapshot) {
    const failure = snapshot as PluginFailure;
    return {
      revisions: failure.counts?.revisions ?? null,
      expiredTransients: failure.counts?.expiredTransients ?? null,
      spamComments: failure.counts?.spamComments ?? null,
      innodb: failure.code === "INNODB_REQUIRED" ? false : failure.code === "PAYLOAD_LIMIT" ? true : null,
      overLimit: failure.code === "PAYLOAD_LIMIT",
    };
  }
  return {
    revisions: snapshot.counts.revisions,
    expiredTransients: snapshot.counts.expiredTransients,
    spamComments: snapshot.counts.spamComments,
    innodb: true,
    overLimit: false,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
