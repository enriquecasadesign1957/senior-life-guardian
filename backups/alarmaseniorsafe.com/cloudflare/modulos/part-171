import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as ArrowLeft, aa as Gift, ab as Percent, b as MessageCircle, w as CreditCard, h as RotateCcw } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
const SECTIONS = [{
  to: "/admin/accounts",
  label: "Gratuidad / cortesía",
  desc: "Activar Senior Safe sin cobro; envía enlace de instalación por correo y WhatsApp/SMS.",
  icon: Gift
}, {
  to: "/admin/discounts",
  label: "Códigos de descuento",
  desc: "Crear y administrar convenios municipales y descuentos en checkout.",
  icon: Percent
}, {
  to: "/admin/inbox",
  label: "Bandeja WhatsApp",
  desc: "Mensajes comerciales entrantes y respuestas.",
  icon: MessageCircle
}, {
  to: "/admin/transbank-validacion",
  label: "Validación Transbank",
  desc: "Pruebas Oneclick Mall (integración).",
  icon: CreditCard
}, {
  to: "/admin/reset",
  label: "Reset de prueba",
  desc: "Limpiar datos de entrenamiento (solo desarrollo).",
  icon: RotateCcw
}];
function AdminHubPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Administración Senior Safe" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-3xl mx-auto px-4 py-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Herramientas internas. Cada sección pide el PIN de administración (",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1 rounded", children: "ADMIN_PIN" }),
        " o",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs bg-muted px-1 rounded", children: "ADMIN_INBOX_PIN" }),
        ")."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: SECTIONS.map(({
        to,
        label,
        desc,
        icon: Icon
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-0.5", children: desc })
        ] })
      ] }, to)) })
    ] })
  ] });
}
export {
  AdminHubPage as component
};
