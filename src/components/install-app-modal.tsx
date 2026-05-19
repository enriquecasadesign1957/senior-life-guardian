import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, Download, Share, Plus, ExternalLink, ShieldCheck } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";

/** URL de la app móvil (PWA). Se le adjunta el signupId para continuidad. */
const APP_BASE_URL = "https://senior-safe-link.lovable.app";

function buildAppUrl(signupId: string | null) {
  if (!signupId) return APP_BASE_URL;
  const u = new URL(APP_BASE_URL);
  u.searchParams.set("ss", signupId);
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
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const { isIOS, isAndroid, isSafari } = detectPlatform();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
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
  }, []);

  const handleInstallPwa = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const openWeb = () => {
    window.open(buildAppUrl(signupId), "_blank", "noopener,noreferrer");
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
            Elige cómo prefieres instalar la app. No es necesario volver a configurar nada.
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
          {/* PWA install (Android/desktop) */}
          {deferred && !installed && (
            <Button
              onClick={handleInstallPwa}
              className="w-full h-14 text-lg font-bold rounded-2xl"
              style={{ background: DEEP, color: "white" }}
            >
              <Download className="w-5 h-5 mr-2" />
              Instalar app ahora
            </Button>
          )}

          {/* iOS install instructions */}
          {isIOS && isSafari && !installed && (
            <div className="rounded-2xl border-2 border-border p-4 text-sm space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Apple className="w-5 h-5" /> Instalar en iPhone
              </div>
              <p className="text-muted-foreground">
                1. Toca <Share className="inline w-4 h-4 align-text-bottom" /> Compartir en Safari.
              </p>
              <p className="text-muted-foreground">
                2. Selecciona <Plus className="inline w-4 h-4 align-text-bottom" /> "Añadir a pantalla de inicio".
              </p>
            </div>
          )}

          {/* Android fallback if no BIP yet */}
          {isAndroid && !deferred && !installed && (
            <div className="rounded-2xl border-2 border-border p-4 text-sm space-y-1.5">
              <div className="font-bold text-foreground flex items-center gap-2">
                <Smartphone className="w-5 h-5" /> Instalar en Android
              </div>
              <p className="text-muted-foreground">
                Abre el menú ⋮ de Chrome y toca "Instalar app" o "Añadir a pantalla de inicio".
              </p>
            </div>
          )}

          {installed && (
            <div className="rounded-2xl p-4 text-sm font-semibold text-center" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
              ✅ App ya instalada en este dispositivo
            </div>
          )}

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

          {/* Open in web — última opción, sin popup intermedio */}
          <button
            type="button"
            onClick={openWeb}
            className="w-full text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 py-2"
          >
            <ExternalLink className="w-4 h-4" /> Abrir versión web mientras tanto
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
