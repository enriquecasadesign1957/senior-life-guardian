import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { isDemoMode } from "@/lib/demo/demo-config";
import {
  Shield, MessageCircle, MapPin, CheckCircle2,
  Mail, ArrowRight, Heart, AlertCircle, Users, Zap, Smartphone,
  Clock, Activity, Star, Accessibility, Home,
  PhoneCall, Radio, Navigation, Send,
  Brain, Sparkles, HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import seniorCouple from "@/assets/senior-couple.jpg";
import seniorPhone from "@/assets/senior-phone.jpg";
import familyPhoto from "@/assets/family-photo.jpg";
import heroSeniorPhone from "@/assets/hero-senior-phone.png";
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
  ANNUAL_SAVINGS_CRO_CLP,
  FAMILY_BUNDLE,
} from "@/lib/plans";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import {
  TrustStackChileno,
  FAQ_CANCELLATION_POSITIVE_A,
  FAQ_CANCELLATION_POSITIVE_Q,
  FEATURED_TESTIMONIAL_CARMEN,
} from "@/components/trust-stack-chileno";
import { seniorSafeWhatsAppMeUrl } from "@/lib/twilio";
import { CANCELLATION_POLICY_FAQ_ANSWER, CANCELLATION_POLICY_SUMMARY } from "@/lib/subscription-cancellation-policy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Safe — Tu mamá siempre protegida, aunque no estés cerca" },
      { name: "description", content: "Red de cuidado inteligente que alerta a la familia en menos de 3 segundos ante caídas o emergencias. Sin contratos ni burocracia. Desde $6.900/mes." },
      { property: "og:title", content: "Senior Safe — Protección familiar en menos de 3 segundos" },
      { property: "og:description", content: "Alertas por WhatsApp, SMS, GPS y llamada automática. Plan Único $6.900/mes, sin permanencia." },
    ],
  }),
  component: Landing,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const RED = "#dc2626";
const GREEN = "#16a34a";

const HERO_CTA_GREEN = "#22c55e";
const HERO_CTA_GREEN_DARK = "#15803d";

const HERO_TRUST_AVATARS = [
  { src: seniorCouple, alt: "Pareja de adultos mayores" },
  { src: seniorPhone, alt: "Adulto mayor con celular" },
  { src: familyPhoto, alt: "Familia conectada" },
] as const;

