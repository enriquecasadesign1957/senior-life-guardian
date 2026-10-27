import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href="/" className="inline-flex items-center" aria-label="CuidadoWeb">
            <BrandLogo className="h-8 w-auto" />
          </a>
          <p className="mt-3 text-sm text-stone-600">Cuidado Conector™ powered by WakeUpDev®</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
          <a href="/#funciona">Cómo funciona</a>
          <a href="/#precios">Precios</a>
          <a href="/#agencias">Agencias</a>
          <a href="/#analizar">Analizar</a>
        </nav>
      </div>
    </footer>
  );
}
