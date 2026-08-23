"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("languageToggle")}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/70 px-1.5 py-1 text-[11px] font-semibold tracking-wide",
        className
      )}
    >
      <span aria-hidden className="px-0.5 text-sm leading-none">
        🌐
      </span>
      <button
        type="button"
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={cn(
          "rounded px-1.5 py-0.5 font-mono transition",
          locale === "es"
            ? "bg-zinc-800 text-accent"
            : "text-zinc-500 hover:text-zinc-200"
        )}
      >
        ES
      </button>
      <span className="text-zinc-700" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded px-1.5 py-0.5 font-mono transition",
          locale === "en"
            ? "bg-zinc-800 text-accent"
            : "text-zinc-500 hover:text-zinc-200"
        )}
      >
        EN
      </button>
    </div>
  );
}
