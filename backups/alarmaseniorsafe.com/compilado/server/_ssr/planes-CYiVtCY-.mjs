import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { T as TrustStackChileno } from "./trust-stack-chileno-DeGOuxt6.mjs";
import { P as PLAN, f as formatPlanPrice, y as yearlyEquivalentMonthly, d as checkoutUrl } from "./plans-BJeLFmLc.mjs";
import { b as paymentLabel } from "./index.mjs";

import { g as Sparkles, c as ArrowRight, C as CircleCheck } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "../_libs/zod.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
function PlanesPage() {
  const [yearly, setYearly] = reactExports.useState(false);
  const price = yearly ? PLAN.yearly : PLAN.monthly;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden text-white", style: {
        background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 100%)`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-5xl mx-auto px-6 py-20 md:py-24 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
            " Sin permanencia · Cancela cuando quieras"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]", children: PLAN.displayName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto", children: [
            "Alarma familiar para adultos mayores desde $",
            formatPlanPrice(PLAN.monthly),
            " USD",
            "/mes, sin permanencia. Botón SOS, WhatsApp, SMS, GPS y llamada automática. Activa la protección en menos de 2 minutos."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-9 inline-flex items-center bg-white rounded-full p-1.5 shadow-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setYearly(false), className: `px-6 py-2.5 rounded-full text-sm font-bold transition ${!yearly ? "text-white" : "text-foreground/60"}`, style: !yearly ? {
              background: DEEP
            } : void 0, children: [
              "Mensual · $",
              formatPlanPrice(PLAN.monthly)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setYearly(true), className: `px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${yearly ? "text-white" : "text-foreground/60"}`, style: yearly ? {
              background: DEEP
            } : void 0, children: [
              "Anual · $",
              formatPlanPrice(PLAN.yearly),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-white text-[10px] font-bold", style: {
                background: GREEN
              }, children: PLAN.yearlySavingsLabel.toUpperCase() })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "py-16 md:py-20 -mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-lg mx-auto px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-3xl p-8 md:p-10 text-white shadow-2xl transition hover:-translate-y-1", style: {
          background: `linear-gradient(160deg, ${DEEP}, ${PETROL})`
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white", style: {
            background: GREEN
          }, children: "PLAN OFICIAL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold uppercase tracking-[0.18em] mb-2 text-white/70", children: PLAN.displayName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold mb-1 text-white", children: PLAN.tagline }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-5xl md:text-6xl font-bold tracking-tight text-white", children: [
              "$",
              formatPlanPrice(price)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/70", children: [
              " USD",
              "/",
              yearly ? "año" : "mes"
            ] })
          ] }),
          yearly ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm font-semibold text-[#a7f3d0]", children: [
            PLAN.yearlySavingsLabel,
            " · equivale a $",
            formatPlanPrice(yearlyEquivalentMonthly()),
            "/mes"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-white/80", children: [
            "Anual $",
            formatPlanPrice(PLAN.yearly),
            " — ",
            PLAN.yearlySavingsLabel.toLowerCase()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-7", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: checkoutUrl({
            periodo: yearly ? "anual" : "mensual"
          }), className: "w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-base transition hover:scale-[1.02] bg-white", style: {
            color: DEEP
          }, children: [
            "Contratar con ",
            paymentLabel,
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrustStackChileno, { className: "mt-6", variant: "onDark" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-8 space-y-3.5", children: PLAN.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 mt-0.5 shrink-0 text-[#a7f3d0]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm leading-relaxed text-white/90", children: f })
          ] }, f)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-lg mx-auto px-6 mt-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
          "¿Dudas? ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", hash: "contacto", className: "font-semibold", style: {
            color: DEEP
          }, children: "Contáctanos" }),
          " y te ayudamos."
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  PlanesPage as component
};
