import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  Mail, ArrowRight, Heart, AlertCircle, Users, Zap, Smartphone,
  Clock, Activity, Star, Accessibility, Home, Loader2,
  CircleDot, PhoneCall, Radio, Satellite, Navigation, Send,
} from "lucide-react";
import emergencyButton from "@/assets/emergency-button.jpg";
import seniorCouple from "@/assets/senior-couple.jpg";
import seniorPhone from "@/assets/senior-phone.jpg";
import logo from "@/assets/logo-senior-safe.png";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  PLAN,
  PLAN_KEY,
  checkoutUrl,
  formatPlanPrice,
  yearlyEquivalentMonthly,
} from "@/lib/plans";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alarma Senior Safe — Seguridad inteligente para adultos mayores" },
      { name: "description", content: "Protección inmediata para quienes más quieres. Botón de emergencia, GPS, WhatsApp, SMS y llamada automática conectados con la familia." },
      { property: "og:title", content: "Alarma Senior Safe — Más que una app, una red de cuidado" },
      { property: "og:description", content: "Conecta automáticamente a adultos mayores con sus familiares mediante alertas inteligentes." },
    ],
  }),
  component: Landing,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const RED = "#dc2626";
const GREEN = "#16a34a";

function HeroPhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[340px] lg:max-w-none lg:min-h-[480px] flex items-center justify-center py-8 lg:py-0">
      <div
        className="absolute w-[min(100%,320px)] aspect-square rounded-full bg-gradient-to-tr from-white/25 via-[#ffd66b]/20 to-emerald-400/25 blur-3xl animate-glow-pulse"
        aria-hidden
      />
      <div
        className="absolute w-[min(90%,260px)] aspect-[3/4] rounded-[3rem] bg-black/20 blur-2xl translate-y-8"
        aria-hidden
      />

      <div className="relative z-10 animate-float">
        <div className="relative w-[240px] sm:w-[270px] md:w-[300px] rounded-[2.75rem] border-[7px] border-white/25 bg-gradient-to-b from-slate-800/95 to-slate-950/95 p-2.5 shadow-hero-dynamic backdrop-blur-md ring-1 ring-white/20">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black/80 z-20" aria-hidden />
          <div className="relative rounded-[2.25rem] overflow-hidden bg-black aspect-[9/19.5] ring-1 ring-white/10">
            <img
              src={emergencyButton}
              alt="Pantalla Senior Safe con botón SOS"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
              <div
                className="mx-auto w-full max-w-[200px] py-4 rounded-2xl text-center font-bold text-white text-lg shadow-[0_0_40px_-8px_rgba(220,38,38,0.9)] border border-red-400/40 animate-pulse"
                style={{ background: `linear-gradient(180deg, ${RED}, #991b1b)` }}
              >
                SOS
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -top-5 -right-4 sm:-right-8 z-20 animate-float-delayed">
          <div className="bg-white rounded-2xl p-3 shadow-2xl ring-1 ring-white/50 border border-white/80">
            <img src={logo} alt="Senior Safe" className="h-12 sm:h-14 w-auto" />
          </div>
        </div>

        <div className="absolute -bottom-4 -left-6 sm:-left-10 z-20 bg-white/95 backdrop-blur-md text-foreground px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[220px] border border-white/60 animate-float-delayed">
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: RED }}>
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Respuesta</div>
            <div className="font-bold text-sm leading-tight">menos de 3 s</div>
          </div>
        </div>

        <div className="absolute top-1/3 -left-8 sm:-left-12 z-20 hidden sm:flex bg-white/95 backdrop-blur-md text-foreground p-2.5 rounded-xl shadow-xl items-center gap-2 border border-emerald-200/80">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: GREEN }}>
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold pr-1">Red activa</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 55%, oklch(0.5 0.14 235) 100%)` }}
    >
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-emerald-400/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70 mb-4 animate-fade-in">
            Alarma Senior Safe
          </p>
          <p className="text-xl md:text-2xl text-white/90 font-light italic mb-5 animate-fade-in" style={{ animationDelay: "80ms" }}>
            Seguridad inteligente para adultos mayores
          </p>
          <h1
            className="text-[36px] md:text-[52px] lg:text-[58px] font-bold leading-[1.06] tracking-tight animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            Protección inmediata <br />
            para quienes <span className="text-[#ffd66b] drop-shadow-sm">más quieres</span>.
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed max-w-xl animate-fade-in"
            style={{ animationDelay: "180ms" }}
          >
            Senior Safe conecta automáticamente a adultos mayores con sus familiares mediante alertas inteligentes, ubicación GPS, llamadas, SMS y WhatsApp.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "240ms" }}>
            <a
              href={checkoutUrl()}
              className="inline-flex items-center justify-center gap-3 px-7 py-5 rounded-full bg-white text-base font-bold shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300"
              style={{ color: DEEP }}
            >
              Contratar con Webpay
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/instalar-app?entrenamiento=1"
              className="inline-flex items-center justify-center gap-3 px-7 py-5 rounded-full text-base font-bold shadow-xl hover:scale-[1.03] transition-all duration-300 text-white ring-2 ring-white/20"
              style={{ background: GREEN }}
            >
              Ya tengo cuenta · Entrar
              <CheckCircle2 className="w-5 h-5" />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" /> Sin permanencia
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" /> Cancelación simple
            </div>
            <a href="#como" className="underline underline-offset-4 hover:text-white transition-colors">
              Cómo funciona
            </a>
          </div>
        </div>

        <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <HeroPhoneMockup />
        </div>
      </div>
    </section>
  );
}

