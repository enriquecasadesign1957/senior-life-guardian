import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, Download, Share, Plus, ShieldCheck, CheckCircle2 } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PROMPT_KEY = "__seniorSafeInstallPrompt";
const PROMPT_BOUND_KEY = "__seniorSafeInstallPromptBound";

function getCapturedInstallPrompt() {
  if (typeof window === "undefined") return null;
  return ((window as any)[PROMPT_KEY] as BIPEvent | null) ?? null;
}

function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") (window as any)[PROMPT_KEY] = null;
}

function ensureInstallPromptCapture() {
  if (typeof window === "undefined" || (window as any)[PROMPT_BOUND_KEY]) return;
  (window as any)[PROMPT_BOUND_KEY] = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    (window as any)[PROMPT_KEY] = event as BIPEvent;
  });
}

ensureInstallPromptCapture();

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";

/**
 * URL ÚNICA Y OFICIAL de la APK Senior Safe.
 * Sirve un 302 hacia el objeto público en Lovable Cloud Storage
 * (bucket `apk`, archivo SeniorSafe.apk). Definida en
 * src/routes/downloads.SeniorSafe[.]apk.ts — la URL nunca cambia
 * aunque cambie el backend de almacenamiento.
 */
const APK_DOWNLOAD_URL = "https://alarmaseniorsafe.cl/downloads/SeniorSafe.apk";

/** Pantalla nativa publicada. Se usa solo como fallback web (no-Android). */
const APP_BASE_URL = "https://alarmaseniorsafe.cl/native";

function buildAppUrl(signupId: string | null) {
  let resolvedSignupId = signupId;
  if (!resolvedSignupId && typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup");
      resolvedSignupId = raw ? JSON.parse(raw)?.id ?? null : null;
    } catch {}
  }
  if (!resolvedSignupId) return APP_BASE_URL;
  const u = new URL(APP_BASE_URL);
  u.searchParams.set("ss", resolvedSignupId);
  u.searchParams.set("source", "onboarding");
  return u.toString();
}

