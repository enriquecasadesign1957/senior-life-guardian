"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export function GraciasClaim() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const email = (params.get("email") ?? "").trim().toLowerCase();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  if (!email) return null;

  async function claim() {
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/auth/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="text-sm font-medium text-zinc-200">{t("claimTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {t("claimBody", { email })}
      </p>
      {sent ? (
        <p className="mt-4 text-sm text-accent">{t("claimSent")}</p>
      ) : (
        <button
          type="button"
          onClick={() => void claim()}
          disabled={sending}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-zinc-950 transition hover:bg-accent-dim disabled:opacity-60"
        >
          {sending ? t("claimSending") : t("claimCta")}
        </button>
      )}
      {error ? (
        <p className="mt-3 text-xs text-red-400">{t("claimError")}</p>
      ) : null}
    </div>
  );
}
