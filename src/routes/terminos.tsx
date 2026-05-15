import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — Alarma Senior Safe" },
      { name: "description", content: "Términos del servicio de Alarma Senior Safe: uso, suscripciones y responsabilidades." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Términos y Condiciones</h1>
        <p className="text-muted-foreground mb-10">Última actualización: mayo 2026</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Aceptación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al usar Alarma Senior Safe aceptas estos términos. Si no estás de acuerdo, no uses el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alarma Senior Safe es una aplicación de alertas para adultos mayores que envía notificaciones
              a contactos familiares mediante WhatsApp, SMS, llamadas y ubicación GPS. El servicio depende
              de la conexión a internet y de proveedores externos de mensajería.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Suscripción y pagos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ofrecemos planes mensuales y anuales sin permanencia. Puedes cancelar en cualquier momento.
              Los pagos se procesan a través de Webpay y/o Stripe en futuras versiones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Prueba gratis</h2>
            <p className="text-muted-foreground leading-relaxed">
              La prueba de 7 días no requiere tarjeta y no genera cobros automáticos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alarma Senior Safe complementa pero no reemplaza los servicios de emergencia oficiales.
              No somos responsables por fallas de red, dispositivos o de proveedores externos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar estos términos. Notificaremos cambios relevantes por email o desde la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas legales o del servicio: hola@alarmaseniorsafe.cl.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
