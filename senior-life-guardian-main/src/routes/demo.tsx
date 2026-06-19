import { createFileRoute, Link, Outlet, Navigate, useNavigate } from "@tanstack/react-router";
import { DemoProvider } from "@/lib/demo/demo-context";
import { isDemoMode } from "@/lib/demo/demo-config";
import { DEMO_INSTITUTION_PRESETS } from "@/lib/demo/demo-presets";
import { DemoNav } from "@/components/demo/demo-nav";
import { DemoEmergencyButton } from "@/components/demo/demo-emergency-button";
import { DemoInsightsChat } from "@/components/demo/demo-insights-chat";
import { Shield, ArrowLeft } from "lucide-react";
import { useDemo } from "@/lib/demo/demo-context";

export const Route = createFileRoute("/demo")({
  validateSearch: (search: Record<string, unknown>) => ({
    institucion:
      typeof search.institucion === "string" ? search.institucion : "las-condes",
  }),
  head: () => ({
    meta: [
      { title: "Modo Demo Institucional — Senior Safe" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DemoLayout,
});

function DemoLayout() {
  const search = Route.useSearch();

  if (!isDemoMode()) {
    return <Navigate to="/" replace />;
  }

  return (
    <DemoProvider institutionSlug={search.institucion}>
      <DemoLayoutInner searchInstitucion={search.institucion} />
    </DemoProvider>
  );
}

function DemoLayoutInner({ searchInstitucion }: { searchInstitucion: string }) {
  const navigate = useNavigate();
  const { preset } = useDemo();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 shrink-0" style={{ color: "var(--brand-petrol-deep)" }} />
            <div className="min-w-0">
              <div className="font-bold text-foreground leading-tight truncate">Senior Safe — Demo</div>
              <div className="text-[11px] text-muted-foreground truncate">{preset.municipality.nombre}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-[11px] text-muted-foreground sr-only">Institución reunión</label>
            <select
              value={searchInstitucion}
              onChange={(e) =>
                navigate({
                  to: "/demo",
                  search: { institucion: e.target.value },
                  replace: true,
                })
              }
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background max-w-[180px]"
            >
              {Object.values(DEMO_INSTITUTION_PRESETS).map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              DEMO
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6 grid lg:grid-cols-[220px_1fr_280px] gap-6">
        <aside className="hidden lg:block">
          <DemoNav />
        </aside>
        <main className="min-w-0 animate-in fade-in duration-300">
          <Outlet />
        </main>
        <aside className="hidden xl:block">
          <DemoInsightsChat compact />
        </aside>
      </div>

      <DemoEmergencyButton />
    </div>
  );
}
