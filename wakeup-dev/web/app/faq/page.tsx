import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { FAQ_ITEMS, faqJsonLd } from "@/lib/marketing/faq-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "WakeUp Dev FAQ — Voice On-Call Alerts & Incident Escalation",
  description:
    "Answers about WakeUp Dev, voice-first on-call alerting, phone calls, human acknowledgement, escalation, Grafana, UptimeRobot and webhooks.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <MarketingShell>
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            WakeUp Dev FAQ
          </h1>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Voice on-call alerts, human ACK, escalation, integrations, and
            pricing—based on what WakeUp Dev implements today.
          </p>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">General</h2>
            <FaqAccordion items={FAQ_ITEMS.slice(0, 5)} />
          </section>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">
              Alerts and acknowledgement
            </h2>
            <FaqAccordion items={FAQ_ITEMS.slice(5, 10)} />
          </section>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">
              Integrations
            </h2>
            <FaqAccordion items={FAQ_ITEMS.slice(10, 14)} />
          </section>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">On-call</h2>
            <FaqAccordion items={FAQ_ITEMS.slice(14, 17)} />
          </section>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">Pricing</h2>
            <FaqAccordion items={FAQ_ITEMS.slice(17, 20)} />
          </section>

          <section className="mt-12">
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">Security</h2>
            <FaqAccordion items={FAQ_ITEMS.slice(20)} />
          </section>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-zinc-800 pt-10">
            <GitHubLoginButton label="Start free — 5 voice alerts" />
            <Link
              href="/what-is-wakeup-dev"
              className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
            >
              What is WakeUp Dev?
            </Link>
            <Link
              href="/webhook-to-phone-call"
              className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
            >
              Webhook to phone call
            </Link>
          </div>
        </div>
      </MarketingShell>
    </>
  );
}
