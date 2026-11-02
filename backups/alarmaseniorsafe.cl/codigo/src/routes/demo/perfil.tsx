import { createFileRoute, Link } from "@tanstack/react-router";
import { DEMO_SENIORS, DEMO_GUARDIANS, DEMO_MUNICIPALITY } from "@/lib/demo/demo-data";
import { CheckCircle2, CreditCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demo/perfil")({
  component: DemoPerfilPage,
});

const senior = DEMO_SENIORS[0];

function DemoPerfilPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        <p className="text-sm text-muted-foreground">Adulto mayor — entidad contract_signups (demo)</p>
      </header>

      <div
        className="rounded-3xl p-6 text-white"
        style={{ background: "linear-gradient(135deg, var(--brand-petrol-deep), var(--brand-petrol))" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {senior.nombre.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{senior.nombre}</h2>
            <p className="text-white/80 text-sm">
              {senior.edad} años · {senior.comuna}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Suscripción activa
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-white/15 px-3 py-1 rounded-full">
            Programa {DEMO_MUNICIPALITY.programa}
          </span>
        </div>
      </div>

      <dl className="grid gap-3 text-sm rounded-2xl border bg-card p-5">
        <Row label="Teléfono" value={senior.telefono} />
        <Row label="Dirección" value={senior.direccion} icon={MapPin} />
        <Row label="Plan" value="Plan Único Senior Safe" />
        <Row label="Pago" value={`Oneclick ·••• ${senior.oneclick_card_last4}`} icon={CreditCard} />
        <Row label="Descuento municipal" value={DEMO_MUNICIPALITY.codigo_descuento} />
      </dl>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-bold mb-3">Contactos de emergencia</h3>
        <ul className="space-y-2">
          {DEMO_GUARDIANS.map((g) => (
            <li key={g.id} className="text-sm flex justify-between py-2 border-b last:border-0">
              <span>
                {g.nombre} <span className="text-muted-foreground">({g.parentesco})</span>
              </span>
              <span className="font-mono text-xs">{g.telefono}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button asChild variant="outline">
        <Link to="/app">Ver app senior real (requiere cuenta)</Link>
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof MapPin;
}) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <dt className="text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5" />} {label}
      </dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
