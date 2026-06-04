import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Loader2,
  Monitor,
  Plus,
  QrCode,
  Share,
  Smartphone,
  Apple,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectPlatform, isMobileDevice, isPwaStandalone } from "@/lib/device";
import {
  ensureInstallPromptCapture,
  getCapturedInstallPrompt,
  triggerPwaInstallPrompt,
} from "@/lib/pwa-install";
import {
  APP_ENTRENAMIENTO_SEARCH,
  buildMobileInstallPageUrl,
  clearRequiresPwaInstall,
  markRequiresPwaInstall,
} from "@/lib/post-payment";

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";

export type PaymentSummary = {
  amount?: number | null;
  buyOrder?: string | null;
  authorizationCode?: string | null;
  cardLast4?: string | null;
};

type Props = {
  paymentSummary?: PaymentSummary;
  signupId?: string | null;
  /** Si false, no muestra el bloque de pago aprobado (p. ej. acceso directo desde QR). */
  showPaymentSuccess?: boolean;
};

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

function qrImageUrl(target: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=14&data=${encodeURIComponent(target)}`;
}

/**
 * Pantalla post-pago: obliga a instalar la PWA/WAM antes del panel web.
 * — Móvil: botón central que dispara el prompt nativo (o guía iOS).
 * — Escritorio: QR + pasos; sin acceso al panel web tradicional.
 */
export function PostPaymentInstallScreen({
  paymentSummary,
  signupId: signupIdProp,
  showPaymentSuccess = true,
}: Props) {
  const navigate = useNavigate();
  const [signupId, setSignupId] = useState<string | null>(() => resolveSignupId(signupIdProp));
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [hasDeferredPrompt, setHasDeferredPrompt] = useState(false);
  const mobile = useMemo(() => isMobileDevice(), []);
  const { isIOS, isAndroid } = detectPlatform();

  const installPageUrl = useMemo(
    () => buildMobileInstallPageUrl(signupId),
    [signupId],
  );

  useEffect(() => {
    markRequiresPwaInstall();
    setSignupId(resolveSignupId(signupIdProp));
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

  const continueToApp = useCallback(() => {
    clearRequiresPwaInstall();
    navigate({ to: "/app", search: APP_ENTRENAMIENTO_SEARCH });
  }, [navigate]);

  const handleInstallClick = async () => {
    setInstalling(true);
    setShowIosGuide(false);
    setShowAndroidGuide(false);
    try {
      if (isIOS) {
        setShowIosGuide(true);
        return;
      }
      const outcome = await triggerPwaInstallPrompt();
      if (outcome === "accepted") {
        setInstalled(true);
        return;
      }
      if (outcome === "dismissed" || outcome === "unavailable") {
        if (isAndroid) setShowAndroidGuide(true);
        else setShowAndroidGuide(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: "var(--gradient-soft)" }}
    >
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
              ¡Pago aprobado!
            </h1>
            <p className="mt-2 text-muted-foreground text-base">
              Un último paso: instala Senior Safe en tu teléfono para usar la protección real.
            </p>
            {paymentSummary && (paymentSummary.amount != null || paymentSummary.buyOrder) && (
              <div className="mt-5 text-left bg-card border border-border rounded-2xl p-4 text-sm space-y-1.5 shadow-sm">
                {paymentSummary.amount != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto</span>
                    <span className="font-semibold">
                      ${paymentSummary.amount.toLocaleString("es-CL")}
                    </span>
                  </div>
                )}
                {paymentSummary.buyOrder && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orden</span>
                    <span className="font-mono text-xs">{paymentSummary.buyOrder}</span>
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
            <p className="mt-2 text-muted-foreground">
              Escaneaste el código desde tu computador. Continúa en este teléfono.
            </p>
          </>
        )}
      </header>

      <main className="flex-1 px-6 pb-10 max-w-lg mx-auto w-full">
        {mobile ? (
          <MobileInstallPanel
            installed={installed}
            installing={installing}
            hasDeferredPrompt={hasDeferredPrompt}
            isIOS={isIOS}
            isAndroid={isAndroid}
            showIosGuide={showIosGuide}
            showAndroidGuide={showAndroidGuide}
            onInstall={handleInstallClick}
            onContinue={continueToApp}
          />
        ) : (
          <DesktopInstallPanel installPageUrl={installPageUrl} qrSrc={qrImageUrl(installPageUrl)} />
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {mobile
            ? "El panel web en el navegador es solo temporal. La app instalada es la forma segura de usar el botón de emergencia."
            : "Por seguridad, el panel web no está disponible en computador. Usa tu celular para instalar la aplicación."}
        </p>
      </main>
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
        <p className="text-muted-foreground text-sm">
          Abre Senior Safe desde el ícono en tu pantalla de inicio y completa el entrenamiento del botón de pánico.
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
            Instalar aplicación
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isIOS
          ? "En iPhone verás los pasos para añadir Senior Safe a tu pantalla de inicio."
          : hasDeferredPrompt
            ? "Toca el botón y confirma «Instalar» en el mensaje del navegador."
            : "Si no aparece el mensaje automático, sigue la guía paso a paso debajo."}
      </p>

      {showIosGuide && (
        <div className="rounded-2xl border-2 p-4 text-sm space-y-2" style={{ borderColor: PETROL }}>
          <div className="font-bold flex items-center gap-2">
            <Apple className="w-5 h-5" /> iPhone (Safari)
          </div>
          <p>
            1. Toca <Share className="inline w-4 h-4 align-text-bottom" /> <b>Compartir</b> abajo.
          </p>
          <p>
            2. Elige <Plus className="inline w-4 h-4 align-text-bottom" /> <b>Añadir a pantalla de inicio</b>.
          </p>
          <p>3. Toca <b>Añadir</b> y abre Senior Safe desde el ícono nuevo.</p>
        </div>
      )}

      {showAndroidGuide && !isIOS && (
        <div className="rounded-2xl border-2 p-4 text-sm space-y-2" style={{ borderColor: PETROL }}>
          <div className="font-bold flex items-center gap-2">
            <Smartphone className="w-5 h-5" /> Android (Chrome)
          </div>
          <ol className="space-y-2 list-decimal list-inside text-foreground">
            <li>Toca el menú <b>⋮</b> del navegador.</li>
            <li>Elige <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</li>
            <li>Confirma <b>Instalar</b> y abre la app desde el ícono.</li>
          </ol>
          {isAndroid && (
            <p className="text-xs text-muted-foreground pt-1">
              Si pagaste desde el computador, este enlace ya trae tu cuenta lista.
            </p>
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
    "Abre la cámara o app de escaneo QR en tu celular.",
    "Apunta al código de abajo hasta que aparezca el enlace.",
    "Toca el enlace y pulsa «Instalar aplicación» en tu teléfono.",
    "Abre Senior Safe desde el ícono en la pantalla de inicio.",
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

      <p className="mt-5 text-sm text-center text-amber-800 font-medium rounded-xl p-3" style={{ background: "color-mix(in oklab, #f59e0b 12%, white)" }}>
        El acceso al panel web desde este computador no está disponible. Debes completar la instalación en tu teléfono.
      </p>
    </div>
  );
}
