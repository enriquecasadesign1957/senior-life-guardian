import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, Copy, ArrowLeft, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/activar-whatsapp")({
  head: () => ({
    meta: [
      { title: "Activa tus alertas WhatsApp — Senior Safe" },
      { name: "description", content: "Activa las alertas por WhatsApp en 2 pasos: envía la palabra ACTIVAR a nuestro número oficial y listo." },
    ],
  }),
  component: ActivarWhatsAppPage,
});

// Número oficial Senior Safe (WhatsApp). Usamos el sender Twilio verificado.
const WA_NUMBER_DISPLAY = "+1 415 523 8886";
const WA_NUMBER_E164 = "14155238886";
// Código del sandbox Twilio. Debe enviarse EXACTAMENTE así para que Twilio
// registre el número del usuario y pueda recibir alertas.
const KEYWORD = "join ask-he";
const WA_LINK = `https://wa.me/${WA_NUMBER_E164}?text=${encodeURIComponent(KEYWORD)}`;
const STORAGE_KEY = "ss_whatsapp_activated";

function ActivarWhatsAppPage() {
  const [activated, setActivated] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setActivated(true);
    } catch {}
    // Auto-abrir WhatsApp si el usuario llega con ?auto=1 (desde la APK / CTA)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto") === "1" && localStorage.getItem(STORAGE_KEY) !== "1") {
        setTimeout(() => {
          setOpened(true);
          window.location.href = WA_LINK;
        }, 600);
      }
    } catch {}
  }, []);

  const markActivated = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setActivated(true);
    toast.success("¡Listo! Tus alertas por WhatsApp están activas.");
  };

  const copyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(KEYWORD);
      toast.success("Palabra copiada: ACTIVAR");
    } catch {
      toast.error("No se pudo copiar. Escríbela manualmente: ACTIVAR");
    }
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(WA_NUMBER_DISPLAY);
      toast.success("Número copiado");
    } catch {
      toast.error("No se pudo copiar el número");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/activacion"
            className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a activación
          </Link>

          {/* Hero */}
          <div className="text-center mb-8">
            <div
              className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "#25D366" }}
              aria-hidden
            >
              <MessageCircle className="w-12 h-12 text-white" fill="white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Activa tus alertas WhatsApp
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Solo 2 pasos. Así podremos avisar a tu familia cuando lo necesites.
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
                <div className="text-xl font-bold text-foreground">¡WhatsApp activado!</div>
                <div className="text-base text-muted-foreground">
                  Tus alertas se enviarán por WhatsApp a tus familiares.
                </div>
              </div>
            </div>
          )}

          {/* Paso 1 */}
          <section className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-extrabold">
                1
              </div>
              <h2 className="text-2xl font-bold">Abre WhatsApp</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-5">
              Toca el botón verde. Se abrirá WhatsApp con un mensaje ya escrito.
              Solo debes <strong>presionar enviar</strong>.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpened(true)}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-white text-xl font-bold shadow-xl hover:scale-[1.02] transition active:scale-100"
              style={{ background: "#25D366", minHeight: 64 }}
            >
              <MessageCircle className="w-7 h-7" fill="white" />
              Abrir WhatsApp
            </a>

            <div className="mt-6 rounded-2xl bg-muted/50 p-5 space-y-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                ¿No se abre? Hazlo manualmente:
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Envía la palabra:</div>
                <div className="flex items-center justify-between gap-3 bg-background rounded-xl border-2 border-border px-4 py-3">
                  <span className="text-2xl font-extrabold tracking-wider">{KEYWORD}</span>
                  <Button variant="outline" size="sm" onClick={copyKeyword} className="h-10">
                    <Copy className="w-4 h-4 mr-1" /> Copiar
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Al número:</div>
                <div className="flex items-center justify-between gap-3 bg-background rounded-xl border-2 border-border px-4 py-3">
                  <span className="text-2xl font-extrabold">{WA_NUMBER_DISPLAY}</span>
                  <Button variant="outline" size="sm" onClick={copyNumber} className="h-10">
                    <Copy className="w-4 h-4 mr-1" /> Copiar
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Paso 2 */}
          <section className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 mb-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-extrabold">
                2
              </div>
              <h2 className="text-2xl font-bold">Confirma aquí cuando lo hayas enviado</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-5">
              Cuando hayas enviado la palabra <strong>ACTIVAR</strong>, vuelve a esta pantalla
              y toca el botón de abajo.
            </p>
            <Button
              onClick={markActivated}
              disabled={activated}
              className="w-full text-xl font-bold rounded-2xl shadow-lg"
              style={{
                minHeight: 64,
                background: activated ? "#94a3b8" : "var(--brand-petrol)",
                color: "white",
              }}
            >
              <CheckCircle2 className="w-7 h-7 mr-2" />
              {activated ? "Ya está activado" : "Ya envié el mensaje"}
            </Button>
            {!activated && opened && (
              <p className="mt-3 text-sm text-muted-foreground text-center">
                Esperamos que WhatsApp se haya abierto correctamente.
              </p>
            )}
          </section>

          {/* Confianza */}
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-5">
            <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "var(--brand-petrol)" }} />
            <div className="text-base text-muted-foreground">
              Usamos WhatsApp porque es la forma más rápida y segura de avisar a tu familia.
              Tu número solo se usa para enviarte alertas.
            </div>
          </div>

          {activated && (
            <div className="mt-8 text-center">
              <Link
                to="/activacion"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-lg font-bold text-white shadow-lg hover:scale-[1.02] transition"
                style={{ background: "var(--brand-petrol)", minHeight: 56 }}
              >
                Continuar con la activación
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
