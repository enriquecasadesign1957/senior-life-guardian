import { createFileRoute, Link } from "@tanstack/react-router";
import { DEMO_NAV_SECTIONS } from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";
import { DemoNav } from "@/components/demo/demo-nav";
import { ChevronRight, Users, Bell, Clock, Heart } from "lucide-react";

export const Route = createFileRoute("/demo/")({
  validateSearch: (search: Record<string, unknown>) => ({
    institucion:
      typeof search.institucion === "string" ? search.institucion : "las-condes",
  }),
  component: DemoHubPage,
});

const DEEP = "var(--brand-petrol-deep)";

function DemoHubPage() {
  const { preset } = useDemo();
  const institucion = Route.useSearch().institucion ?? preset.slug;
  const kpis = preset.kpis;
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Programa municipal</p>
        <h1 className="text-3xl font-bold mt-1">{preset.municipality.nombre}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Modo demostración para reuniones con municipalidades. UI y flujos reales de Senior Safe, datos simulados
          alineados al modelo <code className="text-xs bg-muted px-1 rounded">contract_signups</code> y{" "}
          <code className="text-xs bg-muted px-1 rounded">alert_logs</code>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Usuarios protegidos" value={kpis.usuarios_protegidos.toLocaleString("es-CL")} />
        <Kpi icon={Bell} label="Alertas del mes" value={String(kpis.alertas_mes)} />
        <Kpi icon={Clock} label="Respuesta prom." value={`${kpis.tiempo_respuesta_promedio_min} min`} />
        <Kpi icon={Heart} label="Satisfacción" value={`${kpis.satisfaccion_pct}%`} />
      </div>

      <div className="lg:hidden">
        <DemoNav compact />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DEMO_NAV_SECTIONS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            search={{ institucion }}
            className="group p-5 rounded-2xl border border-border bg-card hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-foreground group-hover:underline">{s.label}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition" style={{ color: DEEP }} />
          </Link>
        ))}
      </div>

      <div className="p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 text-sm text-amber-950">
        Usa el botón flotante <strong>«Simular Emergencia»</strong> para ejecutar la cascada SOS (SMS → WhatsApp →
        confirmación) sin enviar mensajes reales.
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-border bg-card">
      <Icon className="w-5 h-5 mb-2 opacity-70" style={{ color: DEEP }} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
