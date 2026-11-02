import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import { W as WhatsAppFloat } from "./whatsapp-float-CfwyDlWL.mjs";
import { f as formatPlanPrice, P as PLAN, d as checkoutUrl } from "./plans-BJeLFmLc.mjs";
import { b as paymentLabel } from "./index.mjs";
import { x as CASCADE_MARKETING_SUMMARY } from "./emergency-cascade-continuation-BhQV3eMZ.mjs";

import { A as ArrowLeft, c as ArrowRight, S as Shield, p as Smartphone, b as MessageCircle, M as MapPin, P as Phone, Y as Play, Z as Star } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./demo-config-D1XL_8ap.mjs";
import "./twilio-DNHuHEFY.mjs";
import "../_libs/zod.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




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
import "./contacts-storage-DdsYD-uQ.mjs";
import "./phone-utils-D7EH6fht.mjs";
const YOUTUBE_VIDEO_ID = "xSOKFh1oZnI";
const YOUTUBE_THUMB = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;
const TESTIMONIALS = [{
  segments: [{
    text: "Buscaba una alarma familiar para mi mamá sin pagar 30 dólares al mes. Con Senior Safe "
  }, {
    text: `por $${formatPlanPrice(PLAN.monthly)} tengo la tranquilidad`,
    highlight: true
  }, {
    text: " de que el aviso me llega por WhatsApp y me llaman si no confirmo. Excelente servicio."
  }],
  author: "Carmen R.",
  role: "Hija · Villa Alemana"
}, {
  segments: [{
    text: "La uso cuando salgo temprano en Santiago. Un toque SOS y "
  }, {
    text: "mis hermanos ven la ubicación GPS",
    highlight: true
  }, {
    text: " en el mapa, con SMS y WhatsApp en cascada. Rápido y claro."
  }],
  author: "Jorge M.",
  role: "Usuario · Santiago Centro"
}, {
  segments: [{
    text: "La bajamos desde Google Play en el celular de mi papá en un minuto. Inició sesión con el correo y "
  }, {
    text: "funciona impecable",
    highlight: true
  }, {
    text: ". Totalmente recomendado por el precio y la comunicación familiar."
  }],
  author: "Paulina S.",
  role: "Viña del Mar"
}];
const TRUST_CTA_ITEMS = [`Pago seguro con ${paymentLabel}`, "Sin contratos ni permanencia", "Cancela con 1 click cuando quieras"];
const CASCADE_STEPS = [{
  icon: Smartphone,
  title: "Botón SOS en el celular",
  desc: "Un toque activa la alerta de seguridad del hogar. Sin equipos caros ni instalación."
}, {
  icon: MessageCircle,
  title: "Comunicación en cascada",
  desc: CASCADE_MARKETING_SUMMARY
}, {
  icon: MapPin,
  title: "Geolocalización familiar",
  desc: "Tu familia recibe el enlace de ubicación en Google Maps para llegar rápido."
}, {
  icon: Phone,
  title: "Llamada si nadie confirma",
  desc: "Si nadie responde el mensaje, el sistema intenta por llamada automática."
}];
function StarRating() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5 mb-4", "aria-label": "5 estrellas", children: Array.from({
    length: 5
  }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4 sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400 shrink-0", "aria-hidden": true }, i)) });
}
function VideoReinforcementSection() {
  const [playing, setPlaying] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "video-tranquilidad", className: "mt-10 md:mt-14 pt-8 md:pt-10 border-t border-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "video-tranquilidad", className: "text-lg sm:text-xl md:text-2xl font-bold text-center text-slate-900 leading-snug px-1", children: "Mira cómo Senior Safe conecta a tu familia en segundos" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-2 mb-5 md:mb-6 leading-relaxed px-1 line-clamp-2 sm:line-clamp-none", children: "Seguridad del hogar y alertas familiares — conoce el servicio completo en 2 minutos." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900", children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { src: `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`, title: "Alarma Senior Safe — video explicativo", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowFullScreen: true, className: "absolute inset-0 h-full w-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPlaying(true), className: "group absolute inset-0 flex flex-col items-center justify-center w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]", "aria-label": "Reproducir video: alarma familiar Senior Safe", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: YOUTUBE_THUMB, alt: "", className: "absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity", loading: "lazy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 bg-slate-950/35 group-hover:bg-slate-950/25 transition-colors" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative z-10 flex flex-col items-center gap-3 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#00845a] text-white shadow-2xl group-hover:scale-105 group-hover:bg-[#006b48] transition-all duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-6 h-6 sm:w-9 sm:h-9 ml-1 fill-current", "aria-hidden": true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white text-sm sm:text-base font-bold drop-shadow-md text-center leading-snug", children: "Ver video explicativo" })
      ] })
    ] }) })
  ] });
}
function CascadeSection({
  monthlyLabel
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "cascada-titulo", className: "mt-3 md:mt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-2xl mx-auto mb-5 md:mb-8 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-700 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 shrink-0", "aria-hidden": true }),
        "Seguridad del hogar · desde ",
        monthlyLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "cascada-titulo", className: "text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug", children: "Comunicación en cascada por WhatsApp y SMS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed", children: "Geolocalización familiar incluida. Sin call center caro ni contratos de amarre." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid gap-3 sm:gap-4 sm:grid-cols-2 max-w-3xl mx-auto", children: CASCADE_STEPS.map((step) => {
      const Icon = step.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-md flex gap-3 sm:gap-4 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00845a]/10 text-[#00845a]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5", "aria-hidden": true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-sm sm:text-base leading-snug", children: step.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed", children: step.desc })
        ] })
      ] }, step.title);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 md:mt-8 text-center px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: checkoutUrl(), className: "inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-md mx-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-white text-sm sm:text-base font-bold shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 bg-[#00845a] hover:bg-[#006b48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]", children: [
        "Contratar — ",
        monthlyLabel,
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5 shrink-0", "aria-hidden": true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Checkout seguro con Lemon Squeezy, en dólares." })
    ] })
  ] });
}
function AlarmaFamiliarPage() {
  const monthlyLabel = `$${formatPlanPrice(PLAN.monthly)}/mes`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground antialiased overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-6xl mx-auto px-3 sm:px-6 py-2 md:py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4 shrink-0" }),
        "Volver al inicio"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight px-1", children: "Alarma familiar para la seguridad del hogar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 md:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-snug md:leading-relaxed max-w-2xl mx-auto px-1 line-clamp-3 md:line-clamp-none", children: [
          "Comunicación en cascada por WhatsApp y SMS, geolocalización familiar y plan desde",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-900 font-semibold", children: monthlyLabel }),
          ". Sin permanencia."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CascadeSection, { monthlyLabel }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VideoReinforcementSection, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "aria-labelledby": "testimonios-titulo", className: "bg-slate-50 border-y border-slate-100 py-10 md:py-16 mt-8 md:mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "testimonios-titulo", className: "text-xl sm:text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-10 leading-snug px-1", children: "Familias chilenas que ya confían en Senior Safe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid gap-5 sm:gap-6 md:grid-cols-3", children: TESTIMONIALS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRating, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "text-slate-700 text-sm sm:text-[15px] leading-relaxed flex-1 break-words", children: [
          "“",
          item.segments.map((seg, i) => seg.highlight ? /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-bold text-slate-900", children: seg.text }, i) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: seg.text }, i)),
          "”"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-5 pt-4 border-t border-slate-100 text-sm min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("cite", { className: "not-italic font-semibold text-slate-900", children: item.author }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-muted-foreground mt-0.5 text-xs sm:text-sm leading-snug", children: item.role })
        ] })
      ] }, item.author)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "aria-labelledby": "cta-contratar", className: "py-12 md:py-20 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 sm:px-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { id: "cta-contratar", className: "text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-3 leading-snug px-1", children: [
        "Protege tu hogar por solo ",
        monthlyLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm sm:text-base md:text-lg mb-7 md:mb-8 leading-relaxed px-1", children: "Pagas con Lemon Squeezy, en dólares. Sin contratos amarrados." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: checkoutUrl(), className: "inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-md mx-auto px-6 py-4 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full text-white text-sm sm:text-base md:text-lg font-bold shadow-xl hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 bg-[#00845a] hover:bg-[#006b48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00845a]", children: [
        "Ir al checkout — ",
        monthlyLabel,
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5 shrink-0", "aria-hidden": true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-5 md:mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs sm:text-sm text-slate-600 leading-snug px-1", "aria-label": "Garantías de compra", children: TRUST_CTA_ITEMS.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5 shrink-0", children: [
        i > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline text-slate-300 mx-0.5", "aria-hidden": true, children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00845a] font-bold", "aria-hidden": true, children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
      ] }, item)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppFloat, {})
  ] });
}
export {
  AlarmaFamiliarPage as component
};
