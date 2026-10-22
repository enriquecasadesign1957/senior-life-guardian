import { and, eq } from "drizzle-orm";
import { findings, getDb, scanRuns, sites } from "@cuidado/db";
import { notFound } from "next/navigation";
import { CleanupPanel } from "@/components/cleanup-panel";
import { IncidentNotice } from "@/components/incident-notice";
import { JunkMeter } from "@/components/junk-meter";
import { Reassurance } from "@/components/reassurance";
import { RevokeAccess } from "@/components/revoke-access";
import { ScoreMeter } from "@/components/score-meter";
import { UndoBanner } from "@/components/undo-banner";
import { optionalUserId } from "@/lib/session";
import { isWatchActive, watchDaysRemaining } from "@/lib/watch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ siteId?: string }>;
};

type Inventory = {
  revisions?: number | null;
};

function seconds(value: number | null): string {
  if (value === null) return "—";
  return `${(value / 1000).toLocaleString("es-CL", { maximumFractionDigits: 1 })} s`;
}

function cls(value: number | null): string {
  if (value === null) return "—";
  return (value / 1000).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function InformePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = getDb();
  const scan = (await db.select().from(scanRuns).where(eq(scanRuns.id, id)).limit(1))[0];
  if (!scan) notFound();
  const issues = await db.select().from(findings).where(eq(findings.scanRunId, scan.id));
  const summary = scan.summary as { text?: string; wordpress?: boolean; inventory?: Inventory } | null;
  const requestedSiteId = query.siteId && /^[0-9a-f-]{36}$/i.test(query.siteId) ? query.siteId : null;
  const siteId = scan.siteId ?? requestedSiteId;
  const viewerId = await optionalUserId();
  const site =
    viewerId && siteId
      ? (
          await db
            .select()
            .from(sites)
            .where(and(eq(sites.id, siteId), eq(sites.userId, viewerId)))
            .limit(1)
        )[0]
      : undefined;
  const ownedId = site?.status === "connected" ? site.id : null;
  const now = new Date();
  const watchDays =
    site && site.plan === "rescue" && site.watchUntil && isWatchActive(site, now)
      ? watchDaysRemaining(site.watchUntil, now)
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <UndoBanner undoUntil={null} />
      {site?.lastProbeAt ? <IncidentNotice status={site.lastProbeStatus} streak={site.probeStreak} /> : null}
      {watchDays !== null && watchDays > 0 ? (
        <p className="text-sm text-stone-600">
          Vigilancia activa por {watchDays} {watchDays === 1 ? "día" : "días"} más. Después puedes seguir con el plan Cuidado, a $19 al mes.
        </p>
      ) : null}
      {site && site.plan === "cuidado" && isWatchActive(site, now) ? (
        <p className="text-sm text-stone-600">Vigilancia activa con el plan Cuidado.</p>
      ) : null}

      <div>
        <p className="text-sm text-stone-500">{scan.requestedUrl}</p>
        <h1 className="mt-1 text-4xl tracking-tight">Informe del celular</h1>
      </div>

      <ScoreMeter score={scan.performanceScore} />

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">LCP</p>
          <p className="text-2xl font-semibold">{seconds(scan.lcpMs)}</p>
        </article>
        <article className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">INP</p>
          <p className="text-2xl font-semibold">{seconds(scan.inpMs)}</p>
        </article>
        <article className="rounded-2xl bg-white p-4">
          <p className="text-sm text-stone-500">CLS</p>
          <p className="text-2xl font-semibold">{cls(scan.clsMilli)}</p>
        </article>
      </section>

      <JunkMeter revisions={summary?.inventory?.revisions ?? null} />

      <p className="text-lg">{summary?.text}</p>
      {summary?.wordpress === false ? (
        <p className="rounded-2xl bg-white p-4 text-sm">
          Este sitio no parece WordPress. Puedes leer el diagnóstico. La limpieza y el conector son solo para WordPress.
        </p>
      ) : null}

      <section className="space-y-3">
        {issues.map((issue) => (
          <article key={issue.id} className="rounded-2xl bg-white p-5">
            <h2 className="text-xl">{issue.plainTitle}</h2>
            <p className="mt-2 text-sm text-stone-700">{issue.whatItMeans}</p>
            <p className="mt-2 text-sm text-stone-500">{issue.ifIgnored}</p>
          </article>
        ))}
      </section>

      <Reassurance />
      <CleanupPanel siteId={ownedId} />
      {ownedId ? <RevokeAccess siteId={ownedId} /> : null}
    </div>
  );
}
