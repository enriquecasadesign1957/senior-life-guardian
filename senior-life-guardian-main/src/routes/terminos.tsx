import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { CANCELLATION_POLICY_BULLETS } from "@/lib/subscription-cancellation-policy";

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
        <p className="text-muted-foreground mb-10">Última actualización: junio 2026</p>

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
              Ofrecemos planes mensuales y anuales sin permanencia contractual. Los pagos se procesan a
              través de Webpay Plus. Puedes solicitar la baja del plan en cualquier momento escribiendo a
              hola@alarmaseniorsafe.cl.
            </p>
          </section>

          <section id="cancelacion">
            <h2 className="text-2xl font-bold mb-3">4. Cancelación y reembolsos</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-5">
              {CANCELLATION_POLICY_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La cancelación implica dejar de renovar o solicitar la baja del servicio. No se generan cargos
              adicionales por cancelar. El acceso al servicio se mantiene hasta el término del periodo ya
              pagado, salvo que solicites una baja anticipada conforme a esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Activación y pago</h2>
            <p className="text-muted-foreground leading-relaxed">
              El servicio requiere pago previo con Webpay Plus. Tras confirmar el pago, puedes practicar el botón de emergencia en modo simulación sin envíos reales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alarma Senior Safe complementa pero no reemplaza los servicios de emergencia oficiales.
              No somos responsables por fallas de red, dispositivos o de proveedores externos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">7. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar estos términos. Notificaremos cambios relevantes por email o desde la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">8. Contacto</h2>
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
