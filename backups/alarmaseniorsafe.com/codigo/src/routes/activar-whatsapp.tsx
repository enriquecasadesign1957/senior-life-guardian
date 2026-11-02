import { createFileRoute, Link } from "@tanstack/react-router";
import { POST_PAYMENT_INSTALL_PATH } from "@/lib/post-payment";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppActivarCta } from "@/components/whatsapp-activar-cta";
import {
  isWhatsAppActivatedLocally,
  markWhatsAppActivatedLocally,
} from "@/lib/whatsapp-activation-local";
import { whatsAppActivarUrl } from "@/lib/whatsapp-commercial-activation";

export const Route = createFileRoute("/activar-whatsapp")({
  head: () => ({
    meta: [
      { title: "Activa tus alertas WhatsApp — Senior Safe" },
      {
        name: "description",
        content:
          "Vincula WhatsApp con Senior Safe. En la app también se activa al usar el botón rojo por primera vez.",
      },
    ],
  }),
  component: ActivarWhatsAppPage,
});

function ActivarWhatsAppPage() {
  const [activated, setActivated] = useState(() => isWhatsAppActivatedLocally());

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto") === "1" && !isWhatsAppActivatedLocally()) {
        window.location.href = whatsAppActivarUrl();
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to={POST_PAYMENT_INSTALL_PATH}
            search={{ entrenamiento: "1" }}
            className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la app
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Vincular WhatsApp
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Si ya instalaste la app, la primera pulsación del botón rojo también vincula WhatsApp
              automáticamente. Este paso es opcional.
            </p>
          </div>

          {activated && (
            <div
              role="status"
              className="mb-6 rounded-2xl border-2 p-5 flex items-start gap-4"
              style={{ borderColor: "#16a34a", background: "#f0fdf4" }}
            >
              <CheckCircle2 className="w-8 h-8 flex-shrink-0" style={{ color: "#16a34a" }} />
              <div>
                <div className="text-xl font-bold text-foreground">WhatsApp vinculado</div>
                <div className="text-base text-muted-foreground">
                  Tu cuenta ya está conectada al chat de Senior Safe.
                </div>
              </div>
            </div>
          )}

          <WhatsAppActivarCta />

          {!activated && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Tras enviar el mensaje, vuelve a la app. No necesitas confirmar aquí si usaste el botón
              rojo por primera vez.
            </p>
          )}

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                markWhatsAppActivatedLocally();
                setActivated(true);
              }}
              className="text-sm font-semibold underline underline-offset-2 text-muted-foreground hover:text-foreground"
            >
              Ya envié el mensaje — marcar como listo
            </button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
