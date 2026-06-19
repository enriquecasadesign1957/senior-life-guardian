import { createFileRoute } from "@tanstack/react-router";
import { useDemo } from "@/lib/demo/demo-context";
import { DEMO_GUARDIANS } from "@/lib/demo/demo-data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/demo/alertas")({
  component: DemoAlertasPage,
});

function statusLabel(status: string) {
  const map: Record<string, string> = {
    delivered: "Entregada",
    partial: "Parcial",
    pending: "Pendiente",
    simulated: "Simulada",
  };
  return map[status] ?? status;
}

function DemoAlertasPage() {
  const { alerts, activeEmergency } = useDemo();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Gestión de Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Réplica visual del modelo <code className="text-xs bg-muted px-1 rounded">alert_logs</code> y cascada Twilio
        </p>
      </header>

      {activeEmergency && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <h2 className="font-bold text-destructive">Simulación en curso</h2>
          <ol className="text-sm space-y-1">
            {activeEmergency.steps.map((s, i) => (
              <li key={i}>
                [{s.channel}] {s.to}: {s.message.slice(0, 60)}…
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="rounded-2xl border bg-card divide-y divide-border">
        {alerts.map((a) => (
          <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
            <div>
              <div className="font-bold">{a.senior_nombre}</div>
              <div className="text-xs text-muted-foreground">
                {a.event_type} · {a.comuna} · {new Date(a.created_at).toLocaleString("es-CL")}
              </div>
              <div className="text-xs font-mono mt-1">
                GPS {a.gps_lat.toFixed(4)}, {a.gps_lng.toFixed(4)} (±{a.gps_accuracy}m)
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant={a.status === "delivered" ? "default" : "secondary"}>{statusLabel(a.status)}</Badge>
              {a.acknowledged_by && (
                <span className="text-xs text-green-700">Acuse: {a.acknowledged_by}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-bold mb-3">Guardianes (emergency_contacts)</h2>
        <ul className="grid sm:grid-cols-3 gap-3 text-sm">
          {DEMO_GUARDIANS.map((g) => (
            <li key={g.id} className="p-3 rounded-xl bg-muted/40 border border-border">
              <div className="font-semibold">{g.nombre}</div>
              <div className="text-muted-foreground text-xs">{g.parentesco}</div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {g.recibe_sms && <Badge variant="outline">SMS</Badge>}
                {g.recibe_whatsapp && <Badge variant="outline">WA</Badge>}
                {g.recibe_llamada && <Badge variant="outline">Voz</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
