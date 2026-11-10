import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { c as DEMO_SENIORS, f as DEMO_MUNICIPALITY, d as DEMO_GUARDIANS } from "./demo-data-CXO5wtMy.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as CircleCheck, M as MapPin, w as CreditCard } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
const senior = DEMO_SENIORS[0];
function DemoPerfilPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Perfil de Usuario" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Adulto mayor — entidad contract_signups (demo)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-6 text-white", style: {
      background: "linear-gradient(135deg, var(--brand-petrol-deep), var(--brand-petrol))"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold", children: senior.nombre.charAt(0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: senior.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/80 text-sm", children: [
            senior.edad,
            " años · ",
            senior.comuna
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-white/15 px-3 py-1 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5" }),
          " Suscripción activa"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs bg-white/15 px-3 py-1 rounded-full", children: [
          "Programa ",
          DEMO_MUNICIPALITY.programa
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid gap-3 text-sm rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Teléfono", value: senior.telefono }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Dirección", value: senior.direccion, icon: MapPin }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Plan", value: "Plan Único Senior Safe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Pago", value: `Oneclick ·••• ${senior.oneclick_card_last4}`, icon: CreditCard }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Descuento municipal", value: DEMO_MUNICIPALITY.codigo_descuento })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-3", children: "Contactos de emergencia" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: DEMO_GUARDIANS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm flex justify-between py-2 border-b last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          g.nombre,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "(",
            g.parentesco,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: g.telefono })
      ] }, g.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app", children: "Ver app senior real (requiere cuenta)" }) })
  ] });
}
function Row({
  label,
  value,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4 py-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-muted-foreground flex items-center gap-1", children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-medium text-right", children: value })
  ] });
}
export {
  DemoPerfilPage as component
};
