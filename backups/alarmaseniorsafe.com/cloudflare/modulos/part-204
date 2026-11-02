import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { h as seniorSafeWhatsAppMeUrl } from "./twilio-DNHuHEFY.mjs";
import { X, b as MessageCircle } from "../_libs/lucide-react.mjs";
const WHATSAPP_LINK = seniorSafeWhatsAppMeUrl("Hola Senior Safe, tengo una consulta");
function WhatsAppFloat() {
  const [mounted, setMounted] = reactExports.useState(false);
  const [showTooltip, setShowTooltip] = reactExports.useState(true);
  const [dismissed, setDismissed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowTooltip(false), 8e3);
    return () => clearTimeout(t);
  }, []);
  if (!mounted || dismissed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2", children: [
    showTooltip && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-white text-foreground text-sm font-medium px-4 py-3 rounded-2xl shadow-xl border border-border max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowTooltip(false),
          className: "absolute -top-2 -right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground",
          "aria-label": "Cerrar",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
        }
      ),
      "Soporte 24/7 · Escríbenos por WhatsApp",
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-5 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-border" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: WHATSAPP_LINK,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: () => setShowTooltip(false),
        className: "w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition duration-300 animate-in zoom-in duration-300",
        style: { background: "#25D366" },
        "aria-label": "Abrir WhatsApp soporte",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-8 h-8", fill: "white" })
      }
    )
  ] });
}
export {
  WhatsAppFloat as W
};
