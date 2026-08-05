import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Loader2,
  Monitor,
  Plus,
  QrCode,
  Smartphone,
  Apple,
  Shield,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectPlatform, isMobileDevice, isNativeApp, isPwaStandalone } from "@/lib/device";
import {
  APK_DOWNLOAD_URL,
  buildNativeHandoffUrl,
  markAndroidApkAcknowledged,
} from "@/lib/install-config";
import {
  ensureInstallPromptCapture,
  getCapturedInstallPrompt,
  triggerPwaInstallPrompt,
} from "@/lib/pwa-install";
import { PRODUCTION_SITE_URL } from "@/lib/app-url";
import { toast } from "sonner";
import { trackGoogleAdsSubscriptionConversion } from "@/lib/ga4";
import {
  buildAppHandoffSearch,
  buildMobileInstallPageUrl,
  clearRequiresPwaInstall,
  markRequiresPwaInstall,
  persistSignupHandoff,
} from "@/lib/post-payment";
import { WhatsAppActivarCta } from "@/components/whatsapp-activar-cta";
import { InstallNotifyBanner } from "@/components/install-notify-banner";
import type { PostPaymentInstallNotifyResult } from "@/lib/post-payment-install-notify";

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";

export type PaymentSummary = {
  amount?: number | null;
  /** Webpay Plus — orden única */
  buyOrder?: string | null;
  authorizationCode?: string | null;
  cardLast4?: string | null;
};

type Props = {
  paymentSummary?: PaymentSummary;
  signupId?: string | null;
  /** Si false, no muestra el bloque de pago aprobado (p. ej. acceso directo desde QR). */
  showPaymentSuccess?: boolean;
  /**
   * Disparar conversión Ads/GA4. Solo true tras Webpay/Oneclick confirmado en servidor
   * (con authorizationCode o buyOrder). Nunca por solo ?pago=ok.
   */
  trackConversion?: boolean;
  installNotify?: PostPaymentInstallNotifyResult | null;
};

/** Modo prueba local: fuerza flujo iOS (?simular_ios=true). Deshabilitado en producción. */
function readSimulateIosFromUrl(): boolean {
  if (import.meta.env.PROD) return false;
  if (typeof window === "undefined") return false;
  const v = new URLSearchParams(window.location.search).get("simular_ios");
  return v === "true" || v === "1";
}

function resolveSignupId(explicit?: string | null): string | null {
  if (explicit) return explicit;
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("ss");
    if (fromQuery) return fromQuery;
    const raw =
      sessionStorage.getItem("seniorsafe_user") ||
      localStorage.getItem("seniorsafe_user_backup");
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
}

/** URL codificada en el QR — instalación limpia (sin modo entrenamiento). */
function buildQrTargetUrl(signupId: string | null, paymentSuccess: boolean): string {
  if (import.meta.env.PROD) {
    const u = new URL("/instalar-app", PRODUCTION_SITE_URL);
    if (paymentSuccess) u.searchParams.set("pago", "ok");
    if (signupId) u.searchParams.set("ss", signupId);
    return u.toString();
  }
  return buildMobileInstallPageUrl(signupId, { paymentSuccess });
}

