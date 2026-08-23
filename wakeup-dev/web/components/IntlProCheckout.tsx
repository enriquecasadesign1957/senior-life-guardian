"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatUsdFromCents,
  lemonCheckoutUrl,
  normalizeCuponCode,
  PLAN_INTL_USD_CENTS,
} from "@/lib/planChile";
import { useCuponQuote } from "@/lib/useCuponQuote";

type Props = {
  onQuoteChange?: (montoCents: number, valido: boolean) => void;
};

export function IntlProCheckout({ onQuoteChange }: Props) {
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const { quote, checking } = useCuponQuote(code, "internacional");
  const normalized = normalizeCuponCode(code);
  const showInvalid = normalized.length >= 4 && !checking && !quote.valido;
  const href = lemonCheckoutUrl(
    quote.valido ? quote.codigo ?? normalized : null
  );

  useEffect(() => {
    onQuoteChange?.(quote.monto_clp, quote.valido);
  }, [onQuoteChange, quote.monto_clp, quote.valido]);

  return (
    <div className="mt-8 w-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-zinc-950 transition hover:bg-accent-dim"
      >
        {t("payLemon")}
        <ArrowUpRight className="h-4 w-4" />
      </a>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs text-zinc-500">
          {t("couponPrompt")}
        </span>
        <input
          type="text"
          value={code}
          autoComplete="off"
          spellCheck={false}
          maxLength={32}
          onChange={(e) => setCode(e.target.value)}
          className={cn(
            "w-full rounded-md border bg-zinc-950 px-3 py-2 font-mono text-sm uppercase tracking-wide text-zinc-50 outline-none ring-accent focus:ring-1",
            quote.valido ? "border-accent/50" : "border-zinc-800"
          )}
        />
      </label>
      {quote.valido && quote.porcentaje != null ? (
        <p className="mt-2 text-xs text-accent">
          {t("couponApplied", {
            code: quote.codigo ?? normalized,
            pct: quote.porcentaje,
            price: formatUsdFromCents(quote.monto_clp),
            full: formatUsdFromCents(PLAN_INTL_USD_CENTS),
          })}
        </p>
      ) : null}
      {showInvalid ? (
        <p className="mt-2 text-xs text-zinc-500">{t("couponInvalid")}</p>
      ) : null}
    </div>
  );
}
