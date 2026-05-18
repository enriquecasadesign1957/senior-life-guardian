import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Shield, Clock, CreditCard, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/planes")({
  head: () => ({
    meta: [
      { title: "Planes — Alarma Senior Safe" },
      { name: "description", content: "Compara los planes Básico y Premium de Senior Safe. Sin permanencia, pago seguro Webpay y soporte 24/7." },
      { property: "og:title", content: "Planes Senior Safe — Básico y Premium" },
      { property: "og:description", content: "Elige el plan ideal para proteger a tu familia. Mensual o anual con ahorro." },
    ],
  }),
  component: PlanesPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

const plans = [
  {
    name: "Básico",
    tagline: "Protección esencial",
    monthly: 5900,
    yearly: 65000,
    features: [
      "Botón de emergencia",
      "Alertas por SMS",
      "Alertas por WhatsApp",
      "Ubicación GPS en tiempo real",
      "Llamada automática",
      "1 familiar conectado",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    tagline: "Tranquilidad total para toda la familia",
    monthly: 7900,
    yearly: 85000,
    features: [
      "Todo lo del plan Básico",
      "Múltiples familiares conectados",
      "Monitoreo de inactividad",
      "Historial completo de alertas",
      "Recordatorios inteligentes",
      "Soporte prioritario 24/7",
    ],
    highlight: true,
  },
];

function format(n: number) {
  return n.toLocaleString("es-CL");
}

function PlanesPage() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 100%)` }}>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-5">
              <Sparkles className="w-4 h-4" /> Sin permanencia · Cancela cuando quieras
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Un plan para cada familia.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto">
              Elige Básico o Premium. Activa la protección en menos de 2 minutos.
            </p>

            {/* Toggle */}
            <div className="mt-9 inline-flex items-center bg-white rounded-full p-1.5 shadow-xl">
              <button
                onClick={() => setYearly(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${!yearly ? "text-white" : "text-foreground/60"}`}
                style={!yearly ? { background: DEEP } : undefined}
              >
                Mensual
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${yearly ? "text-white" : "text-foreground/60"}`}
                style={yearly ? { background: DEEP } : undefined}
              >
                Anual
                <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: GREEN }}>
                  AHORRA 8%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 md:py-20 -mt-10">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-6">
            {plans.map((p) => {
              const price = yearly ? p.yearly : p.monthly;
              const savings = p.monthly * 12 - p.yearly;
              return (
                <div
                  key={p.name}
                  className={`relative rounded-3xl p-8 md:p-10 transition hover:-translate-y-1 ${
                    p.highlight
                      ? "text-white shadow-2xl border-0"
                      : "bg-card border border-border shadow-lg"
                  }`}
                  style={p.highlight ? { background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` } : undefined}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: GREEN }}>
                      MÁS ELEGIDO
                    </div>
                  )}
                  <div className={`text-sm font-bold uppercase tracking-[0.18em] mb-2 ${p.highlight ? "text-white/70" : ""}`} style={!p.highlight ? { color: PETROL } : undefined}>
                    Plan {p.name}
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${p.highlight ? "text-white" : "text-foreground"}`}>{p.tagline}</h3>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className={`text-5xl md:text-6xl font-bold tracking-tight ${p.highlight ? "text-white" : "text-foreground"}`}>
                      ${format(price)}
                    </span>
                    <span className={p.highlight ? "text-white/70" : "text-muted-foreground"}>
                      /{yearly ? "año" : "mes"}
                    </span>
                  </div>
                  {yearly && (
                    <div className={`mt-2 text-sm font-semibold ${p.highlight ? "text-[#a7f3d0]" : "text-[#16a34a]"}`}>
                      Ahorras ${format(savings)} al año
                    </div>
                  )}

                  <div className="mt-7 space-y-2.5">
                    <a
                      href={`/checkout?mode=trial&plan=${p.name.toLowerCase()}&periodo=${yearly ? "anual" : "mensual"}`}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-base transition hover:scale-[1.02] ${
                        p.highlight ? "bg-white" : "text-white"
                      }`}
                      style={p.highlight ? { color: DEEP } : { background: DEEP }}
                    >
                      Probar gratis 7 días
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href={`/checkout?mode=contratar&plan=${p.name.toLowerCase()}&periodo=${yearly ? "anual" : "mensual"}`}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm border-2 transition hover:scale-[1.02] ${
                        p.highlight ? "border-white/40 text-white" : ""
                      }`}
                      style={p.highlight ? undefined : { borderColor: GREEN, color: GREEN }}
                    >
                      Contratar ahora
                    </a>
                  </div>


                  <ul className="mt-8 space-y-3.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${p.highlight ? "text-[#a7f3d0]" : ""}`} style={!p.highlight ? { color: GREEN } : undefined} />
                        <span className={`text-sm leading-relaxed ${p.highlight ? "text-white/90" : "text-foreground"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div className="max-w-5xl mx-auto px-6 mt-14">
            <div className="bg-card border border-border rounded-3xl p-8 md:p-10 grid sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: DEEP }}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Webpay</div>
                  <div className="text-xs text-muted-foreground">Pago seguro en Chile</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: GREEN }}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Pago 100% seguro</div>
                  <div className="text-xs text-muted-foreground">Datos cifrados SSL</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PETROL }}>
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Soporte 24/7</div>
                  <div className="text-xs text-muted-foreground">Asistencia humana siempre</div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              ¿Dudas? <Link to="/" hash="contacto" className="font-semibold" style={{ color: DEEP }}>Contáctanos</Link> y te ayudamos a elegir.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
