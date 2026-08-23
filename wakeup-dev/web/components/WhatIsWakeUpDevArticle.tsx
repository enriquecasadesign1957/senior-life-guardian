import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import type { WhatIsContent } from "@/lib/marketing/what-is-wakeup-dev-content";

export function WhatIsWakeUpDevArticle({ content: c }: { content: WhatIsContent }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
        {c.h1}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-300">{c.lead}</p>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{c.body}</p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.problemTitle}</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.problemBody}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.whoTitle}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
          {c.whoBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.howTitle}</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-400 leading-relaxed">
          {c.howSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">{c.ackTitle}</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">{c.ackBody}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-zinc-50">
          {c.integrationsTitle}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
          {c.integrations.map((item) => (
            <li key={item.name}>
              <strong className="text-zinc-300">{item.name}</strong> —{" "}
              {item.detail}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-400">{c.ctaBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <GitHubLoginButton label={c.ctaPrimary} />
          <Link
            href="/webhook-to-phone-call"
            className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            {c.relatedWebhook}
          </Link>
          <Link
            href="/faq"
            className="inline-flex h-12 items-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
          >
            {c.relatedFaq}
          </Link>
        </div>
      </section>

      <p className="mt-8 text-sm text-zinc-500">
        <Link href="/" className="text-accent hover:underline">
          {c.backHome}
        </Link>
      </p>
    </article>
  );
}
