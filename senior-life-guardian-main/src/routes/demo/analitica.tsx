import { createFileRoute } from "@tanstack/react-router";
import { DEMO_ALERTS_BY_MONTH, DEMO_ALERTS_BY_COMUNA, DEMO_KPIS } from "@/lib/demo/demo-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DemoInsightsChat } from "@/components/demo/demo-insights-chat";

export const Route = createFileRoute("/demo/analitica")({
  component: DemoAnaliticaPage,
});

function DemoAnaliticaPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analítica</h1>
        <p className="text-sm text-muted-foreground">Tendencias e impacto del programa</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-bold mb-4">Alertas vs casos críticos</h2>
          <ChartContainer
            config={{
              alertas: { label: "Alertas", color: "hsl(var(--primary))" },
              criticos: { label: "Críticos", color: "#dc2626" },
            }}
            className="h-[260px] w-full"
          >
            <AreaChart data={DEMO_ALERTS_BY_MONTH}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="alertas" fill="var(--color-alertas)" fillOpacity={0.3} stroke="var(--color-alertas)" />
              <Area type="monotone" dataKey="criticos" fill="var(--color-criticos)" fillOpacity={0.3} stroke="var(--color-criticos)" />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-bold mb-4">Distribución por comuna</h2>
          <ChartContainer config={{ alertas: { label: "Alertas", color: "#0d9488" } }} className="h-[260px] w-full">
            <BarChart data={DEMO_ALERTS_BY_COMUNA}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="comuna" tick={{ fontSize: 10 }} />
              <YAxis />
              <Bar dataKey="alertas" fill="var(--color-alertas)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-center">
        <Impact label="Vidas monitoreadas" value={DEMO_KPIS.usuarios_protegidos} suffix="" />
        <Impact label="Minutos ahorrados/mes" value={Math.round(DEMO_KPIS.alertas_mes * DEMO_KPIS.tiempo_respuesta_promedio_min * 0.6)} suffix=" est." />
        <Impact label="Familias conectadas" value={DEMO_KPIS.familiares_vinculados} suffix="" />
      </div>

      <div className="xl:hidden">
        <DemoInsightsChat />
      </div>
    </div>
  );
}

function Impact({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="p-4 rounded-2xl border bg-card">
      <div className="text-2xl font-bold">{value.toLocaleString("es-CL")}{suffix}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
