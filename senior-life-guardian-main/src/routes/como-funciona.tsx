import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Play, Star } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { EmergencySimulator } from "@/components/sales-demo/emergency-simulator";
import { checkoutUrl, formatPlanPrice, PLAN } from "@/lib/plans";

const YOUTUBE_VIDEO_ID = "xSOKFh1oZnI";
const YOUTUBE_THUMB = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;

type TestimonialSegment = { text: string; highlight?: boolean };

const TESTIMONIALS: {
  segments: TestimonialSegment[];
  author: string;
  role: string;
}[] = [
  {
    segments: [
      { text: "Estaba buscando una alarma para mi mamá en Villa Alemana, pero todas cobraban sobre 30 mil pesos al mes. Encontré Senior Safe y " },
      { text: "por $6.900 tengo la tranquilidad", highlight: true },
      { text: " de que si le pasa algo, el aviso me llega al segundo por WhatsApp y me llama automáticamente. Excelente servicio." },
    ],
    author: "Carmen R.",
    role: "Hija y cuidadora · Villa Alemana",
  },
  {
    segments: [
      { text: "Lo uso yo mismo cuando salgo a trabajar temprano en Santiago Centro por el tema de la delincuencia. El menú con los 3 botones de emergencia (Salud, Accidente, Delincuencia) es súper rápido y " },
      { text: "mis hermanos saben exactamente mi ubicación GPS", highlight: true },
      { text: " en el mapa si pasa algo." },
    ],
    author: "Jorge M.",
    role: "Usuario universal · Santiago Centro",
  },
  {
    segments: [
      { text: "Al principio tenía dudas porque no se descarga de la Play Store, pero agregarlo a la pantalla de inicio del celular de mi papá fue un trámite de un minuto. No gasta memoria y " },
      { text: "funciona impecable", highlight: true },
      { text: ". Totalmente recomendado por el precio." },
    ],
    author: "Paulina S.",
    role: "Viña del Mar",
  },
];

const TRUST_CTA_ITEMS = [
  "Pago seguro con Transbank",
  "Sin contratos ni permanencia",
  "Cancela con 1 click cuando quieras",
] as const;

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo protege Senior Safe a tu familia — Simulador y testimonios" },
      {
        name: "description",
        content:
          "Prueba el simulador SOS en vivo y mira cómo Senior Safe alerta a tu familia por WhatsApp, SMS y llamada. Desde $6.900/mes, sin permanencia.",
      },
    ],
  }),
  component: ComoFuncionaPage,
});

function StarRating() {
  return (
    <div className="flex items-center gap-0.5 mb-4" aria-label="5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400 shrink-0"
          aria-hidden
        />
      ))}
    </div>
  );
}

function VideoReinforcementSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      aria-labelledby="video-tranquilidad"
      className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-slate-200"
    >
      <h2
        id="video-tranquilidad"
        className="text-lg sm:text-xl md:text-2xl font-bold text-center text-slate-900 leading-snug px-1"
      >
        Mira cómo Senior Safe protege a tu familiar en caso de emergencia
      </h2>
      <p className="text-center text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-2 mb-5 md:mb-6 leading-relaxed px-1 line-clamp-2 sm:line-clamp-none">
        Ya probaste el simulador — ahora conoce el servicio completo en 2 minutos.
      </p>

      <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`}
            title="Alarma Senior Safe — video explicativo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-center justify-center w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]"
            aria-label="Reproducir video: cómo funciona Senior Safe"
          >
            <img
              src={YOUTUBE_THUMB}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-slate-950/35 group-hover:bg-slate-950/25 transition-colors" />
            <span className="relative z-10 flex flex-col items-center gap-3 px-4">
              <span className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#00845a] text-white shadow-2xl group-hover:scale-105 group-hover:bg-[#006b48] transition-all duration-300">
                <Play className="w-6 h-6 sm:w-9 sm:h-9 ml-1 fill-current" aria-hidden />
              </span>
              <span className="text-white text-sm sm:text-base font-bold drop-shadow-md text-center leading-snug">
                Ver video explicativo
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

function ComoFuncionaPage() {
  const monthlyLabel = `$${formatPlanPrice(PLAN.monthly)}/mes`;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-2 md:py-12">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Volver al inicio
        </Link>

        {/* 1. Hero */}
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight px-1">
            Protege a tu familiar en una emergencia
          </h1>
          <p className="mt-2 md:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-snug md:leading-relaxed max-w-2xl mx-auto px-1 line-clamp-2 md:line-clamp-none">
            Un botón y la alerta llega al instante por WhatsApp, SMS y llamada.
          </p>
        </header>

        {/* 2. Simulador interactivo — inmediatamente tras el hero */}
        <section aria-labelledby="simulador-titulo" className="mt-3 md:mt-6">
          <h2 id="simulador-titulo" className="sr-only">
            Simulador interactivo Senior Safe
          </h2>
          <p className="text-center text-xs sm:text-sm font-semibold text-sky-700 mb-2 md:mb-3">
            ¡Pruébalo en tiempo real! Toca S.O.S abajo ↓
          </p>
          <EmergencySimulator
            embedded
            showIntro={false}
            showConversionTrigger
            priorityMobile
          />
        </section>

        {/* 3. Video — refuerzo después del simulador */}
        <VideoReinforcementSection />
      </main>

      {/* 4. Testimonios */}
      <section
        aria-labelledby="testimonios-titulo"
        className="bg-slate-50 border-y border-slate-100 py-10 md:py-16 mt-8 md:mt-12"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2
            id="testimonios-titulo"
            className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-10 leading-snug px-1"
          >
            Familias chilenas que ya confían en Senior Safe
          </h2>
          <ul className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <li
                key={item.author}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col min-w-0"
              >
                <StarRating />
                <blockquote className="text-slate-700 text-sm sm:text-[15px] leading-relaxed flex-1 break-words">
                  &ldquo;
                  {item.segments.map((seg, i) =>
                    seg.highlight ? (
                      <strong key={i} className="font-bold text-slate-900">
                        {seg.text}
                      </strong>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                  &rdquo;
                </blockquote>
                <footer className="mt-5 pt-4 border-t border-slate-100 text-sm min-w-0">
                  <cite className="not-italic font-semibold text-slate-900">{item.author}</cite>
                  <span className="block text-muted-foreground mt-0.5 text-xs sm:text-sm leading-snug">
                    {item.role}
                  </span>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final */}
      <section aria-labelledby="cta-contratar" className="py-12 md:py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2
            id="cta-contratar"
            className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug px-1"
          >
            ¿Listo para proteger a los tuyos por solo {monthlyLabel}?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-7 md:mb-8 leading-relaxed px-1">
            Sin contratos amarrados, sin equipos caros. Todo el control en tu celular.
          </p>
          <Link
            to={checkoutUrl()}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-md mx-auto px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full text-white text-sm sm:text-base md:text-lg font-bold shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 bg-[#00845a] hover:bg-[#006b48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]"
          >
            Proteger a mi familia ahora — {monthlyLabel}
            <ArrowRight className="w-5 h-5 shrink-0" aria-hidden />
          </Link>
          <ul
            className="mt-5 md:mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs sm:text-sm text-slate-600 leading-snug px-1"
            aria-label="Garantías de compra"
          >
            {TRUST_CTA_ITEMS.map((item, i) => (
              <li key={item} className="flex items-center gap-1.5 shrink-0">
                {i > 0 && (
                  <span className="hidden sm:inline text-slate-300 mx-0.5" aria-hidden>
                    ·
                  </span>
                )}
                <span className="text-[#00845a] font-bold" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
