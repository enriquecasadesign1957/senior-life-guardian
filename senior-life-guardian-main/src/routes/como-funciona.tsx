import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { EmergencySimulator } from "@/components/sales-demo/emergency-simulator";
import { checkoutUrl } from "@/lib/plans";

const YOUTUBE_VIDEO_ID = "xSOKFh1oZnI";

const TESTIMONIALS = [
  {
    quote:
      "Estaba buscando una alarma para mi mamá en Villa Alemana, pero todas cobraban sobre 30 mil pesos al mes. Encontré Senior Safe y por $6.900 tengo la tranquilidad de que si le pasa algo, el aviso me llega al segundo por WhatsApp y me llama automáticamente. Excelente servicio.",
    author: "Carmen R.",
    role: "Hija y cuidadora",
  },
  {
    quote:
      "Lo uso yo mismo cuando salgo a trabajar temprano en Santiago Centro por el tema de la delincuencia. El menú con los 3 botones de emergencia (Salud, Accidente, Delincuencia) es súper rápido y mis hermanos saben exactamente mi ubicación GPS en el mapa si pasa algo.",
    author: "Jorge M.",
    role: "Usuario universal",
  },
  {
    quote:
      "Al principio tenía dudas porque no se descarga de la Play Store, pero agregarlo a la pantalla de inicio del celular de mi papá fue un trámite de un minuto. No gasta memoria y funciona impecable. Totalmente recomendado por el precio.",
    author: "Paulina S.",
    role: "Viña del Mar",
  },
] as const;

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona Senior Safe — Flujo SOS en tu celular" },
      {
        name: "description",
        content:
          "Simulador interactivo: botón SOS, tipo de emergencia (Salud, Accidente, Delincuencia) y panel de envíos a familiares en tiempo real.",
      },
    ],
  }),
  component: ComoFuncionaPage,
});

function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <EmergencySimulator embedded showIntro />

        <section aria-labelledby="video-tranquilidad" className="mt-12 md:mt-16">
          <h2
            id="video-tranquilidad"
            className="text-2xl font-bold text-center text-slate-800 mt-12 mb-4"
          >
            La tranquilidad que tu familia merece
          </h2>
          <p className="text-center text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-6">
            Conoce en video cómo Senior Safe protege a quienes más quieres, sin equipos caros ni
            permanencias.
          </p>
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Alarma Senior Safe — video explicativo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </section>
      </main>

      <section
        aria-labelledby="testimonios-titulo"
        className="bg-slate-50 border-y border-slate-100 py-12 md:py-16"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2
            id="testimonios-titulo"
            className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-8 md:mb-10"
          >
            Familias chilenas que ya confían en Senior Safe
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <li
                key={item.author}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
              >
                <blockquote className="text-slate-700 text-sm leading-relaxed flex-1">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-5 pt-4 border-t border-slate-100 text-sm">
                  <cite className="not-italic font-semibold text-slate-900">{item.author}</cite>
                  <span className="block text-muted-foreground mt-0.5">{item.role}</span>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="cta-contratar"
        className="py-14 md:py-20 bg-background"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2
            id="cta-contratar"
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-3"
          >
            ¿Listo para proteger a los tuyos por solo $6.900 al mes?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
            Sin contratos amarrados, sin equipos caros. Todo el control en tu celular.
          </p>
          <Link
            to={checkoutUrl()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 rounded-full text-white text-base md:text-lg font-bold uppercase tracking-wide shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 bg-[#00845a] hover:bg-[#006b48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]"
          >
            CONTRATAR PLAN ÚNICO AQUÍ
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
          <p className="mt-5 text-xs text-muted-foreground">
            Pago seguro con Transbank · Cancela cuando quieras
          </p>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
