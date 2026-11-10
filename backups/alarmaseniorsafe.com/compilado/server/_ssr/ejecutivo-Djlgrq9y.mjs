import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { j as DEMO_ALERTS_BY_MONTH, k as DEMO_RESPONSE_TIME_TREND, l as DEMO_INSTITUTIONS } from "./demo-data-CXO5wtMy.mjs";
import { u as useDemo } from "./demo-context-qctLjgP3.mjs";
import { C as ChartContainer, a as ChartTooltip, b as ChartTooltipContent } from "./chart-D4tReIYH.mjs";
import { B as BarChart, C as CartesianGrid, X as XAxis, Y as YAxis, a as Bar, L as LineChart, b as Line } from "../_libs/recharts.mjs";

import "./demo-config-D1XL_8ap.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/lodash.mjs";
import "../_libs/react-smooth.mjs";
import "../_libs/prop-types.mjs";
import "../_libs/fast-equals.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/react-is.mjs";
import "../_libs/d3-shape.mjs";
import "../_libs/d3-path.mjs";
import "../_libs/victory-vendor.mjs";
import "../_libs/d3-scale.mjs";
import "../_libs/internmap.mjs";
import "../_libs/d3-array.mjs";
import "../_libs/d3-time-format.mjs";
import "../_libs/d3-time.mjs";
import "../_libs/d3-interpolate.mjs";
import "../_libs/d3-color.mjs";
import "../_libs/d3-format.mjs";
import "../_libs/recharts-scale.mjs";
import "../_libs/decimal.js-light.mjs";
import "../_libs/eventemitter3.mjs";
function DemoEjecutivoPage() {
  const {
    preset
  } = useDemo();
  const kpis = preset.kpis;
  const alertsByComuna = preset.alertsByComuna;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Dashboard Ejecutivo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "KPIs para autoridades municipales y salud comunal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 xl:grid-cols-4 gap-4", children: [["Usuarios protegidos", kpis.usuarios_protegidos], ["Alertas mes", kpis.alertas_mes], ["Casos críticos", kpis.casos_criticos_mes], ["Tasa acuse", `${kpis.tasa_ack_pct}%`], ["Familiares", kpis.familiares_vinculados], ["Comunas", kpis.cobertura_comunas], ["Respuesta prom.", `${kpis.tiempo_respuesta_promedio_min} min`], ["Satisfacción", `${kpis.satisfaccion_pct}%`]].map(([label, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: typeof val === "number" ? val.toLocaleString("es-CL") : val }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
    ] }, String(label))) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Alertas por mes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: {
        alertas: {
          label: "Alertas",
          color: "hsl(var(--primary))"
        }
      }, className: "h-[240px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: DEMO_ALERTS_BY_MONTH, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "alertas", fill: "var(--color-alertas)", radius: 4 })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Tiempo de respuesta (semanas)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: {
        minutos: {
          label: "Minutos",
          color: "#16a34a"
        }
      }, className: "h-[240px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: DEMO_RESPONSE_TIME_TREND, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { vertical: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "semana" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: [3, 6] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltipContent, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "minutos", stroke: "var(--color-minutos)", strokeWidth: 2, dot: true })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Instituciones vinculadas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: DEMO_INSTITUTIONS.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: i.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground ml-2 capitalize", children: [
            "(",
            i.tipo,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
          i.usuarios_protegidos,
          " usuarios"
        ] })
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Alertas por comuna", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartContainer, { config: {
      alertas: {
        label: "Alertas",
        color: "hsl(var(--primary))"
      }
    }, className: "h-[200px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: alertsByComuna, layout: "vertical", margin: {
      left: 80
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "comuna", type: "category", width: 75 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "alertas", fill: "var(--color-alertas)", radius: 4 })
    ] }) }) })
  ] });
}
function ChartCard({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-4", children: title }),
    children
  ] });
}
export {
  DemoEjecutivoPage as component
};
