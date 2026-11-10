"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("languageToggle")}
      className={`inline-flex items-center gap-0.5 rounded-full border border-stone-300 bg-white px-1.5 py-1 text-[11px] font-semibold tracking-wide ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={`rounded-full px-2 py-0.5 font-mono transition ${
          locale === "es" ? "bg-ink text-white" : "text-stone-500 hover:text-ink"
        }`}
      >
        ES
      </button>
      <span className="text-stone-300" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2 py-0.5 font-mono transition ${
          locale === "en" ? "bg-ink text-white" : "text-stone-500 hover:text-ink"
        }`}
      >
        EN
      </button>
    </div>
  );
}
