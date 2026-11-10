"use client";

import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-stone-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href="/" className="inline-flex items-center" aria-label="CuidadoWeb">
            <BrandLogo className="h-8 w-auto" />
          </a>
          <p className="mt-3 text-sm text-stone-600">{t("footerPowered")}</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
          <a href="/#funciona">{t("navHowItWorks")}</a>
          <a href="/#precios">{t("navPricing")}</a>
          <a href="/#agencias">{t("navAgencies")}</a>
          <a href="/#analizar">{t("navAnalyzeShort")}</a>
        </nav>
      </div>
    </footer>
  );
}
