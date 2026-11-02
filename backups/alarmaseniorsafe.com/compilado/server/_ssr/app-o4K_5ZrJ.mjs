import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CPxdlKfP.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { i as isSosGpsPrimed, l as listFamilyWithFallback, k as getCurrentCoordsWithError, b as useFallDetection, c as useFallSensorDeferred, d as useSosGpsPriming, u as useDeviceHeartbeat, a as useLiveBatteryLevel, e as useEmergencyCategoryAutoSend, I as InstallStepGuideBanner, P as PinGateDialog, F as FallDetectionOverlay, S as SosGpsPrimingUi, f as FallSensorDeferredPrompt, h as getAppConfiguration, r as reportSosPrimed, m as listFamily, n as activateWhatsAppFromApp, o as loginAccountByEmail, p as loginErrorMessage, j as ensureGeoPermission, q as addFamily, s as updateFamily, t as deleteFamily, v as deleteFamilyWithFallback, w as familyErrorMessage, x as updateFamilyWithFallback, y as addFamilyWithFallback } from "./sos-gps-priming-ui-DaQ-rmpO.mjs";
import { sendEmergencyAlert, cancelEmergencyAlert } from "./emergency-alert.functions-C9HDco_8.mjs";
import { m as markWhatsAppActivatedLocally } from "./whatsapp-activation-local-CXNPbGDY.mjs";
import { i as isTrainingDone, d as requiresPwaInstall, p as persistSignupHandoff, m as markTrainingDone, r as readStoredSignupId } from "./post-payment-BtVMraP6.mjs";
import { a as isAppInstalled, i as isNativeApp, A as APK_DOWNLOAD_URL, b as buildNativeHandoffUrl } from "./device-Dq_ZTBb-.mjs";
import { P as PostPaymentInstallScreen } from "./post-payment-install-screen-CIuEh8WZ.mjs";
import { W as WhatsAppActivationButton } from "./whatsapp-activation-button-GGQRkYcb.mjs";
import { S as SENIOR_SAFE_PLAY_STORE_URL } from "./index.mjs";
import { r as readSeniorAccessToken, p as persistSeniorAccessToken, d as requireSeniorAccessToken } from "./senior-access-auth-Bmk7iyGS.mjs";
import { C as Capacitor } from "../_libs/capacitor__core.mjs";
import { L as LocalNotifications } from "../_libs/capacitor__local-notifications.mjs";
import { u as emergencyCategoryLabel, v as EMERGENCY_CATEGORY_AUTO_DEFAULT, s as EMERGENCY_CATEGORIES, x as CASCADE_MARKETING_SUMMARY } from "./emergency-cascade-continuation-BhQV3eMZ.mjs";
import { M as MAX_GUARDIANS } from "./contacts-storage-DdsYD-uQ.mjs";
import { i as isSubscriptionServiceAllowed, s as subscriptionBlockedMessage } from "./subscription-access-DQDPNP0w.mjs";
import { g as Route$$ } from "./router-FK5WbXyp.mjs";


import "../_libs/capacitor__geolocation.mjs";

