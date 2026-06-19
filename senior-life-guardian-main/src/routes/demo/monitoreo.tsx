import { createFileRoute } from "@tanstack/react-router";
import { DEMO_OPERATORS, DEMO_SENIORS } from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";
import { Activity, Battery, Info, Wifi } from "lucide-react";

export const Route = createFileRoute("/demo/monitoreo")({
  head: () => ({
    meta: [{ title: "Supervisión del programa — Demo Senior Safe" }],
  }),
  component: DemoSupervisionPage,
});

function DemoSupervisionPage() {
  const { alerts, activeEmergency } = useDemo();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Supervisión del programa</h1>
        <p className="text-sm text-muted-foreground">
          Maqueta institucional para reuniones — seguimiento agregado del convenio municipal
        </p>
      </header>

      <div
        className="flex gap-3 p-4 rounded-2xl border border-sky-200 bg-sky-50/90 text-sm text-sky-950"
        role="note"
      >
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-sky-700" aria-hidden="true" />
        <div className="space-y-1.5 leading-relaxed">
          <p className="font-bold">Vista conceptual — no operativa</p>
          <p>
            Esta pantalla es solo para <strong>presentaciones</strong> con la municipalidad. Los datos son simulados y{" "}
            <strong>no reemplaza</strong> la respuesta real ante emergencias.
          </p>
          <p className="text-sky-900/90">
            En producción, las alertas SOS van <strong>directo a la familia</strong> (SMS, WhatsApp y llamada en
            cascada). Aquí se ilustra cómo el municipio podría <em>supervisar</em> usuarios del programa, no operar
            una central de despacho.
          </p>
        </div>
      </div>

      <section aria-labelledby="equipo-supervision-heading">
        <h2 id="equipo-supervision-heading" className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Equipo de supervisión (simulado)
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DEMO_OPERATORS.map((op) => (
            <div key={op.id} className="p-4 rounded-2xl border bg-card">
              <div className="font-bold">{op.nombre}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {op.rol} · Turno {op.turno}
              </div>
              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                En línea
              </span>
            </div>
          ))}
        </div>
      </section>

      {activeEmergency && activeEmergency.status !== "closed" && (
        <div className="p-4 rounded-2xl border-2 border-red-300 bg-red-50 animate-pulse">
          <strong className="text-red-800">Alerta simulada en curso:</strong> {activeEmergency.seniorNombre} — la
          cascada real la atiende la familia; esto es solo visibilidad demo del programa.
        </div>
      )}

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="font-bold text-sm">Usuarios del programa</h2>
          <p className="text-xs text-muted-foreground">Estado agregado (datos demo)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Usuario</th>
              <th className="p-3">Comuna</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Señales</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_SENIORS.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.nombre}</td>
                <td className="p-3">{s.comuna}</td>
                <td className="p-3">
                  <span className="text-green-700 font-semibold">Seguro</span>
                </td>
                <td className="p-3 flex gap-2 text-muted-foreground">
                  <Wifi className="w-4 h-4" aria-hidden="true" /> <Battery className="w-4 h-4" aria-hidden="true" />{" "}
                  <Activity className="w-4 h-4" aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <h2 className="font-bold mb-1">Últimas alertas del programa</h2>
        <p className="text-xs text-muted-foreground mb-3">Registro agregado para reportes municipales (simulado)</p>
        <ul className="space-y-2 text-sm">
          {alerts.slice(0, 5).map((a) => (
            <li key={a.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <span>
                {a.senior_nombre} — <code>{a.event_type}</code>
              </span>
              <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString("es-CL")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
