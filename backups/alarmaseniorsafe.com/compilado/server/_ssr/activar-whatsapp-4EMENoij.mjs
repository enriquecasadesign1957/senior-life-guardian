import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as POST_PAYMENT_INSTALL_PATH } from "./post-payment-BtVMraP6.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { W as WhatsAppActivarCta } from "./whatsapp-activar-cta-CjTD6kty.mjs";
import { i as isWhatsAppActivatedLocally, m as markWhatsAppActivatedLocally } from "./whatsapp-activation-local-CXNPbGDY.mjs";
import { h as whatsAppActivarUrl } from "./install-step-sync-65QKjQIB.mjs";
import "./index.mjs";

import "../_libs/sonner.mjs";
import { A as ArrowLeft, C as CircleCheck } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./senior-access-auth-Bmk7iyGS.mjs";
import "../_libs/zod.mjs";
import "./plans-BJeLFmLc.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "./button-BC9oXVxV.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./client.server-U_pH-Evd.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./signups-db-JWUtXpaW.mjs";
import "./twilio-inbound-_C02bj0d.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




function ActivarWhatsAppPage() {
  const [activated, setActivated] = reactExports.useState(() => isWhatsAppActivatedLocally());
  reactExports.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auto") === "1" && !isWhatsAppActivatedLocally()) {
        window.location.href = whatsAppActivarUrl();
      }
    } catch {
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 py-10 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: POST_PAYMENT_INSTALL_PATH, search: {
        entrenamiento: "1"
      }, className: "inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-5 h-5" }),
        "Volver a la app"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl sm:text-5xl font-extrabold tracking-tight mb-3", children: "Vincular WhatsApp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground max-w-xl mx-auto", children: "Si ya instalaste la app, la primera pulsación del botón rojo también vincula WhatsApp automáticamente. Este paso es opcional." })
      ] }),
      activated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "mb-6 rounded-2xl border-2 p-5 flex items-start gap-4", style: {
        borderColor: "#16a34a",
        background: "#f0fdf4"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-8 h-8 flex-shrink-0", style: {
          color: "#16a34a"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold text-foreground", children: "WhatsApp vinculado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base text-muted-foreground", children: "Tu cuenta ya está conectada al chat de Senior Safe." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivarCta, {}),
      !activated && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: "Tras enviar el mensaje, vuelve a la app. No necesitas confirmar aquí si usaste el botón rojo por primera vez." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
        markWhatsAppActivatedLocally();
        setActivated(true);
      }, className: "text-sm font-semibold underline underline-offset-2 text-muted-foreground hover:text-foreground", children: "Ya envié el mensaje — marcar como listo" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  ActivarWhatsAppPage as component
};
