"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ProChileCheckout } from "@/components/ProChileCheckout";
import { IntlProCheckout } from "@/components/IntlProCheckout";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatClp,
  formatUsdFromCents,
  PLAN_BASIC_CLP,
  PLAN_BASIC_USD_CENTS,
  PLAN_CHILE_CLP,
  PLAN_INTL_USD_CENTS,
  withBillingPeriod,
  type BillingPeriod,
} from "@/lib/planChile";
import type { MsgKey } from "@/lib/i18n";
import {
  Check,
  CreditCard,
  Globe,
  Mail,
  Quote,
  Users,
} from "lucide-react";

const ENTERPRISE_MAILTO =
  "mailto:administrador@alarmaseniorsafe.cl?subject=WakeUp%20Dev%20%E2%80%94%20Plan%20Enterprise&body=Hola%2C%20quiero%20evaluar%20WakeUp%20Dev%20Enterprise%20para%20mi%20equipo.";

const HOW_IT_WORKS_STEPS: MsgKey[] = [
  "howItWorksStep1",
  "howItWorksStep2",
  "howItWorksStep3",
  "howItWorksStep4",
  "howItWorksStep5",
];

const FOOTER_LINKS: { href: string; labelKey: MsgKey }[] = [
  { href: "/what-is-wakeup-dev", labelKey: "footerWhatIs" },
  { href: "/webhook-to-phone-call", labelKey: "footerHowItWorks" },
  { href: "/pagerduty-alternative", labelKey: "footerPagerDuty" },
  { href: "/on-call-escalation", labelKey: "footerOnCallEscalation" },
  { href: "/grafana-phone-alerts", labelKey: "footerGrafanaPhoneAlerts" },
  { href: "/uptimerobot-phone-alerts", labelKey: "footerUptimeRobotPhoneAlerts" },
  { href: "/faq", labelKey: "footerFaq" },
  { href: "/blog", labelKey: "footerBlog" },
];

const COMPARISON: { ours: MsgKey; theirs: MsgKey }[] = [
  { ours: "compareOurs1", theirs: "compareTheirs1" },
  { ours: "compareOurs2", theirs: "compareTheirs2" },
  { ours: "compareOurs3", theirs: "compareTheirs3" },
];

export type LandingQuery = {
  auth?: string;
  reason?: string;
  error?: string;
  error_code?: string;
  error_description?: string;
  billing?: string;
  why?: string;
  hint?: string;
};

function billingFailedKey(why?: string): MsgKey {
  if (why === "secret") return "billingFailedSecret";
  if (why === "start") return "billingFailedStart";
  if (why === "network") return "billingFailedNetwork";
  if (why === "token") return "billingFailedToken";
  if (why === "finish") return "billingFailedFinish";
  return "billingFailedDefault";
}

function billingDeclinedKey(why?: string): MsgKey {
  if (why === "max_amount") return "billingDeclinedMaxAmount";
  if (why === "max_daily_amount") return "billingDeclinedMaxDailyAmount";
  if (why === "max_daily_count") return "billingDeclinedMaxDailyCount";
  return "billingDeclinedDefault";
}

