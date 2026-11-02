import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as createSsrRpc } from "./createSsrRpc-14pD3De2.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { A as AdminPinGate } from "./admin-pin-gate-BkqeYSuC.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { C as Card } from "./card-RGlIzTYo.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { t as toast } from "../_libs/sonner.mjs";

import { o as objectType, s as stringType, l as literalType } from "../_libs/zod.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./admin-auth-5OIH6Qjw.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
const resetTestData = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  confirm: literalType("RESET"),
  pin: stringType().min(1).max(64)
}).parse(input)).handler(createSsrRpc("303d4d806158d51b2bd7f29802806d4cc9b23a0448575e3a8cceaaadaf5faf45"));
const resetMyAccountData = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  confirm: literalType("RESET"),
  email: stringType().email().max(255),
  pin: stringType().min(1).max(64)
}).parse(input)).handler(createSsrRpc("c7d01bf199875a53070189b5b003f24d77b88e339e7eb0af33ca1f493354124f"));
function AdminResetPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPinGate, { title: "Reset de datos", description: "Operaciones destructivas de prueba. Requiere PIN de administración.", onUnlockFailed: (m) => toast.error(m), children: (pin) => /* @__PURE__ */ jsxRuntimeExports.jsx(AdminResetInner, { pin }) });
}
function AdminResetInner({
  pin
}) {
  const reset = useServerFn(resetTestData);
  const resetMine = useServerFn(resetMyAccountData);
  const [confirm, setConfirm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const [myEmail, setMyEmail] = reactExports.useState("");
  const [myConfirm, setMyConfirm] = reactExports.useState("");
  const [myLoading, setMyLoading] = reactExports.useState(false);
  const [myResult, setMyResult] = reactExports.useState(null);
  const handleResetMine = async () => {
    if (myConfirm !== "RESET") return toast.error("Escribe RESET para confirmar");
    if (!myEmail.trim()) return toast.error("Ingresa tu email");
    setMyLoading(true);
    try {
      const res = await resetMine({
        data: {
          confirm: "RESET",
          email: myEmail.trim(),
          pin
        }
      });
      setMyResult(res);
      if (res.ok) {
        try {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("seniorsafe") || k.startsWith("ss_")) localStorage.removeItem(k);
          });
          Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith("seniorsafe") || k.startsWith("ss_")) sessionStorage.removeItem(k);
          });
        } catch {
        }
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error(e?.message ?? "Error al resetear cuenta");
    } finally {
      setMyLoading(false);
    }
  };
  const handleReset = async () => {
    if (confirm !== "RESET") {
      toast.error("Escribe RESET para confirmar");
      return;
    }
    setLoading(true);
    try {
      const res = await reset({
        data: {
          confirm: "RESET",
          pin
        }
      });
      setResult(res);
      toast.success(res.message);
    } catch (e) {
      toast.error(e?.message ?? "Error al resetear");
    } finally {
      setLoading(false);
    }
  };
  const clearLocalSession = () => {
    try {
      const keysToClear = ["seniorsafe_user", "seniorsafe_onboarding", "seniorsafe_contacts", "seniorsafe_pin", "seniorsafe_trial", "seniorsafe_purchase"];
      keysToClear.forEach((k) => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("seniorsafe")) sessionStorage.removeItem(k);
      });
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("seniorsafe")) localStorage.removeItem(k);
      });
      toast.success("Sesión local limpiada");
    } catch {
      toast.error("No pudimos limpiar la sesión local");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-foreground", children: "Reset datos de prueba" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-2", children: [
        "Elimina signups en modo trial y datos asociados (contactos, PINs, transacciones no autorizadas).",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "No toca" }),
        " cuentas pagadas ni suscripciones activas."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-4 border-primary/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground mb-2", children: "🔁 Resetear SOLO mi cuenta (para repetir pruebas)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
          "Borra ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "familiares, PIN y alertas" }),
          " de tu cuenta, y reinicia el onboarding y la activación de WhatsApp.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "No toca" }),
          " pagos, Webpay, otras cuentas ni configuraciones."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: myEmail, onChange: (e) => setMyEmail(e.target.value), placeholder: "tu-email@ejemplo.com", className: "mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: myConfirm, onChange: (e) => setMyConfirm(e.target.value), placeholder: 'Escribe "RESET" para confirmar', className: "mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleResetMine, disabled: myLoading || myConfirm !== "RESET" || !myEmail.trim(), className: "w-full", children: myLoading ? "Reseteando…" : "Resetear mi cuenta" })
      ] }),
      myResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 bg-muted rounded-lg text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: myResult.message }),
        myResult.ok && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc pl-5 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Familiares eliminados: ",
            myResult.contactsDeleted
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "PIN eliminado: ",
            myResult.pinsDeleted
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Alertas eliminadas: ",
            myResult.alertsDeleted
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Onboarding y WhatsApp reiniciados" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-4 border-destructive/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground mb-2", children: "⚠️ Eliminar datos de prueba en backend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
          "Escribe ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "px-2 py-1 bg-muted rounded", children: "RESET" }),
          " para confirmar."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: confirm, onChange: (e) => setConfirm(e.target.value), placeholder: "RESET", className: "mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: handleReset, disabled: loading || confirm !== "RESET", className: "w-full", children: loading ? "Eliminando…" : "Eliminar datos de prueba" })
      ] }),
      result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-4 bg-muted rounded-lg text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: result.message }),
        result.emails.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 list-disc pl-5 text-muted-foreground", children: result.emails.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: e }, e)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Limpiar sesión local (navegador)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Borra ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "sessionStorage" }),
        " y ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "localStorage" }),
        " relacionados al onboarding para reiniciar el flujo desde cero en este dispositivo."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: clearLocalSession, className: "w-full", children: "Limpiar sesión local" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Reiniciar onboarding" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Después de limpiar, ve al inicio para comenzar un onboarding nuevo." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "default", className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: "Ir al inicio" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/planes", children: "Ver planes" }) })
      ] })
    ] })
  ] }) });
}
export {
  AdminResetPage as component
};
