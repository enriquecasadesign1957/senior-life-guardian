"use client";

import { AgencyTrialPanel } from "@/components/agency-trial-panel";
import { AnalyzeForm } from "@/components/analyze-form";
import { BrandLogo } from "@/components/brand-logo";
import { ConnectorPanel } from "@/components/connector-panel";
import { Checks, Limits } from "@/components/landing/marks";
import { WhatHappened } from "@/components/landing/what-happened";
import { useLanguage } from "@/components/language-provider";
import type { MsgKey } from "@/lib/i18n";

const partnerMailto =
  "mailto:hola@cuidadoweb.com?subject=Programa%20de%20Reparto%20CuidadoWeb";
const allianceMailto =
  "mailto:hola@cuidadoweb.com?subject=Programa%20Alianza%20CuidadoWeb";

const needsItems: MsgKey[] = [
  "needsItem1",
  "needsItem2",
  "needsItem3",
  "needsItem4",
  "needsItem5",
  "needsItem6",
];
const detectItems: MsgKey[] = [
  "detect1",
  "detect2",
  "detect3",
  "detect4",
  "detect5",
  "detect6",
  "detect7",
  "detect8",
];
const removeItems: MsgKey[] = ["remove1", "remove2", "remove3", "remove4"];
const alsoItems: MsgKey[] = ["also1", "also2"];
const repairItems: MsgKey[] = ["repair1", "repair2", "repair3", "repair4"];
const keepItems: MsgKey[] = ["keep1", "keep2", "keep3", "keep4", "keep5"];
const partnerIdeal: MsgKey[] = ["partnerIdeal1", "partnerIdeal2", "partnerIdeal3", "partnerIdeal4"];
const allianceItems: MsgKey[] = [
  "alliance1",
  "alliance2",
  "alliance3",
  "alliance4",
  "alliance5",
  "alliance6",
];
const neverItems: MsgKey[] = ["never1", "never2", "never3", "never4", "never5"];
const soonItems: MsgKey[] = ["soon1", "soon2", "soon3", "soon4", "soon5"];

