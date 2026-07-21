import { useEffect, useState } from "react";
import { APK_DOWNLOAD_URL, buildNativeHandoffUrl } from "@/lib/install-config";
import { SENIOR_SAFE_PLAY_STORE_URL } from "@/lib/app-url";
import { isAppInstalled } from "@/lib/device";
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
      // 1) Android → Google Play (app oficial).
      if (isAndroid) {
        window.location.assign(SENIOR_SAFE_PLAY_STORE_URL);
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
  // instalada (standalone) o como fallback explícito. Nunca como flujo principal.
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
          {/* BOTÓN PRINCIPAL — Google Play (Android) o guía iOS */}
          {!installed && (
            <>
              <Button
                onClick={handleBigInstall}
                disabled={installing}
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg"
                style={{ background: GREEN, color: "white" }}
              >
                <Download className="w-6 h-6 mr-2" />
                {installing
                  ? "Abriendo…"
                  : isAndroid
                    ? "Instalar desde Google Play"
                    : "📥 Instalar app"}
              </Button>
              <p className="text-xs text-muted-foreground text-center px-2">
                {isAndroid
                  ? "Te llevamos a la ficha oficial en Google Play. Luego inicia sesión con el correo de tu plan."
                  : "Sigue los pasos para añadir Senior Safe a tu teléfono."}
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
                <div className="space-y-4">
                  <div className="font-bold text-foreground flex items-center gap-2 text-base">
                    <Smartphone className="w-5 h-5" /> Cómo instalar en Android
                  </div>
                  <ol className="space-y-2 text-foreground">
                    <li className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm">1</span><span>Abre <b>Google Play</b> y busca Senior Safe (o usa el botón de arriba).</span></li>
                    <li className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm">2</span><span>Toca <b>Instalar</b> y espera a que termine.</span></li>
                    <li className="flex gap-3"><span className="w-7 h-7 rounded-full bg-[var(--brand-petrol-deep)] text-white font-bold flex items-center justify-center shrink-0 text-sm">3</span><span>Abre la app e inicia sesión con el correo de tu plan.</span></li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Pasos resumen */}
          <div className="grid gap-2 text-sm">
            {[
              isAndroid ? "Toca 'Instalar desde Google Play'." : "Toca el botón verde de arriba.",
              isAndroid ? "Instala desde Play e inicia sesión con tu correo." : (isIOS ? "Sigue los pasos para añadir a inicio." : "Confirma la instalación."),
              "Abre Senior Safe desde el ícono en tu teléfono.",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: i === 2 ? GREEN : DEEP }}>{i + 1}</span>
                <span className="font-semibold text-foreground">{step}</span>
              </div>
            ))}
          </div>

          {/* Fallback web — solo como último recurso */}
          {!installed && (
            <details className="text-xs text-muted-foreground pt-1">
              <summary className="cursor-pointer hover:text-foreground select-none">¿No puedes instalar ahora? Ver opción temporal</summary>
              <div className="mt-2 rounded-2xl border border-dashed border-border p-3 space-y-2">
                <p>La versión web es temporal. En Android prioriza Google Play.</p>
                <a
                  href={SENIOR_SAFE_PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground font-semibold block"
                >
                  Abrir Google Play
                </a>
                <button
                  type="button"
                  onClick={openInstalledApp}
                  className="underline text-foreground font-semibold"
                >
                  Abrir versión web temporal
                </button>
                <a
                  href={APK_DOWNLOAD_URL}
                  className="underline text-muted-foreground block"
                >
                  Descargar APK (alternativa)
                </a>
              </div>
            </details>
          )}

          {/* Tiendas */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <a
              href={SENIOR_SAFE_PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative rounded-2xl border-2 p-4 text-center hover:shadow-md transition-shadow"
              style={{ borderColor: "color-mix(in oklab, var(--brand-petrol) 35%, transparent)" }}
            >
              <Smartphone className="w-7 h-7 mx-auto mb-2" style={{ color: DEEP }} />
              <div className="font-bold text-foreground text-sm">Google Play</div>
              <div className="text-xs text-muted-foreground mt-1">Disponible ahora</div>
            </a>
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