import { S as Shield, L as LoaderCircle, k as Battery, _ as Wifi, C as CircleCheck, l as Activity, D as Download, M as MapPin, B as Bell, $ as Navigation, j as Clock, U as Users, K as KeyRound, a0 as House, H as Heart, a1 as Settings, T as TriangleAlert, X, b as MessageCircle, a2 as Pencil, a3 as Trash2, u as Plus, x as ShieldCheck, s as Apple, a4 as Share, p as Smartphone } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/tslib.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/class-variance-authority.mjs";
import "./createSsrRpc-14pD3De2.mjs";
import "./createServerFn-CqTdkD5n.mjs";
import "./install-step-sync-65QKjQIB.mjs";
import "./client.server-U_pH-Evd.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "../_libs/supabase__functions-js.mjs";
import "./signups-db-JWUtXpaW.mjs";
import "./twilio-DNHuHEFY.mjs";
import "./twilio-inbound-_C02bj0d.mjs";
import "./pin-reset-B5nhyHPX.mjs";
import "./zoho-smtp-lj0bCuK6.mjs";
import "./plans-BJeLFmLc.mjs";
import "../_libs/zod.mjs";
import "./phone-utils-D7EH6fht.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./whatsapp-activar-cta-CjTD6kty.mjs";
import "./install-notify-banner-CdM3Di4q.mjs";
import "./discount-codes-BbIma2Cq.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./maps-BhXedqc-.mjs";
import "./transbank-oneclick-mall-CC5wwzFZ.mjs";
import "./ack-alert-hZc0eMx8.mjs";
import "./account-lookup-CBKDZ0Aw.mjs";
import "./discount.functions-CbzrjeJP.mjs";
import "./whatsapp-inbox-CZiWC44X.mjs";
import "./admin-auth-5OIH6Qjw.mjs";
import "./post-payment-install-notify-6plkg_BS.mjs";
import "./transactional-email-html-C_kx3NhX.mjs";
import "./subscription-renewal-CVyJ9Wsj.mjs";
import "./oneclick-renewal-charge-XKyXWH2D.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/react-email__button.mjs";
import "../_libs/react-email__link.mjs";
import "../_libs/react-email__hr.mjs";
import "../_libs/capacitor__synapse.mjs";
const PROMPT_KEY = "__seniorSafeInstallPrompt";
const PROMPT_BOUND_KEY = "__seniorSafeInstallPromptBound";
function getCapturedInstallPrompt() {
  if (typeof window === "undefined") return null;
  return window[PROMPT_KEY] ?? null;
}
function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") window[PROMPT_KEY] = null;
}
function ensureInstallPromptCapture() {
  if (typeof window === "undefined" || window[PROMPT_BOUND_KEY]) return;
  window[PROMPT_BOUND_KEY] = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    window[PROMPT_KEY] = event;
  });
}
ensureInstallPromptCapture();
const DEEP$1 = "var(--brand-petrol-deep)";
const PETROL$1 = "var(--brand-petrol)";
const GREEN$1 = "#16a34a";
function detectPlatform() {
  if (typeof navigator === "undefined") return { isIOS: false, isAndroid: false, isSafari: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
  return { isIOS, isAndroid, isSafari };
}
function InstallAppModal({ open, onClose, signupId, showContinuityHint }) {
  const [deferred, setDeferred] = reactExports.useState(() => getCapturedInstallPrompt());
  const [installed, setInstalled] = reactExports.useState(false);
  const [showGuide, setShowGuide] = reactExports.useState(false);
  const [installing, setInstalling] = reactExports.useState(false);
  const { isIOS, isAndroid, isSafari } = detectPlatform();
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    ensureInstallPromptCapture();
    setDeferred(getCapturedInstallPrompt());
    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    const isStandalone = isAppInstalled();
    if (isStandalone) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [signupId]);
  const openInstalledApp = () => {
    window.location.href = buildNativeHandoffUrl(signupId, "onboarding");
  };
  const handleBigInstall = async () => {
    setInstalling(true);
    try {
      if (isAndroid) {
        window.location.assign(SENIOR_SAFE_PLAY_STORE_URL);
        setShowGuide(true);
        return;
      }
      if (deferred) {
        try {
          await deferred.prompt();
          const choice = await deferred.userChoice;
          clearCapturedInstallPrompt();
          setDeferred(null);
          if (choice.outcome === "accepted") {
            setInstalled(true);
            return;
          }
          setShowGuide(true);
          return;
        } catch {
        }
      }
      setShowGuide(true);
    } finally {
      setInstalling(false);
    }
  };
  const showOpenWebFallback = installed;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2", style: { background: PETROL$1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-7 h-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-2xl", children: "✅ Cuenta creada correctamente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-base", children: [
        "Ahora ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "descarga e instala Senior Safe" }),
        " en este teléfono. Es la aplicación real — no una página web temporal."
      ] })
    ] }),
    showContinuityHint && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-4 text-sm flex items-start gap-3", style: { background: "color-mix(in oklab, #16a34a 8%, white)", color: "var(--foreground)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 mt-0.5 shrink-0", style: { color: GREEN$1 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Tu red familiar ya está configurada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "La app reconocerá automáticamente tu nombre, familiares, PIN y WhatsApp activado. Solo te pedirá permisos del teléfono." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      !installed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleBigInstall,
            disabled: installing,
            className: "w-full h-16 text-xl font-bold rounded-2xl shadow-lg",
            style: { background: GREEN$1, color: "white" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-6 h-6 mr-2" }),
              installing ? "Abriendo…" : isAndroid ? "Instalar desde Google Play" : "📥 Instalar app"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center px-2", children: isAndroid ? "Te llevamos a la ficha oficial en Google Play. Luego inicia sesión con el correo de tu plan." : "Sigue los pasos para añadir Senior Safe a tu teléfono." })
      ] }),
      showOpenWebFallback && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-4 text-sm font-semibold text-center flex items-center justify-center gap-2", style: { background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN$1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5" }),
          " App instalada"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: openInstalledApp,
            className: "w-full h-14 text-lg font-bold rounded-2xl",
            style: { background: DEEP$1, color: "white" },
            children: "Abrir Senior Safe"
          }
        )
      ] }),
      showGuide && !installed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border-2 p-4 text-sm space-y-2", style: { borderColor: DEEP$1 }, children: isIOS ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-foreground flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, { className: "w-5 h-5" }),
          " En iPhone (Safari)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground", children: [
          "1. Toca ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share, { className: "inline w-5 h-5 align-text-bottom" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Compartir" }),
          " abajo."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground", children: [
          "2. Elige ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "inline w-5 h-5 align-text-bottom" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Añadir a pantalla de inicio" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-foreground", children: [
          "3. Toca ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Añadir" }),
          " arriba a la derecha."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-foreground flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-5 h-5" }),
          " Cómo instalar en Android"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "space-y-2 text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm", children: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Abre ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Google Play" }),
              " y busca Senior Safe (o usa el botón de arriba)."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm", children: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Toca ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Instalar" }),
              " y espera a que termine."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm", children: "3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Abre la app e inicia sesión con el correo de tu plan." })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 text-sm", children: [
        isAndroid ? "Toca 'Instalar desde Google Play'." : "Toca el botón verde de arriba.",
        isAndroid ? "Instala desde Play e inicia sesión con tu correo." : isIOS ? "Sigue los pasos para añadir a inicio." : "Confirma la instalación.",
        "Abre Senior Safe desde el ícono en tu teléfono."
      ].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0", style: { background: i === 2 ? GREEN$1 : DEEP$1 }, children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: step })
      ] }, step)) }),
      !installed && /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-xs text-muted-foreground pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer hover:text-foreground select-none", children: "¿No puedes instalar ahora? Ver opción temporal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-2xl border border-dashed border-border p-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "La versión web es temporal. En Android prioriza Google Play." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: SENIOR_SAFE_PLAY_STORE_URL,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline text-foreground font-semibold block",
              children: "Abrir Google Play"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: openInstalledApp,
              className: "underline text-foreground font-semibold",
              children: "Abrir versión web temporal"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: APK_DOWNLOAD_URL,
              className: "underline text-muted-foreground block",
              children: "Descargar APK (alternativa)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: SENIOR_SAFE_PLAY_STORE_URL,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "relative rounded-2xl border-2 p-4 text-center hover:shadow-md transition-shadow",
            style: { borderColor: "color-mix(in oklab, var(--brand-petrol) 35%, transparent)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-7 h-7 mx-auto mb-2", style: { color: DEEP$1 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground text-sm", children: "Google Play" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Disponible ahora" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl border-2 border-border p-4 text-center opacity-70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, { className: "w-7 h-7 mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground text-sm", children: "App Store" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950", children: "Próximamente" })
        ] })
      ] })
    ] })
  ] }) });
}
function notificationsSupportedInBrowser() {
  return typeof window !== "undefined" && "Notification" in window;
}
async function requestAppNotifications() {
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === "granted") return { granted: true, mode: "native" };
      const req = await LocalNotifications.requestPermissions();
      return { granted: req.display === "granted", mode: "native" };
    } catch {
      return { granted: false, mode: "native" };
    }
  }
  if (!notificationsSupportedInBrowser()) {
    return { granted: false, mode: "unsupported" };
  }
  const permission = await Notification.requestPermission();
  return { granted: permission === "granted", mode: "web" };
}
const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";
const RED = "#dc2626";
const CATEGORY_ICONS = {
  salud: Heart,
  accidente: TriangleAlert,
  delincuencia: Shield
};
const PALETTE = ["#0ea5e9", "#a855f7", "#f59e0b", "#16a34a", "#dc2626"];
const colorFor = (i) => PALETTE[i % PALETTE.length];
const initialOf = (n) => (n.trim()[0] ?? "?").toUpperCase();
function AppHome() {
  const routeSearch = Route$$.useSearch();
  const [stage, setStage] = reactExports.useState("idle");
  const [emergencyCategory, setEmergencyCategory] = reactExports.useState(null);
  const [deliveredTo, setDeliveredTo] = reactExports.useState(0);
  const [userId, setUserId] = reactExports.useState(null);
  const [userName, setUserName] = reactExports.useState("");
  const [contacts, setContacts] = reactExports.useState([]);
  const [loadingContacts, setLoadingContacts] = reactExports.useState(true);
  const [configReady, setConfigReady] = reactExports.useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = reactExports.useState(null);
  const subscriptionActive = isSubscriptionServiceAllowed(subscriptionStatus);
  const [accountConfigured, setAccountConfigured] = reactExports.useState(false);
  const [gpsAllowed, setGpsAllowed] = reactExports.useState(false);
  const [lastCoords, setLastCoords] = reactExports.useState(null);
  const [notificationsAllowed, setNotificationsAllowed] = reactExports.useState(false);
  const [batteryChecked, setBatteryChecked] = reactExports.useState(false);
  const [manageOpen, setManageOpen] = reactExports.useState(false);
  const [pinConfigured, setPinConfigured] = reactExports.useState(false);
  const [pinGateOpen, setPinGateOpen] = reactExports.useState(false);
  const [pinUnlocked, setPinUnlocked] = reactExports.useState(false);
  const [installOpen, setInstallOpen] = reactExports.useState(false);
  const [isInstalled, setIsInstalled] = reactExports.useState(false);
  const [trainingPending, setTrainingPending] = reactExports.useState(false);
  const [trainingDone, setTrainingDone] = reactExports.useState(false);
  const isTrainingRunRef = reactExports.useRef(false);
  const [trainingRunActive, setTrainingRunActive] = reactExports.useState(false);
  const emergencySendGenRef = reactExports.useRef(0);
  const categoryPickRef = reactExports.useRef(false);
  const sosTriggeredAtMsRef = reactExports.useRef(void 0);
  const [clientReady, setClientReady] = reactExports.useState(false);
  const [loginEmail, setLoginEmail] = reactExports.useState("");
  const [loginBusy, setLoginBusy] = reactExports.useState(false);
  const [loginError, setLoginError] = reactExports.useState(null);
  const [installStep, setInstallStep] = reactExports.useState("pending");
  const [sosPrimedAt, setSosPrimedAt] = reactExports.useState(null);
  const [fallSensorPromptedAt, setFallSensorPromptedAt] = reactExports.useState(null);
  const [guideDismissed, setGuideDismissed] = reactExports.useState(false);
  const [fallPromptBusy, setFallPromptBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    setTrainingPending(routeSearch.entrenamiento === "1");
    setTrainingDone(isTrainingDone());
    setClientReady(true);
  }, [routeSearch.entrenamiento]);
  const mustInstallBeforeWebPanel = clientReady && !isInstalled && (trainingPending || requiresPwaInstall());
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsInstalled(isAppInstalled());
    check();
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);
  const list = useServerFn(listFamily);
  const loadConfig = useServerFn(getAppConfiguration);
  const activateWhatsApp = useServerFn(activateWhatsAppFromApp);
  const reportSosPrimedFn = useServerFn(reportSosPrimed);
  reactExports.useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingContacts(true);
      try {
        const signupIdFromUrl = routeSearch.ss;
        let stored = null;
        const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup");
        if (raw) stored = JSON.parse(raw);
        if (signupIdFromUrl) {
          persistSignupHandoff(signupIdFromUrl);
          setUserId(signupIdFromUrl);
        }
        const lookup = {
          signupId: signupIdFromUrl || stored?.id || void 0,
          email: stored?.email || void 0,
          telefono: stored?.telefono || void 0,
          accessToken: readSeniorAccessToken(signupIdFromUrl || stored?.id) || void 0
        };
        if (!lookup.signupId && !lookup.email && !lookup.telefono) return;
        const res = await loadConfig({
          data: lookup
        });
        if (!alive) return;
        if (res.configured && res.user) {
          const user = res.user;
          let accessToken = res.accessToken;
          if (!accessToken && user.id) {
            try {
              const tokenRes = await loadConfig({
                data: {
                  signupId: user.id
                }
              });
              accessToken = tokenRes.accessToken;
            } catch {
            }
          }
          setUserId(user.id);
          setUserName(String(user.nombre ?? "").split(" ")[0]);
          setContacts(res.contacts);
          setPinConfigured(Boolean(res.pinConfigured));
          setAccountConfigured(true);
          setSubscriptionStatus(user.subscription_status ?? null);
          if (res.whatsappActivated) markWhatsAppActivatedLocally();
          if (res.installStep) setInstallStep(res.installStep);
          setSosPrimedAt(res.sosPrimedAt ?? null);
          setFallSensorPromptedAt(res.fallSensorPromptedAt ?? null);
          if (accessToken) persistSeniorAccessToken(accessToken, res.user.id);
          try {
            sessionStorage.setItem("seniorsafe_user", JSON.stringify(user));
          } catch {
          }
          try {
            localStorage.setItem("seniorsafe_user_backup", JSON.stringify(user));
          } catch {
          }
          try {
            localStorage.setItem("seniorsafe_account_configured", "1");
          } catch {
          }
          try {
            const hasContacts = Array.isArray(res.contacts) && res.contacts.length > 0;
            localStorage.setItem("seniorsafe_progress", JSON.stringify({
              pin: res.pinConfigured,
              contactos: hasContacts,
              gps: false,
              emergencia: false,
              app: true
            }));
          } catch {
          }
        } else if (lookup.signupId) {
          setUserId(lookup.signupId);
          if (stored?.nombre) setUserName(String(stored.nombre).split(" ")[0]);
        } else if (stored?.id) {
          setUserId(stored.id);
          if (stored.nombre) setUserName(String(stored.nombre).split(" ")[0]);
        }
      } catch (e) {
        console.error(e);
        toast.error("No pudimos cargar tu configuración previa.");
      } finally {
        if (alive) {
          setLoadingContacts(false);
          setConfigReady(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadConfig, routeSearch.ss]);
  reactExports.useEffect(() => {
    if (!userId || installStep === "ready") return;
    if (!isSosGpsPrimed(userId)) return;
    let alive = true;
    (async () => {
      try {
        const progress = await reportSosPrimedFn({
          data: {
            signupId: userId,
            accessToken: requireSeniorAccessToken(userId)
          }
        });
        if (!alive || !progress) return;
        if (progress.installStep) setInstallStep(progress.installStep);
        setSosPrimedAt(progress.sosPrimedAt ?? null);
      } catch (e) {
        console.warn("[app] sync sos_primed", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, installStep, reportSosPrimedFn]);
  reactExports.useEffect(() => {
    if (!configReady || !userId || contacts.length > 0) return;
    let alive = true;
    (async () => {
      setLoadingContacts(true);
      try {
        const res = await listFamilyWithFallback(list, userId);
        if (alive) setContacts(res.contacts);
      } catch (e) {
        console.error(e);
        if (alive) toast.error("No pudimos cargar tu red familiar.");
      } finally {
        if (alive) setLoadingContacts(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [configReady, userId, contacts.length, list]);
  reactExports.useEffect(() => {
    if (!userId) return;
    let alive = true;
    const refreshGps = async () => {
      const {
        coords
      } = await getCurrentCoordsWithError({
        highAccuracy: false,
        timeoutMs: 1e4,
        maximumAgeMs: 12e4
      });
      if (!alive) return;
      if (coords) {
        setLastCoords(coords);
        setGpsAllowed(true);
      }
    };
    void refreshGps();
    const id = setInterval(refreshGps, 12e4);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [userId]);
  const familyCount = contacts.length;
  const alertContacts = reactExports.useMemo(() => contacts.slice(0, MAX_GUARDIANS), [contacts]);
  const alertFamilyCount = alertContacts.length;
  const sendAlert = useServerFn(sendEmergencyAlert);
  const cancelAlert = useServerFn(cancelEmergencyAlert);
  const fetchFallGps = reactExports.useCallback(async () => {
    const {
      coords
    } = await getCurrentCoordsWithError({
      highAccuracy: true,
      timeoutMs: 6e3,
      maximumAgeMs: 12e4
    });
    return coords;
  }, []);
  const dispatchFallEmergency = reactExports.useCallback(async (gps) => {
    if (!userId) return;
    const trainingMode = trainingPending && !trainingDone;
    const res = await sendAlert({
      data: {
        signupId: userId,
        accessToken: requireSeniorAccessToken(userId),
        gps,
        emergencyCategory: "accidente",
        trainingMode,
        graceBeforeSend: !trainingMode,
        sosTriggeredAtMs: Date.now()
      }
    });
    if (res?.status === "cancelled_by_senior") {
      toast.message("Alerta por caída cancelada.");
      return;
    }
    if (trainingMode) {
      markTrainingDone();
      setTrainingDone(true);
      toast.success("Simulación de caída completada. Sin mensajes reales.");
      return;
    }
    const sent = (res?.results ?? []).filter((r) => r.status === "sent").length;
    if (sent > 0) toast.success("Alerta por caída enviada a tu familia.");
    else if (res?.status === "no_recipients") toast.error("No hay familiares configurados.");
    else toast.error("No pudimos enviar la alerta automática por caída.");
  }, [sendAlert, userId, trainingPending, trainingDone]);
  const {
    countdownSeconds: fallCountdown,
    isCountdownActive: fallCountdownActive,
    status: fallStatus,
    cancelarAlerta,
    requestPermission: requestFallPermission,
    isMonitoring: fallMonitoring,
    needsMotionPermission: fallNeedsPermission,
    motionSupported: fallMotionSupported,
    probarCuentaRegresiva
  } = useFallDetection({
    signupId: userId,
    enabled: !!userId && stage === "idle",
    getGps: fetchFallGps,
    dispatchEmergency: dispatchFallEmergency
  });
  const {
    showFallPrompt,
    dismissFallPrompt
  } = useFallSensorDeferred({
    signupId: userId,
    installStep,
    sosPrimedAt,
    fallSensorPromptedAt,
    fallMonitoring,
    enabled: !!userId
  });
  const handleDeferredFallActivate = async () => {
    setFallPromptBusy(true);
    try {
      await handleFallPermission();
      await dismissFallPrompt();
    } finally {
      setFallPromptBusy(false);
    }
  };
  const handleFallCancel = reactExports.useCallback(() => {
    cancelarAlerta();
    if (userId) void cancelAlert({
      data: {
        signupId: userId,
        accessToken: requireSeniorAccessToken(userId)
      }
    });
  }, [cancelarAlerta, userId, cancelAlert]);
  const handleFallPermission = reactExports.useCallback(async () => {
    const ok = await requestFallPermission();
    if (ok) {
      toast.success("Sensor de caídas activado. Mantén la app abierta o en segundo plano.");
      return;
    }
    if (!fallMotionSupported) {
      toast.error("Este teléfono no expone el acelerómetro al navegador.");
      return;
    }
    toast.error("Permiso de movimiento denegado. En iPhone: Ajustes → Safari → Sensores de movimiento.");
  }, [fallMotionSupported, requestFallPermission]);
  const [alertSummary, setAlertSummary] = reactExports.useState(null);
  const startEmergencyFlow = () => {
    const isTraining = trainingPending && !trainingDone;
    isTrainingRunRef.current = isTraining;
    setTrainingRunActive(isTraining);
    if ("vibrate" in navigator) navigator.vibrate?.(120);
    setEmergencyCategory(null);
    categoryPickRef.current = false;
    setStage("confirm");
  };
  const autoActivateWhatsApp = reactExports.useCallback(async () => {
    if (!userId) return;
    try {
      const accessToken = requireSeniorAccessToken(userId);
      const res = await activateWhatsApp({
        data: {
          signupId: userId,
          accessToken
        }
      });
      if (res?.ok) markWhatsAppActivatedLocally();
    } catch (e) {
      console.error("[autoActivateWhatsApp]", e);
    }
  }, [userId, activateWhatsApp]);
  const sosPrimingEnabled = clientReady && isInstalled && !!userId && stage === "idle";
  const {
    primed: sosGpsPrimed,
    uiStage: sosPrimingUiStage,
    lastGpsOk: sosPrimingGpsOk,
    dismissIntro: dismissSosPrimingIntro,
    closeSuccess: closeSosPrimingSuccess,
    runPrimingPress
  } = useSosGpsPriming({
    signupId: userId,
    enabled: sosPrimingEnabled,
    onGpsPrimed: (ok) => {
      if (ok) setGpsAllowed(true);
    },
    onWhatsAppAutoActivate: autoActivateWhatsApp,
    onSosPrimedComplete: async () => {
      if (!userId) return;
      const progress = await reportSosPrimedFn({
        data: {
          signupId: userId,
          accessToken: requireSeniorAccessToken(userId)
        }
      });
      if (progress?.installStep) setInstallStep(progress.installStep);
      setSosPrimedAt(progress?.sosPrimedAt ?? (/* @__PURE__ */ new Date()).toISOString());
    }
  });
  useDeviceHeartbeat({
    signupId: userId,
    gpsEnabled: gpsAllowed || sosPrimingGpsOk,
    lastCoords,
    appVersion: "pwa-1.0",
    enabled: !!userId
  });
  const liveBatteryLevel = useLiveBatteryLevel(!!userId);
  const handleEmergencyPress = () => {
    if (!sosGpsPrimed) {
      void runPrimingPress();
      return;
    }
    const isTraining = trainingPending && !trainingDone;
    if (configReady && userId && !subscriptionActive && !isTraining) {
      toast.error(subscriptionBlockedMessage(subscriptionStatus));
      return;
    }
    startEmergencyFlow();
  };
  const chooseEmergencyCategory = reactExports.useCallback((category) => {
    if (categoryPickRef.current) return;
    categoryPickRef.current = true;
    sosTriggeredAtMsRef.current = Date.now();
    if ("vibrate" in navigator) navigator.vibrate?.(80);
    setEmergencyCategory(category);
    setStage("sending");
  }, []);
  const handleAutoSendCategory = reactExports.useCallback((category) => {
    if (categoryPickRef.current) return;
    toast.message(`Enviando alerta de ${emergencyCategoryLabel(category)}…`);
    chooseEmergencyCategory(category);
  }, [chooseEmergencyCategory]);
  const {
    secondsLeft: categoryAutoSendSecondsLeft
  } = useEmergencyCategoryAutoSend(stage === "confirm" && !trainingRunActive, handleAutoSendCategory);
  const cancelEmergencySending = () => {
    emergencySendGenRef.current += 1;
    if (userId) void cancelAlert({
      data: {
        signupId: userId,
        accessToken: requireSeniorAccessToken(userId)
      }
    });
    setDeliveredTo(0);
    setAlertSummary(null);
    setEmergencyCategory(null);
    categoryPickRef.current = false;
    setStage("confirm");
    toast.message("Alerta cancelada. No se avisará a tu familia.");
  };
  const cancelEmergencyFlow = () => {
    emergencySendGenRef.current += 1;
    if (userId) void cancelAlert({
      data: {
        signupId: userId,
        accessToken: requireSeniorAccessToken(userId)
      }
    });
    setEmergencyCategory(null);
    categoryPickRef.current = false;
    setStage("idle");
  };
  reactExports.useEffect(() => {
    if (stage !== "sending" || !emergencyCategory) return;
    const gen = emergencySendGenRef.current;
    let cancelled = false;
    setDeliveredTo(0);
    setAlertSummary(null);
    if ("vibrate" in navigator) navigator.vibrate?.([100, 60, 100]);
    const total = Math.max(1, alertFamilyCount);
    const ticks = [];
    for (let i = 0; i < total; i++) {
      ticks.push(setTimeout(() => {
        if (emergencySendGenRef.current !== gen) return;
        setDeliveredTo((d) => Math.min(total, d + 1));
      }, 400 + i * 350));
    }
    (async () => {
      if (emergencySendGenRef.current !== gen) return;
      if (!userId) {
        toast.error("Sesión no encontrada. No pudimos enviar la alerta.");
        if (!cancelled && emergencySendGenRef.current === gen) {
          categoryPickRef.current = false;
          setStage("confirm");
        }
        return;
      }
      const {
        coords: gps
      } = await getCurrentCoordsWithError({
        highAccuracy: true,
        timeoutMs: 8e3,
        maximumAgeMs: 12e4
      });
      if (emergencySendGenRef.current !== gen) return;
      let sendSucceeded = false;
      try {
        const trainingMode = isTrainingRunRef.current;
        const res = await sendAlert({
          data: {
            signupId: userId,
            accessToken: requireSeniorAccessToken(userId),
            gps,
            trainingMode,
            emergencyCategory,
            graceBeforeSend: !trainingMode,
            sosTriggeredAtMs: sosTriggeredAtMsRef.current
          }
        });
        if (cancelled || emergencySendGenRef.current !== gen) return;
        if (res?.status === "cancelled_by_senior") {
          toast.message("Alerta cancelada. No se envió a tu familia.");
          if (emergencySendGenRef.current === gen) {
            categoryPickRef.current = false;
            setStage("confirm");
          }
          return;
        }
        const sent = (res?.results ?? []).filter((r) => r.status === "sent").length;
        const smsSent = (res?.results ?? []).filter((r) => r.status === "sent" && r.channel === "sms").length;
        const smsGuardians = Math.max(1, alertFamilyCount);
        setAlertSummary({
          delivered: smsSent,
          total: smsGuardians,
          status: res?.status ?? "unknown",
          training: !!res?.training || trainingMode
        });
        if (trainingMode) {
          markTrainingDone();
          setTrainingDone(true);
          isTrainingRunRef.current = false;
          setTrainingRunActive(false);
          toast.success("Entrenamiento completado. Sin llamadas ni mensajes reales.");
        } else if (res?.status === "delivered" || res?.status === "partial" && smsSent > 0) {
          toast.success("Alerta enviada a tu familia.");
        } else if (res?.status === "partial") toast.warning("Alerta enviada parcialmente.");
        else if (res?.status === "no_recipients") toast.error("No hay guardianes configurados. Agrega uno en Administrar familiares.");
        else if (res?.error === "subscription_inactive") {
          toast.error(res?.message ?? "Tu suscripción no está activa.");
        } else if ((res?.results?.length ?? 0) === 0) toast.error("No se pudo contactar a ningún guardián. Revisa que tengan teléfono válido.");
        else toast.error("No pudimos enviar la alerta. Llama directamente.");
        sendSucceeded = true;
      } catch (e) {
        console.error(e);
        if (!cancelled && emergencySendGenRef.current === gen) toast.error("Error enviando la alerta.");
      } finally {
        if (!cancelled && emergencySendGenRef.current === gen && sendSucceeded) {
          setDeliveredTo(total);
          setStage("sent");
        }
      }
    })();
    return () => {
      cancelled = true;
      ticks.forEach(clearTimeout);
    };
  }, [stage, alertFamilyCount, userId, sendAlert, cancelAlert, emergencyCategory]);
  const requestManage = () => {
    if (!userId && !readStoredSignupId()) {
      toast.error("Inicia sesión con tu correo o abre el enlace que recibiste tras el pago.");
      return;
    }
    if (pinUnlocked) setManageOpen(true);
    else setPinGateOpen(true);
  };
  const handleEmailLogin = async () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setLoginError("Ingresa tu correo registrado.");
      return;
    }
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await loginAccountByEmail(loadConfig, email);
      if (!res.configured || !res.user) {
        setLoginError(loginErrorMessage(res.error));
        return;
      }
      const user = res.user;
      setUserId(user.id);
      setUserName(String(user.nombre ?? "").split(" ")[0]);
      setContacts(res.contacts);
      setPinConfigured(Boolean(res.pinConfigured));
      setAccountConfigured(true);
      persistSignupHandoff(user.id);
      if (res.accessToken) persistSeniorAccessToken(res.accessToken, user.id);
      try {
        sessionStorage.setItem("seniorsafe_user", JSON.stringify(user));
      } catch {
      }
      try {
        localStorage.setItem("seniorsafe_user_backup", JSON.stringify(user));
      } catch {
      }
      toast.success(`Hola ${String(user.nombre ?? "").split(" ")[0]}`);
    } catch (e) {
      console.error(e);
      setLoginError("No pudimos cargar tu cuenta. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoginBusy(false);
    }
  };
  const requestGps = async () => {
    const ok = await ensureGeoPermission();
    if (ok) {
      const {
        coords
      } = await getCurrentCoordsWithError({
        highAccuracy: true,
        timeoutMs: 15e3,
        maximumAgeMs: 3e4
      });
      if (coords) setLastCoords(coords);
      setGpsAllowed(true);
      toast.success("GPS activado.");
      return;
    }
    if (isNativeApp()) {
      toast.error("Permiso de ubicación bloqueado. Ve a Ajustes → Apps → Senior Safe → Permisos → Ubicación → Permitir.", {
        duration: 8e3
      });
    } else {
      toast.error("Activa el GPS y el permiso de ubicación para este sitio en Ajustes del teléfono.");
    }
  };
  const requestNotifications = async () => {
    const {
      granted,
      mode
    } = await requestAppNotifications();
    if (granted) {
      setNotificationsAllowed(true);
      toast.success("Notificaciones activadas.");
      return;
    }
    if (mode === "unsupported" && isNativeApp()) {
      toast.message("Las alertas de emergencia llegan por SMS/WhatsApp a tu familia. Las notificaciones push son opcionales.", {
        duration: 7e3
      });
      setNotificationsAllowed(true);
      return;
    }
    if (isNativeApp()) {
      toast.error("Activa notificaciones en Ajustes → Apps → Senior Safe → Notificaciones.", {
        duration: 8e3
      });
    } else {
      toast.error("Notificaciones no disponibles en este navegador. Las alertas igual llegan a tu familia.");
      setNotificationsAllowed(true);
    }
  };
  const markBatteryReady = () => {
    setBatteryChecked(true);
    toast.success("Listo. Recuerda permitir funcionamiento en segundo plano.");
  };
  if (mustInstallBeforeWebPanel) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(PostPaymentInstallScreen, { signupId: userId, showPaymentSuccess: false });
  }
  if (configReady && !userId && !loadingContacts) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh flex flex-col items-center justify-center p-6 text-white", style: {
      background: `linear-gradient(135deg, ${DEEP}, #0a3540)`
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-6 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-10 h-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-extrabold mb-2", children: "Senior Safe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 text-center mb-8 max-w-xs", children: "Ingresa el correo con el que te registraste en alarmaseniorsafe.cl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "app-email", className: "text-white/90", children: "Correo registrado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "app-email", type: "email", inputMode: "email", autoComplete: "email", value: loginEmail, onChange: (e) => {
          setLoginEmail(e.target.value);
          setLoginError(null);
        }, onKeyDown: (e) => {
          if (e.key === "Enter") handleEmailLogin();
        }, placeholder: "tu@correo.cl", className: "h-14 text-base bg-white text-foreground" }),
        loginError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-red-200 bg-red-950/40 rounded-xl px-3 py-2", role: "alert", children: loginError }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: handleEmailLogin, disabled: loginBusy, className: "w-full h-14 text-lg font-bold", style: {
          background: GREEN
        }, children: loginBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }) : "Entrar" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh flex flex-col", style: {
    background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-5 pb-3 flex items-center justify-between max-w-md mx-auto w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl flex items-center justify-center text-white", style: {
          background: DEEP
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-foreground leading-tight", children: "Senior Safe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            "Hola",
            userName ? `, ${userName}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-foreground", "aria-label": "Estado del dispositivo", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-sm font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Battery, { className: "w-4 h-4", "aria-hidden": "true" }),
          liveBatteryLevel != null ? `${liveBatteryLevel}%` : "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-sm font-bold", "aria-label": "Conectado a Wi-Fi", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "w-4 h-4", "aria-hidden": "true" }) })
      ] })
    ] }),
    !guideDismissed && installStep !== "ready" && /* @__PURE__ */ jsxRuntimeExports.jsx(InstallStepGuideBanner, { step: installStep, signupId: userId, onDismiss: () => setGuideDismissed(true) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 flex flex-col px-5 pb-6 max-w-md mx-auto w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Estado actual", className: "rounded-3xl p-5 mb-6 text-white shadow-xl", style: {
        background: `linear-gradient(135deg, ${GREEN}, #15803d)`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-8 h-8", "aria-hidden": "true" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold leading-tight", children: "Estás segura" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/90", children: familyCount > 0 ? "Red familiar configurada" : "Aún sin familiares conectados" })
          ] })
        ] }),
        userId && fallMotionSupported && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleFallPermission, className: "inline-flex items-center gap-1.5 underline-offset-2 hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-4 h-4" }),
            "Caídas ",
            fallMonitoring ? "activo" : "tocar para activar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: probarCuentaRegresiva, className: "underline underline-offset-2 text-white/85", children: "Probar simulación" })
        ] })
      ] }),
      !isInstalled && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "aria-label": "Descargar la app", className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setInstallOpen(true), className: "w-full rounded-3xl p-5 text-white text-left shadow-xl active:scale-[0.99] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300", style: {
        background: `linear-gradient(135deg, ${GREEN}, #15803d)`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-7 h-7", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-extrabold leading-tight", children: "📲 DESCARGAR APP SENIOR SAFE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white/95 mt-1", children: "Instala Senior Safe para acceso rápido y alertas más confiables." })
        ] })
      ] }) }) }),
      accountConfigured && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { "aria-label": "Configuración recuperada", className: "bg-card border-2 rounded-3xl p-5 mb-4 shadow-sm", style: {
        borderColor: GREEN
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0", style: {
          background: GREEN
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-6 h-6", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground leading-tight", children: "Tu cuenta ya está configurada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Cargamos tu nombre, familiares, PIN, WhatsApp y avance de activación. No debes comenzar de nuevo." })
        ] })
      ] }) }),
      accountConfigured && (sosGpsPrimed && !gpsAllowed || !notificationsAllowed || !batteryChecked || sosGpsPrimed && fallNeedsPermission || sosGpsPrimed && !fallMotionSupported) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Permisos del teléfono", className: "bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-foreground text-lg mb-1", children: "Solo faltan permisos del teléfono" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: sosGpsPrimed ? "Son necesarios para protegerte en emergencias." : "La ubicación y el sensor de caídas se activan con la primera pulsación del botón rojo." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          sosGpsPrimed && !gpsAllowed && /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionButton, { icon: MapPin, label: "Activar GPS", done: gpsAllowed, onClick: requestGps }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionButton, { icon: Bell, label: "Activar notificaciones", done: notificationsAllowed, onClick: requestNotifications }),
          sosGpsPrimed && fallMotionSupported && fallNeedsPermission && /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionButton, { icon: Activity, label: "Activar sensor de caídas", done: fallMonitoring, onClick: handleFallPermission }),
          sosGpsPrimed && !fallMotionSupported && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3", children: "Este dispositivo no permite detección automática de caídas en el navegador. Usa el botón de emergencia." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionButton, { icon: Battery, label: "Revisar batería / segundo plano", done: batteryChecked, onClick: markBatteryReady })
        ] }),
        fallMonitoring && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: probarCuentaRegresiva, className: "mt-3 w-full text-sm font-semibold text-muted-foreground underline underline-offset-2", children: "Probar cuenta regresiva de caída (simulación, no envía alerta)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-4", children: [
        !sosGpsPrimed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-3 text-center text-sm font-semibold text-red-700 max-w-[20rem]", children: [
          "Primera pulsación: activa ubicación",
          fallMotionSupported ? " y caídas" : "",
          " y WhatsApp (sin avisar a nadie)."
        ] }),
        sosGpsPrimed && trainingPending && !trainingDone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-center text-sm font-semibold text-amber-700 max-w-[22rem]", children: "Siguiente pulsación: simulación (sin avisar a nadie). Luego el botón será real." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleEmergencyPress, "aria-label": "Botón de emergencia. Pulsa para pedir ayuda a tu familia", className: "relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full animate-ping", style: {
            background: "rgba(220,38,38,0.25)"
          }, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-3 rounded-full", style: {
            background: "rgba(220,38,38,0.10)"
          }, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition", style: {
            background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)`
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-20 h-20 mb-3", strokeWidth: 2.5, "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl tracking-wide", children: "EMERGENCIA" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 text-base font-semibold text-white/85", children: "Toca para pedir ayuda" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center text-sm text-muted-foreground max-w-[18rem]", children: loadingContacts || !configReady ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Cargando tu red familiar…" }) : alertFamilyCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Avisaremos a ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
            alertFamilyCount,
            " guardián",
            alertFamilyCount === 1 ? "" : "es"
          ] }),
          " (SMS, WhatsApp y llamada escalonada)."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Agrega un familiar en ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Tu red familiar" }),
          " para que reciba tus alertas."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Tu ubicación actual", className: "bg-card border border-border rounded-3xl overflow-hidden mb-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-32", style: {
          background: "radial-gradient(circle at 50% 60%, rgba(16,185,129,0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), linear-gradient(180deg, #f1f5f9, #e2e8f0)"
        }, "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white/80" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 -m-3 rounded-full animate-ping", style: {
              background: "rgba(34,197,94,0.45)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative flex w-7 h-7 rounded-full items-center justify-center text-white shadow-lg", style: {
              background: GREEN
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0", style: {
            background: PETROL
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "w-5 h-5", "aria-hidden": "true" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-semibold uppercase tracking-wide", children: "GPS activo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold text-foreground truncate", children: "En casa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3", "aria-hidden": "true" }),
              " Actualizado hace 1 min"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Familiares conectados", className: "bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5", style: {
              color: DEEP
            }, "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-foreground text-base", children: "Tu red familiar" })
          ] }),
          familyCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-white px-2.5 py-1 rounded-full", style: {
            background: GREEN
          }, children: [
            familyCount,
            " conectado",
            familyCount === 1 ? "" : "s"
          ] })
        ] }),
        loadingContacts ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
          " Cargando familiares…"
        ] }) : familyCount === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground py-2", children: [
          "Aún no has agregado familiares. ",
          pinConfigured ? "Usa “Administrar familiares” para añadirlos." : "Primero crea tu PIN de seguridad (botón de abajo)."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: contacts.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0", style: {
            background: colorFor(i)
          }, children: initialOf(f.nombre) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-foreground leading-tight truncate", children: f.nombre }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground truncate", children: [
              f.parentesco,
              " · recibe WhatsApp"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: {
            background: GREEN
          }, "aria-label": "En línea" })
        ] }, f.id)) }),
        !pinConfigured && userId && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setPinGateOpen(true), className: "mt-3 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md", style: {
          background: DEEP
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-4 h-4" }),
          " Crear PIN de seguridad (4 dígitos)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: requestManage, disabled: !userId, className: `w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-foreground font-bold text-sm hover:bg-muted transition disabled:opacity-50 ${pinConfigured ? "mt-3" : "mt-2"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-4 h-4" }),
          " Administrar familiares"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] text-muted-foreground text-center", children: pinConfigured ? "Para editar tu red pediremos tu PIN. La emergencia nunca pide PIN." : "Crea tu PIN una vez; luego podrás agregar y editar familiares." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivationButton, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { "aria-label": "Navegación principal", className: "grid grid-cols-3 gap-2 bg-card rounded-3xl p-2 border border-border shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { icon: House, label: "Inicio", active: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { icon: Heart, label: "Familia", onClick: requestManage }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NavItem, { icon: Settings, label: "Ajustes", onClick: requestManage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-center text-sm text-muted-foreground mt-4 hover:text-foreground underline-offset-4 hover:underline", children: "Volver al sitio web" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PinGateDialog, { open: pinGateOpen, signupId: userId, pinConfigured, onClose: () => setPinGateOpen(false), onPinConfigured: () => {
      setPinConfigured(true);
      try {
        const raw = localStorage.getItem("seniorsafe_progress");
        const prog = raw ? JSON.parse(raw) : {};
        localStorage.setItem("seniorsafe_progress", JSON.stringify({
          ...prog,
          pin: true
        }));
      } catch {
      }
    }, onSuccess: () => {
      setPinUnlocked(true);
      setPinGateOpen(false);
      setManageOpen(true);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ManageFamilyDialog, { open: manageOpen, onClose: () => setManageOpen(false), signupId: userId, contacts, setContacts }),
    stage !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "emergency-dialog-title", className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-card rounded-3xl shadow-2xl w-full max-w-md p-7 text-center", children: [
      stage === "confirm" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-20 h-20 mx-auto mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full animate-ping", style: {
            background: "rgba(220,38,38,0.25)"
          }, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg", style: {
            background: RED
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-10 h-10", "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "emergency-dialog-title", className: "text-2xl md:text-3xl font-bold text-foreground tracking-tight", children: "¿Qué tipo de ayuda necesitas?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base md:text-lg text-muted-foreground", children: trainingRunActive ? "Simulación: elige un tipo. No se contactará a nadie." : "Toca una opción y avisaremos a tu familia al instante." }),
        !trainingRunActive && categoryAutoSendSecondsLeft > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-medium text-red-600", "aria-live": "polite", children: [
          "Si no eliges, enviaremos alerta de",
          " ",
          emergencyCategoryLabel(EMERGENCY_CATEGORY_AUTO_DEFAULT),
          " en",
          " ",
          categoryAutoSendSecondsLeft,
          "s…"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 gap-3", children: EMERGENCY_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => chooseEmergencyCategory(category.id), className: "w-full py-5 px-4 rounded-2xl text-white text-left font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-red-300 flex items-center gap-4", style: {
            background: category.color
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-8 h-8", "aria-hidden": "true" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xl leading-tight", children: category.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium text-white/90 mt-1", children: category.subtitle })
            ] })
          ] }, category.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelEmergencyFlow, className: "mt-5 w-full py-4 rounded-2xl bg-muted text-foreground text-lg font-bold active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300", children: "Cancelar — estoy bien" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelEmergencyFlow, "aria-label": "Cerrar", className: "absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition focus-visible:ring-2 focus-visible:ring-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5", "aria-hidden": "true" }) })
      ] }),
      stage === "sending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white mb-5 shadow-lg animate-pulse", style: {
          background: RED
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-12 h-12", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "emergency-dialog-title", className: "text-2xl font-bold text-foreground tracking-tight", children: "Avisando a tu familia" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-lg text-muted-foreground", children: "Preparando aviso… Tienes unos segundos para cancelar si fue un error. Luego: SMS, WhatsApp y llamada si nadie confirma." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-2 text-left", "aria-live": "polite", "aria-atomic": "false", children: (alertContacts.length > 0 ? alertContacts : [{
          id: "x",
          nombre: "Tu guardián",
          parentesco: "—",
          telefono: ""
        }]).map((f, i) => {
          const done = i < deliveredTo;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 py-2 px-3 rounded-2xl transition", style: {
            background: done ? "rgba(22,163,74,0.08)" : "hsl(var(--muted))"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0", style: {
              background: colorFor(i)
            }, children: initialOf(f.nombre) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground truncate", children: f.nombre }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: f.parentesco })
            ] }),
            done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-sm font-bold", style: {
              color: GREEN
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5", "aria-hidden": "true" }),
              " Avisado"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin", "aria-label": "Enviando" })
          ] }, f.id);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelEmergencySending, className: "mt-6 w-full py-4 rounded-2xl bg-muted text-foreground text-lg font-bold active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300", children: "Cancelar — estoy bien" })
      ] }),
      stage === "sent" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-24 h-24 mx-auto mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-0 rounded-full animate-ping", style: {
            background: alertSummary && alertSummary.delivered > 0 ? "rgba(22,163,74,0.30)" : "rgba(220,38,38,0.25)"
          }, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg", style: {
            background: alertSummary && alertSummary.delivered > 0 ? GREEN : RED
          }, children: alertSummary && alertSummary.delivered > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-12 h-12", "aria-hidden": "true" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "emergency-dialog-title", className: "text-3xl font-bold text-foreground tracking-tight", children: alertSummary?.training ? "Entrenamiento completado" : alertSummary && alertSummary.delivered > 0 ? "Ayuda en camino" : "No se pudo enviar el SMS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-lg text-muted-foreground", children: alertSummary?.training ? `Simulaste el flujo completo. En una emergencia real: ${CASCADE_MARKETING_SUMMARY}` : alertSummary?.status === "no_recipients" || alertSummary && alertSummary.total === 0 ? "No encontramos guardianes para avisar. Ve a Administrar familiares y agrega al menos uno con teléfono +56 9…" : alertSummary && alertSummary.delivered > 0 ? `${alertSummary.delivered} de ${alertSummary.total} SMS enviados. WhatsApp y llamada se enviaron si nadie confirmó.` : alertSummary ? `0 de ${alertSummary.total} SMS enviados. Revisa guardianes o llama directamente.` : "Tus guardianes recibieron la alerta con tu ubicación." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-muted p-4 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-foreground mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4", style: {
              color: GREEN
            }, "aria-hidden": "true" }),
            "Compartiste tu ubicación"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "En casa" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: cancelEmergencyFlow, className: "mt-6 w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300", style: {
          background: DEEP
        }, children: "Cerrar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FallDetectionOverlay, { isActive: fallCountdownActive, countdownSeconds: fallCountdown, isDispatching: fallStatus === "dispatching", onCancel: handleFallCancel }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(InstallAppModal, { open: installOpen, onClose: () => setInstallOpen(false), signupId: userId }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SosGpsPrimingUi, { uiStage: sosPrimingUiStage, gpsOk: sosPrimingGpsOk, onIntroDismiss: dismissSosPrimingIntro, onSuccessClose: closeSosPrimingSuccess }),
    showFallPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx(FallSensorDeferredPrompt, { busy: fallPromptBusy, onActivate: () => void handleDeferredFallActivate(), onDismiss: () => void dismissFallPrompt() })
  ] });
}
function NavItem({
  icon: Icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: `flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-sm font-semibold transition ${active ? "text-white" : "text-muted-foreground hover:bg-muted"}`, style: active ? {
    background: DEEP
  } : void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5", "aria-hidden": "true" }),
    label
  ] });
}
function PermissionButton({
  icon: Icon,
  label,
  done,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, disabled: done, className: "w-full min-h-14 rounded-2xl border border-border px-4 py-3 flex items-center justify-between gap-3 text-left disabled:opacity-100", style: done ? {
    background: "color-mix(in oklab, #16a34a 8%, white)",
    borderColor: GREEN
  } : void 0, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-3 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", style: {
        background: done ? GREEN : PETROL
      }, children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground text-base leading-tight", children: [
        done ? "Listo: " : "",
        label
      ] })
    ] }),
    !done && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-muted-foreground", children: "Tocar" })
  ] });
}
function ManageFamilyDialog({
  open,
  onClose,
  signupId,
  contacts,
  setContacts
}) {
  const [form, setForm] = reactExports.useState({
    nombre: "",
    telefono: "",
    parentesco: ""
  });
  const [editingId, setEditingId] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const add = useServerFn(addFamily);
  const upd = useServerFn(updateFamily);
  const del = useServerFn(deleteFamily);
  const resetForm = () => {
    setForm({
      nombre: "",
      telefono: "",
      parentesco: ""
    });
    setEditingId(null);
  };
  const submit = async () => {
    if (!signupId) return;
    if (!form.nombre.trim() || !form.telefono.trim() || !form.parentesco.trim()) {
      toast.error("Completa todos los campos");
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        const res = await updateFamilyWithFallback(upd, signupId, editingId, form);
        if (!res.contact) {
          toast.error(familyErrorMessage(res.error));
          return;
        }
        setContacts(contacts.map((c) => c.id === editingId ? res.contact : c));
        toast.success("Familiar actualizado");
      } else {
        if (contacts.length >= MAX_GUARDIANS) {
          toast.error(`Máximo ${MAX_GUARDIANS} guardianes.`);
          return;
        }
        const res = await addFamilyWithFallback(add, signupId, form);
        if (!res.contact) {
          toast.error(familyErrorMessage(res.error));
          return;
        }
        setContacts([...contacts, res.contact]);
        toast.success("Familiar agregado");
      }
      resetForm();
    } catch (e) {
      console.error(e);
      toast.error(familyErrorMessage(e instanceof Error ? e.message : void 0));
    } finally {
      setBusy(false);
    }
  };
  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre,
      telefono: c.telefono,
      parentesco: c.parentesco
    });
  };
  const remove = async (c) => {
    if (!signupId) return;
    if (!confirm(`¿Eliminar a ${c.nombre}?`)) return;
    setBusy(true);
    try {
      const res = await deleteFamilyWithFallback(del, signupId, c.id);
      if (!res.ok) {
        toast.error(familyErrorMessage(res.error));
        return;
      }
      setContacts(contacts.filter((x) => x.id !== c.id));
      if (editingId === c.id) resetForm();
      toast.success("Familiar eliminado");
    } catch (e) {
      console.error(e);
      toast.error("No pudimos eliminar.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && (onClose(), resetForm()), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2", style: {
        background: GREEN
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-7 h-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-2xl", children: "Administrar familiares" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-base", children: [
        "Edita, agrega o elimina hasta ",
        MAX_GUARDIANS,
        " personas que reciben tus alertas."
      ] })
    ] }),
    contacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 mb-4", children: contacts.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 p-3 rounded-2xl border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0", style: {
        background: colorFor(i)
      }, children: initialOf(c.nombre) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground truncate", children: c.nombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
          c.parentesco,
          " · ",
          c.telefono
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => startEdit(c), className: "w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center", "aria-label": `Editar ${c.nombre}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => remove(c), className: "w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-red-600", "aria-label": `Eliminar ${c.nombre}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-border pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: editingId ? "Editar familiar" : "Agregar familiar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nombre, onChange: (e) => setForm({
          ...form,
          nombre: e.target.value
        }), placeholder: "Ej: Pedro" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parentesco" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.parentesco, onChange: (e) => setForm({
            ...form,
            parentesco: e.target.value
          }), placeholder: "Hijo, Hija…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WhatsApp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.telefono, onChange: (e) => setForm({
            ...form,
            telefono: e.target.value
          }), placeholder: "+56 9 …" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-2 mt-4", children: [
      editingId && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: resetForm, children: "Cancelar edición" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: busy, style: {
        background: GREEN
      }, children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : editingId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 mr-1" }),
        " Guardar cambios"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        " Agregar"
      ] }) })
    ] })
  ] }) });
}
export {
  AppHome as component
};
