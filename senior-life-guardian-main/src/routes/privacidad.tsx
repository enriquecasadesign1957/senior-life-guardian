import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Alarma Senior Safe" },
      { name: "description", content: "Cómo recopilamos, usamos y protegemos tus datos personales en Alarma Senior Safe." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-10">Última actualización: mayo 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Información que recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Recopilamos la información necesaria para prestar el servicio de Alarma Senior Safe: nombre,
              email, teléfono, contactos familiares, ubicación GPS durante una alerta y registros de uso de la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. Uso de la información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usamos tus datos exclusivamente para enviar alertas de emergencia a tus contactos, mejorar el
              servicio y comunicarnos contigo sobre tu cuenta. Nunca vendemos tus datos a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Compartir información</h2>
            <p className="text-muted-foreground leading-relaxed">
              Compartimos datos solo con los contactos familiares que tú autorices y con proveedores
              necesarios para el envío de mensajes (WhatsApp, SMS y llamadas), bajo estrictos acuerdos de
              confidencialidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Aplicamos cifrado en tránsito y en reposo. Nuestra plataforma cloud cumple con estándares
              internacionales de seguridad para proteger tu información.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Tus derechos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Puedes acceder, modificar o eliminar tus datos en cualquier momento escribiendo a
              hola@alarmaseniorsafe.cl.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">6. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier consulta sobre privacidad, contáctanos en hola@alarmaseniorsafe.cl.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
