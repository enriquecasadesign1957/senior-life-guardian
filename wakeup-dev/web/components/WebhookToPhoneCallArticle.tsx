import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import type { WebhookToPhoneContent } from "@/lib/marketing/webhook-to-phone-call-content";

export function WebhookToPhoneCallArticle({
  content: c,
}: {
  content: WebhookToPhoneContent;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        {c.h1}
      </h1>
      <p className="mt-6 text-lg text-zinc-400 leading-relaxed">{c.lead}</p>

      <section
        className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 font-mono text-sm leading-loose text-zinc-300"
        aria-label={c.h1}
      >
        {c.flowSteps.map((step, index) => (
          <div key={step}>
            <p
              className={
                index === c.flowSteps.length - 2 ? "text-accent" : undefined
              }
            >
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

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.apiTitle}</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.apiIntro}</p>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs leading-relaxed text-zinc-300">
          {c.apiCurl}
        </pre>
        <p className="mt-4 text-sm text-zinc-500">{c.apiSuccess}</p>
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
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.questionsTitle}
        </h2>
        <dl className="mt-4 space-y-6">
          {c.questions.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-zinc-200">{item.q}</dt>
              <dd className="mt-1 text-sm text-zinc-400 leading-relaxed">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6">
          <Link href="/faq" className="text-accent hover:underline">
            {c.relatedFaq}
          </Link>
        </p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <GitHubLoginButton label={c.ctaPrimary} />
        <Link
          href="/what-is-wakeup-dev"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          {c.relatedWhatIs}
        </Link>
      </div>
    </article>
  );
}
