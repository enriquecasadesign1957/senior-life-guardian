import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { d as detectPlatform, c as isMobileDevice, e as isPwaStandalone, i as isNativeApp, m as markAndroidApkAcknowledged, b as buildNativeHandoffUrl, A as APK_DOWNLOAD_URL } from "./device-Dq_ZTBb-.mjs";
import { P as PRODUCTION_SITE_URL } from "./index.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { t as trackGoogleAdsSubscriptionConversion } from "./router-FK5WbXyp.mjs";
import { a as markRequiresPwaInstall, p as persistSignupHandoff, c as clearRequiresPwaInstall, b as buildAppHandoffSearch } from "./post-payment-BtVMraP6.mjs";
import { W as WhatsAppActivarCta } from "./whatsapp-activar-cta-CjTD6kty.mjs";
import { I as InstallNotifyBanner } from "./install-notify-banner-CdM3Di4q.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { c as createSsrRpc } from "./createSsrRpc-14pD3De2.mjs";
import { j as createServerFn } from "./createServerFn-CqTdkD5n.mjs";
import { n as normalizeDiscountCodeInput } from "./discount-codes-BbIma2Cq.mjs";
import { D as Download, C as CircleCheck, S as Shield, U as Users, M as MapPin, o as Tag, L as LoaderCircle, p as Smartphone, q as Monitor, Q as QrCode, r as ArrowDown, s as Apple, t as ArrowUp, u as Plus } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, l as literalType, Z as ZodIssueCode } from "../_libs/zod.mjs";
const PROMPT_KEY = "__seniorSafeInstallPrompt";
const PROMPT_BOUND_KEY = "__seniorSafeInstallPromptBound";
function installPromptWindow() {
  return window;
}
function getCapturedInstallPrompt() {
  if (typeof window === "undefined") return null;
  return installPromptWindow()[PROMPT_KEY] ?? null;
}
function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") {
    installPromptWindow()[PROMPT_KEY] = null;
  }
}
function ensureInstallPromptCapture() {
  const w = typeof window !== "undefined" ? installPromptWindow() : null;
  if (!w || w[PROMPT_BOUND_KEY]) {
    return;
  }
  w[PROMPT_BOUND_KEY] = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptWindow()[PROMPT_KEY] = event;
  });
}
async function triggerPwaInstallPrompt() {
  ensureInstallPromptCapture();
  const deferred = getCapturedInstallPrompt();
  if (!deferred) return "unavailable";
  try {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    clearCapturedInstallPrompt();
    return choice.outcome;
  } catch {
    return "unavailable";
  }
}
const phoneField = stringType().trim().min(8, "Ingresa un teléfono válido").max(40).regex(/^[0-9+\s-]+$/, "Solo números");
const completeCheckoutProfile = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  signupId: stringType().uuid(),
  direccion: stringType().trim().max(255).optional().or(literalType("")),
  discountCode: stringType().trim().max(64).optional().or(literalType("")),
  guardianName: stringType().trim().min(2).max(100),
  guardianPhone: phoneField,
  guardianRelation: stringType().trim().min(2).max(40),
  seniorPhone: phoneField.optional()
}).superRefine((data, ctx) => {
  if (!data.seniorPhone) return;
  const senior = data.seniorPhone.replace(/\D/g, "").slice(-9);
  const guardian = data.guardianPhone.replace(/\D/g, "").slice(-9);
  if (senior.length >= 8 && senior === guardian) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: "El guardián debe ser otra persona (teléfono distinto).",
      path: ["guardianPhone"]
    });
  }
}).parse(input)).handler(createSsrRpc("746d37c9d4e786a9e375410df0f2051ad7b4dff5079870f21a5d73c9b4833ce6"));
const CHECKOUT_DRAFT_KEY = "seniorsafe_checkout_draft";
function readCheckoutDraft() {
  if (typeof window === "undefined") return null;
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed.email || !parsed.phone || !parsed.seniorName) continue;
      return {
        email: String(parsed.email),
        phone: String(parsed.phone),
        seniorName: String(parsed.seniorName),
        signupId: typeof parsed.signupId === "string" ? parsed.signupId : void 0,
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch {
    }
  }
  return null;
}
function clearCheckoutDraft() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
  }
}
function hasCheckoutDraftForSignup(signupId) {
  const draft = readCheckoutDraft();
  if (!draft) return false;
  if (!signupId) return true;
  return !draft.signupId || draft.signupId === signupId;
}
function getServerErrorMessage(err, fallback) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object") {
    const o = err;
    if (typeof o.message === "string" && o.message.trim()) return o.message;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
  }
  return fallback;
}
const DEEP$1 = "var(--brand-petrol-deep)";
const PETROL$1 = "var(--brand-petrol)";
const GREEN$1 = "#16a34a";
const GUARDIAN_RELATIONS = [
  "Hijo/a",
  "Nieto/a",
  "Hermano/a",
  "Vecino/a",
  "Cuidador/a",
  "Otro familiar"
];
const DONE_KEY = "seniorsafe_checkout_profile_done:";
function alreadyCompleted(signupId) {
  try {
    return localStorage.getItem(`${DONE_KEY}${signupId}`) === "1";
  } catch {
    return false;
  }
}
function markCompleted(signupId) {
  try {
    localStorage.setItem(`${DONE_KEY}${signupId}`, "1");
  } catch {
  }
}
function PostPaymentProfileForm({
  signupId
}) {
  const completeProfile = useServerFn(completeCheckoutProfile);
  const [visible, setVisible] = reactExports.useState(false);
  const [seniorPhone, setSeniorPhone] = reactExports.useState();
  const [guardianName, setGuardianName] = reactExports.useState("");
  const [guardianPhone, setGuardianPhone] = reactExports.useState("");
  const [guardianRelation, setGuardianRelation] = reactExports.useState(GUARDIAN_RELATIONS[0]);
  const [address, setAddress] = reactExports.useState("");
  const [discountCode, setDiscountCode] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!signupId) {
      setVisible(false);
      return;
    }
    if (alreadyCompleted(signupId)) {
      setVisible(false);
      return;
    }
    const draft = readCheckoutDraft();
    setSeniorPhone(draft?.phone);
    setVisible(hasCheckoutDraftForSignup(signupId));
  }, [signupId]);
  if (!visible || !signupId || done) return null;
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (guardianName.trim().length < 2) {
      setError("Ingresa el nombre del guardián.");
      return;
    }
    if (guardianPhone.trim().length < 8) {
      setError("Ingresa el teléfono del guardián.");
      return;
    }
    setLoading(true);
    try {
      await completeProfile({
        data: {
          signupId,
          direccion: address.trim(),
          discountCode: normalizeDiscountCodeInput(discountCode),
          guardianName: guardianName.trim(),
          guardianPhone: guardianPhone.trim(),
          guardianRelation: guardianRelation.trim(),
          seniorPhone
        }
      });
      markCompleted(signupId);
      clearCheckoutDraft();
      setDone(true);
      toast.success("Guardián inscrito. Ya puedes instalar la app.");
    } catch (err) {
      setError(getServerErrorMessage(err, "No pudimos guardar los datos. Intenta de nuevo."));
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit,
      className: "mb-6 rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm text-left space-y-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
              style: { background: PETROL$1 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5", "aria-hidden": true })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-foreground tracking-tight", children: "Completa la red de protección" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground leading-relaxed", children: "Inscribe al primer guardián (obligatorio para alertas). Dirección y código son opcionales." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground mb-1.5 block", children: "Nombre del guardián" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: guardianName,
              onChange: (e) => setGuardianName(e.target.value),
              className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40",
              placeholder: "Carlos González",
              autoComplete: "name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground mb-1.5 block", children: "Teléfono / WhatsApp del guardián" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: guardianPhone,
              onChange: (e) => setGuardianPhone(e.target.value),
              className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40",
              placeholder: "+56 9 ...",
              inputMode: "tel",
              autoComplete: "tel"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground mb-1.5 block", children: "Parentesco" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: guardianRelation,
              onChange: (e) => setGuardianRelation(e.target.value),
              className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40",
              children: GUARDIAN_RELATIONS.map((rel) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: rel, children: rel }, rel))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            " Dirección (opcional)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: address,
              onChange: (e) => setAddress(e.target.value),
              className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40",
              placeholder: "Calle, comuna, ciudad",
              autoComplete: "street-address"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-semibold text-muted-foreground mb-1.5 inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3.5 w-3.5", "aria-hidden": true }),
            " Código institucional (opcional)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: discountCode,
              onChange: (e) => setDiscountCode(e.target.value),
              className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-base outline-none focus:border-foreground/40 uppercase",
              placeholder: "Código de convenio",
              autoComplete: "off",
              spellCheck: false
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: "Si el descuento ya se aplicó al pagar, no es necesario volver a ingresarlo." })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white disabled:opacity-70",
            style: { background: DEEP$1 },
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Guardando…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4", style: { color: GREEN$1 } }),
              "Guardar e instalar"
            ] })
          }
        )
      ]
    }
  );
}
const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";
function readSimulateIosFromUrl() {
  return false;
}
function resolveSignupId(explicit) {
  if (explicit) return explicit;
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("ss");
    if (fromQuery) return fromQuery;
    const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup");
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
}
function buildQrTargetUrl(signupId, paymentSuccess) {
  {
    const u = new URL("/instalar-app", PRODUCTION_SITE_URL);
    if (paymentSuccess) u.searchParams.set("pago", "ok");
    if (signupId) u.searchParams.set("ss", signupId);
    return u.toString();
  }
}
function qrImageUrl(target) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=14&data=${encodeURIComponent(target)}`;
}
function IosShareIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "16 6 12 2 8 6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "2", x2: "12", y2: "15" })
      ]
    }
  );
}
function PostPaymentInstallScreen({
  paymentSummary,
  signupId: signupIdProp,
  showPaymentSuccess = true,
  trackConversion = false,
  installNotify
}) {
  const navigate = useNavigate();
  const displaySummary = paymentSummary ?? {};
  const [signupId, setSignupId] = reactExports.useState(() => resolveSignupId(signupIdProp));
  const [installed, setInstalled] = reactExports.useState(false);
  const [installing, setInstalling] = reactExports.useState(false);
  const [showIosGuide, setShowIosGuide] = reactExports.useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = reactExports.useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = reactExports.useState(false);
  const [simulateIos, setSimulateIos] = reactExports.useState(false);
  const platform = reactExports.useMemo(() => detectPlatform(), []);
  const mobile = reactExports.useMemo(() => isMobileDevice(), []);
  const seniorSimpleMode = mobile;
  const effectiveIsIOS = platform.isIOS || simulateIos;
  const showMobilePanel = mobile || effectiveIsIOS;
  const needsSafariOnIos = effectiveIsIOS && !platform.isSafari && !simulateIos;
  const installPageUrl = reactExports.useMemo(
    () => buildQrTargetUrl(signupId, showPaymentSuccess),
    [signupId, showPaymentSuccess]
  );
  reactExports.useEffect(() => {
    setSimulateIos(readSimulateIosFromUrl());
  }, []);
  reactExports.useEffect(() => {
    markRequiresPwaInstall();
    const id = resolveSignupId(signupIdProp);
    setSignupId(id);
    if (id) persistSignupHandoff(id);
  }, [signupIdProp]);
  reactExports.useEffect(() => {
    if (!trackConversion || !signupId) return;
    const transactionId = displaySummary.buyOrder?.trim() || displaySummary.authorizationCode?.trim() || "";
    if (!transactionId) return;
    trackGoogleAdsSubscriptionConversion({
      value: displaySummary.amount ?? null,
      currency: "CLP",
      transactionId,
      signupId
    });
  }, [
    trackConversion,
    signupId,
    displaySummary.amount,
    displaySummary.buyOrder,
    displaySummary.authorizationCode
  ]);
  reactExports.useEffect(() => {
    ensureInstallPromptCapture();
    const check = () => {
      const standalone = isPwaStandalone();
      setInstalled(standalone);
      if (standalone) clearRequiresPwaInstall();
      setHasDeferredPrompt(!!getCapturedInstallPrompt());
    };
    check();
    const onInstalled = () => {
      setInstalled(true);
      clearRequiresPwaInstall();
    };
    const onBip = () => setHasDeferredPrompt(true);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("beforeinstallprompt", onBip);
    return () => {
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("beforeinstallprompt", onBip);
    };
  }, []);
  reactExports.useEffect(() => {
    if (effectiveIsIOS && !isPwaStandalone() && !installed) {
      setShowIosGuide(true);
    }
  }, [effectiveIsIOS, installed]);
  const continueToApp = reactExports.useCallback(() => {
    const id = resolveSignupId(signupId);
    if (!id) {
      toast.error("No encontramos tu cuenta. Escanea el código QR o vuelve a abrir el enlace de instalación.");
      return;
    }
    persistSignupHandoff(id, showPaymentSuccess ? { subscription_status: "active" } : void 0);
    clearRequiresPwaInstall();
    if (platform.isAndroid && !simulateIos && !isPwaStandalone() && !isNativeApp()) {
      markAndroidApkAcknowledged();
      toast.success("Abre Senior Safe desde el ícono en tu pantalla de inicio.");
      window.location.href = buildNativeHandoffUrl(id, "postpay");
      return;
    }
    if (effectiveIsIOS) {
      navigate({ to: "/app", search: buildAppHandoffSearch(id, { training: false }) });
      return;
    }
    navigate({ to: "/app", search: buildAppHandoffSearch(id, { training: true }) });
  }, [navigate, signupId, showPaymentSuccess, platform.isAndroid, simulateIos, effectiveIsIOS]);
  const handleInstallClick = async () => {
    setInstalling(true);
    setShowAndroidGuide(false);
    try {
      if (effectiveIsIOS) {
        setShowIosGuide(true);
        return;
      }
      if (platform.isAndroid && !simulateIos) {
        window.location.assign(APK_DOWNLOAD_URL);
        setShowAndroidGuide(true);
        return;
      }
      const outcome = await triggerPwaInstallPrompt();
      if (outcome === "accepted") {
        setInstalled(true);
        return;
      }
      if (outcome === "dismissed" || outcome === "unavailable") {
        setShowAndroidGuide(true);
      }
    } finally {
      setInstalling(false);
    }
  };
  const handleAndroidApkInstalled = () => {
    markAndroidApkAcknowledged();
    setInstalled(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-[100dvh] flex flex-col",
      style: { background: "var(--gradient-soft)" },
      children: [
        false,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 pt-10 pb-4 text-center max-w-lg mx-auto w-full", children: [
          showPaymentSuccess && seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white",
                style: { background: GREEN },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-8 h-8" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-2xl md:text-3xl font-bold text-foreground tracking-tight", children: effectiveIsIOS ? "Pon Senior Safe en tu pantalla" : "Instala Senior Safe" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-lg leading-relaxed", children: effectiveIsIOS ? needsSafariOnIos ? "Primero ábrelo en Safari (el navegador azul)." : "Solo 3 toques. Sin pruebas ni pasos extras." : "Toca el botón verde de abajo. Solo toma un minuto." })
          ] }),
          showPaymentSuccess && !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                style: { background: "color-mix(in oklab, #16a34a 14%, white)" },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-9 h-9", style: { color: GREEN } })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-2xl md:text-3xl font-bold text-foreground tracking-tight", children: "¡Pago confirmado!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-base leading-relaxed", children: "Tu suscripción Senior Safe está activa. Instala la app en el celular del titular de la cuenta (también enviamos el enlace por correo y WhatsApp)." }),
            displaySummary && (displaySummary.amount != null || displaySummary.buyOrder || displaySummary.authorizationCode || displaySummary.cardLast4) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 text-left bg-card border border-border rounded-2xl p-4 text-sm space-y-2 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wide text-muted-foreground", children: "Comprobante Lemon Squeezy" }),
              displaySummary.amount != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Monto pagado" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                  "$",
                  displaySummary.amount.toLocaleString("es-CL"),
                  " CLP"
                ] })
              ] }),
              displaySummary.authorizationCode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Código de autorización" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: displaySummary.authorizationCode })
              ] }),
              displaySummary.cardLast4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tarjeta" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs", children: [
                  "**** ",
                  displaySummary.cardLast4
                ] })
              ] }),
              displaySummary.buyOrder && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Orden de compra" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs break-all text-right", children: displaySummary.buyOrder })
              ] })
            ] })
          ] }),
          !showPaymentSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white",
                style: { background: PETROL },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-7 h-7" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-2xl font-bold text-foreground", children: "Instala Senior Safe" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-base leading-relaxed", children: effectiveIsIOS ? needsSafariOnIos ? "Abre este enlace en Safari y sigue los 3 toques." : "Solo 3 toques en Safari. Sin pruebas." : "Toca el botón verde de abajo para descargar la app." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "main",
          {
            className: `flex-1 px-6 max-w-lg mx-auto w-full ${showIosGuide && effectiveIsIOS && !needsSafariOnIos && !installed ? "pb-36" : "pb-10"}`,
            children: [
              showPaymentSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx(PostPaymentProfileForm, { signupId }),
              showPaymentSuccess && !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InstallNotifyBanner, { notify: installNotify }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivarCta, {})
              ] }),
              needsSafariOnIos && /* @__PURE__ */ jsxRuntimeExports.jsx(IosOpenInSafariBanner, { installPageUrl }),
              showMobilePanel ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                MobileInstallPanel,
                {
                  installed,
                  installing,
                  hasDeferredPrompt,
                  isIOS: effectiveIsIOS,
                  isAndroid: platform.isAndroid && !simulateIos,
                  showIosGuide,
                  showAndroidGuide,
                  seniorSimpleMode,
                  needsSafariOnIos,
                  onInstall: handleInstallClick,
                  onContinue: continueToApp,
                  onAndroidApkInstalled: handleAndroidApkInstalled
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(DesktopInstallPanel, { installPageUrl, qrSrc: qrImageUrl(installPageUrl) }),
              showPaymentSuccess && seniorSimpleMode && !effectiveIsIOS && !installed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivarCta, { compact: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-xs text-muted-foreground", children: "WhatsApp se puede vincular después. Primero instala la app." })
              ] }),
              showPaymentSuccess && seniorSimpleMode && effectiveIsIOS && installed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WhatsAppActivarCta, { compact: true }) }),
              !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 text-center text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed", children: showMobilePanel ? effectiveIsIOS ? "En iPhone, agrega Senior Safe a la pantalla de inicio desde Safari." : platform.isAndroid && !simulateIos ? "En Android descarga e instala el archivo APK. La página web del navegador no reemplaza la app." : "La app instalada es la forma segura de usar el botón de emergencia 24/7." : "Por seguridad, el panel web no está disponible en computador. Usa tu celular para instalar la aplicación." })
            ]
          }
        ),
        showIosGuide && effectiveIsIOS && !needsSafariOnIos && !installed && /* @__PURE__ */ jsxRuntimeExports.jsx(IosSafariShareHint, {})
      ]
    }
  );
}
function IosSafariShareHint() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "pointer-events-none fixed left-1/2 z-50 flex flex-col items-center",
      style: {
        bottom: "max(0.75rem, env(safe-area-inset-bottom, 20px))",
        transform: "translateX(-50%)"
      },
      role: "status",
      "aria-live": "polite",
      "aria-label": "Toca Compartir abajo en Safari",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-2xl px-4 py-2.5 shadow-lg border-2 text-center",
            style: {
              background: "rgba(255,255,255,0.96)",
              borderColor: PETROL,
              backdropFilter: "blur(8px)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground leading-tight", children: "Toca aquí abajo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Compartir → Añadir a inicio" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "mt-2 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg",
            style: { background: DEEP, animation: "ss-share-bounce 1.2s ease-in-out infinite" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-7 w-7", strokeWidth: 2.5, "aria-hidden": true })
          }
        )
      ]
    }
  );
}
function IosOpenInSafariBanner({ installPageUrl }) {
  const copyForSafari = async () => {
    try {
      await navigator.clipboard.writeText(installPageUrl);
      toast.success("Enlace copiado. Ábrelo en Safari (ícono azul).");
    } catch {
      toast.error("Copia el enlace manualmente y ábrelo en Safari.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "mb-2 rounded-3xl border-4 p-6 md:p-8 text-center shadow-lg",
      style: {
        borderColor: "#f59e0b",
        background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)"
      },
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black",
            style: { background: "#0A84FF" },
            "aria-hidden": true,
            children: "S"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-2xl font-extrabold text-foreground leading-tight", children: "Abre esto en Safari" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-lg text-foreground/90 leading-relaxed", children: "En iPhone solo funciona desde Safari (el navegador azul). No uses Chrome ni WhatsApp interno." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "mt-5 text-left space-y-3 text-base font-medium text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0", children: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pt-1", children: "Copia el enlace con el botón de abajo." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0", children: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pt-1", children: "Abre Safari y pégalo en la barra de arriba." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0", children: "3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pt-1", children: "Sigue los 3 toques para ponerlo en tu pantalla." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            onClick: copyForSafari,
            className: "mt-6 w-full h-16 text-xl font-bold rounded-2xl shadow-lg",
            style: { background: DEEP, color: "white" },
            children: "Copiar enlace para Safari"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground break-all font-mono", children: installPageUrl })
      ]
    }
  );
}
function IosSafariInstallGuide({ simple = false }) {
  const steps = simple ? [
    {
      n: 1,
      title: "Toca Compartir",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Abajo en el centro de Safari:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 bg-white align-middle mx-1",
            style: { borderColor: PETROL, color: DEEP },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(IosShareIcon, { className: "w-6 h-6" })
          }
        )
      ] })
    },
    {
      n: 2,
      title: "Añadir a pantalla de inicio",
      body: "Desliza el menú y elige esa opción."
    },
    {
      n: 3,
      title: 'Toca "Añadir"',
      body: "Arriba a la derecha. Luego abre el ícono nuevo."
    }
  ] : [
    {
      n: 1,
      title: "Toca Compartir",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "En la barra inferior de Safari, toca el botón",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 bg-white shadow-sm",
              style: { borderColor: PETROL, color: DEEP },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(IosShareIcon, { className: "w-5 h-5" })
            }
          ),
          "Compartir"
        ] }),
        " ",
        "(cuadrado con flecha hacia arriba)."
      ] })
    },
    {
      n: 2,
      title: "Añadir a pantalla de inicio",
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Desliza hacia abajo el menú y elige",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4", style: { color: DEEP } }),
          "Añadir a pantalla de inicio"
        ] }),
        ". En inglés aparece como ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Add to Home Screen" }),
        "."
      ] })
    },
    {
      n: 3,
      title: 'Pulsa "Añadir"',
      body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "En la esquina superior derecha, toca el botón azul",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Añadir" }),
        ". Luego abre Senior Safe desde el ícono nuevo en tu pantalla de inicio."
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: simple ? "rounded-3xl border-4 p-5 md:p-6 space-y-5 shadow-lg" : "rounded-3xl border-4 p-5 md:p-6 space-y-4 shadow-lg",
      style: {
        borderColor: PETROL,
        background: "linear-gradient(180deg, #ffffff 0%, color-mix(in oklab, var(--brand-petrol) 6%, white) 100%)"
      },
      role: "region",
      "aria-label": "Guía de instalación en iPhone Safari",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0",
              style: { background: DEEP },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Apple, { className: "w-6 h-6" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-extrabold text-foreground leading-tight", children: simple ? "Solo 3 toques" : "Instalar en iPhone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-medium", children: "Safari · sin pruebas" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-4", children: steps.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "li",
          {
            className: `flex gap-4 rounded-2xl bg-white/90 border border-border shadow-sm ${simple ? "p-5" : "p-4"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `rounded-full flex items-center justify-center text-white font-extrabold shrink-0 ${simple ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg"}`,
                  style: { background: step.n === 3 ? GREEN : DEEP },
                  children: step.n
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-bold text-foreground mb-1 ${simple ? "text-xl" : "text-base"}`, children: step.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-foreground/90 leading-relaxed ${simple ? "text-lg" : "text-base"}`, children: step.body })
              ] })
            ]
          },
          step.n
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: "text-center font-semibold rounded-xl py-3 px-4",
            style: { background: "color-mix(in oklab, #16a34a 10%, white)", color: "#166534", fontSize: simple ? "1rem" : "0.875rem" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "inline w-4 h-4 mr-1 align-text-bottom" }),
              "El botón Compartir está abajo en el centro"
            ]
          }
        )
      ]
    }
  );
}
function MobileInstallPanel({
  installed,
  installing,
  hasDeferredPrompt,
  isIOS,
  isAndroid,
  showIosGuide,
  showAndroidGuide,
  seniorSimpleMode,
  needsSafariOnIos,
  onInstall,
  onContinue,
  onAndroidApkInstalled
}) {
  if (installed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-3xl p-8 shadow-lg text-center space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white",
          style: { background: GREEN },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-10 h-10" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "¡Listo!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-lg leading-relaxed", children: "Abre Senior Safe desde el ícono en tu pantalla de inicio." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: onContinue,
          className: "w-full h-16 text-xl font-bold rounded-2xl shadow-lg",
          style: { background: GREEN, color: "white" },
          children: "Abrir Senior Safe"
        }
      )
    ] });
  }
  if (needsSafariOnIos) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-5", children: [
    isIOS && showIosGuide ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(IosSafariInstallGuide, { simple: seniorSimpleMode }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: onContinue,
          className: "w-full font-bold rounded-2xl shadow-xl",
          style: {
            background: GREEN,
            color: "white",
            height: seniorSimpleMode ? "5.5rem" : "4.5rem",
            fontSize: seniorSimpleMode ? "1.35rem" : "1.25rem"
          },
          children: "Ya lo agregué → Entrar"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Si ya tocaste «Añadir», entra aquí. Las pruebas son opcionales después." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 justify-center text-sm font-semibold text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-5 h-5", style: { color: DEEP } }),
        "Instalación en este teléfono"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: onInstall,
          disabled: installing,
          className: "w-full font-bold rounded-2xl shadow-xl",
          style: {
            background: GREEN,
            color: "white",
            height: seniorSimpleMode ? "5.5rem" : "4.5rem",
            fontSize: seniorSimpleMode ? "1.35rem" : "1.25rem"
          },
          children: installing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 mr-2 animate-spin" }),
            "Un momento…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-7 h-7 mr-2" }),
            isAndroid ? "Descargar mi app" : isIOS ? "Ver los 3 pasos" : "Instalar aplicación"
          ] })
        }
      ),
      seniorSimpleMode && isAndroid && !showAndroidGuide && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-lg text-foreground font-medium", children: "Luego abre el archivo descargado y toca Instalar." }),
      !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-base text-muted-foreground leading-relaxed", children: isAndroid ? "Se descargará el archivo APK. Instálalo y luego confirma abajo." : hasDeferredPrompt ? "Toca el botón y confirma «Instalar» en el mensaje del navegador." : "Si no aparece el mensaje automático, sigue la guía paso a paso debajo." })
    ] }),
    isIOS && !showIosGuide && !seniorSimpleMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        onClick: onInstall,
        className: "w-full h-14 text-base font-bold rounded-2xl",
        children: "Ver guía de instalación en iPhone"
      }
    ),
    showAndroidGuide && !isIOS && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 p-4 space-y-3", style: { borderColor: PETROL }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-2 text-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-5 h-5" }),
        " ",
        seniorSimpleMode ? "Último paso" : "Instalar APK en Android"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-2 list-decimal list-inside text-foreground leading-relaxed text-base", children: seniorSimpleMode ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Abre ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "SeniorSafe.apk" }),
          " cuando termine la descarga."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Si pregunta, permite instalar desde Chrome." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Toca ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Instalar" }),
          " y abre la app desde el ícono."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Cuando termine la descarga, abre el archivo ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "SeniorSafe.apk" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Si el teléfono lo pide, permite ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Instalar apps desconocidas" }),
          " para Chrome."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "Toca ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Instalar" }),
          " y abre Senior Safe desde el ícono nuevo."
        ] })
      ] }) }),
      isAndroid && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: onAndroidApkInstalled,
          className: "w-full h-14 text-lg font-bold rounded-xl",
          style: { background: DEEP, color: "white" },
          children: "Ya instalé la app"
        }
      )
    ] })
  ] });
}
function DesktopInstallPanel({
  installPageUrl,
  qrSrc
}) {
  const steps = [
    "Abre el enlace en el celular del adulto mayor (puedes copiarlo o reenviarlo por WhatsApp).",
    "Se abrirá alarmaseniorsafe.cl con tu cuenta ya activa.",
    "En Android: pulsa «Descargar Senior Safe (Android)» e instala el APK.",
    "En iPhone: sigue los pasos para agregar a la pantalla de inicio.",
    "Abre Senior Safe desde el ícono — el botón rojo ya está listo."
  ];
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(installPageUrl);
      toast.success("Enlace copiado. Ábrelo en el celular.");
    } catch {
      toast.error("Copia el enlace manualmente desde el recuadro de abajo.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "w-4 h-4" }),
      "Continúa en tu celular"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        onClick: copyLink,
        className: "w-full py-6 rounded-2xl text-lg font-bold shadow-lg",
        style: { background: DEEP },
        children: "Copiar enlace de instalación"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: installPageUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "mt-3 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-semibold text-foreground hover:bg-muted/50 transition",
        style: { borderColor: PETROL },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-5 h-5" }),
          "Abrir enlace (si ya estás en el celular)"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-8 space-y-4", children: steps.map((text, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm",
          style: { background: i === steps.length - 1 ? GREEN : DEEP },
          children: i + 1
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium pt-1", children: text })
    ] }, text)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground break-all font-mono", children: installPageUrl }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "mt-6 rounded-2xl border border-border p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer text-sm font-semibold text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-4 h-4" }),
        "Opcional: escanear código QR"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "p-3 rounded-2xl bg-white shadow-inner border-2",
            style: { borderColor: "color-mix(in oklab, var(--brand-petrol) 25%, white)" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: qrSrc,
                alt: "Código QR para instalar Senior Safe en el teléfono",
                width: 220,
                height: 220,
                className: "rounded-xl"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground text-center", children: "Solo si prefieres escanear en lugar de abrir el enlace." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-sm text-center text-foreground font-medium rounded-xl p-3 bg-muted/50", children: "Senior Safe funciona como aplicación instalada en tu celular. El panel web en computador no está disponible por seguridad." })
  ] });
}
export {
  PostPaymentInstallScreen as P
};
