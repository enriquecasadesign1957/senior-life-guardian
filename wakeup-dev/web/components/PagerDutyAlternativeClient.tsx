"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { PagerDutyAlternativeArticle } from "@/components/PagerDutyAlternativeArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { pagerDutyAltContent } from "@/lib/marketing/pagerduty-alternative-content";

export function PagerDutyAlternativeClient() {
  const { locale } = useLanguage();
  const c = pagerDutyAltContent(locale);
  const tableFeatureLabel = locale === "es" ? "Característica" : "Feature";

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <PagerDutyAlternativeArticle content={c} tableFeatureLabel={tableFeatureLabel} />
    </MarketingShell>
  );
}
