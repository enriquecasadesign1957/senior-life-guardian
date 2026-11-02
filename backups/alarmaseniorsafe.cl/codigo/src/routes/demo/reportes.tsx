import { createFileRoute } from "@tanstack/react-router";
import { DEMO_KPIS, DEMO_ALERTS_BY_COMUNA, DEMO_MUNICIPALITY } from "@/lib/demo/demo-data";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demo/reportes")({
  component: DemoReportesPage,
});

function DemoReportesPage() {
  const reports = [
    {
      title: "Informe mensual de alertas",
      desc: "Detalle por comuna, tipo de evento y tiempos de acuse",
      rows: DEMO_ALERTS_BY_COMUNA.length,
    },
    {
      title: "Cobertura programa municipal",
      desc: `${DEMO_MUNICIPALITY.nombre} — usuarios y familiares vinculados`,
      rows: DEMO_KPIS.usuarios_protegidos,
    },
    {
      title: "Indicadores de impacto",
      desc: "Tiempo de respuesta, satisfacción y casos críticos",
      rows: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Exportables institucionales (simulados en demo)</p>
      </header>

      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.title} className="p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-3">
              <FileText className="w-8 h-8 shrink-0 opacity-60" style={{ color: "var(--brand-petrol-deep)" }} />
              <div>
                <div className="font-bold">{r.title}</div>
                <div className="text-sm text-muted-foreground">{r.desc}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.rows} registros demo</div>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled className="gap-2">
              <Download className="w-4 h-4" /> PDF (demo)
            </Button>
          </div>
        ))}
      </div>

      <pre className="text-xs p-4 rounded-xl bg-muted overflow-x-auto border border-border">
        {JSON.stringify(
          {
            periodo: "2026-06",
            municipio: DEMO_MUNICIPALITY.slug,
            kpis: DEMO_KPIS,
            comunas: DEMO_ALERTS_BY_COMUNA,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
