"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { WebhookToPhoneCallArticle } from "@/components/WebhookToPhoneCallArticle";
import { useLanguage } from "@/components/LanguageProvider";
import { webhookToPhoneCallContent } from "@/lib/marketing/webhook-to-phone-call-content";

export function WebhookToPhoneCallClient() {
  const { locale } = useLanguage();
  const c = webhookToPhoneCallContent(locale);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <WebhookToPhoneCallArticle content={c} />
    </MarketingShell>
  );
}
