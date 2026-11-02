import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as Mail, b as MessageCircle } from "../_libs/lucide-react.mjs";
const GREEN = "#16a34a";
function InstallNotifyBanner({
  notify
}) {
  if (!notify?.sent) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl border p-4 text-sm space-y-2",
      style: {
        borderColor: "color-mix(in oklab, #16a34a 35%, white)",
        background: "color-mix(in oklab, #16a34a 8%, white)"
      },
      role: "status",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4", style: { color: GREEN } }),
          "Enlace enviado al titular de la cuenta"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          notify.emailSent && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Enviamos las instrucciones de instalación a",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: notify.email }),
            ".",
            " "
          ] }),
          (notify.whatsappSent || notify.smsSent) && notify.telefonoMasked && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "También al WhatsApp/teléfono",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: notify.telefonoMasked }),
            ".",
            " "
          ] }),
          "Si pagaste por otra persona, ella puede instalar la app cuando tenga su celular — no necesita estar presente al momento del pago."
        ] }),
        (notify.whatsappSent || notify.smsSent) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-3.5 h-3.5 shrink-0", style: { color: GREEN } }),
          "Revisa también spam o solicitudes de mensajes desconocidos en el teléfono."
        ] })
      ]
    }
  );
}
export {
  InstallNotifyBanner as I
};
