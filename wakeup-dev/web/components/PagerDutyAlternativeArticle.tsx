import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { PagerDutyAltContent } from "@/lib/marketing/pagerduty-alternative-content";

export function PagerDutyAlternativeArticle({
  content: c,
  tableFeatureLabel,
}: {
  content: PagerDutyAltContent;
  tableFeatureLabel: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        {c.h1}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-300">{c.heroLead}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{c.heroBody}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">
        {c.heroPositioning}
      </p>

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
        <h2 className="text-2xl font-semibold text-zinc-50">{c.vsTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">{c.vsIntro}</p>
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th
                  className="px-4 py-3 font-medium text-zinc-500"
                  scope="col"
                >
                  {tableFeatureLabel}
                </th>
                <th className="px-4 py-3 font-medium text-zinc-200" scope="col">
                  WakeUp Dev
                </th>
                <th className="px-4 py-3 font-medium text-zinc-400" scope="col">
                  PagerDuty
                </th>
              </tr>
            </thead>
            <tbody>
              {c.comparisonRows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-zinc-800/80 last:border-0"
                >
                  <th
                    className="px-4 py-3 align-top font-medium text-zinc-400"
                    scope="row"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-3 align-top text-zinc-200">
                    {row.wakeupDev}
                  </td>
                  <td className="px-4 py-3 align-top text-zinc-500">
                    {row.pagerduty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.betterFitTitle}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-400 leading-relaxed">
          {c.betterFitBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.pagerdutyFitTitle}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-400 leading-relaxed">
          {c.pagerdutyFitBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.workflowTitle}
        </h2>
        <ol className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          {c.workflowSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-100">
                {step}
              </span>
              {index < c.workflowSteps.length - 1 ? (
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
        <p className="mt-6 text-zinc-400 leading-relaxed">{c.workflowBody}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.voiceTitle}</h2>
        {c.voiceBody.map((paragraph) => (
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

      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/" className="text-accent hover:underline">
          {c.backHome}
        </Link>
      </p>
    </article>
  );
}
