import { scoreTone } from "@/lib/panel";

export function ScoreMeter({ score, gate = false }: { score: number | null; gate?: boolean }) {
  if (gate) {
    return (
      <article className="rounded-2xl bg-white p-6 sm:p-8">
        <p className="text-sm text-stone-600">Puntaje móvil</p>
        <p className="mt-2 font-display text-7xl leading-none text-ink">—</p>
        <p className="mt-3 text-lg text-stone-700">
          No medimos tu página. El hosting mostró una pantalla de espera.
        </p>
      </article>
    );
  }
  const tone = scoreTone(score);
  const width = score === null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <article className={`rounded-2xl p-6 sm:p-8 ${tone.shell}`}>
      <p className="text-sm text-stone-600">Puntaje móvil</p>
      <p className={`mt-2 font-display text-7xl leading-none ${tone.ink}`}>{score ?? "—"}</p>
      <p className={`mt-3 text-lg ${tone.ink}`}>{tone.label}</p>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/80">
        <div className={`h-full ${tone.bar}`} style={{ width: `${width}%` }} />
      </div>
    </article>
  );
}
