const links = [
  ["/#que-paso", "Qué te pasó"],
  ["/#funciona", "Cómo funciona"],
  ["/#precios", "Precios"],
  ["/#agencias", "Agencias"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="/" className="font-display text-xl tracking-tight">
          CuidadoWeb
        </a>
        <nav className="hidden items-center gap-6 text-sm text-stone-600 sm:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <a href="/#analizar" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
          Analizar mi sitio
        </a>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-6 pb-3 text-sm text-stone-600 sm:hidden">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="shrink-0">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
