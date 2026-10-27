import { formatCount } from "@/lib/explain";
import { junkBarPercent, junkState } from "@/lib/panel";

const copy = {
  unknown: {
    label: "Aún no leído",
    shell: "bg-white",
    bar: "bg-stone-300",
    ink: "text-stone-600",
  },
  clean: {
    label: "Limpio",
    shell: "bg-[#e7f3ec]",
    bar: "bg-pine",
    ink: "text-pine",
  },
  busy: {
    label: "Ocupado",
    shell: "bg-[#fbf3df]",
    bar: "bg-[#c9892d]",
    ink: "text-[#8a5a12]",
  },
  full: {
    label: "Saturado",
    shell: "bg-[#fde8e8]",
    bar: "bg-[#d36b76]",
    ink: "text-[#9f3a45]",
  },
} as const;

export function JunkMeter({
  revisions,
  innodb = null,
}: {
  revisions: number | null;
  innodb?: boolean | null;
}) {
  const state = junkState(revisions);
  const tone = copy[state];
  const width = state === "unknown" || revisions === null ? 0 : junkBarPercent(revisions);
  return (
    <article className={`rounded-2xl p-6 ${tone.shell}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-stone-600">Copias viejas de tus páginas</p>
          <p className={`mt-2 font-display text-4xl ${tone.ink}`}>
            {state === "unknown" || revisions === null ? "—" : formatCount(revisions)}
          </p>
          <p className={`mt-2 text-sm font-medium ${tone.ink}`}>{tone.label}</p>
        </div>
        <Cabinet overflowing={state === "full"} />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/80">
        <div className={`h-full ${tone.bar}`} style={{ width: `${width}%` }} />
      </div>
      {state === "unknown" ? (
        <p className="mt-3 text-sm text-stone-600">
          {innodb === false
            ? "La base no usa InnoDB. Por eso no contamos las copias ni ofrecemos la limpieza."
            : "Conecta el sitio para ver si la base está saturada o limpia."}
        </p>
      ) : null}
    </article>
  );
}

function Cabinet({ overflowing }: { overflowing: boolean }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden className="shrink-0">
      <rect x="16" y="18" width="40" height="46" rx="4" fill="#fff" stroke="#1c1917" strokeWidth="2" />
      <rect x="22" y="26" width="28" height="8" rx="2" fill={overflowing ? "#f3c1c7" : "#e7e5e4"} />
      <rect x="22" y="38" width="28" height="8" rx="2" fill={overflowing ? "#f3c1c7" : "#e7e5e4"} />
      <rect x="22" y="50" width="28" height="8" rx="2" fill={overflowing ? "#f3c1c7" : "#e7e5e4"} />
      {overflowing ? (
        <>
          <rect x="30" y="8" width="14" height="14" rx="1" fill="#fff" stroke="#9f3a45" strokeWidth="2" transform="rotate(-8 37 15)" />
          <rect x="40" y="6" width="12" height="12" rx="1" fill="#fff" stroke="#9f3a45" strokeWidth="2" transform="rotate(10 46 12)" />
        </>
      ) : null}
    </svg>
  );
}
