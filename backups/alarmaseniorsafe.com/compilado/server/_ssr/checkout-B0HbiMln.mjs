import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { f as formatPlanPrice, P as PLAN, y as yearlyEquivalentMonthly, A as ANNUAL_SAVINGS_CRO_CLP, p as periodoSchema, a as planKeySchema, n as normalizePlanKey } from "./plans-BJeLFmLc.mjs";
import { c as createSsrRpc } from "./createSsrRpc-14pD3De2.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import "../_libs/sonner.mjs";
import { h as useSearch } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { l as lemonCheckoutUrl } from "./index.mjs";

import { i as Lock, c as ArrowRight } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType, l as literalType } from "../_libs/zod.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  nombre: stringType().min(2).max(160),
  email: stringType().email().max(255),
  telefono: stringType().min(8).max(40),
  direccion: stringType().max(255).nullable().optional(),
  plan: planKeySchema.transform(normalizePlanKey),
  periodo: periodoSchema,
  discountCode: stringType().trim().max(64).optional().or(literalType("")),
  recurringBillingConsent: booleanType().optional().default(true),
  firstGuardian: objectType({
    nombre: stringType().trim().min(2).max(100),
    telefono: stringType().trim().min(8).max(40),
    parentesco: stringType().trim().min(2).max(40)
  }).optional()
}).parse(input)).handler(createSsrRpc("49263aa3ee9117f2df910b74868e6dffc188033bbea71c85d356956dc46dec62"));
const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
function LemonCheckoutPage() {
  const search = useSearch({ from: "/checkout" });
  const [yearly, setYearly] = reactExports.useState(search.periodo === "anual");
  const periodo = yearly ? "anual" : "mensual";
  const price = yearly ? PLAN.yearly : PLAN.monthly;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-lg mx-auto px-6 py-14 md:py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 text-sm font-semibold mb-4", style: { color: PETROL }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-4 h-4" }),
        "Pago seguro con Lemon Squeezy · USD"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold tracking-tight", children: "Contratar Plan Único" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground leading-relaxed", children: "El cobro es en dólares, en la pasarela de Lemon Squeezy. Puedes pagar con tarjeta internacional. Este sitio no pide los datos de la tarjeta." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 inline-flex items-center bg-white rounded-full p-1.5 shadow-md border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setYearly(false),
            className: `px-5 py-2.5 rounded-full text-sm font-bold transition ${!yearly ? "text-white" : "text-foreground/60"}`,
            style: !yearly ? { background: DEEP } : void 0,
            children: [
              "Mensual · $",
              formatPlanPrice(PLAN.monthly),
              " USD"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setYearly(true),
            className: `px-5 py-2.5 rounded-full text-sm font-bold transition ${yearly ? "text-white" : "text-foreground/60"}`,
            style: yearly ? { background: DEEP } : void 0,
            children: [
              "Anual · $",
              formatPlanPrice(PLAN.yearly),
              " USD"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "mt-8 rounded-3xl p-8 text-white shadow-xl",
          style: { background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold uppercase tracking-[0.18em] text-white/70", children: PLAN.displayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-semibold", children: yearly ? "Plan anual" : "Plan mensual" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-baseline gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-5xl font-bold tracking-tight", children: [
                "$",
                formatPlanPrice(price)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/80", children: [
                "USD/",
                yearly ? "año" : "mes"
              ] })
            ] }),
            yearly ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-semibold text-[#a7f3d0]", children: [
              PLAN.yearlySavingsLabel,
              " · equivale a $",
              formatPlanPrice(yearlyEquivalentMonthly()),
              " USD/mes. Ahorras $",
              formatPlanPrice(ANNUAL_SAVINGS_CRO_CLP),
              " USD al año."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-white/80", children: [
              "Anual $",
              formatPlanPrice(PLAN.yearly),
              " USD — ",
              PLAN.yearlySavingsLabel.toLowerCase(),
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: lemonCheckoutUrl(periodo),
                className: "mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-base bg-white transition hover:scale-[1.02]",
                style: { color: DEEP },
                children: [
                  "Pagar con Lemon Squeezy",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs text-white/75 leading-relaxed", children: [
              "Al continuar sales de alarmaseniorsafe.com hacia el checkout de Lemon Squeezy del plan",
              " ",
              yearly ? "anual ($89 USD)" : "mensual ($8.90 USD)",
              "."
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
function CheckoutRoute() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LemonCheckoutPage, {});
}
const phoneField = stringType().trim().min(8, "Ingresa un teléfono válido").max(20).regex(/^[0-9+\s-]+$/, "Solo números");
objectType({
  email: stringType().trim().email("Correo inválido").max(255),
  phone: phoneField,
  name: stringType().trim().min(2, "Ingresa el nombre del adulto mayor").max(100)
});
export {
  CheckoutRoute as component
};
