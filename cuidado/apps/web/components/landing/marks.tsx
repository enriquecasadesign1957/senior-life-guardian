export function Checks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-stone-800">
          <span className="mt-0.5 font-medium text-pine" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Limits({ items, noLabel = "No" }: { items: string[]; noLabel?: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base">
          <span className="font-medium text-stone-400" aria-hidden>
            {noLabel}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
