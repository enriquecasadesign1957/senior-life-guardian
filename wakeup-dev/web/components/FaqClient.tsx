"use client";

import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MarketingShell } from "@/components/MarketingShell";
import { useLanguage } from "@/components/LanguageProvider";
import { faqPageContent } from "@/lib/marketing/faq-data";

export function FaqClient() {
  const { locale } = useLanguage();
  const c = faqPageContent(locale);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-14 sm:px-6 sm:pb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          {c.h1}
        </h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">{c.intro}</p>

        {c.sections.map((section) => (
          <section key={section.title} className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">
              {section.title}
            </h2>
            <FaqAccordion items={section.items} />
          </section>
        ))}

        <div className="mt-14 flex flex-wrap gap-3 border-t border-zinc-800 pt-10">
          <GitHubLoginButton label={c.ctaPrimary} />
          <Link
            href="/what-is-wakeup-dev"
            className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            {c.relatedWhatIs}
          </Link>
          <Link
            href="/webhook-to-phone-call"
            className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            {c.relatedWebhook}
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