export function LandingClient() {
  const { t, locale } = useLanguage();
  const perMonth = locale === "es" ? "mes" : "mo";

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-20">
        <div className="max-w-xl">
          <BrandLogo className="h-10 w-auto sm:h-12" priority />
          <h1 className="mt-5 text-4xl leading-[1.08] tracking-tight sm:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-6 text-lg text-stone-700">{t("heroLead")}</p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <li>
              <a href="#analizar" className="font-display text-2xl text-ink">
                {t("heroFree")}
              </a>
              <p className="text-stone-500">{t("heroFreeHint")}</p>
            </li>
            <li>
              <a href="#precios" className="font-display text-2xl text-ink">
                $29
              </a>
              <p className="text-stone-500">{t("heroOnce")}</p>
            </li>
            <li>
              <a href="#precios" className="font-display text-2xl text-ink">
                $19
              </a>
              <p className="text-stone-500">{t("heroMonth")}</p>
            </li>
          </ul>
          <div id="analizar" className="mt-8 scroll-mt-28">
            <AnalyzeForm inputId="url" buttonLabelKey="analyzeButtonFree" />
            <p className="mt-3 text-sm text-stone-500">{t("heroNoCard")}</p>
          </div>
        </div>
        <figure className="w-full">
          <img src="/hero-saludable.jpg" alt={t("heroAlt")} className="w-full rounded-[2rem] shadow-sm" />
          <figcaption className="mt-3 text-sm text-stone-500">{t("heroCaption")}</figcaption>
        </figure>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">{t("needsTitle")}</h2>
            <p className="mt-4 text-stone-700">{t("needsLead")}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {needsItems.map((key) => (
              <li key={key} className="rounded-2xl bg-paper px-4 py-4 text-sm">
                {t(key)}
              </li>
            ))}
          </ul>
          <figure className="lg:col-span-2">
            <img src="/antes-despues.jpg" alt={t("needsAlt")} className="w-full rounded-3xl" />
            <figcaption className="mt-3 text-sm text-stone-500">{t("needsCaption")}</figcaption>
          </figure>
          <div className="lg:col-span-2 max-w-3xl space-y-4 text-lg leading-relaxed text-stone-800">
            <p>{t("needsMostTools")}</p>
            <p className="font-display text-3xl text-ink">{t("needsWeDont")}</p>
            <p>{t("needsOnlySafe")}</p>
            <p>{t("needsDownCostsMore")}</p>
          </div>
        </div>
      </section>

      <WhatHappened />

      <section id="funciona" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl tracking-tight sm:text-4xl">{t("howTitle")}</h2>
          <div id="precios" className="mt-10 scroll-mt-28 space-y-6">
            <article className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-medium text-pine">01</p>
                <h3 className="mt-2 text-3xl">{t("stepDiagnose")}</h3>
                <p className="mt-3 text-stone-700">{t("stepDiagnoseBody")}</p>
                <p className="mt-6 font-display text-4xl">{t("heroFree")}</p>
                <p className="mt-2 text-sm text-stone-600">{t("stepDiagnoseLimit")}</p>
                <a href="#analizar" className="mt-6 inline-block rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
                  {t("stepDiagnoseCta")}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">{t("detectLabel")}</p>
                <div className="mt-4">
                  <Checks items={detectItems.map((key) => t(key))} />
                </div>
              </div>
            </article>

            <article className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-pine">02</p>
                <h3 className="mt-2 text-3xl">{t("stepClean")}</h3>
                <p className="mt-3 text-stone-700">{t("stepCleanBody")}</p>
                <p className="mt-6 text-sm font-medium text-stone-500">{t("stepCleanBefore")}</p>
                <ul className="mt-3 space-y-2 text-sm text-stone-800">
                  <li>{t("stepCleanShow1")}</li>
                  <li>{t("stepCleanShow2")}</li>
                  <li>{t("stepCleanShow3")}</li>
                </ul>
                <p className="mt-8 text-sm text-stone-500">{t("rescueLabel")}</p>
                <p className="font-display text-4xl">$29</p>
                <p className="text-sm text-stone-600">{t("rescueOnce")}</p>
                <a href="#conector" className="mt-6 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4">
                  {t("rescueCta")}
                </a>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-stone-500">{t("removeLabel")}</p>
                  <div className="mt-3">
                    <Checks items={removeItems.map((key) => t(key))} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-500">{t("alsoLabel")}</p>
                  <div className="mt-3">
                    <Checks items={alsoItems.map((key) => t(key))} />
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <p className="text-sm font-medium text-pine">03</p>
              <h3 className="mt-2 text-3xl">{t("stepRepair")}</h3>
              <p className="mt-3 max-w-2xl text-stone-700">{t("stepRepairBody")}</p>
              <div className="mt-5 max-w-xl">
                <Checks items={repairItems.map((key) => t(key))} />
              </div>
              <p className="mt-6 text-sm text-stone-600">{t("repairNote")}</p>
            </article>

            <article className="grid gap-8 rounded-3xl bg-ink p-6 text-white sm:p-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-200">04</p>
                <h3 className="mt-2 text-3xl">{t("stepKeep")}</h3>
                <p className="mt-3 max-w-xl text-stone-200">{t("stepKeepBody")}</p>
                <p className="mt-6 text-sm font-medium text-stone-300">{t("includesLabel")}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {keepItems.map((key) => (
                    <li key={key}>✓ {t(key)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm text-stone-300">{t("planLabel")}</p>
                <p className="font-display text-5xl">$19</p>
                <p className="text-sm text-stone-300">{t("heroMonth")}</p>
                <a href="#analizar" className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-medium text-ink">
                  {t("planCta")}
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="conector" className="scroll-mt-28 border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <figure>
            <img
              src="/plugin-instalado.jpg"
              alt={t("connectorAlt")}
              className="w-full rounded-3xl border border-stone-200"
            />
            <figcaption className="mt-3 text-sm text-stone-500">{t("connectorCaption")}</figcaption>
          </figure>
          <ConnectorPanel />
        </div>
      </section>

      <section id="agencias" className="scroll-mt-28 border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="max-w-2xl text-3xl tracking-tight sm:text-4xl">{t("agenciesTitle")}</h2>
          <p className="mt-3 text-stone-700">{t("agenciesLead")}</p>
          <div className="mt-10">
            <AgencyTrialPanel />
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-stone-200 p-6 sm:p-8">
              <h3 className="text-2xl">{t("partnerTitle")}</h3>
              <p className="mt-3 text-stone-700">{t("partnerP1")}</p>
              <p className="mt-2 text-stone-700">{t("partnerP2")}</p>
              <p className="mt-2 text-stone-700">{t("partnerP3")}</p>
              <p className="mt-6 text-sm font-medium text-stone-500">{t("partnerCommissions")}</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>{t("partnerComm1")}</li>
                <li>{t("partnerComm2")}</li>
              </ul>
              <p className="mt-6 text-sm font-medium text-stone-500">{t("partnerTracking")}</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">{t("partnerTrackingBody")}</p>
              <p className="mt-6 text-sm font-medium text-stone-500">{t("partnerIdeal")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {partnerIdeal.map((key) => (
                  <li key={key} className="rounded-full bg-paper px-3 py-1 text-sm">
                    {t(key)}
                  </li>
                ))}
              </ul>
              <a href={partnerMailto} className="mt-8 inline-block rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                {t("partnerCta")}
              </a>
              <p className="mt-3 text-xs text-stone-500">{t("partnerNote")}</p>
            </article>

            <article className="rounded-3xl bg-paper p-6 sm:p-8">
              <h3 className="text-2xl">{t("allianceTitle")}</h3>
              <p className="mt-3 text-stone-700">{t("allianceBody")}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-stone-500">{t("alliance10")}</p>
                  <p className="mt-1 text-sm">{t("alliance10Sites")}</p>
                  <p className="font-display text-3xl">$79/{perMonth}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm text-stone-500">{t("alliance40")}</p>
                  <p className="mt-1 text-sm">{t("alliance40Sites")}</p>
                  <p className="font-display text-3xl">$199/{perMonth}</p>
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-stone-500">{t("allianceIncludes")}</p>
              <div className="mt-3">
                <Checks items={allianceItems.map((key) => t(key))} />
              </div>
              <p className="mt-6 text-sm leading-6 text-stone-700">{t("allianceNote")}</p>
              <a
                href={allianceMailto}
                className="mt-8 inline-block rounded-full border border-stone-400 px-5 py-3 text-sm font-medium"
              >
                {t("allianceCta")}
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="limites" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl tracking-tight sm:text-4xl">{t("neverTitle")}</h2>
          <p className="mt-3 text-stone-700">{t("neverLead")}</p>
          <div className="mt-8">
            <Limits noLabel={t("limitNo")} items={neverItems.map((key) => t(key))} />
          </div>
          <p className="mt-8 text-lg">{t("neverClose")}</p>
        </div>

        <article className="mt-16 rounded-3xl border border-dashed border-stone-300 p-6 sm:p-8">
          <p className="text-sm font-medium text-pine">{t("soonBadge")}</p>
          <h2 className="mt-2 text-3xl">{t("soonTitle")}</h2>
          <p className="mt-3 text-stone-700">{t("soonBody")}</p>
          <div className="mt-5">
            <Checks items={soonItems.map((key) => t(key))} />
          </div>
          <p className="mt-6 text-sm text-stone-600">{t("soonPacks")}</p>
        </article>
      </section>

      <section className="bg-pine text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-5xl">{t("promiseTitle")}</h2>
            <p className="mt-6 text-lg text-emerald-50">{t("promiseMost")}</p>
            <p className="mt-3 font-display text-3xl">{t("promiseWe")}</p>
            <p className="mt-6 text-emerald-50">{t("promiseSafe")}</p>
          </div>
          <div id="analizar-ahora" className="scroll-mt-28">
            <h3 className="text-2xl">{t("promiseAnalyze")}</h3>
            <p className="mt-2 text-sm text-emerald-50">{t("promiseNoCard")}</p>
            <div className="mt-6">
              <AnalyzeForm inputId="url-final" buttonLabelKey="analyzeButtonNow" variant="inverse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
