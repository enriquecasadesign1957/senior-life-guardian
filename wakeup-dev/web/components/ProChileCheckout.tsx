"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { formatClp, normalizeCuponCode, PLAN_CHILE_CLP } from "@/lib/planChile";
import { useCuponQuote } from "@/lib/useCuponQuote";

type Props = {
  variant: "dashboard" | "landing";
  onQuoteChange?: (montoClp: number, valido: boolean) => void;
};

export function ProChileCheckout({ variant, onQuoteChange }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const { quote, checking } = useCuponQuote(code, "chile");
  const normalized = normalizeCuponCode(code);
  const showInvalid = normalized.length >= 4 && !checking && !quote.valido;

  useEffect(() => {
    onQuoteChange?.(quote.monto_clp, quote.valido);
  }, [onQuoteChange, quote.monto_clp, quote.valido]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function activateDashboard() {
    const cupon = normalized;
    const qs = cupon ? `?cupon=${encodeURIComponent(cupon)}` : "";
    window.location.href = `/billing/transbank/start${qs}`;
  }

  const buttonClass =
    variant === "landing"
      ? "inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-50 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-white"
      : "inline-flex w-full items-center justify-center rounded-md border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900";

  const label =
    variant === "landing"
      ? t("activateProChileShort")
      : quote.valido
        ? t("activateProChilePrice", { price: formatClp(quote.monto_clp) })
        : t("activateProChile");

  const couponField = (
    <label className="block">
      <span className="mb-1.5 block text-xs text-zinc-500">
        {t("couponPrompt")}
      </span>
      <input
        type="text"
        name="cupon"
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
      {quote.valido && quote.porcentaje != null ? (
        <p className="mt-2 text-xs text-accent">
          {t("couponApplied", {
            code: quote.codigo ?? normalized,
            pct: quote.porcentaje,
            price: formatClp(quote.monto_clp),
            full: formatClp(PLAN_CHILE_CLP),
          })}
        </p>
      ) : null}
      {showInvalid ? (
        <p className="mt-2 text-xs text-zinc-500">{t("couponInvalid")}</p>
      ) : null}
    </label>
  );

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() =>
          variant === "landing" ? setOpen(true) : activateDashboard()
        }
        className={buttonClass}
      >
        {label}
      </button>

      {variant === "dashboard" ? (
        <div className="mt-3">{couponField}</div>
      ) : null}

      {variant === "landing" && open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t("closeModal")}
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chile-checkout-title"
            className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-glow"
          >
            <h2
              id="chile-checkout-title"
              className="text-lg font-semibold tracking-tight"
            >
              {t("chileModalTitle")}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{t("chileModalBody")}</p>
            <form
              method="POST"
              action="/billing/transbank/start"
              className="mt-5 space-y-4"
            >
              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  {t("email")}
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none ring-accent focus:ring-1"
                />
              </label>
              {couponField}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-zinc-50 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white"
                >
                  {t("proceedToPay")}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-800 px-4 text-sm text-zinc-300 transition hover:bg-zinc-900"
                >
                  {t("closeModal")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
