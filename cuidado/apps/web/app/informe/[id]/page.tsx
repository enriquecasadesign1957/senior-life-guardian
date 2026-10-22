import { eq } from "drizzle-orm";
import { findings, getDb, scanRuns } from "@cuidado/db";
import { notFound } from "next/navigation";
import { CleanupButton } from "@/components/cleanup-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ siteId?: string }>;
};

function seconds(value: number | null): string {
  if (value === null) return "—";
  return `${(value / 1000).toLocaleString("es-CL", { maximumFractionDigits: 1 })} s`;
}

export default async function InformePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = getDb();
  const scan = (await db.select().from(scanRuns).where(eq(scanRuns.id, id)).limit(1))[0];
  if (!scan) notFound();
  const issues = await db.select().from(findings).where(eq(findings.scanRunId, scan.id));
  const summary = scan.summary as { text?: string; wordpress?: boolean } | null;
  const siteId = query.siteId ?? scan.siteId;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div>
        <p className="text-sm text-stone-500">{scan.requestedUrl}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Informe del celular</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        <article className="rounded-md border border-stone-200 bg-white p-4 sm:col-span-1">
          <p className="text-sm text-stone-500">Puntaje móvil</p>
          <p className="text-4xl font-semibold">{scan.performanceScore ?? "—"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full bg-pine" style={{ width: `${Math.max(0, Math.min(100, scan.performanceScore ?? 0))}%` }} />
          </div>
        </article>
        <article className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">LCP</p>
          <p className="text-2xl font-semibold">{seconds(scan.lcpMs)}</p>
        </article>
        <article className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">INP</p>
          <p className="text-2xl font-semibold">{seconds(scan.inpMs)}</p>
        </article>
        <article className="rounded-md border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">CLS</p>
          <p className="text-2xl font-semibold">
            {scan.clsMilli === null ? "—" : (scan.clsMilli / 1000).toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </article>
      </section>

      <p className="text-lg">{summary?.text}</p>
      {summary?.wordpress === false ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm">
          Este sitio no parece WordPress. Puedes leer el diagnóstico. La limpieza y el conector son solo para WordPress.
        </p>
      ) : null}

      <section className="space-y-3">
        {issues.map((issue) => (
          <article key={issue.id} className="rounded-md border border-stone-200 bg-white p-4">
            <h2 className="font-semibold">{issue.plainTitle}</h2>
            <p className="mt-1 text-sm text-stone-700">{issue.whatItMeans}</p>
            <p className="mt-2 text-sm text-stone-500">{issue.ifIgnored}</p>
          </article>
        ))}
      </section>

      <CleanupButton siteId={siteId} />
    </div>
  );
}
