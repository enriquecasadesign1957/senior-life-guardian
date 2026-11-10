"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";

type TrialStatus = {
  active?: boolean;
  seats?: number;
  used?: number;
  remaining?: number;
  error?: { message?: string };
};

export function AgencyTrialPanel() {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/agency/trial");
        const body = (await response.json()) as TrialStatus;
        if (!cancelled && response.ok) setStatus(body);
      } catch {
        // ignore: panel still allows activation
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function activate() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/agency/trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json()) as TrialStatus & { activated?: boolean };
      if (!response.ok) {
        setMessage(body?.error?.message ?? t("trialError"));
        return;
      }
      setStatus(body);
      setMessage(
        t("trialReady", {
          remaining: body.remaining ?? 0,
          seats: body.seats ?? 5,
        }),
      );
    } catch {
      setMessage(t("trialError"));
    } finally {
      setPending(false);
    }
  }

  if (status?.active) {
    return (
      <div className="rounded-3xl border-2 border-pine bg-white p-6 sm:p-8">
        <p className="text-sm font-medium text-pine">{t("trialActiveBadge")}</p>
        <h3 className="mt-2 text-2xl">{t("trialActiveTitle")}</h3>
        <p className="mt-3 text-stone-700">
          {t("trialUsage", {
            used: status.used ?? 0,
            remaining: status.remaining ?? 0,
            seats: status.seats ?? 5,
          })}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">{t("trialActiveBody")}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/agencia/entrar" className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
            {t("trialSaveAccount")}
          </a>
          <a href="/mis-sitios" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
            {t("trialViewSites")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-pine bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-pine">{t("trialNew")}</p>
      <h3 className="mt-2 text-2xl">{t("trialTitle")}</h3>
      <p className="mt-3 text-stone-700">
        {t("trialBodyBefore")}{" "}
        <a href="/mis-sitios" className="underline underline-offset-4">
          {t("trialBodyLink")}
        </a>
        {t("trialBodyAfter")}
      </p>
      <label className="mt-6 block text-sm text-stone-600" htmlFor="agency-trial-code">
        {t("trialCodeLabel")}
      </label>
      <input
        id="agency-trial-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
        placeholder={t("trialCodePlaceholder")}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={activate}
        disabled={pending || code.trim().length < 4}
        className="mt-4 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? t("trialActivating") : t("trialActivate")}
      </button>
      {message ? (
        <p className="mt-3 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : (
        <p className="mt-3 text-xs text-stone-500">{t("trialHint")}</p>
      )}
    </div>
  );
}
