import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { w as whatsAppAnyReplyUrl } from "./install-step-sync-65QKjQIB.mjs";
import { S as SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 } from "./twilio-DNHuHEFY.mjs";
import { b as MessageCircle, v as Copy } from "../_libs/lucide-react.mjs";
function WhatsAppActivarCta({ className = "", compact = false }) {
  const waUrl = whatsAppAnyReplyUrl();
  const digits = SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164.replace(/\D/g, "");
  const displayNumber = digits.startsWith("569") ? `+56 9 ${digits.slice(3, 7)} ${digits.slice(7)}` : `+${digits}`;
  const copyHint = async () => {
    try {
      await navigator.clipboard.writeText("Hola");
      toast.success("Copiado: Hola");
    } catch {
      toast.error("Escribe Hola, Sí u OK en WhatsApp");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `rounded-3xl border-2 p-5 md:p-6 space-y-4 shadow-lg ${className}`,
      style: {
        borderColor: "#25D366",
        background: "linear-gradient(180deg, #ffffff 0%, color-mix(in oklab, #25D366 8%, white) 100%)"
      },
      "aria-label": "Activar WhatsApp con Senior Safe",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0",
              style: { background: "#25D366" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-6 h-6", fill: "white" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg md:text-xl font-extrabold text-foreground leading-tight", children: compact ? "Vincular WhatsApp" : "Paso 2: Vincular WhatsApp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Responde con Sí, Hola, OK o cualquier mensaje." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white border-2 border-border px-4 py-3 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base md:text-lg font-semibold text-foreground leading-snug", children: "Cualquier respuesta activa tu cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: copyHint, className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-4 h-4 mr-1" }),
            "Ejemplo"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: waUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-white text-lg font-bold shadow-xl hover:opacity-95 transition",
            style: { background: "#25D366", minHeight: 56 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-6 h-6", fill: "white" }),
              "Abrir WhatsApp"
            ]
          }
        ),
        !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-center text-muted-foreground", children: [
          "Se abrirá WhatsApp al ",
          displayNumber,
          ". Envía el mensaje y listo — no hace falta escribir ACTIVAR."
        ] })
      ]
    }
  );
}
export {
  WhatsAppActivarCta as W
};
