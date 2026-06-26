import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import {
  CreditCard, ShieldCheck, UserPlus, Clock, Mail, MessageCircle,
  Sparkles, Users, Bell, CheckCircle2, Loader2, ArrowRight, Heart,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/flujo")({
  head: () => ({
    meta: [
      { title: "Flujo de activación — Senior Safe" },
      { name: "description", content: "Mira cómo Senior Safe activa tu protección: pago Webpay, cuenta, entrenamiento simulado y onboarding." },
    ],
  }),
  component: FlujoPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";
const AMBER = "#f59e0b";

type Phase = "activando" | "configurando" | "protegido";

const STEPS = [
  { icon: CreditCard, color: DEEP,    title: "Contratas tu plan",            desc: "Activas el Plan Único Senior Safe en el sitio." },
  { icon: ShieldCheck, color: PETROL, title: "Webpay confirma el pago",      desc: "Pago seguro en pesos chilenos." },
  { icon: UserPlus,   color: PETROL,  title: "Cuenta creada automáticamente",desc: "Sin formularios complejos." },
  { icon: Clock,      color: AMBER,   title: "Mock de entrenamiento",        desc: "Practica el botón de pánico sin alertas reales." },
  { icon: Mail,       color: AMBER,   title: "Email de bienvenida enviado",  desc: "Recibes accesos e instrucciones." },
  { icon: MessageCircle, color: GREEN,title: "WhatsApp de confirmación",     desc: "Tu familia queda informada al instante." },
  { icon: Sparkles,   color: GREEN,   title: "Accedes al onboarding",        desc: "Guía paso a paso, simple y visual." },
  { icon: Users,      color: GREEN,   title: "Configuras a tus familiares",  desc: "Los conectas en menos de 2 minutos." },
  { icon: Bell,       color: RED,     title: "Pruebas el botón de emergencia", desc: "Confirmas que todo funciona." },
];

const PHASES: { key: Phase; label: string; range: [number, number]; color: string }[] = [
  { key: "activando",    label: "Activando",    range: [0, 3], color: PETROL },
  { key: "configurando", label: "Configurando", range: [4, 6], color: AMBER },
  { key: "protegido",    label: "Protegido",    range: [7, 8], color: GREEN },
];

function FlujoPage() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (current >= STEPS.length - 1) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 1400);
    return () => clearTimeout(t);
  }, [current, playing]);

  const phase = PHASES.find((p) => current >= p.range[0] && current <= p.range[1]) ?? PHASES[0];
  const progress = ((current + 1) / STEPS.length) * 100;
  const done = current === STEPS.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">

          {/* Header */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>
              <Sparkles className="w-4 h-4" /> Onboarding automático
            </div>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Tu protección, lista en minutos.
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Mira cómo Senior Safe activa tu cuenta y conecta a tu familia paso a paso.
            </p>
          </div>

          {/* Phase indicator */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PHASES.map((p) => {
              const active = phase.key === p.key;
              const passed = current > p.range[1];
              return (
                <div
                  key={p.key}
                  className={`rounded-2xl p-4 border-2 transition ${active ? "shadow-md" : ""}`}
                  style={{
                    borderColor: active || passed ? p.color : "var(--border)",
                    background: active ? `color-mix(in oklab, ${p.color} 8%, white)` : "white",
                  }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: active || passed ? p.color : undefined }}>
                    {passed ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 rounded-full border-2 border-border" />}
                    Fase {PHASES.indexOf(p) + 1}
                  </div>
                  <div className={`mt-1 font-bold ${active || passed ? "text-foreground" : "text-muted-foreground"}`}>{p.label}</div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-bold text-foreground">Paso {current + 1} de {STEPS.length}</span>
              <span className="text-2xl font-bold tracking-tight" style={{ color: phase.color }}>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PETROL}, ${phase.color})` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setPlaying((p) => !p)} className="text-xs font-bold px-3 py-1.5 rounded-full border border-border hover:bg-muted transition" style={{ color: DEEP }}>
                {playing ? "Pausar" : "Reanudar"}
              </button>
              <button onClick={() => { setCurrent(0); setPlaying(true); }} className="text-xs font-bold px-3 py-1.5 rounded-full border border-border hover:bg-muted transition" style={{ color: DEEP }}>
                Reiniciar
              </button>
            </div>
          </div>

          {/* Steps timeline */}
          <ol className="relative">
            <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-border" aria-hidden />
            {STEPS.map((s, i) => {
              const active = i === current;
              const isDone = i < current;
              const pending = i > current;
              return (
                <li key={i} className="relative pl-20 pr-2 py-3">
                  <div className="absolute left-0 top-3">
                    <div
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${active ? "scale-110" : ""} ${pending ? "opacity-40" : ""}`}
                      style={{ background: isDone ? GREEN : s.color }}
                    >
                      {isDone ? <CheckCircle2 className="w-7 h-7" /> : <s.icon className="w-7 h-7" />}
                      {active && (
                        <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: `${s.color}55` }} />
                      )}
                    </div>
                  </div>

                  <div className={`bg-card border rounded-2xl p-5 transition-all ${active ? "shadow-lg" : "shadow-sm"} ${pending ? "opacity-60" : ""}`} style={active ? { borderColor: s.color } : { borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold tracking-wider text-muted-foreground">PASO {i + 1}</span>
                        {active && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in oklab, ${s.color} 14%, white)`, color: s.color }}>
                            <Loader2 className="w-3 h-3 animate-spin" /> En curso
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
                            <CheckCircle2 className="w-3 h-3" /> Listo
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-1 text-lg md:text-xl font-bold text-foreground leading-snug">{s.title}</h3>
                    <p className="mt-1 text-sm md:text-base text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Final CTA */}
          {done && (
            <div className="mt-10 rounded-3xl p-8 md:p-10 text-white text-center shadow-2xl animate-fade-in" style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}>
              <Heart className="w-10 h-10 mx-auto mb-3" fill="currentColor" />
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Tu familia ya está protegida</h2>
              <p className="mt-2 text-white/85">Senior Safe activo · 24/7 · Sin permanencia.</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/checkout" search={{ mode: "contratar", plan: "unico", periodo: "mensual" }} className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white font-bold shadow-lg hover:scale-[1.02] transition" style={{ color: DEEP }}>
                  Contratar con Webpay
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/familia" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border-2 border-white/40 text-white font-bold hover:bg-white/10 transition">
                  Ver portal familia
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
