"use client";

import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import type { MsgKey } from "@/lib/i18n";

const links: Array<[string, MsgKey]> = [
  ["/#que-paso", "navWhatHappened"],
  ["/#funciona", "navHowItWorks"],
  ["/#precios", "navPricing"],
  ["/#agencias", "navAgencies"],
];

export function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="/" className="inline-flex items-center" aria-label="CuidadoWeb">
          <BrandLogo className="h-8 w-auto sm:h-9" priority />
        </a>
        <nav className="hidden items-center gap-6 text-sm text-stone-600 sm:flex">
          {links.map(([href, key]) => (
            <a key={href} href={href} className="hover:text-ink">
              {t(key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <a href="/#analizar" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
            {t("navAnalyze")}
          </a>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-6 pb-3 text-sm text-stone-600 sm:hidden">
        {links.map(([href, key]) => (
          <a key={href} href={href} className="shrink-0">
            {t(key)}
          </a>
        ))}
      </nav>
    </header>
  );
}