function detectPlatform() {
  if (typeof navigator === "undefined") return { isIOS: false, isAndroid: false, isSafari: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
  return { isIOS, isAndroid, isSafari };
}

interface Props {
  open: boolean;
  onClose: () => void;
  signupId: string | null;
  /** Texto opcional para mostrar continuidad ("Tu red ya está lista"). */
  showContinuityHint?: boolean;
}

/**
 * Modal de instalación: NO abre la app web automáticamente.
 * Muestra opciones reales: instalar PWA, descargar APK (cuando esté), tiendas (próximamente),
 * y como último recurso abrir versión web (con signupId para continuidad).
 */
export function InstallAppModal({ open, onClose, signupId, showContinuityHint }: Props) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(() => getCapturedInstallPrompt());
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { isIOS, isAndroid, isSafari } = detectPlatform();

  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureInstallPromptCapture();
    setDeferred(getCapturedInstallPrompt());
    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [signupId]);

  const openInstalledApp = () => {
    window.location.href = buildAppUrl(signupId);
  };

  const handleBigInstall = async () => {
    setInstalling(true);
    try {
      // 1) Android → SIEMPRE priorizar descarga de APK real (no PWA).
      //    Evita que el usuario crea que "ya instaló" cuando solo abrió la web.
      if (isAndroid) {
        window.open(APK_DOWNLOAD_URL, "_blank", "noopener");
        setShowGuide(true);
        return;
      }
      // 2) Desktop/Chrome con PWA instalable → prompt nativo (útil para QA interno).
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
        } catch {}
      }
      // 3) iOS / otros → guía visual paso a paso.
      setShowGuide(true);
    } finally {
      setInstalling(false);
    }
  };

  // Solo mostramos el acceso a la versión web cuando la PWA ya está realmente
  // instalada (standalone) o como fallback explícito de debug. Nunca como flujo
  // principal del onboarding — el usuario debe instalar la APK.
  const showOpenWebFallback = installed;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: PETROL }}>
            <Download className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">✅ Cuenta creada correctamente</DialogTitle>
          <DialogDescription className="text-base">
            Ahora <b>descarga e instala Senior Safe</b> en este teléfono. Es la aplicación real — no una página web temporal.
          </DialogDescription>
        </DialogHeader>

        {showContinuityHint && (
          <div className="rounded-2xl p-4 text-sm flex items-start gap-3" style={{ background: "color-mix(in oklab, #16a34a 8%, white)", color: "var(--foreground)" }}>
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <div>
              <div className="font-bold">Tu red familiar ya está configurada</div>
              <p className="text-muted-foreground">La app reconocerá automáticamente tu nombre, familiares, PIN y WhatsApp activado. Solo te pedirá permisos del teléfono.</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* BOTÓN PRINCIPAL — descargar APK */}
          {!installed && (
            <>
              <Button
                onClick={handleBigInstall}
                disabled={installing}
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
                style={{ background: GREEN, color: "white" }}
              >
                <Download className="w-6 h-6 mr-2" />
                {installing ? "Preparando descarga…" : "📥 Descargar App"}
              </Button>
              <p className="text-xs text-muted-foreground text-center px-2">
                Importante: no cierres esta ventana hasta terminar la instalación. La versión web no reemplaza la app instalada.
              </p>
            </>
          )}

          {showOpenWebFallback && (
            <>
              <div className="rounded-2xl p-4 text-sm font-semibold text-center flex items-center justify-center gap-2" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
                <CheckCircle2 className="w-5 h-5" /> App instalada
              </div>
              <Button
                onClick={openInstalledApp}
                className="w-full h-14 text-lg font-bold rounded-2xl"
                style={{ background: DEEP, color: "white" }}
              >
                Abrir Senior Safe
              </Button>
            </>
          )}

          {/* Guía visual — aparece tras tocar el botón si no hay instalación automática */}
          {showGuide && !installed && (
            <div className="rounded-2xl border-2 p-4 text-sm space-y-2" style={{ borderColor: DEEP }}>
              {isIOS ? (
                <>
                  <div className="font-bold text-foreground flex items-center gap-2 text-base">
                    <Apple className="w-5 h-5" /> En iPhone (Safari)
                  </div>
                  <p className="text-foreground">1. Toca <Share className="inline w-5 h-5 align-text-bottom" /> <b>Compartir</b> abajo.</p>
                  <p className="text-foreground">2. Elige <Plus className="inline w-5 h-5 align-text-bottom" /> <b>Añadir a pantalla de inicio</b>.</p>
                  <p className="text-foreground">3. Toca <b>Añadir</b> arriba a la derecha.</p>
                </>
              ) : (
                <>
                  <div className="font-bold text-foreground flex items-center gap-2 text-base">
                    <Smartphone className="w-5 h-5" /> En Android (Chrome)
                  </div>
                  <p className="text-foreground">1. Si aparece una ventana, toca <b>Instalar</b>.</p>
                  <p className="text-foreground">2. Si no aparece, abre el menú <b>⋮</b> arriba a la derecha.</p>
                  <p className="text-foreground">3. Toca solo <b>Instalar app</b>.</p>
                  <p className="text-foreground">4. Confirma <b>Instalar</b>.</p>
                  <p className="text-foreground">Si dice <b>Crear acceso directo</b>, no lo uses.</p>
                  <p className="text-muted-foreground text-xs pt-1">Tu cuenta ya está lista — la app abrirá con todo configurado.</p>
                </>
              )}
            </div>
          )}

          {/* Pasos resumen */}
          <div className="grid gap-2 text-sm">
            {[
              "Toca el botón verde de arriba.",
              isAndroid ? "Confirma 'Instalar' si aparece." : (isIOS ? "Sigue los pasos para añadir a inicio." : "Confirma la instalación."),
              "La app abrirá con tu cuenta lista.",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: i === 2 ? GREEN : DEEP }}>{i + 1}</span>
                <span className="font-semibold text-foreground">{step}</span>
              </div>
            ))}
          </div>

          {/* Stores próximamente */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="relative rounded-2xl border-2 border-border p-4 text-center opacity-70">
              <Smartphone className="w-7 h-7 mx-auto mb-2" style={{ color: DEEP }} />
              <div className="font-bold text-foreground text-sm">Google Play</div>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Próximamente</span>
            </div>
            <div className="relative rounded-2xl border-2 border-border p-4 text-center opacity-70">
              <Apple className="w-7 h-7 mx-auto mb-2" />
              <div className="font-bold text-foreground text-sm">App Store</div>
              <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">Próximamente</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
