import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { W as WhatsAppFloat } from "./whatsapp-float-CfwyDlWL.mjs";
import { W as WhatsAppActivationButton } from "./whatsapp-activation-button-GGQRkYcb.mjs";
import { P as POST_PAYMENT_INSTALL_PATH } from "./post-payment-BtVMraP6.mjs";
import "./index.mjs";

import { C as CircleCheck, g as Sparkles, S as Shield, c as ArrowRight } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./plans-BJeLFmLc.mjs";
import "../_libs/zod.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./whatsapp-activation-local-CXNPbGDY.mjs";
import "./install-step-sync-65QKjQIB.mjs";
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
import "./senior-access-auth-Bmk7iyGS.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
function BienvenidaPremiumPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", style: {
      background: "var(--gradient-soft)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-6 py-16 md:py-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg", style: {
        background: "color-mix(in oklab, #16a34a 14%, white)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12", style: {
        color: GREEN
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider", style: {
        background: "color-mix(in oklab, #16a34a 14%, white)",
        color: GREEN
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5" }),
        " Suscripci?n activa"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-5 text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]", children: [
        "?Tu plan ya est? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          color: GREEN
        }, children: "activo" }),
        "!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-lg md:text-xl text-muted-foreground", children: "Gracias por contratar Senior Safe. Entra a la app y completa el mock de entrenamiento del bot?n de p?nico (sin alertas reales)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-6 h-6 mt-0.5 shrink-0", style: {
          color: DEEP
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground", children: "Siguiente paso: mock de entrenamiento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Practica el bot?n de emergencia en simulaci?n. Luego configura PIN, familiares y GPS desde la app." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: POST_PAYMENT_INSTALL_PATH, search: {
        pago: "ok",
        entrenamiento: "1"
      }, className: "mt-8 inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-white font-bold shadow-xl", style: {
        background: GREEN
      }, children: [
        "Instalar en mi tel?fono ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivationButton, {}) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppFloat, {})
  ] });
}
export {
  BienvenidaPremiumPage as component
};
