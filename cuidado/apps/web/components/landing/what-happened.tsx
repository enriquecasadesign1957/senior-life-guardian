"use client";

import { useLanguage } from "@/components/language-provider";
import { specialistHref } from "@/lib/specialist-referral";
import type { MsgKey } from "@/lib/i18n";

const paths: Array<{
  title: MsgKey;
  body: MsgKey;
  href: string;
  action: MsgKey;
  note?: MsgKey;
}> = [
  {
    title: "whatSlowTitle",
    body: "whatSlowBody",
    href: "#analizar",
    action: "whatSlowAction",
  },
  {
    title: "whatFullTitle",
    body: "whatFullBody",
    href: "#precios",
    action: "whatFullAction",
  },
  {
    title: "whatDownTitle",
    body: "whatDownBody",
    href: "#precios",
    action: "whatDownAction",
  },
  {
    title: "whatHackTitle",
    body: "whatHackBody",
    href: specialistHref,
    action: "whatHackAction",
    note: "whatHackNote",
  },
];

export function WhatHappened() {
  const { t } = useLanguage();

  return (
    <section id="que-paso" className="scroll-mt-28 border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="max-w-2xl text-3xl tracking-tight sm:text-4xl">{t("whatTitle")}</h2>
        <p className="mt-3 max-w-2xl text-stone-700">{t("whatLead")}</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {paths.map((path) => (
            <article key={path.title} className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h3 className="text-2xl">{t(path.title)}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-700">{t(path.body)}</p>
              <a
                href={path.href}
                className="mt-6 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
              >
                {t(path.action)}
              </a>
              {path.note ? <p className="mt-2 text-xs leading-5 text-stone-500">{t(path.note)}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
