import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { API_ALERT_URL, buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Webhook to Phone Call for Critical Alerts | WakeUp Dev",
  description:
    "Learn how WakeUp Dev turns HTTP webhooks from monitoring systems into phone calls with human acknowledgement and escalation.",
  path: "/webhook-to-phone-call",
});

const howToLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": pageUrl("/webhook-to-phone-call"),
      url: pageUrl("/webhook-to-phone-call"),
      name: "Turn Webhooks Into Phone Calls",
    },
    {
      "@type": "HowTo",
      name: "Send a monitoring webhook to WakeUp Dev for a phone call",
      description:
        "Connect Grafana, UptimeRobot, or any HTTP webhook to WakeUp Dev voice alerting with ACK and escalation.",
      step: [
        {
          "@type": "HowToStep",
          name: "Monitoring system fires",
          text: "Grafana, UptimeRobot, or another monitor detects a critical condition.",
        },
        {
          "@type": "HowToStep",
          name: "HTTP webhook",
          text: "The monitor POSTs the alert body to WakeUp Dev with the x-api-key header.",
        },
        {
          "@type": "HowToStep",
          name: "WakeUp Dev accepts",
          text: "WakeUp Dev validates the API key and credits, then starts the on-call cascade (HTTP 202).",
        },
        {
          "@type": "HowToStep",
          name: "Phone call",
          text: "Twilio calls the first on-call phone and reads a voice summary of the alert.",
        },
        {
          "@type": "HowToStep",
          name: "Press 1 to acknowledge",
          text: "The responder presses 1 on the keypad to ACK. The alert stops escalating.",
        },
        {
          "@type": "HowToStep",
          name: "Escalation if unanswered",
          text: "If there is no ACK or no answer, WakeUp Dev calls the next number in the cascade.",
        },
      ],
    },
  ],
};

export default function WebhookToPhonePage() {
  return (
    <>
      <JsonLd data={howToLd} />
      <MarketingShell>
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
            Turn Webhooks Into Phone Calls
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
            WakeUp Dev connects monitoring webhooks to voice calls with human
            acknowledgement—built for DevOps and SRE on-call workflows.
          </p>

          <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm leading-loose text-zinc-300">
            <p>Monitoring system</p>
            <p className="text-zinc-500">↓</p>
            <p>HTTP webhook</p>
            <p className="text-zinc-500">↓</p>
            <p>WakeUp Dev</p>
            <p className="text-zinc-500">↓</p>
            <p>Phone call</p>
            <p className="text-zinc-500">↓</p>
            <p className="text-accent">Press 1 to acknowledge</p>
            <p className="text-zinc-500">↓</p>
            <p>Escalation if unanswered</p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">API example</h2>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              The public alert endpoint accepts the raw alert body (plain text or
              JSON). Authentication is via the{" "}
              <code className="font-mono text-sm">x-api-key</code> header.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs leading-relaxed text-zinc-300">
              {`curl -X POST ${API_ALERT_URL} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"API production down - HTTP 503"}'`}
            </pre>
            <p className="mt-4 text-sm text-zinc-500">
              On success the API returns HTTP <strong>202</strong> with{" "}
              <code className="font-mono">accepted: true</code> and starts the
              cascade asynchronously. One credit is consumed when the alert is
              accepted.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Why use phone calls for critical alerts?
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-400 leading-relaxed">
              <li>
                Push notifications can be silenced or ignored when the phone is
                in Do Not Disturb.
              </li>
              <li>
                Email may not be read immediately during an overnight incident.
              </li>
              <li>
                A phone call can demand attention in a different way than text
                channels.
              </li>
              <li>
                WakeUp Dev adds explicit ACK (press 1) so you know someone
                confirmed—not just that a notification was sent.
              </li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-zinc-50">
              Quick questions
            </h2>
            <dl className="mt-4 space-y-6">
              <div>
                <dt className="font-medium text-zinc-200">
                  What is a webhook-to-phone-call alert?
                </dt>
                <dd className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  Your monitor sends HTTP POST to WakeUp Dev; WakeUp Dev places
                  a voice call instead of (or in addition to) passive
                  notifications.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-200">
                  How does WakeUp Dev acknowledge an alert?
                </dt>
                <dd className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  During the call, the responder presses 1. That digit is
                  captured via Twilio Gather and marks the alert ACKNOWLEDGED.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-200">
                  What happens if nobody answers?
                </dt>
                <dd className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  WakeUp Dev escalates to the next phone in the cascade—shift
                  roster, team members by order, or your verified emergency
                  number—up to 8 attempts.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-200">
                  Can I use any monitoring system that supports HTTP webhooks?
                </dt>
                <dd className="mt-1 text-sm text-zinc-400 leading-relaxed">
                  Yes. Grafana, UptimeRobot, and custom scripts that can POST
                  with a custom header are supported.
                </dd>
              </div>
            </dl>
            <p className="mt-6">
              <Link href="/faq" className="text-accent hover:underline">
                Full FAQ →
              </Link>
            </p>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <GitHubLoginButton label="Start free — 5 voice alerts" />
            <Link
              href="/what-is-wakeup-dev"
              className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
            >
              What is WakeUp Dev?
            </Link>
          </div>
        </article>
      </MarketingShell>
    </>
  );
}
