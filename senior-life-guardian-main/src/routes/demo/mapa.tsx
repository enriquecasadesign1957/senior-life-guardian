import { createFileRoute } from "@tanstack/react-router";
import { DEMO_GEOFENCES, DEMO_GPS_HISTORY } from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";
import { DemoMapVisual } from "@/components/demo/demo-map-visual";

export const Route = createFileRoute("/demo/mapa")({
  component: DemoMapaPage,
});

function DemoMapaPage() {
  const { activeEmergency } = useDemo();
  const alertMode = activeEmergency != null && activeEmergency.status !== "closed";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mapa de Emergencias</h1>
        <p className="text-sm text-muted-foreground">
          GPS e historial simulado. Geocercas son demo institucional (no persistidas en BD producción).
        </p>
      </header>

      <DemoMapVisual label={alertMode ? "SOS activo" : "María González · Domicilio"} alertMode={alertMode} showGeofence />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-bold mb-3">Historial GPS (hoy)</h2>
          <ul className="space-y-2 text-sm">
            {DEMO_GPS_HISTORY.map((p, i) => (
              <li key={i} className="flex justify-between py-2 border-b border-border">
                <span>
                  {p.at} — {p.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-bold mb-3">Geocercas demo</h2>
          <ul className="space-y-2 text-sm">
            {DEMO_GEOFENCES.map((g) => (
              <li key={g.id} className="p-3 rounded-xl bg-muted/50 flex justify-between">
                <span>
                  <strong>{g.nombre}</strong>
                  <span className="text-muted-foreground block text-xs">{g.comuna}</span>
                </span>
                <span className={g.activa ? "text-green-700 font-bold" : "text-muted-foreground"}>
                  {g.activa ? "Activa" : "Off"} · {g.radio_m}m
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
