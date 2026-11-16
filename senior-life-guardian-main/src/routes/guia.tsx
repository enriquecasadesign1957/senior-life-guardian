import { createFileRoute, Link } from "@tanstack/react-router";
import { isInternational } from "@/lib/market";
import { CASCADE_MARKETING_SUMMARY } from "@/lib/emergency-cascade-timing";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  MapPin,
  MessageCircle,
  Shield,
  Smartphone,
  Users,
  Bell,
  Apple,
  ArrowUp,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { checkoutUrl } from "@/lib/plans";
import { SENIOR_SAFE_INSTALL_GUIDE_URL, SENIOR_SAFE_PLAY_STORE_URL } from "@/lib/app-url";
import { seniorSafeWhatsAppMeUrl } from "@/lib/twilio";
import { buildPublicPageMeta, breadcrumbJsonLd, jsonLdHeadScript } from "@/lib/seo";

export const Route = createFileRoute("/guia")({
  head: () => {
    const page = buildPublicPageMeta({
      title: "Cómo instalar Senior Safe en el celular del abuelo — Guía paso a paso",
      description:
        isInternational
          ? "Cómo instalar Senior Safe: Google Play en Android, guía iPhone, guardianes, WhatsApp, GPS y botón SOS. Latinoamérica."
          : "Cómo instalar Senior Safe: Google Play en Android, guía iPhone, guardianes, WhatsApp, GPS y botón SOS. Chile.",
      pathname: "/guia",
      ogTitle: "Instalar Senior Safe en el celular del abuelo",
    });

    return {
      ...page,
      scripts: [
        jsonLdHeadScript(
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Guía de instalación", path: "/guia" },
          ]),
        ),
      ],
    };
  },
  component: GuiaPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";

const STEPS = [
  {
    n: 1,
    title: "La familia contrata",
    desc: isInternational
      ? "Entra a alarmaseniorsafe.com, elige mensual o anual y paga con Lemon Squeezy. El teléfono de quien paga queda como primer guardián y recibe las alertas."
      : "Entra a alarmaseniorsafe.cl, elige mensual o anual y paga con Oneclick. Si contrata un familiar, su teléfono recibe las alertas. Si contrata el adulto mayor, ese teléfono queda en la app y debe indicar otro número, el de un guardián.",
    tip: "Otros familiares se agregan después desde el portal de la familia, en su propio celular.",
  },
  {
    n: 2,
    title: "Instala en el celular del adulto mayor",
    desc: "Abre el enlace del pago en ese celular. En Android se abre Google Play. En iPhone, Safari pide 3 toques: Compartir, Añadir a inicio, Añadir.",
    tip: "Si abres la app de Google Play por primera vez, la familia entra una vez con el correo del plan.",
  },
  {
    n: 3,
    title: "El adulto mayor aprende el botón rojo",
    desc: "La primera pulsación solo enciende la ubicación y no avisa a nadie. Después, el botón pide ayuda de verdad. Si hay una caída, el celular vibra y suena 30 segundos antes de avisar.",
    tip: `Alertas: ${CASCADE_MARKETING_SUMMARY}`,
  },
];

function GuiaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section
          className="py-16 md:py-20 text-white"
          style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold mb-6">
              <Download className="w-4 h-4" />
              Guía paso a paso
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Cómo instalar Senior Safe en el celular del abuelo
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              En Android: descarga desde Google Play. En iPhone: agrega a la pantalla de inicio con Safari.
              Luego conecta a la familia en pocos minutos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={SENIOR_SAFE_PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white font-bold shadow-lg"
                style={{ color: DEEP }}
              >
                Disponible en Google Play
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={seniorSafeWhatsAppMeUrl("Hola, necesito ayuda para instalar Senior Safe")}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold ring-2 ring-white/30 text-white"
              >
                <MessageCircle className="w-5 h-5" />
                Ayuda por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 bg-background">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Antes de empezar</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                "Un smartphone Android o iPhone compatible",
                "Conexión a internet (Wi‑Fi o datos móviles)",
                "Haber contratado el Plan Único en alarmaseniorsafe.cl",
                "El teléfono de quien va a recibir la primera alerta",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4 text-sm md:text-base"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-14 md:py-16" style={{ background: "var(--gradient-soft)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Los 3 pasos</h2>
            <div className="space-y-6">
              {STEPS.map((step) => (
                <article
                  key={step.n}
                  className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: DEEP }}
                    >
                      {step.n}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                      <p className="mt-3 text-sm font-medium" style={{ color: PETROL }}>
                        💡 {step.tip}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Cómo instalar según tu teléfono</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <Smartphone className="w-8 h-8" style={{ color: GREEN }} />
                  <h3 className="text-xl font-bold">Android</h3>
                </div>
                <ol className="space-y-4 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">1.</span>
                    Abre{" "}
                    <a
                      href={SENIOR_SAFE_PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2"
                      style={{ color: PETROL }}
                    >
                      Google Play — Senior Safe
                    </a>
                    .
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">2.</span>
                    Toca <strong className="text-foreground">Instalar</strong> y espera a que termine.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">3.</span>
                    Vuelve al enlace y abre el botón rojo. Si entras por la app de Play, la familia escribe una vez el correo del plan.
                  </li>
                </ol>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <Apple className="w-8 h-8" style={{ color: PETROL }} />
                  <h3 className="text-xl font-bold">iPhone (Safari)</h3>
                </div>
                <ol className="space-y-4 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">1.</span>
                    Abre el enlace en <strong className="text-foreground">Safari</strong> (no en Chrome).
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="font-bold text-foreground shrink-0">2.</span>
                    <span>
                      Toca el botón <strong className="text-foreground inline-flex items-center gap-1">
                        Compartir <ArrowUp className="w-4 h-4" />
                      </strong>{" "}
                      (cuadrado con flecha hacia arriba).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">3.</span>
                    Elige <strong className="text-foreground">Agregar a pantalla de inicio</strong> y confirma.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16" style={{ background: "var(--gradient-soft)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Dentro de la app</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Bell, label: "Botón rojo de emergencia", color: RED },
                { icon: MapPin, label: "Ubicación al pedir ayuda", color: "#f59e0b" },
                { icon: Shield, label: "Detección de caídas", color: PETROL },
                { icon: Users, label: "La familia administra los contactos", color: GREEN },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4"
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ background: color }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-sm md:text-base">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 bg-background">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Aún no has contratado?</h2>
            <p className="text-muted-foreground mb-8">
              El primer paso es activar tu Plan Único. Luego sigues esta misma guía para instalar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/checkout"
                search={{ mode: "contratar", plan: "unico", periodo: "mensual" }}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-white font-bold"
                style={{ background: DEEP }}
              >
                Contratar ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={checkoutUrl()}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-border font-semibold"
              >
                Ver checkout
              </a>
            </div>
            <p className="mt-8 text-xs text-muted-foreground break-all">
              Enlace de esta guía: {SENIOR_SAFE_INSTALL_GUIDE_URL}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
