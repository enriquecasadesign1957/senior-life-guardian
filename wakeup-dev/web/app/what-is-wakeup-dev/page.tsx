import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { API_ALERT_URL, buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "What is WakeUp Dev? | Voice-First On-Call Alerting",
  description:
    "WakeUp Dev turns critical technical alerts into phone calls, requires human acknowledgement and automatically escalates unanswered incidents.",
  path: "/what-is-wakeup-dev",
});

const webPageLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": pageUrl("/what-is-wakeup-dev"),
      url: pageUrl("/what-is-wakeup-dev"),
      name: "What is WakeUp Dev?",
      description:
        "Voice-first on-call alerting with phone calls, human ACK, and automatic escalation.",
      isPartOf: { "@id": SITE },
    },
    {
      "@type": "SoftwareApplication",
      name: "WakeUp Dev",
      url: SITE,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      description:
        "Voice-first on-call alerting platform that converts monitoring webhooks into phone calls with digit-1 acknowledgement and cascade escalation.",
      featureList: [
        "HTTP webhook alert ingestion",
        "Phone call with press-1 acknowledgement",
        "Automatic on-call cascade escalation",
        "Grafana and UptimeRobot compatible",
        "CSV on-call roster and shift import",
      ],
    },
  ],
};

export default function WhatIsPage() {
  return (
    <>
      <JsonLd data={webPageLd} />
      <MarketingShell>
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            What is WakeUp Dev?
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            WakeUp Dev is a voice-first on-call alerting platform for critical
            technical incidents.
          </p>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            When Grafana, UptimeRobot, or any HTTP-capable monitor fires an
            alert, WakeUp Dev can turn that webhook into a phone call to the
            engineer on call—not just another push notification. The responder
            must press <strong className="text-zinc-200">1</strong> to
            acknowledge (ACK). If nobody answers or ACKs in time, the alert
            escalates through your configured on-call cascade.
          </p>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              What problem does it solve?
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Critical alerts sent only to Slack, email, or mobile push can be
              missed at 3 AM. WakeUp Dev is for teams that need a human to
              actually respond during incident response—not merely be notified.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Who uses WakeUp Dev?
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              <li>DevOps and SRE engineers on call</li>
              <li>Small teams without per-seat budget for classic paging tools</li>
              <li>Teams in Chile and internationally (CLP and USD billing paths)</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              How WakeUp Dev works
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-400 leading-relaxed">
              <li>A monitoring system generates a critical alert.</li>
              <li>
                WakeUp Dev receives the alert at{" "}
                <code className="font-mono text-sm text-zinc-300">
                  POST {API_ALERT_URL}
                </code>{" "}
                with your <code className="font-mono text-sm">x-api-key</code>.
              </li>
              <li>
                WakeUp Dev validates credits, summarizes the payload for voice
                (when Groq is configured), and starts the on-call cascade.
              </li>
              <li>
                WakeUp Dev initiates a phone call to the first on-call target.
              </li>
              <li>
                The on-call responder hears the alert and presses{" "}
                <strong className="text-zinc-200">1</strong> to acknowledge.
              </li>
              <li>
                If nobody acknowledges within the wait window, or the call is
                unanswered, WakeUp Dev escalates to the next phone in the
                cascade (shift roster, team CSV, or verified emergency number).
              </li>
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Don&apos;t just notify. Get an acknowledgement.
            </h2>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Traditional notifications tell you that something happened. WakeUp
              Dev is designed for situations where someone needs to actually
              respond. A phone call plus digit-1 ACK gives you a clearer signal
              that a human confirmed the alert—not that a message was merely
              delivered to a device.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Integrations
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
              <li>
                <strong className="text-zinc-300">Grafana</strong> — HTTP
                contact point / webhook
              </li>
              <li>
                <strong className="text-zinc-300">UptimeRobot</strong> — webhook
                alerts
              </li>
              <li>
                <strong className="text-zinc-300">HTTP webhooks</strong> — any
                monitor that can POST with a custom header
              </li>
            </ul>
          </section>

          <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <p className="text-sm text-zinc-400">
              WakeUp Dev is designed as a lightweight voice-first alternative for
              teams that need critical alerts to reach a human—without adding a
              per-seat license for every engineer on the rotation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <GitHubLoginButton label="Start free — 5 voice alerts" />
              <Link
                href="/webhook-to-phone-call"
                className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
              >
                See how webhooks become calls
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
              >
                Read the FAQ
              </Link>
            </div>
          </section>

          <p className="mt-8 text-sm text-zinc-500">
            <Link href="/" className="text-accent hover:underline">
              ← Back to home
            </Link>
          </p>
        </article>
      </MarketingShell>
    </>
  );
}
