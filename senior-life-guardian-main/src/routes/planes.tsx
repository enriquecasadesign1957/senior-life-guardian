import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { TrustStackChileno } from "@/components/trust-stack-chileno";
import {
  PLAN,
  checkoutUrl,
  formatPlanPrice,
  yearlyEquivalentMonthly,
} from "@/lib/plans";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Plan Único — Alarma Senior Safe" },
      { name: "description", content: "Plan Único Senior Safe: $6.900/mes o $69.000/año (ahorras 2 meses). Sin permanencia, pago seguro Webpay y soporte 24/7." },
      { property: "og:title", content: "Plan Único Senior Safe" },
      { property: "og:description", content: "Protección completa para tu familia. Mensual o anual con ahorro de 2 meses." },
    ],
  }),
  component: PlanesPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

function PlanesPage() {
  const [yearly, setYearly] = useState(false);
  const price = yearly ? PLAN.yearly : PLAN.monthly;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 100%)` }}>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-5">
              <Sparkles className="w-4 h-4" /> Sin permanencia · Cancela cuando quieras
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              {PLAN.displayName}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
              {PLAN.tagline} Activa la protección en menos de 2 minutos.
            </p>

            <div className="mt-9 inline-flex items-center bg-white rounded-full p-1.5 shadow-xl">
              <button
                onClick={() => setYearly(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${!yearly ? "text-white" : "text-foreground/60"}`}
                style={!yearly ? { background: DEEP } : undefined}
              >
                Mensual · ${formatPlanPrice(PLAN.monthly)}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${yearly ? "text-white" : "text-foreground/60"}`}
                style={yearly ? { background: DEEP } : undefined}
              >
                Anual · ${formatPlanPrice(PLAN.yearly)}
                <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: GREEN }}>
                  {PLAN.yearlySavingsLabel.toUpperCase()}
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 -mt-10">
          <div className="max-w-lg mx-auto px-6">
            <div
              className="relative rounded-3xl p-8 md:p-10 text-white shadow-2xl transition hover:-translate-y-1"
              style={{ background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: GREEN }}>
                PLAN OFICIAL
              </div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] mb-2 text-white/70">
                {PLAN.displayName}
              </div>
              <h3 className="text-2xl font-bold mb-1 text-white">{PLAN.tagline}</h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                  ${formatPlanPrice(price)}
                </span>
                <span className="text-white/70">/{yearly ? "año" : "mes"}</span>
              </div>
              {yearly ? (
                <div className="mt-2 text-sm font-semibold text-[#a7f3d0]">
                  {PLAN.yearlySavingsLabel} · equivale a ${formatPlanPrice(yearlyEquivalentMonthly())}/mes
                </div>
              ) : (
                <div className="mt-2 text-sm text-white/80">
                  Anual ${formatPlanPrice(PLAN.yearly)} — {PLAN.yearlySavingsLabel.toLowerCase()}
                </div>
              )}

              <div className="mt-7">
                <a
                  href={checkoutUrl({ periodo: yearly ? "anual" : "mensual" })}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-base transition hover:scale-[1.02] bg-white"
                  style={{ color: DEEP }}
                >
                  Contratar con Webpay Plus
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <TrustStackChileno className="mt-6" variant="onDark" />

              <ul className="mt-8 space-y-3.5">
                {PLAN.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#a7f3d0]" />
                    <span className="text-sm leading-relaxed text-white/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="max-w-lg mx-auto px-6 mt-10">
            <p className="text-center text-sm text-muted-foreground">
              ¿Dudas? <Link to="/" hash="contacto" className="font-semibold" style={{ color: DEEP }}>Contáctanos</Link> y te ayudamos.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
