import { createFileRoute, Link } from "@tanstack/react-router";
import { CASCADE_MARKETING_SUMMARY } from "@/lib/emergency-cascade-timing";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  KeyRound,
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
import { SENIOR_SAFE_INSTALL_GUIDE_URL } from "@/lib/app-url";
import { seniorSafeWhatsAppMeUrl } from "@/lib/twilio";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "Guía de instalación y uso — Senior Safe" },
      {
        name: "description",
        content:
          "Aprende paso a paso cómo descargar, instalar y usar Senior Safe en el celular del adulto mayor.",
      },
    ],
  }),
  component: GuiaPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";

const STEPS = [
  {
    n: 1,
    title: "Contrata el Plan Único",
    desc: "Entra a alarmaseniorsafe.cl, elige mensual o anual y paga con Webpay Plus. Al terminar verás un código QR o un enlace para el celular del adulto mayor.",
    tip: "Guarda el comprobante de pago por si lo necesitas después.",
  },
  {
    n: 2,
    title: "Abre el enlace en el celular del adulto mayor",
    desc: "Escanea el QR con la cámara del teléfono o abre el enlace que te enviamos. Debe abrirse en el navegador del celular (Chrome en Android o Safari en iPhone).",
    tip: "La app funciona en el smartphone; no hace falta comprar otro aparato.",
  },
  {
    n: 3,
    title: "Instala Senior Safe en la pantalla de inicio",
    desc: "Sigue las instrucciones según tu teléfono (detalle abajo). Al final verás el ícono de Senior Safe como cualquier otra app.",
    tip: "Si ya pagaste y no tienes el enlace, escríbenos por WhatsApp.",
  },
  {
    n: 4,
    title: "Configura la protección (5 minutos)",
    desc: "Dentro de la app: crea un PIN de 4 dígitos, agrega a tus familiares guardianes, activa el GPS y el sensor de caídas, y haz una prueba segura sin alerta real.",
    tip: `Hasta 3 guardianes. Alertas: ${CASCADE_MARKETING_SUMMARY}`,
  },
  {
    n: 5,
    title: "Activa las alertas por WhatsApp",
    desc: 'Escribe la palabra ACTIVAR al WhatsApp comercial de Senior Safe (+56 9 7140 4580). Así vinculamos tu cuenta con las notificaciones familiares.',
    tip: "Solo necesitas hacerlo una vez después de contratar.",
  },
  {
    n: 6,
    title: "Uso diario — ya estás protegido",
    desc: "El adulto mayor usa el botón rojo SOS si necesita ayuda. Si hay una caída, el celular vibra y suena 30 segundos: puede cancelar si está bien; si no, la familia es avisada al instante.",
    tip: "Mantén el celular con batería y conexión a internet cuando sea posible.",
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
              Cómo descargar y usar Senior Safe
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              Instrucciones simples para instalar la app en el celular del adulto mayor y dejar la red
              familiar lista en pocos minutos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/instalar-app?entrenamiento=1"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white font-bold shadow-lg"
                style={{ color: DEEP }}
              >
                Ir a instalar ahora
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
                "Los teléfonos de familiares que serán guardianes",
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
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Los 6 pasos</h2>
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
                    Abre el enlace en <strong className="text-foreground">Google Chrome</strong>.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">2.</span>
                    Toca <strong className="text-foreground">Instalar app</strong> o{" "}
                    <strong className="text-foreground">Agregar a pantalla de inicio</strong>.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-foreground">3.</span>
                    Confirma. El ícono de Senior Safe quedará en tu pantalla principal.
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
                { icon: KeyRound, label: "PIN de seguridad", color: DEEP },
                { icon: Users, label: "Guardianes familiares", color: GREEN },
                { icon: MapPin, label: "GPS activado", color: "#f59e0b" },
                { icon: Shield, label: "Sensor de caídas", color: PETROL },
                { icon: Bell, label: "Prueba segura (simulacro)", color: RED },
                { icon: MessageCircle, label: 'Activar WhatsApp (escribe ACTIVAR)', color: "#25D366" },
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
