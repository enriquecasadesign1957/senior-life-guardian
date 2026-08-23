"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { GrafanaPhoneAlertsArticle } from "@/components/GrafanaPhoneAlertsArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { grafanaPhoneAlertsContent } from "@/lib/marketing/grafana-phone-alerts-content";

export function GrafanaPhoneAlertsClient() {
  const { locale } = useLanguage();
  const c = grafanaPhoneAlertsContent(locale);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <GrafanaPhoneAlertsArticle content={c} />
    </MarketingShell>
  );
}
