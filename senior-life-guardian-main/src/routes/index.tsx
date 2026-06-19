import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { isDemoMode } from "@/lib/demo/demo-config";
import {
  Shield, MessageCircle, MapPin, CheckCircle2,
  Mail, ArrowRight, Heart, AlertCircle, Users, Zap, Smartphone,
  Clock, Activity, Star, Accessibility, Home,
  PhoneCall, Radio, Navigation, Send,
  Brain, Sparkles, Layers, HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import emergencyButton from "@/assets/emergency-button.jpg";
import seniorCouple from "@/assets/senior-couple.jpg";
import seniorPhone from "@/assets/senior-phone.jpg";
import logo from "@/assets/logo-senior-safe.png";
import screenRedProteccion from "@/assets/screen-red-proteccion.png";
import screenUbicacionGps from "@/assets/screen-ubicacion-gps.png";
import screenAlertaMulticanal from "@/assets/screen-alerta-multicanal.png";
import screenModoFamiliar from "@/assets/screen-modo-familiar.png";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import {
  PLAN,
  checkoutUrl,
  formatPlanPrice,
  yearlyEquivalentMonthly,
} from "@/lib/plans";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { seniorSafeWhatsAppMeUrl } from "@/lib/twilio";
import { CANCELLATION_POLICY_FAQ_ANSWER, CANCELLATION_POLICY_SUMMARY } from "@/lib/subscription-cancellation-policy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Safe — Ecosistema Inteligente de Protección de Toda la Familia" },
      { name: "description", content: "Infraestructura blindada con IA, telemetría y comunicaciones redundantes: WhatsApp, SMS, GPS en vivo y escalamiento por voz. Plan Único desde $6.900/mes." },
      { property: "og:title", content: "Senior Safe — Ecosistema Inteligente de Protección Familiar" },
      { property: "og:description", content: "Protección resiliente para toda la familia con canales redundantes y telemetría avanzada." },
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
              alt="Aplicación Senior Safe con red de protección familiar activa"
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
              <div
                className="mx-auto w-full max-w-[200px] py-3 rounded-2xl text-center font-bold text-white text-sm shadow-lg border border-emerald-400/40"
                style={{ background: `linear-gradient(180deg, ${GREEN}, #15803d)` }}
              >
                <Shield className="inline w-4 h-4 mr-1 align-text-bottom" />
                Red protegida 24/7
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
            Plan Único · desde ${formatPlanPrice(PLAN.monthly)}/mes
          </p>
          <h1
            className="text-[30px] md:text-[44px] lg:text-[50px] font-bold leading-[1.08] tracking-tight animate-fade-in"
            style={{ animationDelay: "80ms" }}
          >
            Senior Safe — Ecosistema Inteligente de Protección de{" "}
            <span className="text-[#ffd66b] drop-shadow-sm">Toda la Familia</span>
          </h1>
          <h2
            className="mt-5 text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-xl animate-fade-in"
            style={{ animationDelay: "140ms" }}
          >
            Una infraestructura tecnológica blindada que fusiona Inteligencia Artificial, telemetría avanzada y comunicaciones resilientes para cuidar a quienes más quieres.
          </h2>
          <div
            className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <span className="text-sm font-bold text-white/90">{PLAN.displayName}</span>
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              ${formatPlanPrice(PLAN.monthly)}
              <span className="text-base font-semibold text-white/80">/mes</span>
            </span>
            <span className="text-xs text-white/70">Sin permanencia · Webpay Plus</span>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "260ms" }}>
            <a
              href={checkoutUrl()}
              className="inline-flex items-center justify-center gap-3 px-7 py-5 rounded-full bg-white text-base font-bold shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-300"
              style={{ color: DEEP }}
            >
              Contratar Plan Único — ${formatPlanPrice(PLAN.monthly)}/mes
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
            <Link
              to="/guia"
              className="inline-flex items-center justify-center gap-3 px-7 py-5 rounded-full text-base font-bold shadow-xl hover:scale-[1.03] transition-all duration-300 text-white bg-white/15 ring-2 ring-white/25 backdrop-blur-sm"
            >
              Guía de instalación
              <Smartphone className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" /> Sin permanencia
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" /> Cancelación simple
            </div>
            <Link to="/como-funciona" className="underline underline-offset-4 hover:text-white transition-colors">
              Cómo funciona
            </Link>
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
    { icon: Layers, color: DEEP, title: "Ecosistema unificado", desc: "Una sola plataforma conecta senior, familia y canales de respuesta." },
    { icon: Zap, color: "#f59e0b", title: "Alertas resilientes", desc: "WhatsApp, SMS, GPS y voz en cascada ante emergencias reales." },
    { icon: MapPin, color: PETROL, title: "Telemetría en vivo", desc: "Coordenadas exactas y contexto operativo en cada evento." },
    { icon: Users, color: GREEN, title: "Red familiar priorizada", desc: "Hasta 3 guardianes con orden de escalamiento inteligente." },
    { icon: Smartphone, color: RED, title: "Diseño senior-first", desc: "Interfaz clara, accesible y pensada para el uso diario en casa." },
  ];
  return (
    <section id="que-es" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>¿Qué es?</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Más que una app: un ecosistema de protección familiar.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Senior Safe integra inteligencia artificial, sensores del teléfono y comunicaciones redundantes para que tu familia reciba ayuda cuando más importa — sin depender de un solo canal.
          </p>
          <div className="mt-8 flex flex-col items-center text-center gap-4">
            <p className="text-base md:text-lg text-foreground/90 font-medium max-w-2xl leading-relaxed">
              Te invitamos a entrar y recorrer el flujo SOS paso a paso: botón de emergencia, aviso a la familia y
              mapa con ubicación — como en la app real, sin instalar nada.
            </p>
            <Link
              to="/como-funciona"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 md:px-12 md:py-6 rounded-2xl font-bold text-lg md:text-xl text-white no-underline transition-all duration-200 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
              style={{
                backgroundColor: "#007bff",
                boxShadow: "0 8px 24px rgba(0,123,255,0.35)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              📱 Entrar — ver cómo funciona en tu celular →
            </Link>
            <p className="text-sm text-muted-foreground">Recorrido interactivo · unos 2 minutos · gratis</p>
          </div>
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
            <Shield className="w-5 h-5" />
            Infraestructura blindada para toda la familia.
          </div>
        </div>
      </div>
    </section>
  );
}

function ParaQuien() {
  const cards = [
    { icon: Home, title: "Adultos mayores", desc: "Que viven solos y necesitan tranquilidad diaria." },
    { icon: Heart, title: "Toda la familia conectada por emergencias", desc: "" },
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

const BENTO_CHANNELS = [
  {
    id: "A",
    icon: MessageCircle,
    color: "#25D366",
    badge: "Canal A",
    title: "WhatsApp + IA Groq",
    desc: "Notificación automatizada e instantánea al núcleo familiar. Procesamiento de respuestas con Inteligencia Artificial para confirmar lectura y contexto.",
    tag: "Paralelo · Top 3 guardianes",
    span: "md:col-span-2",
  },
  {
    id: "B",
    icon: Mail,
    color: "#f59e0b",
    badge: "Canal B",
    title: "SMS de Respaldo",
    desc: "Mensajería celular tradicional enviada en simultáneo. Opera sin necesidad de internet móvil en el dispositivo del familiar.",
    tag: "Resiliente sin datos",
    span: "md:col-span-1",
  },
  {
    id: "C",
    icon: MapPin,
    color: PETROL,
    badge: "Canal C",
    title: "Geolocalización en Vivo",
    desc: "Inyección de coordenadas GPS exactas con enlaces universales de Google Maps para asistencia inmediata en terreno.",
    tag: "Lat/lng en cada alerta",
    span: "md:col-span-1",
  },
  {
    id: "D",
    icon: PhoneCall,
    color: DEEP,
    badge: "Canal D",
    title: "Escalamiento por Voz",
    desc: "Si la familia no confirma lectura en la plataforma, el sistema inicia llamadas telefónicas secuenciales automáticas mediante Twilio.",
    tag: "Secuencial · prioridad",
    span: "md:col-span-2",
  },
] as const;

function ComunicacionRedundanteBento() {
  return (
    <section id="comunicacion" className="relative py-20 md:py-28 overflow-hidden" style={{ background: "var(--gradient-soft)" }}>
      <div
        className="absolute top-0 left-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, color-mix(in oklab, var(--brand-petrol) 35%, transparent), transparent 70%)` }}
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] mb-4 px-4 py-1.5 rounded-full border"
            style={{
              color: PETROL,
              borderColor: "color-mix(in oklab, var(--brand-petrol) 20%, transparent)",
              background: "color-mix(in oklab, var(--brand-petrol) 6%, white)",
            }}
          >
            <Radio className="w-4 h-4" />
            Comunicación redundante
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Cuatro pilares de resiliencia ante emergencias reales.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            El algoritmo <strong className="font-semibold text-foreground">ecosystem_v3_cascade</strong> envía SMS al instante y WhatsApp siempre a los 10 segundos; la llamada solo entra si nadie confirma ni abre el mensaje — sin depender de una sola tecnología.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {BENTO_CHANNELS.map((ch) => (
            <article
              key={ch.id}
              className={`group bg-card border-2 border-border rounded-3xl p-6 md:p-7 shadow-sm hover:shadow-xl transition-all duration-300 ${ch.span}`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <span
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{ background: ch.color }}
                >
                  <ch.icon className="w-6 h-6" />
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border"
                  style={{ color: PETROL, borderColor: "color-mix(in oklab, var(--brand-petrol) 25%, transparent)" }}
                >
                  {ch.badge}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{ch.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{ch.desc}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide" style={{ color: PETROL }}>
                {ch.tag}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const FALL_DETECTION_STEPS = [
  {
    label: "Impacto Crítico",
    title: "Monitoreo Telemetría G",
    desc: "Analiza de forma constante los vectores de movimiento mediante el acelerómetro, identificando desaceleraciones severas superiores a 3.8G.",
    icon: Activity,
    color: RED,
  },
  {
    label: "Fase de Shock",
    title: "Validación de Inmovilidad",
    desc: "El sistema espera y verifica de forma inteligente una ventana de quietud total durante 3 segundos continuos para descartar falsos positivos cotidianos.",
    icon: Clock,
    color: "#f59e0b",
  },
  {
    label: "Escudo Resiliente",
    title: "Alerta Progresiva",
    desc: "Activa un modal a pantalla completa con 30 segundos de cuenta regresiva. Inicia con vibración silenciosa por privacidad y escala a sirena audible antes de despachar el auxilio simultáneo a la familia.",
    icon: Shield,
    color: GREEN,
  },
] as const;

function DeteccionCaidasActiva() {
  return (
    <section id="deteccion-caidas" className="py-12 md:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="rounded-2xl border border-border/60 py-12 px-6 md:px-12 shadow-sm"
          style={{ background: "#f0f7f9" }}
        >
          <div className="max-w-4xl mx-auto text-center mb-10 md:mb-12">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4 border border-white/80 bg-white/90 shadow-sm"
              style={{ color: PETROL }}
            >
              <Activity className="w-4 h-4" />
              Protección activa
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
              Protección Activa: Detección Inteligente y Autónoma de Caídas
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              Transformamos el smartphone en un guardián continuo que actúa por sí solo cuando más se necesita, ideal para la seguridad de adultos mayores dentro y fuera del hogar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {FALL_DETECTION_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="bg-white rounded-2xl border border-border/70 p-6 md:p-7 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ background: step.color }}
                  >
                    <step.icon className="w-5 h-5" />
                  </span>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      color: PETROL,
                      background: "color-mix(in oklab, var(--brand-petrol) 8%, white)",
                    }}
                  >
                    Paso {index + 1}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: step.color }}>
                  {step.label}
                </p>
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CapacidadesPredictivas() {
  const cards = [
    {
      icon: Brain,
      color: DEEP,
      title: "Patrones Preventivos con IA",
      desc: "Inteligencia Artificial orientada a identificar ausencia de actividad, priorizar niveles de emergencia crítica en el hogar y enriquecer respuestas familiares vía Groq.",
      badge: "IA predictiva",
    },
  ];

  return (
    <section id="inteligencia" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>
            <Sparkles className="w-4 h-4" />
            Capacidades en evolución
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Telemetría inteligente que anticipa el riesgo.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sensores del dispositivo e IA trabajan en conjunto para proteger antes de que una emergencia se agrave.
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
          {cards.map((c) => (
            <div
              key={c.title}
              className="relative overflow-hidden rounded-3xl border-2 border-border p-8 shadow-lg"
              style={{ background: "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 5%, white) 100%)" }}
            >
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5 text-white"
                style={{ background: c.color }}
              >
                {c.badge}
              </span>
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-5 shadow-md"
                style={{ background: c.color }}
              >
                <c.icon className="w-7 h-7" />
              </span>
              <h3 className="text-2xl font-bold text-foreground mb-3">{c.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center rounded-3xl overflow-hidden border border-border shadow-xl">
          <img
            src={seniorCouple}
            alt="Pareja de adultos mayores protegida por Senior Safe"
            loading="lazy"
            className="w-full h-full object-cover min-h-[240px]"
          />
          <div className="p-8 md:p-10 bg-card">
            <h3 className="text-xl font-bold text-foreground mb-3">Protección que evoluciona contigo</h3>
            <p className="text-muted-foreground leading-relaxed">
              El ecosistema combina detección física en el teléfono, análisis de patrones y comunicación multicanal para que tu familia nunca quede desconectada ante un evento crítico.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FLOW_STEPS = [
  {
    n: 1,
    icon: AlertCircle,
    color: RED,
    title: "Activación del evento",
    desc: "Una emergencia o detección autónoma dispara el algoritmo ecosystem_v2. La señal se registra al instante en la nube blindada.",
    detail: "Menos de 1 segundo",
  },
  {
    n: 2,
    icon: Navigation,
    color: "#f59e0b",
    title: "Telemetría y GPS",
    desc: "El sistema captura coordenadas satelitales, contexto del dispositivo y prepara el paquete de alerta multicanal.",
    detail: "Hasta 3 s de sincronización",
  },
  {
    n: 3,
    icon: Send,
    color: GREEN,
    title: "Cascada SMS → WhatsApp → voz",
    desc: "SMS al instante, WhatsApp a los 15 s y enlace Google Maps a los tres guardianes prioritarios. Llamada a los 30 s solo si nadie confirma recepción.",
    detail: "Multicanal automático",
  },
] as const;

function Como() {
  return (
    <section id="como-funciona" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: RED }}>
            Cómo funciona
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Del evento crítico a la familia en tres pasos.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            El recorrido del ecosistema, de principio a fin — en línea de tiempo vertical.
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
    { icon: Smartphone, title: "Fácil de usar", desc: "Interfaz senior-first con acciones claras y visibles." },
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
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">{CANCELLATION_POLICY_SUMMARY}</p>
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
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="rounded-3xl border border-border bg-card p-10 md:p-14 shadow-2xl">
          <a
            href={checkoutUrl()}
            className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full text-white text-lg font-bold shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
          >
            👉 Contratar Plan Único — ${formatPlanPrice(PLAN.monthly)}/mes
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="mt-6 text-xs text-muted-foreground">
            Al continuar aceptas nuestros términos y política de privacidad.
          </p>
        </div>
      </div>
    </section>
  );
}

function Capturas() {
  const screens = [
    { title: "Red de protección", color: RED, icon: Shield, image: screenRedProteccion, alt: "Pantalla de red de protección con guardianes conectados" },
    { title: "Ubicación GPS", color: PETROL, icon: MapPin, image: screenUbicacionGps, alt: "Pantalla de ubicación GPS en tiempo real" },
    { title: "Alerta multicanal", color: "#f59e0b", icon: MessageCircle, image: screenAlertaMulticanal, alt: "Pantalla de alerta multicanal SMS, WhatsApp y llamada" },
    { title: "Modo familiar", color: GREEN, icon: Users, image: screenModoFamiliar, alt: "Pantalla modo familiar con estado de la red" },
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
              <div className="aspect-[9/16] rounded-2xl mb-5 relative overflow-hidden bg-black shadow-inner">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)" }}
                />
                <div className="absolute inset-x-0 top-0 z-10 h-7 flex justify-center items-end pointer-events-none">
                  <div className="w-24 h-5 bg-black/50 rounded-b-2xl backdrop-blur-sm" />
                </div>
                <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-center text-white">
                  <span
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg ring-2 ring-white/30"
                    style={{ background: s.color }}
                  >
                    <s.icon className="w-7 h-7" />
                  </span>
                  <div className="text-sm font-bold drop-shadow-md">{s.title}</div>
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

function PreguntasFrecuentes() {
  const sections = [
    {
      title: "Funcionamiento",
      icon: Smartphone,
      items: [
        {
          q: "¿Qué es exactamente Senior Safe?",
          a: "Senior Safe no es un dispositivo físico adicional, sino un ecosistema de protección inteligente basado en una aplicación para smartphone. Utiliza Inteligencia Artificial, los sensores del propio teléfono y un sistema de comunicación redundante para alertar a la familia de inmediato ante caídas o emergencias.",
        },
        {
          q: "¿Cómo funciona el sistema de alerta en cascada?",
          a: "Ante una emergencia, nuestro algoritmo activa cuatro canales de respaldo en tiempo real: (A) WhatsApp + IA para confirmar lecturas; (B) SMS de respaldo simultáneo; (C) GPS en vivo con enlace Google Maps; (D) llamadas de voz automáticas y secuenciales a los guardianes si nadie confirma en los primeros segundos.",
        },
        {
          q: "¿A quién notifica la aplicación cuando ocurre una emergencia?",
          a: "Las alertas van directamente al núcleo familiar, sin pasar por centrales de monitoreo externas ni intermediarios. Puedes configurar hasta 3 guardianes (hijos, nietos, vecinos o cuidadores) con orden de prioridad.",
        },
        {
          q: "¿Cuánto tarda en llegar una alerta a la familia?",
          a: "El sistema es ultra rápido. Desde que se detecta el impacto o se presiona el botón SOS, la primera notificación tarda menos de 3 segundos en ser despachada a la red familiar.",
        },
      ],
    },
    {
      title: "Caídas y emergencias",
      icon: AlertCircle,
      items: [
        {
          q: "¿Cómo funciona la detección automática de caídas?",
          a: "La aplicación transforma el smartphone en un guardián continuo: (1) el acelerómetro analiza impactos abruptos superiores a 3.8G; (2) valida 3 segundos de inmovilidad para evitar falsos positivos; (3) activa vibración y sirena por 30 segundos — si el usuario está bien puede cancelar; si no responde, la ayuda se despacha de inmediato.",
        },
        {
          q: "¿Qué pasa si el adulto mayor no puede presionar el botón?",
          a: "No se preocupe. Si el sistema detecta una caída crítica seguida de inmovilidad, la alerta se envía de forma completamente autónoma, incluso si el usuario queda inconsciente o en estado de shock.",
        },
        {
          q: "¿La localización GPS funciona fuera de la casa?",
          a: "Sí. El sistema inyecta coordenadas satelitales en vivo. Esto permite saber la ubicación exacta del adulto mayor dentro del hogar, caminando, de compras o en terreno abierto.",
        },
      ],
    },
    {
      title: "Uso diario",
      icon: Accessibility,
      items: [
        {
          q: "¿Es difícil de usar para un adulto mayor?",
          a: "Para nada. Senior Safe cuenta con un diseño Senior-First: botones grandes, textos claros y acciones muy visibles, pensado para operarse en segundos y sin complicaciones tecnológicas.",
        },
        {
          q: "¿Qué requisitos debe cumplir el teléfono del adulto mayor?",
          a: "Solo requiere un smartphone compatible con la aplicación. Al contratar recibirá instrucciones de instalación paso a paso. No necesita comprar aparatos ni collares adicionales.",
        },
        {
          q: "¿Cómo descargo e instalo la app?",
          a: "Guía completa en alarmaseniorsafe.cl/guia: contratar, abrir el enlace en el celular, agregar a la pantalla de inicio (Android o iPhone), configurar PIN y guardianes, y escribir ACTIVAR por WhatsApp.",
        },
      ],
    },
    {
      title: "Planes y pagos",
      icon: CheckCircle2,
      items: [
        {
          q: "¿Cuánto cuesta el servicio?",
          a: `Ofrecemos un Plan Único de protección completa: $${formatPlanPrice(PLAN.monthly)} al mes o $${formatPlanPrice(PLAN.yearly)} al año (${PLAN.yearlySavingsLabel.toLowerCase()}).`,
        },
        {
          q: "¿Existe algún contrato de amarre o permanencia?",
          a: "No, ninguno. Puede dar de baja el plan cuando lo desee, sin multas. " + CANCELLATION_POLICY_SUMMARY,
        },
        {
          q: "¿Hay reembolso si cancelo el plan?",
          a: CANCELLATION_POLICY_FAQ_ANSWER,
        },
        {
          q: "¿Cuáles son los medios de pago disponibles?",
          a: "Los pagos se realizan de manera 100% segura en línea a través de Webpay Plus, utilizando tarjetas de crédito, débito o prepago.",
        },
      ],
    },
    {
      title: "Soporte",
      icon: PhoneCall,
      items: [
        {
          q: "¿Tienen atención en caso de dudas?",
          a: "Sí, el Plan Único incluye soporte prioritario 24/7. Si tiene problemas con la configuración de guardianes o la aplicación, nuestro equipo estará disponible por WhatsApp o en hola@alarmaseniorsafe.cl.",
        },
      ],
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>
            Preguntas frecuentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Resolvemos tus dudas.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Todo lo que necesitas saber sobre Senior Safe antes de contratar.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden">
          <div
            className="px-6 py-5 border-b border-border flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${DEEP}08, ${PETROL}12)` }}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
            >
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-foreground">FAQ Senior Safe</div>
              <div className="text-sm text-muted-foreground">Funcionamiento, caídas, planes y soporte</div>
            </div>
          </div>

          <div className="px-6 md:px-8 py-2">
            {sections.map((section, sectionIdx) => (
              <div key={section.title} className={sectionIdx > 0 ? "mt-6 pt-6 border-t border-border" : "pt-4"}>
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="w-4 h-4 shrink-0" style={{ color: PETROL }} />
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: PETROL }}>
                    {section.title}
                  </h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, itemIdx) => (
                    <AccordionItem
                      key={item.q}
                      value={`${sectionIdx}-${itemIdx}`}
                      className="border-border/70"
                    >
                      <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          ¿Necesitas instalar la app?{" "}
          <Link to="/guia" className="font-semibold hover:underline" style={{ color: PETROL }}>
            Ver guía paso a paso
          </Link>
          {" · "}
          <a
            href={seniorSafeWhatsAppMeUrl("Hola Senior Safe, tengo una consulta")}
            className="font-semibold hover:underline"
            style={{ color: PETROL }}
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}

function Testimonios() {
  const items = [
    { name: "Carmen R.", role: "Hija", quote: "Ahora puedo estar tranquila sabiendo que mi madre puede avisarnos inmediatamente." },
    { name: "Jorge M.", role: "Adulto mayor, 74", quote: "Es muy fácil de usar. Mis hijos reciben la alerta al instante por WhatsApp y SMS." },
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
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <ContactCard icon={MessageCircle} title="WhatsApp" value="Escríbenos ahora" href={seniorSafeWhatsAppMeUrl("Hola Senior Safe, tengo una consulta")} isExternal highlight />
          <ContactCard icon={Mail} title="Email" value="hola@alarmaseniorsafe.cl" href="mailto:hola@alarmaseniorsafe.cl" />
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
  if (isDemoMode()) {
    return <Navigate to="/demo" search={{ institucion: "las-condes" }} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <main>
        <Hero />
        <QueEs />
        <ComunicacionRedundanteBento />
        <CapacidadesPredictivas />
        <DeteccionCaidasActiva />
        <ParaQuien />
        <Como />
        <Beneficios />
        <Capturas />
        <Planes />
        <Prueba />
        <PreguntasFrecuentes />
        <Testimonios />
        <Contacto />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
