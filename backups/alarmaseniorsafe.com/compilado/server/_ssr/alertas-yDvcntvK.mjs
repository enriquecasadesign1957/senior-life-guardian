import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useDemo } from "./demo-context-qctLjgP3.mjs";
import { d as DEMO_GUARDIANS } from "./demo-data-CXO5wtMy.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";

import "./demo-config-D1XL_8ap.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
function statusLabel(status) {
  const map = {
    delivered: "Entregada",
    partial: "Parcial",
    pending: "Pendiente",
    simulated: "Simulada"
  };
  return map[status] ?? status;
}
function DemoAlertasPage() {
  const {
    alerts,
    activeEmergency
  } = useDemo();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Gestión de Alertas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Réplica visual del modelo ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1 rounded", children: "alert_logs" }),
        " y cascada Twilio"
      ] })
    ] }),
    activeEmergency && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-destructive", children: "Simulación en curso" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "text-sm space-y-1", children: activeEmergency.steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        "[",
        s.channel,
        "] ",
        s.to,
        ": ",
        s.message.slice(0, 60),
        "…"
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card divide-y divide-border", children: alerts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-col sm:flex-row sm:items-center gap-2 justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: a.senior_nombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          a.event_type,
          " · ",
          a.comuna,
          " · ",
          new Date(a.created_at).toLocaleString("es-CL")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono mt-1", children: [
          "GPS ",
          a.gps_lat.toFixed(4),
          ", ",
          a.gps_lng.toFixed(4),
          " (±",
          a.gps_accuracy,
          "m)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: a.status === "delivered" ? "default" : "secondary", children: statusLabel(a.status) }),
        a.acknowledged_by && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-700", children: [
          "Acuse: ",
          a.acknowledged_by
        ] })
      ] })
    ] }, a.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Guardianes (emergency_contacts)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid sm:grid-cols-3 gap-3 text-sm", children: DEMO_GUARDIANS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "p-3 rounded-xl bg-muted/40 border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: g.nombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: g.parentesco }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-1 flex-wrap", children: [
          g.recibe_sms && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "SMS" }),
          g.recibe_whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "WA" }),
          g.recibe_llamada && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Voz" })
        ] })
      ] }, g.id)) })
    ] })
  ] });
}
export {
  DemoAlertasPage as component
};
