import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Sparkles, Shield } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { WhatsAppActivationButton } from "@/components/whatsapp-activation-button";

export const Route = createFileRoute("/bienvenida-premium")({
  head: () => ({
    meta: [
      { title: "¡Tu plan ya está activo! — Senior Safe" },
      { name: "description", content: "Bienvenido a Senior Safe Premium. Tu suscripción está activa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BienvenidaPremiumPage,
});

const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";

function BienvenidaPremiumPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg" style={{ background: "color-mix(in oklab, #16a34a 14%, white)" }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: GREEN }} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
            <Sparkles className="w-3.5 h-3.5" /> Suscripción activa
          </div>

          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            ¡Tu plan ya está <span style={{ color: GREEN }}>activo</span>!
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground">
            Gracias por contratar Senior Safe. Tu suscripción está activa y tienes acceso completo a todas las funciones desde hoy.
          </p>

          <div className="mt-8 bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm text-left">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 mt-0.5 shrink-0" style={{ color: DEEP }} />
              <div>
                <div className="font-bold text-foreground">Siguiente paso: configura tu red de cuidado</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea tu PIN, agrega a tus familiares, activa el GPS y prueba el botón de emergencia. Toma menos de 5 minutos.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/activacion"
            className="mt-8 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-white font-bold shadow-xl"
            style={{ background: GREEN }}
          >
            Comenzar la configuración <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="mt-6 max-w-md mx-auto">
            <WhatsAppActivationButton />
          </div>
        </div>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
