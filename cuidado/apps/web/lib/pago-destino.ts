import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb, scanRuns, sites } from "@cuidado/db";
import { isWatchActive } from "./watch";

export type PagoPurpose = "rescue" | "cuidado";

const INFORME = /^\/informe\/([0-9a-f-]{36})$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function readReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/informe/")) return null;
  try {
    const url = new URL(value, "https://cuidadoweb.com");
    if (!INFORME.test(url.pathname)) return null;
    const siteId = url.searchParams.get("siteId");
    if (siteId && !UUID.test(siteId)) return null;
    return siteId ? `${url.pathname}?siteId=${siteId}` : url.pathname;
  } catch {
    return null;
  }
}

export async function findPagoInformeHref(input: {
  userId: string;
  purpose: PagoPurpose;
  preferredPath?: string | null;
  now?: Date;
}): Promise<string | null> {
  const now = input.now ?? new Date();
  const preferred = readReturnPath(input.preferredPath);
  const preferredMatch = preferred?.match(INFORME);
  const preferredScanId = preferredMatch?.[1] ?? null;
  const preferredSiteId = preferred
    ? new URL(preferred, "https://cuidadoweb.com").searchParams.get("siteId")
    : null;

  const db = getDb();
  const owned = await db
    .select({
      id: sites.id,
      plan: sites.plan,
      watchUntil: sites.watchUntil,
      status: sites.status,
      baseUrl: sites.baseUrl,
    })
    .from(sites)
    .where(and(eq(sites.userId, input.userId), inArray(sites.status, ["pending", "connected"])));

  const active = owned.filter((site) => {
    if (input.purpose === "cuidado") return site.plan === "cuidado" && isWatchActive(site, now);
    return site.plan === "rescue" && isWatchActive(site, now);
  });
  if (active.length === 0) return null;

  const site = (preferredSiteId ? active.find((row) => row.id === preferredSiteId) : null) ?? active[0];
  if (!site) return null;

  if (preferredScanId) {
    const scan = (
      await db
        .select({ id: scanRuns.id, siteId: scanRuns.siteId })
        .from(scanRuns)
        .where(eq(scanRuns.id, preferredScanId))
        .limit(1)
    )[0];
    if (scan && (scan.siteId === site.id || scan.siteId === null)) {
      return `/informe/${scan.id}?siteId=${site.id}`;
    }
  }

  const latest = (
    await db
      .select({ id: scanRuns.id })
      .from(scanRuns)
      .where(and(eq(scanRuns.siteId, site.id), eq(scanRuns.status, "ready")))
      .orderBy(desc(scanRuns.createdAt))
      .limit(1)
  )[0];
  if (latest) return `/informe/${latest.id}?siteId=${site.id}`;

  const byUrl = (
    await db
      .select({ id: scanRuns.id })
      .from(scanRuns)
      .where(and(eq(scanRuns.requestedUrl, site.baseUrl), eq(scanRuns.status, "ready")))
      .orderBy(desc(scanRuns.createdAt))
      .limit(1)
  )[0];
  if (!byUrl) return `/#conector`;
  return `/informe/${byUrl.id}?siteId=${site.id}`;
}
