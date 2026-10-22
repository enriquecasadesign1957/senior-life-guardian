import { JunkMeter } from "@/components/junk-meter";
import { formatCount } from "@/lib/explain";

export function ReliefCompare({ revisions }: { revisions: number | null }) {
  if (revisions === null || !Number.isInteger(revisions) || revisions <= 0) {
    return <JunkMeter revisions={revisions === 0 ? 0 : null} />;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-medium text-stone-500">Así está</p>
        <JunkMeter revisions={revisions} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-pine">Así quedaría</p>
        <article className="rounded-2xl bg-[#e7f3ec] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-stone-600">Copias viejas de tus páginas</p>
              <p className="mt-2 font-display text-4xl text-pine">{formatCount(0)}</p>
              <p className="mt-2 text-sm font-medium text-pine">Limpio</p>
            </div>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pine" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14.5 11.5 20 22 8" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <p className="mt-5 text-sm text-pine">
            Estas {formatCount(revisions)} copias se pueden quitar. El puntaje de arriba mide la velocidad por separado.
          </p>
        </article>
      </div>
    </section>
  );
}
