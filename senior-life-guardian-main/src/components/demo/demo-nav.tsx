import { Link, useRouterState } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Bell,
  User,
  FileText,
  BarChart3,
  Presentation,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_NAV_SECTIONS } from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";

const ICONS: Record<string, typeof Shield> = {
  "/demo/ejecutivo": LayoutDashboard,
  "/demo/monitoreo": LayoutDashboard,
  "/demo/mapa": Map,
  "/demo/alertas": Bell,
  "/demo/perfil": User,
  "/demo/reportes": FileText,
  "/demo/analitica": BarChart3,
  "/demo/presentacion": Presentation,
};

const DEEP = "var(--brand-petrol-deep)";

const demoRouteApi = getRouteApi("/demo");

export function DemoNav({ compact }: { compact?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { institucion } = demoRouteApi.useSearch();
  const { preset } = useDemo();

  return (
    <nav className={cn("flex flex-col gap-1", compact ? "text-sm" : "")}>
      {!compact && (
        <div className="px-3 py-4 mb-2 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Shield className="w-5 h-5" style={{ color: DEEP }} />
            Modo Demo
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {preset.municipality.nombre}
          </p>
        </div>
      )}
      {DEMO_NAV_SECTIONS.map((item) => {
        const Icon = ICONS[item.to] ?? Shield;
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            search={{ institucion }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
              active ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" style={active ? { color: DEEP } : undefined} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
