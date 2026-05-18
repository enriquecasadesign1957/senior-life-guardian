import { useEffect, useState } from "react";
import { Download, X, Share, Plus, Phone } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isPreviewOrIframe() {
  if (typeof window === "undefined") return true;
  let inIframe = false;
  try { inIframe = window.self !== window.top; } catch { inIframe = true; }
  const host = window.location.hostname;
  const preview =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.dev");
  return inIframe || preview;
}

/** Registra el service worker solo en producción real (fuera del preview/iframe). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (isPreviewOrIframe()) {
      // Limpia SW previo si quedó instalado en un host de preview
      navigator.serviceWorker.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

/** Banner de instalación PWA (Android/desktop) + instrucciones para iOS. */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPreviewOrIframe()) return;

    const dismissed = localStorage.getItem("seniorsafe_pwa_dismissed");
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) { setInstalled(true); return; }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      if (!dismissed) setShow(true);
    };
    const onInstalled = () => { setInstalled(true); setShow(false); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari no soporta beforeinstallprompt → mostrar instrucciones
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isSafari && !dismissed) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBIP);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }
    if (isIOS) setIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) { setIosHint(true); return; }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem("seniorsafe_pwa_dismissed", "1");
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md">
      <div className="rounded-2xl bg-white border border-border shadow-2xl p-4 flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-petrol-deep)] text-white flex items-center justify-center shrink-0">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">Instalar Senior Safe</p>
          {iosHint || !deferred ? (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Toca <Share className="inline w-3.5 h-3.5 align-text-bottom" /> Compartir y luego
              <Plus className="inline w-3.5 h-3.5 align-text-bottom" /> "Añadir a pantalla de inicio".
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground mt-1">Acceso rápido al botón de emergencia.</p>
              <button
                onClick={handleInstall}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--brand-petrol-deep)] text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Instalar ahora
              </button>
            </>
          )}
        </div>
        <button onClick={dismiss} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/** Botón flotante de emergencia (acceso rápido tipo app). */
export function EmergencyFab() {
  const [confirm, setConfirm] = useState(false);
  const trigger = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([100, 50, 100]);
    window.location.href = "tel:+56971404580";
  };
  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        aria-label="Botón de emergencia"
        className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full bg-red-600 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: "0 10px 30px -5px rgba(220,38,38,0.55), 0 0 0 6px rgba(220,38,38,0.18)" }}
      >
        <Phone className="w-7 h-7" />
      </button>
      {confirm && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">¿Llamar a emergencia?</h3>
            <p className="text-sm text-muted-foreground mt-1">Se llamará al equipo Senior Safe 24/7 al +56 9 7140 4580.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setConfirm(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold text-sm">Cancelar</button>
              <button onClick={trigger} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm">Llamar ahora</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