function QueEs() {
  const items = [
    { icon: Bell, color: RED, title: "Botón de emergencia", desc: "Grande, visible y fácil de presionar." },
    { icon: Zap, color: "#f59e0b", title: "Alertas automáticas", desc: "WhatsApp, SMS y llamada en segundos." },
    { icon: MapPin, color: PETROL, title: "Ubicación GPS", desc: "Mapa con la ubicación exacta del usuario." },
    { icon: Users, color: GREEN, title: "Conexión familiar", desc: "Toda la familia recibe la alerta a la vez." },
    { icon: Smartphone, color: DEEP, title: "Facilidad de uso", desc: "Diseñado para adultos mayores: simple y claro." },
  ];
  return (
    <section id="que-es" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>¿Qué es?</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Una red de cuidado familiar, en un solo botón.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Alarma Senior Safe es una aplicación simple y segura que permite a los adultos mayores pedir ayuda en segundos, conectándose automáticamente con sus familiares.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {items.map((it) => (
            <div key={it.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: it.color }}>
                <it.icon className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-foreground mb-1.5">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full text-white font-bold text-lg" style={{ background: DEEP }}>
            <Heart className="w-5 h-5" fill="currentColor" />
            Todo funciona con un solo botón.
          </div>
        </div>
      </div>
    </section>
  );
}

function ParaQuien() {
  const cards = [
    { icon: Home, title: "Adultos mayores", desc: "Que viven solos y necesitan tranquilidad diaria." },
    { icon: Heart, title: "Familias", desc: "Que buscan saber que mamá o papá están bien." },
    { icon: Activity, title: "Asistencia rápida", desc: "Personas con condiciones médicas o riesgo de caídas." },
    { icon: Accessibility, title: "Movilidad reducida", desc: "Quienes necesitan ayuda inmediata en casa." },
  ];
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>¿Para quién es?</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Pensado para tu familia.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-2xl p-7 text-center hover:shadow-xl transition">
              <span className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white mb-5" style={{ background: PETROL }}>
                <c.icon className="w-7 h-7" />
              </span>
              <h3 className="font-bold text-foreground mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type TechVisual = "button" | "call" | "network" | "map";

const TECH_FEATURES: Array<{
  icon: typeof CircleDot;
  color: string;
  title: string;
  desc: string;
  spec: string;
  visual: TechVisual;
}> = [
  {
    icon: CircleDot,
    color: RED,
    title: "Botón Único",
    desc: "Un solo botón de emergencia, visible y accesible. Sin menús ni pasos extra: diseñado para activarse bajo estrés.",
    spec: "Activación en 1 toque",
    visual: "button",
  },
  {
    icon: PhoneCall,
    color: DEEP,
    title: "Llamada Express",
    desc: "Marcación automática prioritaria a los contactos de confianza. La llamada se dispara en paralelo a los otros canales.",
    spec: "Voz Twilio · prioridad alta",
    visual: "call",
  },
  {
    icon: Radio,
    color: GREEN,
    title: "WhatsApp / SMS Omnicanal",
    desc: "Mensajes simultáneos por WhatsApp y SMS de respaldo. Mismo contenido de alerta en todos los canales.",
    spec: "WhatsApp + SMS en segundos",
    visual: "network",
  },
  {
    icon: Satellite,
    color: PETROL,
    title: "GPS Satelital",
    desc: "Coordenadas en tiempo real adjuntas a cada alerta, con enlace directo a Google Maps para los guardianes.",
    spec: "Lat/lng + precisión",
    visual: "map",
  },
];

function TechFeatureVisual({ type, accent }: { type: TechVisual; accent: string }) {
  const frame =
    "relative w-full overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-background to-muted/40 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] aspect-[4/3] min-h-[240px] md:min-h-[280px] group-hover:shadow-xl transition-shadow duration-500";

  if (type === "button") {
    return (
      <div className={frame}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-slate-700/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end p-6 pb-8">
          <div
            className="w-[72%] max-w-[220px] aspect-square rounded-full flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-[0_0_60px_-10px_rgba(220,38,38,0.85)] border-4 border-red-300/50 animate-pulse"
            style={{ background: `radial-gradient(circle at 30% 25%, #fca5a5, ${RED} 45%, #7f1d1d)` }}
          >
            SOS
          </div>
          <p className="mt-5 text-xs text-white/70 font-medium tracking-wide">1 toque · sin menús</p>
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-white/90" />
        </div>
      </div>
    );
  }

  if (type === "call") {
    return (
      <div className={frame}>
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(circle at 50% 40%, ${accent}40, transparent 65%)` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {[1, 2, 3].map((ring) => (
              <span
                key={ring}
                className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{
                  borderColor: accent,
                  animationDuration: `${2 + ring * 0.6}s`,
                  animationDelay: `${ring * 0.35}s`,
                  margin: `-${ring * 14}px`,
                }}
              />
            ))}
            <span
              className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center text-white shadow-2xl"
              style={{ background: `linear-gradient(145deg, ${accent}, ${DEEP})` }}
            >
              <PhoneCall className="w-10 h-10 md:w-12 md:h-12" />
            </span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          {["G1", "G2", "G3"].map((g) => (
            <div key={g} className="flex-1 rounded-xl bg-card/90 backdrop-blur border border-border px-2 py-2 text-center text-[10px] font-bold text-foreground shadow-sm">
              {g} <span className="text-emerald-600">●</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "network") {
    const nodes = [
      { label: "Guardián 1", x: "12%", y: "18%", color: GREEN },
      { label: "Guardián 2", x: "78%", y: "22%", color: PETROL },
      { label: "Guardián 3", x: "50%", y: "8%", color: "#f59e0b" },
    ];
    return (
      <div className={frame}>
        <svg className="absolute inset-0 w-full h-full text-border" aria-hidden>
          <line x1="50%" y1="52%" x2="22%" y2="28%" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="opacity-60" />
          <line x1="50%" y1="52%" x2="82%" y2="30%" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="opacity-60" />
          <line x1="50%" y1="52%" x2="50%" y2="18%" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="opacity-60" />
        </svg>
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl border-2 border-white/30"
            style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
          >
            <Heart className="w-7 h-7 mb-1" fill="currentColor" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Senior</span>
          </div>
        </div>
        {nodes.map((n) => (
          <div
            key={n.label}
            className="absolute z-10 flex flex-col items-center gap-1"
            style={{ left: n.x, top: n.y, transform: "translate(-50%, -50%)" }}
          >
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white"
              style={{ background: n.color }}
            >
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground bg-card/90 px-2 py-0.5 rounded-full border border-border shadow-sm">
              {n.label}
            </span>
          </div>
        ))}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            <MessageCircle className="w-3.5 h-3.5" /> WA
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-900 border border-amber-200">
            <Mail className="w-3.5 h-3.5" /> SMS
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={frame}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-sky-50/50 to-slate-100/90" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.85 0.02 240 / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.85 0.02 240 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0">
        <div className="absolute top-[28%] left-[22%] w-16 h-10 rounded-lg bg-emerald-200/40 border border-emerald-300/50" />
        <div className="absolute top-[45%] right-[18%] w-20 h-14 rounded-lg bg-sky-200/40 border border-sky-300/50" />
        <div className="absolute bottom-[32%] left-[38%] w-24 h-12 rounded-lg bg-amber-100/50 border border-amber-200/60" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 flex flex-col items-center">
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white animate-bounce"
          style={{ background: RED, animationDuration: "2s" }}
        >
          <MapPin className="w-6 h-6" />
        </span>
        <span className="mt-1 w-3 h-1 rounded-full bg-black/20" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border p-3 shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          <Satellite className="w-3.5 h-3.5" style={{ color: accent }} />
          GPS en vivo
        </div>
        <p className="text-xs font-mono text-foreground">-33.4489, -70.6693</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Precisión ± 8 m · enlace Maps</p>
      </div>
    </div>
  );
}

function TechFeatureRow({
  feature,
  reverse,
  index,
}: {
  feature: (typeof TECH_FEATURES)[number];
  reverse: boolean;
  index: number;
}) {
  return (
    <article
      className={`group grid lg:grid-cols-2 gap-8 lg:gap-14 items-center ${index > 0 ? "mt-16 md:mt-24" : ""}`}
    >
      <div className={`space-y-5 ${reverse ? "lg:order-2" : "lg:order-1"}`}>
        <div className="inline-flex items-center gap-3">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{ background: feature.color }}
          >
            <feature.icon className="w-6 h-6" strokeWidth={2} />
          </span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
            style={{
              color: PETROL,
              borderColor: "color-mix(in oklab, var(--brand-petrol) 22%, transparent)",
              background: "color-mix(in oklab, var(--brand-petrol) 8%, white)",
            }}
          >
            {feature.spec}
          </span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{feature.title}</h3>
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg">{feature.desc}</p>
        <div
          className="h-1 w-16 rounded-full transition-all duration-500 group-hover:w-28"
          style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
        />
      </div>
      <div className={`${reverse ? "lg:order-1" : "lg:order-2"} transition-transform duration-500 group-hover:scale-[1.01]`}>
        <TechFeatureVisual type={feature.visual} accent={feature.color} />
      </div>
    </article>
  );
}

const FLOW_STEPS = [
  {
    n: 1,
    icon: Bell,
    color: RED,
    title: "Pulsación",
    desc: "El adulto mayor presiona el botón de emergencia en la app. La señal se registra al instante en la nube.",
    detail: "Menos de 1 segundo",
  },
  {
    n: 2,
    icon: Navigation,
    color: "#f59e0b",
    title: "Procesamiento GPS",
    desc: "El sistema captura y valida la ubicación satelital del dispositivo mientras prepara el mensaje de alerta.",
    detail: "Hasta 3 s de sincronización",
  },
  {
    n: 3,
    icon: Send,
    color: GREEN,
    title: "Alerta masiva a los 3 guardianes",
    desc: "Se notifica en paralelo a los tres guardianes activos: llamada, WhatsApp y SMS con mapa y enlace de confirmación.",
    detail: "Multicanal automático",
  },
] as const;

function Funciones() {
  return (
    <section id="funciones" className="relative py-20 md:py-28 overflow-hidden" style={{ background: "var(--gradient-soft)" }}>
      <div
        className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, color-mix(in oklab, var(--brand-petrol) 35%, transparent), transparent 70%)` }}
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <div
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] mb-4 px-4 py-1.5 rounded-full border"
            style={{
              color: PETROL,
              borderColor: "color-mix(in oklab, var(--brand-petrol) 20%, transparent)",
              background: "color-mix(in oklab, var(--brand-petrol) 6%, white)",
            }}
          >
            <Zap className="w-4 h-4" />
            Funciones técnicas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Infraestructura pensada para emergencias reales.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Layout espejo: cada capacidad con su visual — mapa, red familiar y canales en vivo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {TECH_FEATURES.map((f, i) => (
            <TechFeatureRow key={f.title} feature={f} reverse={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Como() {
  return (
    <section id="como" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: RED }}>
            Cómo funciona
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Del botón a la familia en tres pasos.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            El recorrido del usuario, de principio a fin — en línea de tiempo vertical.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <ol className="relative space-y-0">
            {FLOW_STEPS.map((step, index) => (
              <li key={step.n} className="relative flex gap-6 md:gap-8 pb-12 last:pb-0">
                {index < FLOW_STEPS.length - 1 && (
                  <span
                    className="absolute left-[1.6875rem] top-14 bottom-0 w-0.5 md:left-[1.875rem]"
                    style={{
                      background: `linear-gradient(180deg, ${step.color} 0%, var(--border) 100%)`,
                    }}
                    aria-hidden
                  />
                )}

                <div className="relative z-10 shrink-0 flex flex-col items-center">
                  <span
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg ring-4 ring-background"
                    style={{ background: DEEP }}
                  >
                    {step.n}
                  </span>
                </div>

                <article className="flex-1 min-w-0 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow -mt-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ background: step.color }}
                    >
                      <step.icon className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Paso {step.n}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                      style={{
                        background: "color-mix(in oklab, var(--brand-petrol) 10%, white)",
                        color: PETROL,
                      }}
                    >
                      {step.detail}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.desc}</p>
                </article>
              </li>
            ))}
          </ol>

          <div
            className="mt-10 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border text-center text-sm font-semibold"
            style={{
              borderColor: "color-mix(in oklab, #16a34a 30%, transparent)",
              background: "color-mix(in oklab, #16a34a 8%, white)",
              color: GREEN,
            }}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Tiempo total estimado: menos de 3 segundos hasta la primera notificación.
          </div>
        </div>
      </div>
    </section>
  );
}

function Beneficios() {
  const benefits = [
    { icon: Heart, title: "Tranquilidad para la familia", desc: "Saber que mamá o papá está protegido las 24 horas." },
    { icon: Zap, title: "Protección inmediata", desc: "Senior Safe actúa en menos de 3 segundos." },
    { icon: Smartphone, title: "Fácil de usar", desc: "Botones grandes y texto claro." },
    { icon: Users, title: "Diseñada para adultos mayores", desc: "Probada con familias reales." },
    { icon: Activity, title: "Funciona incluso en estrés", desc: "La alerta se envía aunque no haya respuesta." },
    { icon: Shield, title: "Conexión directa con familiares", desc: "Sin intermediarios. Sin demoras." },
  ];
  return (
    <section id="beneficios" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative">
          <img src={seniorPhone} alt="Pareja mayor usando la app" loading="lazy" className="w-full rounded-3xl object-cover aspect-[4/5] shadow-xl" />
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl max-w-[260px] border border-border">
            <Heart className="w-5 h-5 fill-red-500 text-red-500 mb-2" />
            <p className="text-sm leading-relaxed text-foreground">"Por fin puedo dormir tranquila sabiendo que mi madre está protegida."</p>
            <p className="text-xs text-muted-foreground mt-2">— Carmen, hija</p>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: GREEN }}>Beneficios</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-8">Más que una app, una red de cuidado.</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-3" style={{ background: PETROL }}>
                  <b.icon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-foreground mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Planes() {
  const [yearly, setYearly] = useState(false);
  const price = yearly ? PLAN.yearly : PLAN.monthly;

  return (
    <section id="planes" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>{PLAN.displayName}</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">{PLAN.tagline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
          <div className="mt-7 inline-flex items-center bg-card border border-border rounded-full p-1.5 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${!yearly ? "text-white" : "text-muted-foreground"}`}
              style={!yearly ? { background: DEEP } : undefined}
            >
              Mensual · ${formatPlanPrice(PLAN.monthly)}
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${yearly ? "text-white" : "text-muted-foreground"}`}
              style={yearly ? { background: DEEP } : undefined}
            >
              Anual · ${formatPlanPrice(PLAN.yearly)}
              <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold">{PLAN.yearlySavingsLabel.toUpperCase()}</span>
            </button>
          </div>
        </div>

        <div className="max-w-lg mx-auto">
          <div
            className="p-10 rounded-3xl relative transition shadow-lg text-white"
            style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
          >
            <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider" style={{ color: DEEP }}>
              Plan oficial
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-white/80">{PLAN.displayName}</h3>
            <p className="text-base mb-7 text-white/85">{PLAN.name} — protección completa.</p>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-bold tracking-tight">${formatPlanPrice(price)}</span>
                <span className="text-white/80">/{yearly ? "año" : "mes"}</span>
              </div>
              {yearly ? (
                <div className="mt-2 text-sm text-[#a7f3d0] font-semibold">
                  {PLAN.yearlySavingsLabel} · equivale a ${formatPlanPrice(yearlyEquivalentMonthly())}/mes
                </div>
              ) : (
                <div className="mt-2 text-sm text-white/80">
                  Anual ${formatPlanPrice(PLAN.yearly)} — {PLAN.yearlySavingsLabel.toLowerCase()}
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-10">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-base">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-white" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <a
                href={checkoutUrl({ periodo: yearly ? "anual" : "mensual" })}
                className="block text-center py-4 rounded-full font-bold text-base transition bg-white"
                style={{ color: DEEP }}
              >
                Contratar con Webpay Plus
              </a>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Pago seguro con Webpay Plus · Cancela cuando quieras
        </p>
      </div>
    </section>
  );
}

function Prueba() {
  return (
    <section id="prueba" className="py-20 md:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl border border-border">
          <div className="p-10 md:p-12 text-white" style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider mb-5">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> Pago seguro
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Contrata Senior Safe con Webpay Plus.</h2>
            <p className="text-base text-white/85 leading-relaxed mb-7">
              Sin período de prueba gratuito. Tras confirmar el pago, entras a la app con un mock de entrenamiento del botón de pánico (sin costos Twilio).
            </p>
            <ul className="space-y-3 text-base">
              {[
                "Pago obligatorio antes de activar",
                "Mock de entrenamiento sin alertas reales",
                "Cancelación simple cuando quieras",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-10 md:p-12 flex flex-col gap-5 justify-center">
            <h3 className="text-xl font-bold text-foreground">Comenzar protección</h3>
            <p className="text-muted-foreground">
              El registro gratuito de 7 días fue deshabilitado antes del lanzamiento. Contrata el plan único y practica el botón de emergencia en simulación.
            </p>
            <a
              href={checkoutUrl()}
              className="inline-flex items-center justify-center gap-2 py-4 rounded-full text-white text-base font-bold transition"
              style={{ background: PETROL }}
            >
              Ir a checkout (Webpay)
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/instalar-app?entrenamiento=1"
              className="text-center text-sm font-semibold text-muted-foreground hover:text-foreground transition"
            >
              Ya pagué · Entrar a entrenamiento
            </a>
            <p className="text-xs text-muted-foreground text-center">
              Al continuar aceptas nuestros términos y política de privacidad.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capturas() {
  const screens = [
    { title: "Botón de emergencia", color: RED, icon: Bell },
    { title: "Ubicación GPS", color: PETROL, icon: MapPin },
    { title: "Alerta familiar", color: "#f59e0b", icon: MessageCircle },
    { title: "Modo familiar", color: GREEN, icon: Users },
  ];
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>La app</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Diseñada para ser usada en segundos.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screens.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl transition">
              <div className="aspect-[9/16] rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` }}>
                <div className="absolute inset-x-0 top-0 h-6 flex justify-center items-end">
                  <div className="w-20 h-4 bg-black/40 rounded-b-2xl" />
                </div>
                <div className="text-center text-white px-4">
                  <span className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ background: s.color }}>
                    <s.icon className="w-10 h-10" />
                  </span>
                  <div className="text-base font-bold">{s.title}</div>
                </div>
              </div>
              <h3 className="font-bold text-foreground text-center">{s.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonios() {
  const items = [
    { name: "Carmen R.", role: "Hija", quote: "Ahora puedo estar tranquila sabiendo que mi madre puede avisarnos inmediatamente." },
    { name: "Jorge M.", role: "Adulto mayor, 74", quote: "Es muy fácil de usar. Un solo botón y mis hijos saben que necesito ayuda." },
    { name: "Familia Pérez", role: "Familia conectada", quote: "Por primera vez sentimos que toda la familia está protegida y unida." },
  ];
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Testimonios</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Familias que confían en nosotros.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-2xl p-7">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: PETROL }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section id="contacto" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Contacto</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Hablemos.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Estamos aquí para ayudarte a proteger a tu familia.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          <ContactCard icon={MessageCircle} title="WhatsApp 24/7" value="Escríbenos ahora" href="https://wa.me/56971404580?text=Hola%20Senior%20Safe%2C%20tengo%20una%20consulta" isExternal highlight />
          <ContactCard icon={Mail} title="Email" value="hola@alarmaseniorsafe.cl" href="mailto:hola@alarmaseniorsafe.cl" />
          <ContactCard icon={Clock} title="Horario" value="Soporte humano 24/7" />
        </div>

        <p className="text-center mt-12 text-xl md:text-2xl italic text-foreground/80 font-light">
          "Más que una app, una red de cuidado"
        </p>
      </div>
    </section>
  );
}

function ContactCard({ icon: Icon, title, value, href, isExternal, highlight }: { icon: any; title: string; value: string; href?: string; isExternal?: boolean; highlight?: boolean }) {
  const content = (
    <div
      className="border rounded-2xl p-7 text-center hover:shadow-lg transition cursor-pointer"
      style={highlight
        ? { background: "linear-gradient(135deg, #25D366, #128C7E)", borderColor: "transparent", color: "white" }
        : { background: "var(--card)", borderColor: "var(--border)" }}
    >
      <span
        className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4"
        style={highlight ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: PETROL, color: "white" }}
      >
        <Icon className="w-6 h-6" />
      </span>
      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${highlight ? "text-white/90" : "text-muted-foreground"}`}>{title}</div>
      <div className={`font-bold ${highlight ? "text-white" : "text-foreground"}`}>{value}</div>
    </div>
  );
  if (href) {
    return (
      <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return content;
}


function Field({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
        maxLength={120}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full px-5 py-4 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-petrol)]/30 transition"
      />
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <main>
        <Hero />
        <QueEs />
        <ParaQuien />
        <Funciones />
        <Como />
        <Beneficios />
        <Capturas />
        <Planes />
        <Prueba />
        <Testimonios />
        <Contacto />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
