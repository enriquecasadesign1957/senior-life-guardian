import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { SosFlowScreensPage } from "@/components/demo/sos-flow-screens-page";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Cómo funciona Senior Safe — Flujo SOS en tu celular" },
      {
        name: "description",
        content:
          "Recorrido interactivo: botón SOS, tipo de emergencia, mensaje al guardián y mapa GPS. Misma demo que presentaciones institucionales.",
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
        <SosFlowScreensPage />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
