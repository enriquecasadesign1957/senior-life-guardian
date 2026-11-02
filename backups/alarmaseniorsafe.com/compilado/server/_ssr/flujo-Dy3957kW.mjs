import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./site-layout-BSSgEBzk.mjs";
import "./index.mjs";

import { w as CreditCard, x as ShieldCheck, y as UserPlus, j as Clock, f as Mail, b as MessageCircle, g as Sparkles, U as Users, B as Bell, C as CircleCheck, L as LoaderCircle, H as Heart, c as ArrowRight } from "../_libs/lucide-react.mjs";

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
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";
const AMBER = "#f59e0b";
const STEPS = [{
  icon: CreditCard,
  color: DEEP,
  title: "Contratas tu plan",
  desc: "Activas el Plan Único Senior Safe en el sitio."
}, {
  icon: ShieldCheck,
  color: PETROL,
  title: "Lemon Squeezy confirma el pago",
  desc: "Pago seguro en dólares."
}, {
  icon: UserPlus,
  color: PETROL,
  title: "Cuenta creada automáticamente",
  desc: "Sin formularios complejos."
}, {
  icon: Clock,
  color: AMBER,
  title: "Mock de entrenamiento",
  desc: "Practica el botón de pánico sin alertas reales."
}, {
  icon: Mail,
  color: AMBER,
  title: "Email de bienvenida enviado",
  desc: "Recibes accesos e instrucciones."
}, {
  icon: MessageCircle,
  color: GREEN,
  title: "WhatsApp de confirmación",
  desc: "Tu familia queda informada al instante."
}, {
  icon: Sparkles,
  color: GREEN,
  title: "Accedes al onboarding",
  desc: "Guía paso a paso, simple y visual."
}, {
  icon: Users,
  color: GREEN,
  title: "Configuras a tus familiares",
  desc: "Los conectas en menos de 2 minutos."
}, {
  icon: Bell,
  color: RED,
  title: "Pruebas el botón de emergencia",
  desc: "Confirmas que todo funciona."
}];
const PHASES = [{
  key: "activando",
  label: "Activando",
  range: [0, 3],
  color: PETROL
}, {
  key: "configurando",
  label: "Configurando",
  range: [4, 6],
  color: AMBER
}, {
  key: "protegido",
  label: "Protegido",
  range: [7, 8],
  color: GREEN
}];
function FlujoPage() {
  const [current, setCurrent] = reactExports.useState(0);
  const [playing, setPlaying] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!playing) return;
    if (current >= STEPS.length - 1) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 1400);
    return () => clearTimeout(t);
  }, [current, playing]);
  const phase = PHASES.find((p) => current >= p.range[0] && current <= p.range[1]) ?? PHASES[0];
  const progress = (current + 1) / STEPS.length * 100;
  const done = current === STEPS.length - 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", style: {
      background: "var(--gradient-soft)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-6 py-12 md:py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-10 max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold", style: {
          background: "color-mix(in oklab, var(--brand-petrol) 12%, white)",
          color: DEEP
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
          " Onboarding automático"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]", children: "Tu protección, lista en minutos." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-base md:text-lg text-muted-foreground", children: "Mira cómo Senior Safe activa tu cuenta y conecta a tu familia paso a paso." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 mb-6", children: PHASES.map((p) => {
        const active = phase.key === p.key;
        const passed = current > p.range[1];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl p-4 border-2 transition ${active ? "shadow-md" : ""}`, style: {
          borderColor: active || passed ? p.color : "var(--border)",
          background: active ? `color-mix(in oklab, ${p.color} 8%, white)` : "white"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold uppercase tracking-wider", style: {
            color: active || passed ? p.color : void 0
          }, children: [
            passed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4" }) : active ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 rounded-full border-2 border-border" }),
            "Fase ",
            PHASES.indexOf(p) + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1 font-bold ${active || passed ? "text-foreground" : "text-muted-foreground"}`, children: p.label })
        ] }, p.key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-3xl p-6 shadow-sm mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-foreground", children: [
            "Paso ",
            current + 1,
            " de ",
            STEPS.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold tracking-tight", style: {
            color: phase.color
          }, children: [
            Math.round(progress),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all duration-700", style: {
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${PETROL}, ${phase.color})`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPlaying((p) => !p), className: "text-xs font-bold px-3 py-1.5 rounded-full border border-border hover:bg-muted transition", style: {
            color: DEEP
          }, children: playing ? "Pausar" : "Reanudar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setCurrent(0);
            setPlaying(true);
          }, className: "text-xs font-bold px-3 py-1.5 rounded-full border border-border hover:bg-muted transition", style: {
            color: DEEP
          }, children: "Reiniciar" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-7 top-2 bottom-2 w-0.5 bg-border", "aria-hidden": true }),
        STEPS.map((s, i) => {
          const active = i === current;
          const isDone = i < current;
          const pending = i > current;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative pl-20 pr-2 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-all ${active ? "scale-110" : ""} ${pending ? "opacity-40" : ""}`, style: {
              background: isDone ? GREEN : s.color
            }, children: [
              isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-7 h-7" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "w-7 h-7" }),
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-2xl animate-ping", style: {
                background: `${s.color}55`
              } })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-card border rounded-2xl p-5 transition-all ${active ? "shadow-lg" : "shadow-sm"} ${pending ? "opacity-60" : ""}`, style: active ? {
              borderColor: s.color
            } : {
              borderColor: "var(--border)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold tracking-wider text-muted-foreground", children: [
                  "PASO ",
                  i + 1
                ] }),
                active && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full", style: {
                  background: `color-mix(in oklab, ${s.color} 14%, white)`,
                  color: s.color
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }),
                  " En curso"
                ] }),
                isDone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full", style: {
                  background: "color-mix(in oklab, #16a34a 14%, white)",
                  color: GREEN
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  " Listo"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-lg md:text-xl font-bold text-foreground leading-snug", children: s.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm md:text-base text-muted-foreground", children: s.desc })
            ] })
          ] }, i);
        })
      ] }),
      done && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-3xl p-8 md:p-10 text-white text-center shadow-2xl animate-fade-in", style: {
        background: `linear-gradient(135deg, ${GREEN}, #15803d)`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-10 h-10 mx-auto mb-3", fill: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-4xl font-bold tracking-tight", children: "Tu familia ya está protegida" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-white/85", children: "Senior Safe activo · 24/7 · Sin permanencia." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-3 justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/checkout", search: {
            mode: "contratar",
            plan: "unico",
            periodo: "mensual"
          }, className: "inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white font-bold shadow-lg hover:scale-[1.02] transition", style: {
            color: DEEP
          }, children: [
            "Contratar con ",
            "Lemon Squeezy",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/familia", className: "inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border-2 border-white/40 text-white font-bold hover:bg-white/10 transition", children: "Ver portal familia" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  FlujoPage as component
};
