import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as DEMO_OPERATORS, c as DEMO_SENIORS } from "./demo-data-CXO5wtMy.mjs";
import { u as useDemo } from "./demo-context-qctLjgP3.mjs";
import { al as Info, _ as Wifi, k as Battery, l as Activity } from "../_libs/lucide-react.mjs";

import "./demo-config-D1XL_8ap.mjs";
function DemoSupervisionPage() {
  const {
    alerts,
    activeEmergency
  } = useDemo();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Supervisión del programa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Maqueta institucional para reuniones — seguimiento agregado del convenio municipal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 p-4 rounded-2xl border border-sky-200 bg-sky-50/90 text-sm text-sky-950", role: "note", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-5 h-5 shrink-0 mt-0.5 text-sky-700", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: "Vista conceptual — no operativa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Esta pantalla es solo para ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "presentaciones" }),
          " con la municipalidad. Los datos son simulados y",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "no reemplaza" }),
          " la respuesta real ante emergencias."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sky-900/90", children: [
          "En producción, las alertas SOS van ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "directo a la familia" }),
          " (SMS, WhatsApp y llamada en cascada). Aquí se ilustra cómo el municipio podría ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "supervisar" }),
          " usuarios del programa, no operar una central de despacho."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "equipo-supervision-heading", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "equipo-supervision-heading", className: "text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3", children: "Equipo de supervisión (simulado)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-4", children: DEMO_OPERATORS.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: op.nombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground capitalize", children: [
          op.rol,
          " · Turno ",
          op.turno
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800", children: "En línea" })
      ] }, op.id)) })
    ] }),
    activeEmergency && activeEmergency.status !== "closed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl border-2 border-red-300 bg-red-50 animate-pulse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-red-800", children: "Alerta simulada en curso:" }),
      " ",
      activeEmergency.seniorNombre,
      " — la cascada real la atiende la familia; esto es solo visibilidad demo del programa."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-sm", children: "Usuarios del programa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Estado agregado (datos demo)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Usuario" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Comuna" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Estado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Señales" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: DEMO_SENIORS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-medium", children: s.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: s.comuna }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 font-semibold", children: "Seguro" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 flex gap-2 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "w-4 h-4", "aria-hidden": "true" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Battery, { className: "w-4 h-4", "aria-hidden": "true" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4", "aria-hidden": "true" })
          ] })
        ] }, s.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-1", children: "Últimas alertas del programa" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Registro agregado para reportes municipales (simulado)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: alerts.slice(0, 5).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between py-2 border-b border-border last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          a.senior_nombre,
          " — ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: a.event_type })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: new Date(a.created_at).toLocaleString("es-CL") })
      ] }, a.id)) })
    ] })
  ] });
}
export {
  DemoSupervisionPage as component
};
