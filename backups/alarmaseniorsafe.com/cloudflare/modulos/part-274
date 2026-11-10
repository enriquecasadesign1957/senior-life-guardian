import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { A as ADMIN_PIN_SESSION_KEY } from "./admin-auth-5OIH6Qjw.mjs";
import { i as Lock } from "../_libs/lucide-react.mjs";
function AdminPinGate({ title, description, children, onUnlockFailed }) {
  const [pin, setPin] = reactExports.useState("");
  const [unlocked, setUnlocked] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY);
      if (saved) {
        setPin(saved);
        setUnlocked(true);
      }
    } catch {
    }
  }, []);
  const unlock = () => {
    if (!pin.trim()) {
      onUnlockFailed?.("Ingresa el PIN de administración.");
      return;
    }
    try {
      sessionStorage.setItem(ADMIN_PIN_SESSION_KEY, pin.trim());
    } catch {
    }
    setUnlocked(true);
  };
  if (!unlocked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md mx-auto mt-12 p-8 rounded-3xl border border-border bg-card shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-6 h-6 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: title })
      ] }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "password",
          inputMode: "numeric",
          autoComplete: "off",
          placeholder: "PIN de administración",
          value: pin,
          onChange: (e) => setPin(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && unlock()
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", className: "w-full", onClick: unlock, children: "Entrar" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: children(pin) });
}
export {
  AdminPinGate as A
};
