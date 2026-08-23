import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { UptimeRobotPhoneAlertsContent } from "@/lib/marketing/uptimerobot-phone-alerts-content";

export function UptimeRobotPhoneAlertsArticle({
  content: c,
}: {
  content: UptimeRobotPhoneAlertsContent;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        {c.h1}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-300">
        {c.heroSubheading}
      </p>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{c.heroLead}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{c.heroBody}</p>

      <section
        className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm leading-loose text-zinc-300"
        aria-label={c.h1}
      >
        {c.flowSteps.map((step, index) => (
          <div key={step}>
            <p className={index === c.flowSteps.length - 2 ? "text-accent" : undefined}>
              {step}
            </p>
            {index < c.flowSteps.length - 1 ? (
              <p className="text-zinc-500" aria-hidden="true">
                ↓
              </p>
            ) : null}
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <GitHubLoginButton label={c.ctaPrimary} />
        <Link
          href="/webhook-to-phone-call"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 bg-zinc-950 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
        >
          {c.ctaSecondary}
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.sendTitle}</h2>
        {c.sendIntro.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-3 text-zinc-400 leading-relaxed first:mt-4"
          >
            {paragraph}
          </p>
        ))}
        <h3 className="mt-6 text-lg font-medium text-zinc-200">
          {c.architectureTitle}
        </h3>
        <ol className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {c.architectureSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-100">
                {step}
              </span>
              {index < c.architectureSteps.length - 1 ? (
                <span
                  className="hidden text-lg text-zinc-600 sm:inline"
                  aria-hidden="true"
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.howTitle}</h2>
        <ol className="mt-6 list-decimal space-y-6 pl-5">
          {c.howSteps.map((step) => (
            <li key={step.title}>
              <h3 className="inline text-lg font-medium text-zinc-200">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.configTitle}</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.configIntro}</p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-zinc-400 leading-relaxed">
          {c.configSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <h3 className="mt-8 text-lg font-medium text-zinc-200">
          {c.configFactsTitle}
        </h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-400 leading-relaxed">
          {c.configFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          {c.configDifferenceNote}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.exampleTitle}</h2>
        <h3 className="mt-6 text-lg font-medium text-zinc-200">
          {c.exampleManualTitle}
        </h3>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.exampleManualIntro}</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs leading-relaxed text-zinc-300">
          {c.exampleCurl}
        </pre>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          {c.exampleManualNote}
        </p>
        <h3 className="mt-8 text-lg font-medium text-zinc-200">
          {c.exampleUptimeRobotTitle}
        </h3>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          {c.exampleUptimeRobotBody}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          {c.exampleSuccess}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.whyTitle}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-400 leading-relaxed">
          {c.whyBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.afterTitle}</h2>
        {c.afterBody.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-3 text-zinc-400 leading-relaxed first:mt-4"
          >
            {paragraph}
          </p>
        ))}
      </section>

      <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-xl font-semibold text-zinc-50">{c.pricingTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {c.pricingBody}
        </p>
        <div className="mt-6">
          <GitHubLoginButton label={c.ctaPrimary} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.integrationsTitle}
        </h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.integrationsBody}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
          {c.integrationsList.map((item) => (
            <li key={item}>
              <strong className="text-zinc-300">{item}</strong>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-zinc-500">
          <Link
            href="/grafana-phone-alerts"
            className="text-accent hover:underline"
          >
            {c.relatedGrafana}
          </Link>
          {" · "}
          <Link
            href="/on-call-escalation"
            className="text-accent hover:underline"
          >
            {c.relatedOnCall}
          </Link>
          {" · "}
          <Link
            href="/webhook-to-phone-call"
            className="text-accent hover:underline"
          >
            {c.relatedWebhook}
          </Link>
          {" · "}
          <Link href="/what-is-wakeup-dev" className="text-accent hover:underline">
            {c.relatedWhatIs}
          </Link>
          {" · "}
          <Link href="/faq" className="text-accent hover:underline">
            {c.relatedFaq}
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.faqTitle}</h2>
        <div className="mt-6">
          <FaqAccordion items={c.faqItems} />
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-3 border-t border-zinc-800 pt-10">
        <GitHubLoginButton label={c.ctaPrimary} />
        <Link
          href="/grafana-phone-alerts"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedGrafana}
        </Link>
        <Link
          href="/on-call-escalation"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedOnCall}
        </Link>
        <Link
          href="/webhook-to-phone-call"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedWebhook}
        </Link>
        <Link
          href="/what-is-wakeup-dev"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedWhatIs}
        </Link>
        <Link
          href="/faq"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedFaq}
        </Link>
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/" className="text-accent hover:underline">
          {c.backHome}
        </Link>
      </p>
    </article>
  );
}