function HeroSocialProof() {
  return (
    <div
      className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 animate-fade-in"
      style={{ animationDelay: "320ms" }}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <div className="flex items-center gap-0.5" aria-label="Calificación 5 de 5 estrellas">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" aria-hidden />
          ))}
        </div>
        <span className="text-sm font-semibold text-white/95">
          2.000+ familias protegidas en Chile
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2.5">
          {HERO_TRUST_AVATARS.map((avatar) => (
            <img
              key={avatar.alt}
              src={avatar.src}
              alt={avatar.alt}
              className="w-9 h-9 rounded-full border-2 border-white/90 object-cover shadow-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroCreative() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-white/20 via-amber-300/15 to-emerald-400/20 blur-2xl"
        aria-hidden
      />
      <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/25">
        <img
          src={heroSeniorPhone}
          alt="Adulto mayor usando Senior Safe con botón SOS en su celular, conectada con su familia"
          className="w-full h-auto object-cover object-center"
          width={1024}
          height={1024}
          fetchPriority="high"
        />
      </div>
      <div className="absolute -bottom-3 -left-3 sm:-left-5 z-10 bg-white/95 backdrop-blur-md text-foreground px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/60">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md"
          style={{ background: RED }}
        >
          <Zap className="w-5 h-5" />
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Respuesta
          </div>
          <div className="font-bold text-sm leading-tight">menos de 3 s</div>
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
            className="text-[1.625rem] sm:text-3xl md:text-[2.125rem] lg:text-[2.75rem] font-bold leading-[1.2] sm:leading-[1.15] tracking-tight animate-fade-in [overflow-wrap:anywhere] hyphens-none"
            style={{ animationDelay: "80ms" }}
          >
            Tu mamá siempre protegida —{" "}
            <span className="text-[#ffd66b] drop-shadow-sm">aunque no estés cerca</span>
          </h1>
          <p
            className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-xl animate-fade-in"
            style={{ animationDelay: "140ms" }}
          >
            Una red de cuidado inteligente que alerta a la familia en menos de 3 segundos ante caídas
            o emergencias, sin contratos ni burocracia.
          </p>
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
          <div className="mt-7 sm:mt-8 flex flex-col gap-3 animate-fade-in" style={{ animationDelay: "260ms" }}>
            <a
              href={checkoutUrl()}
              className="inline-flex items-center justify-center gap-3 px-7 py-5 rounded-full text-base sm:text-lg font-extrabold text-white shadow-2xl hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(34,197,94,0.45)] transition-all duration-300 ring-2 ring-white/30"
              style={{
                background: `linear-gradient(180deg, ${HERO_CTA_GREEN} 0%, ${HERO_CTA_GREEN_DARK} 100%)`,
              }}
            >
              Proteger a mi familia — ${formatPlanPrice(PLAN.monthly)}/mes
              <ArrowRight className="w-5 h-5 shrink-0" />
            </a>
            <HeroSocialProof />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1">
              <a
                href="/instalar-app?entrenamiento=1"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white/85 border border-white/25 bg-transparent hover:bg-white/10 transition-colors"
              >
                Ya tengo cuenta · Entrar
              </a>
              <Link
                to="/guia"
                className="inline-flex items-center justify-center text-sm font-medium text-white/70 hover:text-white underline underline-offset-4 transition-colors"
              >
                Guía de instalación
              </Link>
            </div>
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

        <div className="order-1 lg:order-2 animate-fade-in py-4 lg:py-0" style={{ animationDelay: "200ms" }}>
          <HeroCreative />
        </div>
      </div>
    </section>
  );
}

const QUE_ES_BENEFITS = [
  "Tu familiar puede pedir ayuda con un toque",
  "Tu familia recibe alerta instantánea",
  "Red de respuesta activa en <3 segundos",
  "Cobertura nacional sin zonas ciegas",
] as const;

function QueEs() {
  return (
    <section id="que-es" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>
            ¿Qué es?
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Más que una app: un ecosistema de protección familiar.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Senior Safe conecta a tu familiar con la familia en segundos — WhatsApp, SMS, GPS y llamada
            automática, sin depender de un solo canal.
          </p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto mb-12 md:mb-14">
          {QUE_ES_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3.5 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <CheckCircle2
                className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5"
                style={{ color: GREEN }}
                aria-hidden
              />
              <span className="text-base md:text-lg font-semibold text-foreground leading-snug">
                {benefit}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <p className="text-base md:text-lg text-foreground/90 font-medium leading-relaxed">
            Prueba el simulador S.O.S: botón de emergencia, tipo de ayuda y panel de envíos en tiempo
            real — sin instalar nada.
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
    desc: "SMS al instante, WhatsApp a los 15 s y enlace Google Maps a los tres guardianes prioritarios. Llamada a los 60 s solo si nadie confirma recepción.",
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
  return (
    <section id="planes" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>
            {PLAN.displayName}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">{PLAN.tagline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">{CANCELLATION_POLICY_SUMMARY}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto items-stretch">
          {/* Plan mensual — ancla */}
          <article className="relative flex flex-col rounded-3xl border-2 border-border bg-card p-7 md:p-8 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Plan Mensual
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Flexibilidad mes a mes</p>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  ${formatPlanPrice(PLAN.monthly)}
                </span>
                <span className="text-muted-foreground font-medium">/mes</span>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {PLAN.features.slice(0, 4).map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: PETROL }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={checkoutUrl({ periodo: "mensual" })}
              className="block text-center py-3.5 rounded-full font-bold text-sm transition border-2 border-border text-foreground hover:bg-muted/60"
            >
              Contratar plan mensual
            </a>
          </article>

          {/* Plan anual — destacado */}
          <article
            className="relative flex flex-col rounded-3xl border-2 p-7 md:p-8 shadow-xl text-white md:scale-[1.02] md:-my-1"
            style={{
              background: `linear-gradient(145deg, ${DEEP}, ${PETROL})`,
              borderColor: GREEN,
            }}
          >
            <div className="flex flex-wrap gap-2 mb-5 -mt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[11px] font-bold uppercase tracking-wide shadow-sm" style={{ color: DEEP }}>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden />
                Más popular
              </span>
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/30 text-[11px] font-bold uppercase tracking-wide">
                Sin permanencia
              </span>
              <span className="px-3 py-1 rounded-full bg-[#22c55e] text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                Activación inmediata
              </span>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-1">Plan Anual</h3>
            <p className="text-xs text-white/70 mb-4">La mejor oferta para tu familia</p>
            <div className="mb-4">
              <div className="flex flex-wrap items-baseline gap-x-1 gap-y-0">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  ${formatPlanPrice(PLAN.yearly)}
                </span>
                <span className="text-white/80 font-medium">/año</span>
              </div>
              <p className="mt-3 text-sm md:text-base font-bold text-[#bbf7d0] leading-snug">
                Equivale a ${formatPlanPrice(yearlyEquivalentMonthly())}/mes. ¡Ahorras $
                {formatPlanPrice(ANNUAL_SAVINGS_CRO_CLP)} al año!
              </p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-white" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={checkoutUrl({ periodo: "anual" })}
              className="block text-center py-4 rounded-full font-bold text-base transition bg-white shadow-lg hover:scale-[1.02] hover:shadow-xl"
              style={{ color: DEEP }}
            >
              Contratar plan anual — mejor oferta
            </a>
          </article>
        </div>

        {/* Bundle familiar — upsell */}
        <aside className="mt-6 md:mt-8 max-w-4xl mx-auto rounded-2xl border-2 border-dashed border-[var(--brand-petrol)]/35 bg-card p-5 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: PETROL }}>
                ¿Quieres cuidar a ambos padres?
              </p>
              <p className="text-base md:text-lg font-semibold text-foreground leading-snug">
                Introduce nuestro{" "}
                <span className="font-bold" style={{ color: DEEP }}>
                  {FAMILY_BUNDLE.label}
                </span>
                : Protege a {FAMILY_BUNDLE.adults} adultos mayores por{" "}
                <span className="font-bold">${formatPlanPrice(FAMILY_BUNDLE.monthly)}/mes</span>
                {" "}— ahorra ${formatPlanPrice(FAMILY_BUNDLE.monthlySavingsVsTwo)}/mes.
              </p>
            </div>
            <a
              href={seniorSafeWhatsAppMeUrl(
                `Hola, me interesa el ${FAMILY_BUNDLE.label} para ${FAMILY_BUNDLE.adults} adultos mayores ($${formatPlanPrice(FAMILY_BUNDLE.monthly)}/mes).`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-white transition hover:scale-[1.02] shadow-md"
              style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
            >
              Consultar bundle familiar
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </aside>

        <TrustStackChileno className="mt-8 max-w-4xl mx-auto" />
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
          <TrustStackChileno className="mt-8 text-left" />
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
      title: "Planes y pagos",
      icon: CheckCircle2,
      items: [
        {
          q: FAQ_CANCELLATION_POSITIVE_Q,
          a: FAQ_CANCELLATION_POSITIVE_A,
          highlight: true,
        },
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
            <div
              className="my-4 rounded-2xl border-2 p-5 md:p-6"
              style={{
                borderColor: "color-mix(in oklab, #16a34a 35%, transparent)",
                background: "color-mix(in oklab, #16a34a 8%, white)",
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                <div>
                  <h3 className="text-base md:text-lg font-bold text-foreground">{FAQ_CANCELLATION_POSITIVE_Q}</h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    {FAQ_CANCELLATION_POSITIVE_A}
                  </p>
                </div>
              </div>
            </div>

            {sections.map((section, sectionIdx) => (
              <div key={section.title} className={sectionIdx > 0 ? "mt-6 pt-6 border-t border-border" : "pt-4"}>
                <div className="flex items-center gap-2 mb-3">
                  <section.icon className="w-4 h-4 shrink-0" style={{ color: PETROL }} />
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: PETROL }}>
                    {section.title}
                  </h3>
                </div>
                <Accordion type="single" collapsible className="w-full" defaultValue="0-0">
                  {section.items.map((item, itemIdx) => (
                    <AccordionItem
                      key={item.q}
                      value={`${sectionIdx}-${itemIdx}`}
                      className={`border-border/70 ${"highlight" in item && item.highlight ? "bg-green-50/50 rounded-xl px-2 -mx-2" : ""}`}
                    >
                      <AccordionTrigger
                        className={`text-base font-semibold text-foreground hover:no-underline py-4 ${
                          "highlight" in item && item.highlight ? "text-[#15803d]" : ""
                        }`}
                      >
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
    {
      name: "Jorge M.",
      role: "Adulto mayor, 74",
      quote:
        "Es muy fácil de usar. Mis hijos reciben la alerta al instante por WhatsApp y SMS.",
    },
    {
      name: "Paulina S.",
      role: "Viña del Mar",
      quote:
        "Agregar la app a la pantalla de inicio del celular de mi papá fue un trámite de un minuto. Totalmente recomendado.",
    },
    {
      name: "Familia Pérez",
      role: "Familia conectada",
      quote: "Por primera vez sentimos que toda la familia está protegida y unida.",
    },
  ];
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>
            Testimonios
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Familias que confían en nosotros.
          </h2>
        </div>

        <figure
          className="relative max-w-4xl mx-auto mb-10 md:mb-12 rounded-3xl border-2 p-8 md:p-12 shadow-lg overflow-hidden"
          style={{
            borderColor: "color-mix(in oklab, var(--brand-petrol) 25%, transparent)",
            background: "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 6%, white) 100%)",
          }}
        >
          <Heart
            className="absolute top-6 right-6 w-8 h-8 fill-red-500/20 text-red-500/40"
            aria-hidden
          />
          <blockquote className="relative">
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground leading-snug md:leading-relaxed">
              &ldquo;{FEATURED_TESTIMONIAL_CARMEN.quote}&rdquo;
            </p>
            <figcaption className="mt-6 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: PETROL }}
              >
                C
              </div>
              <div>
                <cite className="not-italic font-bold text-foreground">{FEATURED_TESTIMONIAL_CARMEN.name}</cite>
                <span className="block text-sm text-muted-foreground">{FEATURED_TESTIMONIAL_CARMEN.role}</span>
              </div>
            </figcaption>
          </blockquote>
        </figure>

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
