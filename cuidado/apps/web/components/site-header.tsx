import { BrandLogo } from "@/components/brand-logo";

const links = [
  ["/#que-paso", "Qué te pasó"],
  ["/#funciona", "Cómo funciona"],
  ["/#precios", "Precios"],
  ["/#agencias", "Agencias"],
  ["/mis-sitios", "Mis sitios"],
  ["/admin/codigos", "Códigos"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="/" className="inline-flex items-center" aria-label="CuidadoWeb">
          <BrandLogo className="h-8 w-auto sm:h-9" priority />
        </a>
        <nav className="hidden items-center gap-6 text-sm text-stone-600 lg:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/admin/codigos"
            className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm font-medium sm:inline-flex lg:hidden"
          >
            Códigos
          </a>
          <a href="/agencia/entrar" className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm font-medium sm:inline-flex">
            Agencia
          </a>
          <a href="/#analizar" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
            Analizar mi sitio
          </a>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-6 pb-3 text-sm text-stone-600 lg:hidden">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="shrink-0">
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
