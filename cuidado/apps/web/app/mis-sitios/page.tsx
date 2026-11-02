import { and, desc, eq } from "drizzle-orm";
import { getDb, scanRuns } from "@cuidado/db";
import { redirect } from "next/navigation";
import { AgencyLogoutButton } from "@/components/agency-logout-button";
import { getAgencyTrialStatus } from "@/lib/agency";
import { getAgencyAccount, isAnonymousEmail, listAgencySites } from "@/lib/agency-account";
import { optionalUserId } from "@/lib/session";
import { isWatchActive } from "@/lib/watch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function planLabel(plan: "none" | "rescue" | "cuidado", agencySeat: boolean): string {
  if (plan === "cuidado" && agencySeat) return "Cupo gratis de agencia";
  if (plan === "cuidado") return "Plan Cuidado";
  if (plan === "rescue") return "Rescate";
  return "Sin plan";
}

async function latestInformeHref(siteId: string): Promise<string | null> {
  const latest = (
    await getDb()
      .select({ id: scanRuns.id })
      .from(scanRuns)
      .where(and(eq(scanRuns.siteId, siteId), eq(scanRuns.status, "ready")))
      .orderBy(desc(scanRuns.createdAt))
      .limit(1)
  )[0];
  if (!latest) return null;
  return `/informe/${latest.id}?siteId=${siteId}`;
}

export default async function MisSitiosPage() {
  const userId = await optionalUserId();
  if (!userId) redirect("/agencia/entrar");
  const account = await getAgencyAccount(userId);
  if (!account?.hasPassword || isAnonymousEmail(account.email)) {
    redirect("/agencia/entrar");
  }

  const [sites, trial] = await Promise.all([listAgencySites(userId), getAgencyTrialStatus(userId)]);
  const now = new Date();
  const links = await Promise.all(sites.map(async (site) => [site.id, await latestInformeHref(site.id)] as const));
  const hrefBySite = new Map(links);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{account.email}</p>
          <h1 className="mt-1 font-display text-4xl tracking-tight text-ink">Mis sitios</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {trial.active
              ? `Prueba de agencia: ${trial.used} usados, ${trial.remaining} libres de ${trial.seats}.`
              : "Aquí ves los WordPress conectados a tu cuenta de agencia."}
          </p>
        </div>
        <AgencyLogoutButton />
      </div>

      <div className="flex flex-wrap gap-3">
        <a href="/#conector" className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
          Conectar otro sitio
        </a>
        <a href="/#agencias" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
          Cupos de agencia
        </a>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8">
          <p className="text-lg text-stone-700">Todavía no hay sitios conectados.</p>
          <p className="mt-2 text-sm text-stone-600">
            Instala el Cuidado Conector y conéctalo desde la home. Luego vuelve aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sites.map((site) => {
            const watchOn = isWatchActive(
              { plan: site.plan, watchUntil: site.watchUntil },
              now,
            );
            const informeHref = hrefBySite.get(site.id) ?? null;
            return (
              <li key={site.id} className="rounded-3xl border border-stone-200 bg-white p-6">
                <p className="text-sm text-stone-500">{site.baseUrl}</p>
                <p className="mt-1 text-xl font-medium text-ink">{planLabel(site.plan, site.agencySeat)}</p>
                <p className="mt-2 text-sm text-stone-600">
                  {watchOn ? "Vigilancia activa." : "Sin vigilancia activa."}
                  {site.lastProbeAt
                    ? ` Última revisión: ${site.lastProbeAt.toLocaleString("es-CL", { timeZone: "America/Santiago" })}.`
                    : null}
                </p>
                {informeHref ? (
                  <a
                    href={informeHref}
                    className="mt-4 inline-flex text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
                  >
                    Abrir informe
                  </a>
                ) : (
                  <a
                    href={`/?url=${encodeURIComponent(site.baseUrl)}#analizar`}
                    className="mt-4 inline-flex text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
                  >
                    Pedir un informe nuevo
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
