import { createFileRoute } from "@tanstack/react-router";
import {
  DEMO_ALERTS_BY_MONTH,
  DEMO_INSTITUTIONS,
  DEMO_RESPONSE_TIME_TREND,
} from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/demo/ejecutivo")({
  component: DemoEjecutivoPage,
});

function DemoEjecutivoPage() {
  const { preset } = useDemo();
  const kpis = preset.kpis;
  const alertsByComuna = preset.alertsByComuna;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard Ejecutivo</h1>
        <p className="text-muted-foreground text-sm">KPIs para autoridades municipales y salud comunal</p>
      </header>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ["Usuarios protegidos", kpis.usuarios_protegidos],
          ["Alertas mes", kpis.alertas_mes],
          ["Casos críticos", kpis.casos_criticos_mes],
          ["Tasa acuse", `${kpis.tasa_ack_pct}%`],
          ["Familiares", kpis.familiares_vinculados],
          ["Comunas", kpis.cobertura_comunas],
          ["Respuesta prom.", `${kpis.tiempo_respuesta_promedio_min} min`],
          ["Satisfacción", `${kpis.satisfaccion_pct}%`],
        ].map(([label, val]) => (
          <div key={String(label)} className="p-4 rounded-2xl border bg-card">
            <div className="text-2xl font-bold">{typeof val === "number" ? val.toLocaleString("es-CL") : val}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Alertas por mes">
          <ChartContainer config={{ alertas: { label: "Alertas", color: "hsl(var(--primary))" } }} className="h-[240px] w-full">
            <BarChart data={DEMO_ALERTS_BY_MONTH}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="alertas" fill="var(--color-alertas)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Tiempo de respuesta (semanas)">
          <ChartContainer config={{ minutos: { label: "Minutos", color: "#16a34a" } }} className="h-[240px] w-full">
            <LineChart data={DEMO_RESPONSE_TIME_TREND}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="semana" />
              <YAxis domain={[3, 6]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="minutos" stroke="var(--color-minutos)" strokeWidth={2} dot />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-bold mb-3">Instituciones vinculadas</h2>
        <ul className="divide-y divide-border">
          {DEMO_INSTITUTIONS.map((i) => (
            <li key={i.id} className="py-3 flex justify-between text-sm">
              <span>
                <strong>{i.nombre}</strong>
                <span className="text-muted-foreground ml-2 capitalize">({i.tipo})</span>
              </span>
              <span className="font-mono">{i.usuarios_protegidos} usuarios</span>
            </li>
          ))}
        </ul>
      </div>

      <ChartCard title="Alertas por comuna">
        <ChartContainer config={{ alertas: { label: "Alertas", color: "hsl(var(--primary))" } }} className="h-[200px] w-full">
          <BarChart data={alertsByComuna} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" />
            <YAxis dataKey="comuna" type="category" width={75} />
            <Bar dataKey="alertas" fill="var(--color-alertas)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
