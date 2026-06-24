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

/** URL codificada en el QR — en producción siempre alarmaseniorsafe.cl/instalar-app */
function buildQrTargetUrl(signupId: string | null, paymentSuccess: boolean): string {
  if (import.meta.env.PROD) {
    const u = new URL("/instalar-app", PRODUCTION_SITE_URL);
    u.searchParams.set("entrenamiento", "1");
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
  const effectiveIsIOS = platform.isIOS || simulateIos;
  const showMobilePanel = mobile || effectiveIsIOS;

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

    navigate({ to: "/app", search: buildAppHandoffSearch(id) });
  }, [navigate, signupId, showPaymentSuccess, platform.isAndroid, simulateIos]);

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
        {showPaymentSuccess && (
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
                ? "Sigue los 3 pasos de abajo para guardar la app en tu iPhone."
                : "Escaneaste el código desde tu computador. Continúa en este teléfono."}
            </p>
          </>
        )}
      </header>

      <main className="flex-1 px-6 pb-10 max-w-lg mx-auto w-full">
        {showPaymentSuccess && (
          <div className="mb-6 space-y-4">
            <InstallNotifyBanner notify={installNotify} />
            <WhatsAppActivarCta />
          </div>
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
            onInstall={handleInstallClick}
            onContinue={continueToApp}
            onAndroidApkInstalled={handleAndroidApkInstalled}
          />
        ) : (
          <DesktopInstallPanel installPageUrl={installPageUrl} qrSrc={qrImageUrl(installPageUrl)} />
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {showMobilePanel
            ? effectiveIsIOS
              ? "En iPhone, agrega Senior Safe a la pantalla de inicio desde Safari."
              : platform.isAndroid && !simulateIos
                ? "En Android descarga e instala el archivo APK. La página web del navegador no reemplaza la app."
                : "La app instalada es la forma segura de usar el botón de emergencia 24/7."
            : "Por seguridad, el panel web no está disponible en computador. Usa tu celular para instalar la aplicación."}
        </p>
      </main>
    </div>
  );
}

function IosSafariInstallGuide() {
  const steps = [
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
      className="rounded-3xl border-4 p-5 md:p-6 space-y-4 shadow-lg"
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
          <h2 className="text-xl font-extrabold text-foreground leading-tight">Instalar en iPhone</h2>
          <p className="text-sm text-muted-foreground font-medium">Safari · 3 pasos sencillos</p>
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((step) => (
          <li
            key={step.n}
            className="flex gap-4 rounded-2xl bg-white/90 border border-border p-4 shadow-sm"
          >
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-lg shrink-0"
              style={{ background: step.n === 3 ? GREEN : DEEP }}
            >
              {step.n}
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground mb-1">{step.title}</p>
              <p className="text-base text-foreground/90 leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-sm text-center font-semibold rounded-xl py-3 px-4" style={{ background: "color-mix(in oklab, #16a34a 10%, white)", color: "#166534" }}>
        <ArrowUp className="inline w-4 h-4 mr-1 align-text-bottom" />
        El botón Compartir está abajo en el centro de Safari
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
        <h2 className="text-xl font-bold text-foreground">App instalada</h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          {isAndroid
            ? "Abre Senior Safe desde el ícono en tu pantalla de inicio y completa la configuración inicial."
            : "Abre Senior Safe desde el ícono en tu pantalla de inicio y completa la configuración inicial."}
        </p>
        <Button
          onClick={onContinue}
          className="w-full h-16 text-lg font-bold rounded-2xl shadow-lg"
          style={{ background: GREEN, color: "white" }}
        >
          Abrir Senior Safe
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-5">
      {isIOS && showIosGuide ? (
        <IosSafariInstallGuide />
      ) : (
        <>
          <div className="flex items-center gap-3 justify-center text-sm font-semibold text-muted-foreground">
            <Smartphone className="w-5 h-5" style={{ color: DEEP }} />
            Instalación en este teléfono
          </div>

          <Button
            onClick={onInstall}
            disabled={installing}
            className="w-full h-[4.5rem] text-xl font-bold rounded-2xl shadow-xl"
            style={{ background: GREEN, color: "white" }}
          >
            {installing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Preparando instalación…
              </>
            ) : (
              <>
                <Download className="w-6 h-6 mr-2" />
                {isAndroid ? "Descargar Senior Safe (Android)" : "Instalar aplicación"}
              </>
            )}
          </Button>

          <p className="text-center text-base text-muted-foreground leading-relaxed">
            {isAndroid
              ? "Se descargará el archivo APK. Instálalo y luego confirma abajo."
              : hasDeferredPrompt
                ? "Toca el botón y confirma «Instalar» en el mensaje del navegador."
                : "Si no aparece el mensaje automático, sigue la guía paso a paso debajo."}
          </p>
        </>
      )}

      {isIOS && !showIosGuide && (
        <Button
          variant="outline"
          onClick={onInstall}
          className="w-full h-14 text-base font-bold rounded-2xl"
        >
          Ver guía de instalación en iPhone
        </Button>
      )}

      {showAndroidGuide && !isIOS && (
        <div className="rounded-2xl border-2 p-4 text-base space-y-3" style={{ borderColor: PETROL }}>
          <div className="font-bold flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Instalar APK en Android
          </div>
          <ol className="space-y-2 list-decimal list-inside text-foreground leading-relaxed">
            <li>Cuando termine la descarga, abre el archivo <b>SeniorSafe.apk</b>.</li>
            <li>Si el teléfono lo pide, permite <b>Instalar apps desconocidas</b> para Chrome.</li>
            <li>Toca <b>Instalar</b> y abre Senior Safe desde el ícono nuevo.</li>
          </ol>
          {isAndroid && (
            <>
              <p className="text-sm text-muted-foreground pt-1">
                No uses «Añadir a pantalla de inicio» del navegador — eso no es la app completa.
              </p>
              <Button
                onClick={onAndroidApkInstalled}
                variant="outline"
                className="w-full h-12 font-bold rounded-xl"
              >
                Ya instalé la app
              </Button>
            </>
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
    "Abre la cámara de tu celular y escanea el código QR.",
    "Se abrirá alarmaseniorsafe.cl con tu cuenta ya activa.",
    "En Android: pulsa «Descargar Senior Safe (Android)» e instala el APK.",
    "En iPhone: sigue los pasos para agregar a la pantalla de inicio.",
    "Abre Senior Safe desde el ícono e instala la configuración inicial.",
  ];

  return (
    <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
        <Monitor className="w-4 h-4" />
        Continúa en tu celular
      </div>

      <div className="flex flex-col items-center">
        <div
          className="p-4 rounded-3xl bg-white shadow-inner border-2"
          style={{ borderColor: "color-mix(in oklab, var(--brand-petrol) 25%, white)" }}
        >
          <img
            src={qrSrc}
            alt="Código QR para instalar Senior Safe en el teléfono"
            width={280}
            height={280}
            className="rounded-xl"
          />
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <QrCode className="w-4 h-4" />
          Escanea con tu teléfono
        </div>
      </div>

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

      <p className="mt-5 text-sm text-center text-foreground font-medium rounded-xl p-3 bg-muted/50">
        Senior Safe funciona como aplicación instalada en tu celular. El panel web en computador no está disponible por seguridad.
      </p>
    </div>
  );
}
