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
 * Archivo servido estáticamente desde /public/SeniorSafe.apk.
 * Esta APK abre directamente /native (ver capacitor.config.ts).
 * No agregar fallbacks ni rutas alternativas: garantiza que todos
 * los usuarios descarguen siempre la misma versión vigente.
 */
const APK_DOWNLOAD_URL = "https://alarmaseniorsafe.cl/SeniorSafe.apk";

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
    // 1) APK real publicado → descarga directa de Senior Life Guardian
    if (isAndroid) {
      const apkUrl = await findAvailableApk();
      if (apkUrl) {
        window.location.href = apkUrl;
        setInstalling(false);
        return;
      }
    }
    // 2) Sin APK: redirigir SIEMPRE al dominio de la app real (NO instalar el sitio comercial).
    //    Desde ese dominio el usuario instala la PWA real "Senior Life Guardian".
    //    Nunca disparamos deferred.prompt() aquí porque instalaría alarmaseniorsafe.cl/activacion.
    const appUrl = buildAppUrl(signupId);
    window.location.href = appUrl;
    setInstalling(false);
    // 3) Guía visual de respaldo si el navegador bloquea la navegación
    setShowGuide(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: PETROL }}>
            <Download className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Instalar Senior Safe en tu teléfono</DialogTitle>
          <DialogDescription className="text-base">
            Toca el botón verde. Instalará Senior Life Guardian, no un acceso directo de esta pantalla.
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
          {/* BOTÓN PRINCIPAL — siempre visible */}
          {!installed && (
            <Button
              onClick={handleBigInstall}
              disabled={installing}
              className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
              style={{ background: GREEN, color: "white" }}
            >
              <Download className="w-6 h-6 mr-2" />
              {installing ? "Preparando instalación…" : "📲 Instalar Senior Safe"}
            </Button>
          )}

          {installed && (
            <>
              <div className="rounded-2xl p-4 text-sm font-semibold text-center flex items-center justify-center gap-2" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
                <CheckCircle2 className="w-5 h-5" /> App instalada — abriendo Senior Safe…
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
          {showGuide && !deferred && !installed && (
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
