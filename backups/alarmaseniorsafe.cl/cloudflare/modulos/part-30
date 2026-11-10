import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { h as DEMO_GPS_HISTORY, i as DEMO_GEOFENCES } from "./demo-data-CXO5wtMy.mjs";
import { u as useDemo } from "./demo-context-qctLjgP3.mjs";
import { D as DemoMapVisual } from "./demo-map-visual-_ZekioTk.mjs";

import "./demo-config-D1XL_8ap.mjs";
import "../_libs/lucide-react.mjs";
function DemoMapaPage() {
  const {
    activeEmergency
  } = useDemo();
  const alertMode = activeEmergency != null && activeEmergency.status !== "closed";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Mapa de Emergencias" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "GPS e historial simulado. Geocercas son demo institucional (no persistidas en BD producción)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DemoMapVisual, { label: alertMode ? "SOS activo" : "María González · Domicilio", alertMode, showGeofence: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Historial GPS (hoy)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: DEMO_GPS_HISTORY.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between py-2 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            p.at,
            " — ",
            p.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground", children: [
            p.lat.toFixed(4),
            ", ",
            p.lng.toFixed(4)
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Geocercas demo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: DEMO_GEOFENCES.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-3 rounded-xl bg-muted/50 flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: g.nombre }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground block text-xs", children: g.comuna })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: g.activa ? "text-green-700 font-bold" : "text-muted-foreground", children: [
            g.activa ? "Activa" : "Off",
            " · ",
            g.radio_m,
            "m"
          ] })
        ] }, g.id)) })
      ] })
    ] })
  ] });
}
export {
  DemoMapaPage as component
};
