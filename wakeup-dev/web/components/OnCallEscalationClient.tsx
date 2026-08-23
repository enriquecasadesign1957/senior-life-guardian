"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { OnCallEscalationArticle } from "@/components/OnCallEscalationArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { onCallEscalationContent } from "@/lib/marketing/on-call-escalation-content";

export function OnCallEscalationClient() {
  const { locale } = useLanguage();
  const c = onCallEscalationContent(locale);
  const tableAspectLabel = locale === "es" ? "Aspecto" : "Aspect";

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <OnCallEscalationArticle content={c} tableAspectLabel={tableAspectLabel} />
    </MarketingShell>
  );
}
