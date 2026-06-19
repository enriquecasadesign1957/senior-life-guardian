import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gift, Percent, MessageCircle, CreditCard, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHubPage,
  head: () => ({ meta: [{ title: "Administración — Senior Safe" }] }),
});

const SECTIONS = [
  {
    to: "/admin/accounts",
    label: "Gratuidad / cortesía",
    desc: "Activar Senior Safe sin cobro para una cuenta (convenios, becas, soporte).",
    icon: Gift,
  },
  {
    to: "/admin/discounts",
    label: "Códigos de descuento",
    desc: "Crear y administrar convenios municipales y descuentos en checkout.",
    icon: Percent,
  },
  {
    to: "/admin/inbox",
    label: "Bandeja WhatsApp",
    desc: "Mensajes comerciales entrantes y respuestas.",
    icon: MessageCircle,
  },
  {
    to: "/admin/transbank-validacion",
    label: "Validación Transbank",
    desc: "Pruebas Oneclick Mall (integración).",
    icon: CreditCard,
  },
  {
    to: "/admin/reset",
    label: "Reset de prueba",
    desc: "Limpiar datos de entrenamiento (solo desarrollo).",
    icon: RotateCcw,
  },
] as const;

function AdminHubPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Administración Senior Safe</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Herramientas internas. Cada sección pide el PIN de administración (
          <code className="text-xs bg-muted px-1 rounded">ADMIN_PIN</code> o{" "}
          <code className="text-xs bg-muted px-1 rounded">ADMIN_INBOX_PIN</code>).
        </p>

        <div className="grid gap-3">
          {SECTIONS.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition"
            >
              <span className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </span>
              <div>
                <div className="font-bold text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