function qrImageUrl(target: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=14&data=${encodeURIComponent(target)}`;
}

/** Icono estilo Safari/iOS: cuadrado con flecha hacia arriba (Compartir). */
function IosShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

/**
 * Pantalla post-pago: obliga a instalar la PWA/WAM antes del panel web.
 * — Móvil / iPhone: guía Safari automática o prompt nativo Android.
 * — Escritorio: QR + pasos; sin acceso al panel web tradicional.
 */
export function PostPaymentInstallScreen({
  paymentSummary,
  signupId: signupIdProp,
  showPaymentSuccess = true,
  trackConversion = false,
  installNotify,
}: Props) {
  const navigate = useNavigate();
  const displaySummary = paymentSummary ?? {};
  const [signupId, setSignupId] = useState<string | null>(() => resolveSignupId(signupIdProp));
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);
  const [simulateIos, setSimulateIos] = useState(false);

  const platform = useMemo(() => detectPlatform(), []);
  const mobile = useMemo(() => isMobileDevice(), []);
  /** En celular: pantalla pensada para el adulto mayor (un paso a la vez). */
  const seniorSimpleMode = mobile;
  const effectiveIsIOS = platform.isIOS || simulateIos;
  const showMobilePanel = mobile || effectiveIsIOS;
  const needsSafariOnIos = effectiveIsIOS && !platform.isSafari && !simulateIos;

  const installPageUrl = useMemo(
    () => buildQrTargetUrl(signupId, showPaymentSuccess),
    [signupId, showPaymentSuccess],
  );

  useEffect(() => {
    setSimulateIos(readSimulateIosFromUrl());
  }, []);

  useEffect(() => {
    markRequiresPwaInstall();
    const id = resolveSignupId(signupIdProp);
    setSignupId(id);
    if (id) persistSignupHandoff(id);
  }, [signupIdProp]);

  useEffect(() => {
    if (!trackConversion || !signupId) return;
    const transactionId =
      displaySummary.buyOrder?.trim() ||
      displaySummary.authorizationCode?.trim() ||
      "";
    if (!transactionId) return;
    trackGoogleAdsSubscriptionConversion({
      value: displaySummary.amount ?? null,
      currency: "CLP",
      transactionId,
      signupId,
    });
  }, [
    trackConversion,
    signupId,
    displaySummary.amount,
    displaySummary.buyOrder,
    displaySummary.authorizationCode,
  ]);

  useEffect(() => {
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

  // Guía Safari automática en iPhone (o simulación) si aún no está instalada.
  useEffect(() => {
    if (effectiveIsIOS && !isPwaStandalone() && !installed) {
      setShowIosGuide(true);
    }
  }, [effectiveIsIOS, installed]);

  const continueToApp = useCallback(() => {
    const id = resolveSignupId(signupId);
    if (!id) {
      toast.error("No encontramos tu cuenta. Escanea el código QR o vuelve a abrir el enlace de instalación.");
      return;
    }
    persistSignupHandoff(id, showPaymentSuccess ? { subscription_status: "active" } : undefined);
    clearRequiresPwaInstall();

    // Android + APK: no abrir el panel web en el navegador (confunde con la app real).
    if (platform.isAndroid && !simulateIos && !isPwaStandalone() && !isNativeApp()) {
      markAndroidApkAcknowledged();
      toast.success("Abre Senior Safe desde el ícono en tu pantalla de inicio.");
      window.location.href = buildNativeHandoffUrl(id, "postpay");
      return;
    }

    // iPhone PWA: entrar directo, sin modo entrenamiento (pruebas opcionales después).
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
      // Android: APK real (misma ruta que InstallAppModal — evita confundir web con app).
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

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: "var(--gradient-soft)" }}
    >
      {import.meta.env.DEV && simulateIos && (
        <div
          className="mx-auto mt-3 max-w-lg w-full px-4 py-2 rounded-xl text-center text-xs font-bold border-2 border-dashed"
          style={{ borderColor: PETROL, color: DEEP, background: "color-mix(in oklab, var(--brand-petrol) 8%, white)" }}
          role="status"
        >
          Modo prueba iOS activo (?simular_ios=true) — la guía Safari se muestra automáticamente.
        </div>
      )}

      <header className="px-6 pt-10 pb-4 text-center max-w-lg mx-auto w-full">
        {showPaymentSuccess && seniorSimpleMode && (
          <>
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white"
              style={{ background: GREEN }}
            >
              <Download className="w-8 h-8" />
            </div>
            <h1 className="mt-5 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {effectiveIsIOS ? "Pon Senior Safe en tu pantalla" : "Instala Senior Safe"}
            </h1>
            <p className="mt-2 text-muted-foreground text-lg leading-relaxed">
              {effectiveIsIOS
                ? needsSafariOnIos
                  ? "Primero ábrelo en Safari (el navegador azul)."
                  : "Solo 3 toques. Sin pruebas ni pasos extras."
                : "Toca el botón verde de abajo. Solo toma un minuto."}
            </p>
          </>
        )}

        {showPaymentSuccess && !seniorSimpleMode && (
          <>
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "color-mix(in oklab, #16a34a 14%, white)" }}
            >
              <CheckCircle2 className="w-9 h-9" style={{ color: GREEN }} />
            </div>
            <h1 className="mt-5 text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              ¡Pago confirmado!
            </h1>
            <p className="mt-2 text-muted-foreground text-base leading-relaxed">
              Tu suscripción Senior Safe está activa. Instala la app en el celular del titular de la
              cuenta (también enviamos el enlace por correo y WhatsApp).
            </p>
            {displaySummary &&
              (displaySummary.amount != null ||
                displaySummary.buyOrder ||
                displaySummary.authorizationCode ||
                displaySummary.cardLast4) && (
              <div className="mt-5 text-left bg-card border border-border rounded-2xl p-4 text-sm space-y-2 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Comprobante Webpay Plus
                </p>
                {displaySummary.amount != null && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Monto pagado</span>
                    <span className="font-semibold">
                      ${displaySummary.amount.toLocaleString("es-CL")} CLP
                    </span>
                  </div>
                )}
                {displaySummary.authorizationCode && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Código de autorización</span>
                    <span className="font-mono text-xs">{displaySummary.authorizationCode}</span>
                  </div>
                )}
                {displaySummary.cardLast4 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Tarjeta</span>
                    <span className="font-mono text-xs">**** {displaySummary.cardLast4}</span>
                  </div>
                )}
                {displaySummary.buyOrder && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Orden de compra</span>
                    <span className="font-mono text-xs break-all text-right">{displaySummary.buyOrder}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!showPaymentSuccess && (
          <>
            <div
              className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white"
              style={{ background: PETROL }}
            >
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Instala Senior Safe</h1>
            <p className="mt-2 text-muted-foreground text-base leading-relaxed">
              {effectiveIsIOS
                ? needsSafariOnIos
                  ? "Abre este enlace en Safari y sigue los 3 toques."
                  : "Solo 3 toques en Safari. Sin pruebas."
                : "Toca el botón verde de abajo para descargar la app."}
            </p>
          </>
        )}
      </header>

      <main
        className={`flex-1 px-6 max-w-lg mx-auto w-full ${
          showIosGuide && effectiveIsIOS && !needsSafariOnIos && !installed
            ? "pb-36"
            : "pb-10"
        }`}
      >
        {showPaymentSuccess && !seniorSimpleMode && (
          <div className="mb-6 space-y-4">
            <InstallNotifyBanner notify={installNotify} />
            <WhatsAppActivarCta />
          </div>
        )}

        {needsSafariOnIos && (
          <IosOpenInSafariBanner installPageUrl={installPageUrl} />
        )}

        {showMobilePanel ? (
          <MobileInstallPanel
            installed={installed}
            installing={installing}
            hasDeferredPrompt={hasDeferredPrompt}
            isIOS={effectiveIsIOS}
            isAndroid={platform.isAndroid && !simulateIos}
            showIosGuide={showIosGuide}
            showAndroidGuide={showAndroidGuide}
            seniorSimpleMode={seniorSimpleMode}
            needsSafariOnIos={needsSafariOnIos}
            onInstall={handleInstallClick}
            onContinue={continueToApp}
            onAndroidApkInstalled={handleAndroidApkInstalled}
          />
        ) : (
          <DesktopInstallPanel installPageUrl={installPageUrl} qrSrc={qrImageUrl(installPageUrl)} />
        )}

        {/* WhatsApp: solo después de instalar, o en Android/desktop — no estorba el flujo iPhone */}
        {showPaymentSuccess && seniorSimpleMode && !effectiveIsIOS && !installed && (
          <div className="mt-6">
            <WhatsAppActivarCta compact />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              WhatsApp se puede vincular después. Primero instala la app.
            </p>
          </div>
        )}
        {showPaymentSuccess && seniorSimpleMode && effectiveIsIOS && installed && (
          <div className="mt-6">
            <WhatsAppActivarCta compact />
          </div>
        )}

        {!seniorSimpleMode && (
          <p className="mt-8 text-center text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {showMobilePanel
              ? effectiveIsIOS
                ? "En iPhone, agrega Senior Safe a la pantalla de inicio desde Safari."
                : platform.isAndroid && !simulateIos
                  ? "En Android descarga e instala el archivo APK. La página web del navegador no reemplaza la app."
                  : "La app instalada es la forma segura de usar el botón de emergencia 24/7."
              : "Por seguridad, el panel web no está disponible en computador. Usa tu celular para instalar la aplicación."}
          </p>
        )}
      </main>

      {/* Solo Safari iPhone + guía activa: apunta al botón Compartir de la barra inferior. */}
      {showIosGuide && effectiveIsIOS && !needsSafariOnIos && !installed && (
        <IosSafariShareHint />
      )}
    </div>
  );
}

/** Flecha fija sobre la barra de Safari — solo mientras dura la guía de instalación. */
function IosSafariShareHint() {
  return (
    <div
      className="pointer-events-none fixed left-1/2 z-50 flex flex-col items-center"
      style={{
        bottom: "max(0.75rem, env(safe-area-inset-bottom, 20px))",
        transform: "translateX(-50%)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Toca Compartir abajo en Safari"
    >
      <div
        className="rounded-2xl px-4 py-2.5 shadow-lg border-2 text-center"
        style={{
          background: "rgba(255,255,255,0.96)",
          borderColor: PETROL,
          backdropFilter: "blur(8px)",
        }}
      >
        <p className="text-sm font-bold text-foreground leading-tight">Toca aquí abajo</p>
        <p className="text-xs text-muted-foreground mt-0.5">Compartir → Añadir a inicio</p>
      </div>
      <div
        className="mt-2 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
        style={{ background: DEEP, animation: "ss-share-bounce 1.2s ease-in-out infinite" }}
      >
        <ArrowDown className="h-7 w-7" strokeWidth={2.5} aria-hidden />
      </div>
    </div>
  );
}

function IosOpenInSafariBanner({ installPageUrl }: { installPageUrl: string }) {
  const copyForSafari = async () => {
    try {
      await navigator.clipboard.writeText(installPageUrl);
      toast.success("Enlace copiado. Ábrelo en Safari (ícono azul).");
    } catch {
      toast.error("Copia el enlace manualmente y ábrelo en Safari.");
    }
  };

  return (
    <div
      className="mb-2 rounded-3xl border-4 p-6 md:p-8 text-center shadow-lg"
      style={{
        borderColor: "#f59e0b",
        background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
      }}
      role="alert"
    >
      <div
        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
        style={{ background: "#0A84FF" }}
        aria-hidden
      >
        S
      </div>
      <h2 className="mt-4 text-2xl font-extrabold text-foreground leading-tight">
        Abre esto en Safari
      </h2>
      <p className="mt-3 text-lg text-foreground/90 leading-relaxed">
        En iPhone solo funciona desde Safari (el navegador azul). No uses Chrome ni WhatsApp interno.
      </p>
      <ol className="mt-5 text-left space-y-3 text-base font-medium text-foreground">
        <li className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">1</span>
          <span className="pt-1">Copia el enlace con el botón de abajo.</span>
        </li>
        <li className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">2</span>
          <span className="pt-1">Abre Safari y pégalo en la barra de arriba.</span>
        </li>
        <li className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">3</span>
          <span className="pt-1">Sigue los 3 toques para ponerlo en tu pantalla.</span>
        </li>
      </ol>
      <Button
        type="button"
        onClick={copyForSafari}
        className="mt-6 w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
        style={{ background: DEEP, color: "white" }}
      >
        Copiar enlace para Safari
      </Button>
      <p className="mt-3 text-xs text-muted-foreground break-all font-mono">{installPageUrl}</p>
    </div>
  );
}

function IosSafariInstallGuide({ simple = false }: { simple?: boolean }) {
  const steps = simple
    ? [
        {
          n: 1,
          title: "Toca Compartir",
          body: (
            <>
              Abajo en el centro de Safari:{" "}
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 bg-white align-middle mx-1"
                style={{ borderColor: PETROL, color: DEEP }}
              >
                <IosShareIcon className="w-6 h-6" />
              </span>
            </>
          ),
        },
        {
          n: 2,
          title: "Añadir a pantalla de inicio",
          body: "Desliza el menú y elige esa opción.",
        },
        {
          n: 3,
          title: 'Toca "Añadir"',
          body: "Arriba a la derecha. Luego abre el ícono nuevo.",
        },
      ]
    : [
        {
          n: 1,
          title: "Toca Compartir",
          body: (
            <>
              En la barra inferior de Safari, toca el botón{" "}
              <span className="inline-flex items-center gap-1 font-bold text-foreground">
                <span
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border-2 bg-white shadow-sm"
                  style={{ borderColor: PETROL, color: DEEP }}
                >
                  <IosShareIcon className="w-5 h-5" />
                </span>
                Compartir
              </span>{" "}
              (cuadrado con flecha hacia arriba).
            </>
          ),
        },
        {
          n: 2,
          title: "Añadir a pantalla de inicio",
          body: (
            <>
              Desliza hacia abajo el menú y elige{" "}
              <span className="inline-flex items-center gap-1 font-bold text-foreground">
                <Plus className="w-4 h-4" style={{ color: DEEP }} />
                Añadir a pantalla de inicio
              </span>
              . En inglés aparece como <b>Add to Home Screen</b>.
            </>
          ),
        },
        {
          n: 3,
          title: 'Pulsa "Añadir"',
          body: (
            <>
              En la esquina superior derecha, toca el botón azul{" "}
              <b>Añadir</b>. Luego abre Senior Safe desde el ícono nuevo en tu pantalla de inicio.
            </>
          ),
        },
      ];

  return (
    <div
      className={simple ? "rounded-3xl border-4 p-5 md:p-6 space-y-5 shadow-lg" : "rounded-3xl border-4 p-5 md:p-6 space-y-4 shadow-lg"}
      style={{
        borderColor: PETROL,
        background: "linear-gradient(180deg, #ffffff 0%, color-mix(in oklab, var(--brand-petrol) 6%, white) 100%)",
      }}
      role="region"
      aria-label="Guía de instalación en iPhone Safari"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
          style={{ background: DEEP }}
        >
          <Apple className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-foreground leading-tight">
            {simple ? "Solo 3 toques" : "Instalar en iPhone"}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Safari · sin pruebas</p>
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((step) => (
          <li
            key={step.n}
            className={`flex gap-4 rounded-2xl bg-white/90 border border-border shadow-sm ${simple ? "p-5" : "p-4"}`}
          >
            <span
              className={`rounded-full flex items-center justify-center text-white font-extrabold shrink-0 ${simple ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg"}`}
              style={{ background: step.n === 3 ? GREEN : DEEP }}
            >
              {step.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-foreground mb-1 ${simple ? "text-xl" : "text-base"}`}>
                {step.title}
              </p>
              <p className={`text-foreground/90 leading-relaxed ${simple ? "text-lg" : "text-base"}`}>
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p
        className="text-center font-semibold rounded-xl py-3 px-4"
        style={{ background: "color-mix(in oklab, #16a34a 10%, white)", color: "#166534", fontSize: simple ? "1rem" : "0.875rem" }}
      >
        <ArrowUp className="inline w-4 h-4 mr-1 align-text-bottom" />
        El botón Compartir está abajo en el centro
      </p>
    </div>
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
  onAndroidApkInstalled,
}: {
  installed: boolean;
  installing: boolean;
  hasDeferredPrompt: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  showIosGuide: boolean;
  showAndroidGuide: boolean;
  seniorSimpleMode: boolean;
  needsSafariOnIos: boolean;
  onInstall: () => void;
  onContinue: () => void;
  onAndroidApkInstalled: () => void;
}) {
  if (installed) {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 shadow-lg text-center space-y-5">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white"
          style={{ background: GREEN }}
        >
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">¡Listo!</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Abre Senior Safe desde el ícono en tu pantalla de inicio.
        </p>
        <Button
          onClick={onContinue}
          className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
          style={{ background: GREEN, color: "white" }}
        >
          Abrir Senior Safe
        </Button>
      </div>
    );
  }

  if (needsSafariOnIos) {
    return null;
  }

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
      {isIOS && showIosGuide ? (
        <>
          <IosSafariInstallGuide simple={seniorSimpleMode} />
          <Button
            onClick={onContinue}
            className="w-full font-bold rounded-2xl shadow-xl"
            style={{
              background: GREEN,
              color: "white",
              height: seniorSimpleMode ? "5.5rem" : "4.5rem",
              fontSize: seniorSimpleMode ? "1.35rem" : "1.25rem",
            }}
          >
            Ya lo agregué → Entrar
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Si ya tocaste «Añadir», entra aquí. Las pruebas son opcionales después.
          </p>
        </>
      ) : (
        <>
          {!seniorSimpleMode && (
            <div className="flex items-center gap-3 justify-center text-sm font-semibold text-muted-foreground">
              <Smartphone className="w-5 h-5" style={{ color: DEEP }} />
              Instalación en este teléfono
            </div>
          )}

          <Button
            onClick={onInstall}
            disabled={installing}
            className="w-full font-bold rounded-2xl shadow-xl"
            style={{
              background: GREEN,
              color: "white",
              height: seniorSimpleMode ? "5.5rem" : "4.5rem",
              fontSize: seniorSimpleMode ? "1.35rem" : "1.25rem",
            }}
          >
            {installing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Un momento…
              </>
            ) : (
              <>
                <Download className="w-7 h-7 mr-2" />
                {isAndroid
                  ? "Descargar mi app"
                  : isIOS
                    ? "Ver los 3 pasos"
                    : "Instalar aplicación"}
              </>
            )}
          </Button>

          {seniorSimpleMode && isAndroid && !showAndroidGuide && (
            <p className="text-center text-lg text-foreground font-medium">
              Luego abre el archivo descargado y toca Instalar.
            </p>
          )}

          {!seniorSimpleMode && (
            <p className="text-center text-base text-muted-foreground leading-relaxed">
              {isAndroid
                ? "Se descargará el archivo APK. Instálalo y luego confirma abajo."
                : hasDeferredPrompt
                  ? "Toca el botón y confirma «Instalar» en el mensaje del navegador."
                  : "Si no aparece el mensaje automático, sigue la guía paso a paso debajo."}
            </p>
          )}
        </>
      )}

      {isIOS && !showIosGuide && !seniorSimpleMode && (
        <Button
          variant="outline"
          onClick={onInstall}
          className="w-full h-14 text-base font-bold rounded-2xl"
        >
          Ver guía de instalación en iPhone
        </Button>
      )}

      {showAndroidGuide && !isIOS && (
        <div className="rounded-2xl border-2 p-4 space-y-3" style={{ borderColor: PETROL }}>
          <div className="font-bold flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5" /> {seniorSimpleMode ? "Último paso" : "Instalar APK en Android"}
          </div>
          <ol className="space-y-2 list-decimal list-inside text-foreground leading-relaxed text-base">
            {seniorSimpleMode ? (
              <>
                <li>Abre <b>SeniorSafe.apk</b> cuando termine la descarga.</li>
                <li>Si pregunta, permite instalar desde Chrome.</li>
                <li>Toca <b>Instalar</b> y abre la app desde el ícono.</li>
              </>
            ) : (
              <>
                <li>Cuando termine la descarga, abre el archivo <b>SeniorSafe.apk</b>.</li>
                <li>Si el teléfono lo pide, permite <b>Instalar apps desconocidas</b> para Chrome.</li>
                <li>Toca <b>Instalar</b> y abre Senior Safe desde el ícono nuevo.</li>
              </>
            )}
          </ol>
          {isAndroid && (
            <Button
              onClick={onAndroidApkInstalled}
              className="w-full h-14 text-lg font-bold rounded-xl"
              style={{ background: DEEP, color: "white" }}
            >
              Ya instalé la app
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DesktopInstallPanel({
  installPageUrl,
  qrSrc,
}: {
  installPageUrl: string;
  qrSrc: string;
}) {
  const steps = [
    "Abre el enlace en el celular del adulto mayor (puedes copiarlo o reenviarlo por WhatsApp).",
    "Se abrirá alarmaseniorsafe.cl con tu cuenta ya activa.",
    "En Android: pulsa «Descargar Senior Safe (Android)» e instala el APK.",
    "En iPhone: sigue los pasos para agregar a la pantalla de inicio.",
    "Abre Senior Safe desde el ícono — el botón rojo ya está listo.",
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(installPageUrl);
      toast.success("Enlace copiado. Ábrelo en el celular.");
    } catch {
      toast.error("Copia el enlace manualmente desde el recuadro de abajo.");
    }
  };

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
        <Monitor className="w-4 h-4" />
        Continúa en tu celular
      </div>

      <Button
        type="button"
        onClick={copyLink}
        className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg"
        style={{ background: DEEP }}
      >
        Copiar enlace de instalación
      </Button>

      <a
        href={installPageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-semibold text-foreground hover:bg-muted/50 transition"
        style={{ borderColor: PETROL }}
      >
        <Smartphone className="w-5 h-5" />
        Abrir enlace (si ya estás en el celular)
      </a>

      <ol className="mt-8 space-y-4">
        {steps.map((text, i) => (
          <li key={text} className="flex gap-3">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm"
              style={{ background: i === steps.length - 1 ? GREEN : DEEP }}
            >
              {i + 1}
            </span>
            <span className="text-foreground font-medium pt-1">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl bg-muted/60 p-4 text-xs text-muted-foreground break-all font-mono">
        {installPageUrl}
      </div>

      <details className="mt-6 rounded-2xl border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          Opcional: escanear código QR
        </summary>
        <div className="mt-4 flex flex-col items-center">
          <div
            className="p-3 rounded-2xl bg-white shadow-inner border-2"
            style={{ borderColor: "color-mix(in oklab, var(--brand-petrol) 25%, white)" }}
          >
            <img
              src={qrSrc}
              alt="Código QR para instalar Senior Safe en el teléfono"
              width={220}
              height={220}
              className="rounded-xl"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Solo si prefieres escanear en lugar de abrir el enlace.
          </p>
        </div>
      </details>

      <p className="mt-5 text-sm text-center text-foreground font-medium rounded-xl p-3 bg-muted/50">
        Senior Safe funciona como aplicación instalada en tu celular. El panel web en computador no está disponible por seguridad.
      </p>
    </div>
  );
}
