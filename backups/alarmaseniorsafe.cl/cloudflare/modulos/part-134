import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as DEMO_ALERTS_BY_COMUNA, a as DEMO_KPIS, f as DEMO_MUNICIPALITY } from "./demo-data-CXO5wtMy.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as FileText, D as Download } from "../_libs/lucide-react.mjs";

import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
function DemoReportesPage() {
  const reports = [{
    title: "Informe mensual de alertas",
    desc: "Detalle por comuna, tipo de evento y tiempos de acuse",
    rows: DEMO_ALERTS_BY_COMUNA.length
  }, {
    title: "Cobertura programa municipal",
    desc: `${DEMO_MUNICIPALITY.nombre} — usuarios y familiares vinculados`,
    rows: DEMO_KPIS.usuarios_protegidos
  }, {
    title: "Indicadores de impacto",
    desc: "Tiempo de respuesta, satisfacción y casos críticos",
    rows: 12
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Reportes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Exportables institucionales (simulados en demo)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: reports.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 shrink-0 opacity-60", style: {
          color: "var(--brand-petrol-deep)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: r.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: r.desc }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            r.rows,
            " registros demo"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: true, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
        " PDF (demo)"
      ] })
    ] }, r.title)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs p-4 rounded-xl bg-muted overflow-x-auto border border-border", children: JSON.stringify({
      periodo: "2026-06",
      municipio: DEMO_MUNICIPALITY.slug,
      kpis: DEMO_KPIS,
      comunas: DEMO_ALERTS_BY_COMUNA
    }, null, 2) })
  ] });
}
export {
  DemoReportesPage as component
};
