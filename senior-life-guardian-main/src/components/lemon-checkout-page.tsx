import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { lemonCheckoutUrl } from "@/lib/market";
import {
  ANNUAL_SAVINGS_CRO_CLP,
  PLAN,
  formatPlanPrice,
  yearlyEquivalentMonthly,
} from "@/lib/plans";

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";

/** Checkout de alarmaseniorsafe.com. El cobro ocurre en Lemon Squeezy, no en Transbank. */
export function LemonCheckoutPage() {
  const search = useSearch({ from: "/checkout" });
  const [yearly, setYearly] = useState(search.periodo === "anual");
  const periodo = yearly ? "anual" : "mensual";
  const price = yearly ? PLAN.yearly : PLAN.monthly;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="max-w-lg mx-auto px-6 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: PETROL }}>
            <Lock className="w-4 h-4" />
            Pago seguro con Lemon Squeezy · USD
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contratar Plan Único</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            El cobro es en dólares, en la pasarela de Lemon Squeezy. Puedes pagar con tarjeta
            internacional. Este sitio no pide los datos de la tarjeta.
          </p>

          <div className="mt-8 inline-flex items-center bg-white rounded-full p-1.5 shadow-md border border-border">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${!yearly ? "text-white" : "text-foreground/60"}`}
              style={!yearly ? { background: DEEP } : undefined}
            >
              Mensual · ${formatPlanPrice(PLAN.monthly)} USD
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition ${yearly ? "text-white" : "text-foreground/60"}`}
              style={yearly ? { background: DEEP } : undefined}
            >
              Anual · ${formatPlanPrice(PLAN.yearly)} USD
            </button>
          </div>

          <div
            className="mt-8 rounded-3xl p-8 text-white shadow-xl"
            style={{ background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">{PLAN.displayName}</p>
            <p className="mt-1 text-lg font-semibold">{yearly ? "Plan anual" : "Plan mensual"}</p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">${formatPlanPrice(price)}</span>
              <span className="text-white/80">USD/{yearly ? "año" : "mes"}</span>
            </div>
            {yearly ? (
              <p className="mt-2 text-sm font-semibold text-[#a7f3d0]">
                {PLAN.yearlySavingsLabel} · equivale a ${formatPlanPrice(yearlyEquivalentMonthly())} USD/mes.
                Ahorras ${formatPlanPrice(ANNUAL_SAVINGS_CRO_CLP)} USD al año.
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/80">
                Anual ${formatPlanPrice(PLAN.yearly)} USD — {PLAN.yearlySavingsLabel.toLowerCase()}.
              </p>
            )}

            <a
              href={lemonCheckoutUrl(periodo)}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-base bg-white transition hover:scale-[1.02]"
              style={{ color: DEEP }}
            >
              Pagar con Lemon Squeezy
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mt-4 text-xs text-white/75 leading-relaxed">
              Al continuar sales de alarmaseniorsafe.com hacia el checkout de Lemon Squeezy del plan{" "}
              {yearly ? "anual ($89 USD)" : "mensual ($8.90 USD)"}.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
