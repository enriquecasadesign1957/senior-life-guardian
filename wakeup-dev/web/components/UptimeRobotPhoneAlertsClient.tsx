"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { UptimeRobotPhoneAlertsArticle } from "@/components/UptimeRobotPhoneAlertsArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { uptimeRobotPhoneAlertsContent } from "@/lib/marketing/uptimerobot-phone-alerts-content";

export function UptimeRobotPhoneAlertsClient() {
  const { locale } = useLanguage();
  const c = uptimeRobotPhoneAlertsContent(locale);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <UptimeRobotPhoneAlertsArticle content={c} />
    </MarketingShell>
  );
}
