import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useRouterState, L as Link, g as getRouteApi } from "../_libs/tanstack__react-router.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { e as DEMO_NAV_SECTIONS } from "./demo-data-CXO5wtMy.mjs";
import { u as useDemo } from "./demo-context-qctLjgP3.mjs";
import { S as Shield, z as Presentation, F as ChartColumn, I as FileText, J as User, B as Bell, N as Map, O as LayoutDashboard } from "../_libs/lucide-react.mjs";
const ICONS = {
  "/demo/ejecutivo": LayoutDashboard,
  "/demo/monitoreo": LayoutDashboard,
  "/demo/mapa": Map,
  "/demo/alertas": Bell,
  "/demo/perfil": User,
  "/demo/reportes": FileText,
  "/demo/analitica": ChartColumn,
  "/demo/presentacion": Presentation
};
const DEEP = "var(--brand-petrol-deep)";
const demoRouteApi = getRouteApi("/demo");
function DemoNav({ compact }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { institucion } = demoRouteApi.useSearch();
  const { preset } = useDemo();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: cn("flex flex-col gap-1", compact ? "text-sm" : ""), children: [
    !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-4 mb-2 rounded-2xl border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-bold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5", style: { color: DEEP } }),
        "Modo Demo"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: preset.municipality.nombre })
    ] }),
    DEMO_NAV_SECTIONS.map((item) => {
      const Icon = ICONS[item.to] ?? Shield;
      const active = pathname === item.to || pathname.startsWith(item.to + "/");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: item.to,
          search: { institucion },
          className: cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
            active ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4 shrink-0", style: active ? { color: DEEP } : void 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: item.label })
          ]
        },
        item.to
      );
    })
  ] });
}
export {
  DemoNav as D
};
