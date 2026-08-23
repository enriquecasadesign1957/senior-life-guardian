"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { WhatIsWakeUpDevArticle } from "@/components/WhatIsWakeUpDevArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { whatIsWakeUpDevContent } from "@/lib/marketing/what-is-wakeup-dev-content";

export function WhatIsWakeUpDevClient() {
  const { locale } = useLanguage();
  const c = whatIsWakeUpDevContent(locale);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <WhatIsWakeUpDevArticle content={c} />
    </MarketingShell>
  );
}