export function LandingClient({
  auth,
  reason,
  error,
  error_code,
  error_description,
  billing,
  why,
  hint,
}: LandingQuery) {
  const { t, locale } = useLanguage();
  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriod>("monthly");
  const [chileMonto, setChileMonto] = useState(PLAN_CHILE_CLP);
  const [chileOff, setChileOff] = useState(false);
  const [intlMonto, setIntlMonto] = useState(PLAN_INTL_USD_CENTS);
  const [intlOff, setIntlOff] = useState(false);
  const isAnnual = billingPeriod === "annual";
  const basicInClp = locale === "es";
  const basicListAmount = basicInClp ? PLAN_BASIC_CLP : PLAN_BASIC_USD_CENTS;
  const basicDisplayAmount = withBillingPeriod(
    basicListAmount,
    billingPeriod
  );
  const chileDisplayPrice = withBillingPeriod(chileMonto, billingPeriod);
  const intlDisplayPrice = withBillingPeriod(intlMonto, billingPeriod);
  const onChileQuote = useCallback((monto: number, valido: boolean) => {
    setChileMonto(monto);
    setChileOff(valido);
  }, []);
  const onIntlQuote = useCallback((monto: number, valido: boolean) => {
    setIntlMonto(monto);
    setIntlOff(valido);
  }, []);
  const oauthReason = (
    reason ||
    error_description?.replace(/\+/g, " ") ||
    error_code ||
    error ||
    ""
  ).trim();
  const showAuthError = auth === "error" || Boolean(error || error_description);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-b border-zinc-800/80 px-4 py-5 sm:px-6">
        <BrandLogo href="/" />
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="#modelo"
            className="hidden text-sm text-zinc-400 transition hover:text-zinc-50 sm:inline"
          >
            {t("navModel")}
          </a>
          <a
            href="#precios"
            className="text-sm text-zinc-400 transition hover:text-zinc-50"
          >
            {t("navPricing")}
          </a>
          <LanguageToggle />
          <GitHubLoginButton
            className="h-9 rounded-md px-3 py-0 text-xs sm:text-sm"
            label={t("signInGithub")}
          />
        </div>
      </nav>

      {auth === "required" && (
        <p className="relative z-10 mx-auto max-w-6xl px-4 py-3 text-sm text-amber-400 sm:px-6">
          {t("authRequired")}
        </p>
      )}
      {billing === "failed" && (
        <p className="relative z-10 mx-auto max-w-6xl px-4 py-3 text-sm text-red-400 sm:px-6">
          {t(billingFailedKey(why))}
          {why === "start" && hint ? (
            <span className="mt-1 block font-mono text-xs text-zinc-500">
              {hint}
            </span>
          ) : null}
        </p>
      )}
      {billing === "declined" && (
        <p className="relative z-10 mx-auto max-w-6xl px-4 py-3 text-sm text-red-400 sm:px-6">
          {t(billingDeclinedKey(why))}
          {hint ? (
            <span className="mt-1 block font-mono text-xs text-zinc-500">
              {hint}
            </span>
          ) : null}
        </p>
      )}
      {billing === "unconfigured" && (
        <p className="relative z-10 mx-auto max-w-6xl px-4 py-3 text-sm text-amber-400 sm:px-6">
          {t("billingUnconfigured")}
        </p>
      )}
      {showAuthError && (
        <p className="relative z-10 mx-auto max-w-6xl px-4 py-3 text-sm text-red-400 sm:px-6">
          {t("authError")}
          {oauthReason ? (
            <span className="mt-1 block font-mono text-xs text-zinc-500">
              {oauthReason}
            </span>
          ) : null}
        </p>
      )}

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20">
        <p className="mb-5 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
          {t("heroEyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.5rem]">
          {t("heroTitle")}{" "}
          <span className="text-zinc-400">{t("heroTitleAccent")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {t("heroBody")}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <GitHubLoginButton label={t("startFreeTrial")} />
          <Link
            href="/webhook-to-phone-call"
            className="inline-flex h-12 items-center rounded-md border border-zinc-800 bg-zinc-950 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
          >
            {t("seeHowItWorks")}
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-zinc-500">
          {t("integrationsMention")}
        </p>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 border-y border-zinc-800 bg-zinc-950 py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
            {t("howItWorksTitle")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
            {t("howItWorksBody")}
          </p>
          <ol className="mt-10 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            {HOW_IT_WORKS_STEPS.map((stepKey, index) => (
              <li key={stepKey} className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-100">
                  {t(stepKey)}
                </span>
                {index < HOW_IT_WORKS_STEPS.length - 1 ? (
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
        </div>
      </section>

      <section className="relative z-10 bg-zinc-950 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
            {t("ackSectionTitle")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {t("ackSectionBody")}
          </p>
        </div>
      </section>

      <section
        id="modelo"
        className="relative z-10 border-y border-zinc-800 bg-zinc-950 py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                {t("modelTitle")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {t("modelBody")}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                {t("pagerDutyLine")}
              </p>
            </div>
            <ul className="space-y-3">
              {COMPARISON.map((row) => (
                <li
                  key={row.ours}
                  className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-2"
                >
                  <p className="flex gap-2 text-sm text-zinc-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {t(row.ours)}
                  </p>
                  <p className="text-sm text-zinc-500">{t(row.theirs)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-label="Viberank"
        className="relative z-10 bg-zinc-950 pb-4 pt-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <figure className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-[0_0_48px_-16px_rgba(34,197,94,0.35)] sm:p-10">
            <p className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              {t("viberankBadge")}
            </p>
            <blockquote className="relative mt-6">
              <Quote
                aria-hidden
                className="absolute -left-1 -top-1 h-8 w-8 text-accent/25"
              />
              <p className="pl-8 text-base leading-relaxed text-zinc-200 sm:text-lg">
                {t("viberankQuote")}
              </p>
            </blockquote>
            <figcaption className="mt-6 pl-8 text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">
                {t("viberankAttribution")}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="precios" className="relative z-10 bg-zinc-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-50">
            {t("pricingTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-500">
            {t("pricingSubtitle")}
          </p>

          <div
            className="mx-auto mt-8 flex w-fit items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1"
            role="group"
            aria-label={`${t("billingMonthly")} / ${t("billingAnnual")}`}
          >
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={
                billingPeriod === "monthly"
                  ? "rounded-md bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950"
                  : "rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              }
            >
              {t("billingMonthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("annual")}
              className={
                billingPeriod === "annual"
                  ? "rounded-md bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950"
                  : "rounded-md px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              }
            >
              {t("billingAnnual")}
              <span className="ml-1.5 text-xs font-semibold text-accent">
                ({t("billingAnnualSave")})
              </span>
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-4">
            <article className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {t("planTrial")}
              </p>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">
                $0
                <span className="ml-1 text-base font-normal text-zinc-500">
                  USD
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {t("planTrialBody")}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planTrialFeat1")}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planTrialFeat2")}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planTrialFeat3")}
                </li>
              </ul>
              <div className="mt-8 space-y-3">
                <GitHubLoginButton
                  className="h-11 w-full rounded-md bg-zinc-50 text-zinc-950 hover:bg-white"
                  label={t("tryFreeTrial")}
                />
                <p className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-accent">
                  {t("planTrialHook")}
                </p>
              </div>
            </article>

            <article className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {t("planBasic")}
              </p>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">
                {isAnnual ? (
                  <>
                    <span className="mr-2 text-2xl font-normal text-zinc-600 line-through">
                      {basicInClp
                        ? formatClp(PLAN_BASIC_CLP)
                        : formatUsdFromCents(PLAN_BASIC_USD_CENTS)}
                    </span>
                    {basicInClp
                      ? formatClp(basicDisplayAmount)
                      : formatUsdFromCents(basicDisplayAmount)}
                  </>
                ) : basicInClp ? (
                  formatClp(PLAN_BASIC_CLP)
                ) : (
                  formatUsdFromCents(PLAN_BASIC_USD_CENTS)
                )}
                <span className="ml-1 text-base font-normal text-zinc-500">
                  {t("planBasicPer")}
                </span>
              </p>
              {isAnnual ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {t("billingBilledAnnually")}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {t("planBasicBody")}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planBasicFeat1")}
                </li>
                <li className="flex gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planBasicFeat2")}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planBasicFeat3")}
                </li>
              </ul>
              <div className="mt-8">
                <ProChileCheckout
                  product="basic"
                  variant="landing"
                  billingPeriod={billingPeriod}
                />
              </div>
            </article>

            <article className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {t("planChile")}
              </p>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">
                {chileOff || isAnnual ? (
                  <>
                    <span className="mr-2 text-2xl font-normal text-zinc-600 line-through">
                      {formatClp(PLAN_CHILE_CLP)}
                    </span>
                    {formatClp(chileDisplayPrice)}
                  </>
                ) : (
                  formatClp(PLAN_CHILE_CLP)
                )}
                <span className="ml-1 text-base font-normal text-zinc-500">
                  {t("planChilePer")}
                </span>
              </p>
              {isAnnual ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {t("billingBilledAnnually")}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {t("planChileBody")}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planChileFeat1")}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planChileFeat2")}
                </li>
                <li className="flex gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planChileFeat3")}
                </li>
                <li className="flex gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planChileFeat4")}
                </li>
              </ul>
              <div className="mt-8">
                <ProChileCheckout
                  variant="landing"
                  billingPeriod={billingPeriod}
                  onQuoteChange={onChileQuote}
                />
              </div>
            </article>

            <article className="relative flex flex-col rounded-xl border border-accent/40 bg-zinc-950 p-6 shadow-glow">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                {t("planIntl")}
              </p>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-tight">
                {intlOff || isAnnual ? (
                  <>
                    <span className="mr-2 text-2xl font-normal text-zinc-600 line-through">
                      {formatUsdFromCents(PLAN_INTL_USD_CENTS)}
                    </span>
                    {formatUsdFromCents(intlDisplayPrice)}
                  </>
                ) : (
                  formatUsdFromCents(PLAN_INTL_USD_CENTS)
                )}
                <span className="ml-1 text-base font-normal text-zinc-500">
                  {t("planIntlPer")}
                </span>
              </p>
              {isAnnual ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {t("billingBilledAnnually")}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {t("planIntlBody")}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planIntlFeat1")}
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planIntlFeat2")}
                </li>
                <li className="flex gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planIntlFeat3")}
                </li>
                <li className="flex gap-2">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {t("planIntlFeat4")}
                </li>
              </ul>
              <IntlProCheckout
                billingPeriod={billingPeriod}
                onQuoteChange={onIntlQuote}
              />
            </article>
          </div>

          <article className="mt-5 flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {t("planEnt")}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
                {t("planEntPrice")}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                {t("planEntBody")}
              </p>
            </div>
            <a
              href={ENTERPRISE_MAILTO}
              className="mt-6 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-5 text-sm font-semibold text-zinc-50 transition hover:border-zinc-500 hover:bg-zinc-800 sm:mt-0"
            >
              {t("contactSales")}
              <Mail className="h-4 w-4" />
            </a>
          </article>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-zinc-600">
            {t("pricingFoot")}
          </p>
        </div>
      </section>

      <section className="relative z-10 border-t border-zinc-800 py-14">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-50">
              {t("ctaTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Webhook:{" "}
              <code className="font-mono text-zinc-400">
                api.wakeupdev.com/v1/alert
              </code>
            </p>
          </div>
          <GitHubLoginButton
            className="inline-flex"
            label={t("startFreeTrial")}
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-800 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div>
            <BrandLogo href="/" className="w-fit" />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-zinc-500">
              {t("footerTagline")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="https://launchbuff.com/products/wakeup-dev-ugijq1"
                title="Featured on LaunchBuff"
                className="inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://launchbuff.com/badge-featured-light.svg"
                  alt="Featured on LaunchBuff"
                  width={160}
                />
              </a>
              <a
                href="https://fazier.com/launches/wakeupdev.com"
                title="Fazier"
                className="inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://fazier.com/api/v1/public/badges/launch_badges.svg?badge_type=launched&theme=light"
                  width={120}
                  alt="Fazier badge"
                />
              </a>
            </div>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-zinc-400">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-zinc-50"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mx-auto mt-10 max-w-6xl border-t border-zinc-700 bg-zinc-900 px-4 py-5 text-center text-sm leading-relaxed text-zinc-300 sm:px-6">
          {t("footerLegal")}
        </p>
      </footer>
    </main>
  );
}
