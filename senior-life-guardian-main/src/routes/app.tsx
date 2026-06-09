import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import {
  Shield, MapPin, Users, Battery, Wifi, Bell, CheckCircle2,
  X, Home, Settings, Heart, MessageCircle, Navigation, Clock,
  Plus, Pencil, Trash2, KeyRound, Loader2, GraduationCap, Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getAppConfiguration, listFamily, addFamily, updateFamily, deleteFamily, verifyPin, setUserPin,
} from "@/lib/family.functions";
import { sendEmergencyAlert } from "@/lib/emergency-alert.functions";
import {
  isTrainingDone,
  markTrainingDone,
  persistSignupHandoff,
  readStoredSignupId,
  requiresPwaInstall,
} from "@/lib/post-payment";
import { PostPaymentInstallScreen } from "@/components/post-payment-install-screen";
import { WhatsAppActivationButton } from "@/components/whatsapp-activation-button";
import { InstallAppModal } from "@/components/install-app-modal";
import { Download } from "lucide-react";
import { loginAccountByEmail, loginErrorMessage } from "@/lib/account-login";
import {
  addFamilyWithFallback,
  deleteFamilyWithFallback,
  familyErrorMessage,
  listFamilyWithFallback,
  updateFamilyWithFallback,
} from "@/lib/family-actions";
import { savePinErrorMessage, saveUserPinWithFallback, verifyPinWithFallback } from "@/lib/pin-actions";
import { FallDetectionOverlay, useFallDetection } from "@/hooks/useFallDetection";

const appSearchSchema = z.object({
  entrenamiento: z.enum(["1"]).optional(),
  ss: z.string().uuid().optional(),
});

export const Route = createFileRoute("/app")({
  validateSearch: (raw) => {
    const parsed = appSearchSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    return {
      entrenamiento: raw.entrenamiento === "1" ? ("1" as const) : undefined,
      ss: undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Senior Safe — Mi protección" },
      { name: "description", content: "Pide ayuda en un solo toque. Tu red familiar te protege 24/7." },
    ],
  }),
  component: AppHome,
});

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";
const RED = "#dc2626";

type Stage = "idle" | "confirm" | "sending" | "sent";
type Contact = { id: string; nombre: string; parentesco: string; telefono: string };
type TrialUser = {
  id: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  plan?: string | null;
  periodo?: string | null;
  trial_active?: boolean | null;
  trial_end?: string | null;
  purchase_mode?: string | null;
  subscription_status?: string | null;
  payment_status?: string | null;
};

const PALETTE = ["#0ea5e9", "#a855f7", "#f59e0b", "#16a34a", "#dc2626"];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];
const initialOf = (n: string) => (n.trim()[0] ?? "?").toUpperCase();

async function hashPin(pin: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function AppHome() {
  const routeSearch = Route.useSearch();
  const [stage, setStage] = useState<Stage>("idle");
  const [countdown, setCountdown] = useState(5);
  const [deliveredTo, setDeliveredTo] = useState<number>(0);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [configReady, setConfigReady] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);
  const [gpsAllowed, setGpsAllowed] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const [batteryChecked, setBatteryChecked] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [pinGateOpen, setPinGateOpen] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [trainingPending, setTrainingPending] = useState(false);
  const [trainingDone, setTrainingDone] = useState(false);
  const isTrainingRunRef = useRef(false);
  const [trainingRunActive, setTrainingRunActive] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTrainingPending(routeSearch.entrenamiento === "1");
    setTrainingDone(isTrainingDone());
    setClientReady(true);
  }, [routeSearch.entrenamiento]);

  const mustInstallBeforeWebPanel =
    clientReady && !isInstalled && (trainingPending || requiresPwaInstall());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () =>
      setIsInstalled(
        window.matchMedia?.("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true,
      );
    check();
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const list = useServerFn(listFamily);
  const loadConfig = useServerFn(getAppConfiguration);

  // Hidrata cuenta desde ?ss=, sessionStorage o email guardado (handoff post-pago / QR).
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingContacts(true);
      try {
        const signupIdFromUrl = routeSearch.ss;
        let stored: Partial<TrialUser> | null = null;
        const raw = sessionStorage.getItem("seniorsafe_user") || localStorage.getItem("seniorsafe_user_backup");
        if (raw) stored = JSON.parse(raw);

        if (signupIdFromUrl) {
          persistSignupHandoff(signupIdFromUrl);
          setUserId(signupIdFromUrl);
        }

        const lookup = {
          signupId: signupIdFromUrl || stored?.id || undefined,
          email: stored?.email || undefined,
          telefono: stored?.telefono || undefined,
        };
        if (!lookup.signupId && !lookup.email && !lookup.telefono) return;

        const res = await loadConfig({ data: lookup });
        if (!alive) return;

        if (res.configured && res.user) {
          const user = res.user as TrialUser;
          setUserId(user.id);
          setUserName(String(user.nombre ?? "").split(" ")[0]);
          setContacts(res.contacts as Contact[]);
          setPinConfigured(Boolean(res.pinConfigured));
          setAccountConfigured(true);
          try { sessionStorage.setItem("seniorsafe_user", JSON.stringify(user)); } catch {}
          try { localStorage.setItem("seniorsafe_user_backup", JSON.stringify(user)); } catch {}
          try { localStorage.setItem("seniorsafe_account_configured", "1"); } catch {}
          try {
            const hasContacts = Array.isArray(res.contacts) && res.contacts.length > 0;
            localStorage.setItem("seniorsafe_progress", JSON.stringify({ pin: res.pinConfigured, contactos: hasContacts, gps: false, emergencia: false, app: true }));
          } catch {}
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
        if (alive) { setLoadingContacts(false); setConfigReady(true); }
      }
    })();
    return () => { alive = false; };
  }, [loadConfig, routeSearch.ss]);

  // Load contacts when userId is ready
  useEffect(() => {
    if (!configReady || !userId || contacts.length > 0) return;
    let alive = true;
    (async () => {
      setLoadingContacts(true);
      try {
        const res = await listFamilyWithFallback(list, userId);
        if (alive) setContacts(res.contacts as Contact[]);
      } catch (e) {
        console.error(e);
        if (alive) toast.error("No pudimos cargar tu red familiar.");
      } finally {
        if (alive) setLoadingContacts(false);
      }
    })();
    return () => { alive = false; };
  }, [configReady, userId, contacts.length, list]);

  const familyCount = contacts.length;

  // Countdown for auto-confirm (NO PIN — accesible bajo estrés)
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    if ("vibrate" in navigator) navigator.vibrate?.(80);
    const id = setInterval(() => {
      setCountdown((c) => {
        if ("vibrate" in navigator) navigator.vibrate?.(30);
        if (c <= 1) { clearInterval(id); setStage("sending"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  const sendAlert = useServerFn(sendEmergencyAlert);

  const fetchFallGps = useCallback(async () => {
    if (!("geolocation" in navigator)) return null;
    return new Promise<{ lat: number; lng: number; accuracy?: number } | null>((resolve) => {
      const to = setTimeout(() => resolve(null), 6000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(to);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          clearTimeout(to);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 },
      );
    });
  }, []);

  const dispatchFallEmergency = useCallback(
    async (gps: { lat: number; lng: number; accuracy?: number } | null) => {
      if (!userId) return;
      const res: any = await sendAlert({ data: { signupId: userId, gps } });
      const sent = (res?.results ?? []).filter((r: any) => r.status === "sent").length;
      if (sent > 0) toast.success("Alerta por caída enviada a tu familia.");
      else if (res?.status === "no_recipients") toast.error("No hay familiares configurados.");
      else toast.error("No pudimos enviar la alerta automática por caída.");
    },
    [sendAlert, userId],
  );

  const {
    countdownSeconds: fallCountdown,
    isCountdownActive: fallCountdownActive,
    status: fallStatus,
    cancelarAlerta,
    requestPermission: requestFallPermission,
    isMonitoring: fallMonitoring,
    needsMotionPermission: fallNeedsPermission,
    motionSupported: fallMotionSupported,
    probarCuentaRegresiva,
  } = useFallDetection({
    signupId: userId,
    enabled: !!userId && stage === "idle",
    getGps: fetchFallGps,
    dispatchEmergency: dispatchFallEmergency,
  });

  const handleFallPermission = useCallback(async () => {
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

  const [alertSummary, setAlertSummary] = useState<{
    delivered: number;
    total: number;
    status: string;
    training?: boolean;
  } | null>(null);

  const startEmergencyFlow = (training: boolean) => {
    if (training) {
      isTrainingRunRef.current = true;
      setTrainingRunActive(true);
      if ("vibrate" in navigator) navigator.vibrate?.(60);
      setStage("confirm");
      return;
    }
    if (trainingPending && !trainingDone) {
      toast.error("Primero completa el mock de entrenamiento (botón naranja).");
      return;
    }
    isTrainingRunRef.current = false;
    setTrainingRunActive(false);
    if ("vibrate" in navigator) navigator.vibrate?.(120);
    setStage("confirm");
  };

  useEffect(() => {
    if (stage !== "sending") return;
    let cancelled = false;
    setDeliveredTo(0);
    setAlertSummary(null);
    if ("vibrate" in navigator) navigator.vibrate?.([100, 60, 100]);

    // Progreso visual mientras se ejecuta el envío real
    const total = Math.max(1, familyCount);
    const ticks: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < total; i++) {
      ticks.push(setTimeout(() => setDeliveredTo((d) => Math.min(total, d + 1)), 400 + i * 350));
    }

    (async () => {
      if (!userId) {
        toast.error("Sesión no encontrada. No pudimos enviar la alerta.");
        if (!cancelled) setStage("sent");
        return;
      }

      // 1) Obtener GPS real (con timeout corto, no bloquea el envío)
      const gps = await new Promise<{ lat: number; lng: number; accuracy?: number } | null>((resolve) => {
        if (!("geolocation" in navigator)) return resolve(null);
        const to = setTimeout(() => resolve(null), 6000);
        navigator.geolocation.getCurrentPosition(
          (pos) => { clearTimeout(to); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }); },
          () => { clearTimeout(to); resolve(null); },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 },
        );
      });

      try {
        const trainingMode = isTrainingRunRef.current;
        const res: any = await sendAlert({
          data: { signupId: userId, gps, trainingMode },
        });
        if (cancelled) return;
        const sent = (res?.results ?? []).filter((r: any) => r.status === "sent").length;
        setAlertSummary({
          delivered: sent,
          total: res?.results?.length ?? 0,
          status: res?.status ?? "unknown",
          training: !!res?.training || trainingMode,
        });
        if (trainingMode) {
          markTrainingDone();
          setTrainingDone(true);
          isTrainingRunRef.current = false;
          setTrainingRunActive(false);
          toast.success("Entrenamiento completado. Sin llamadas ni mensajes reales.");
        } else if (res?.status === "delivered") toast.success("Alerta enviada a tu familia.");
        else if (res?.status === "partial") toast.warning("Alerta enviada parcialmente.");
        else if (res?.status === "no_recipients") toast.error("No hay familiares configurados.");
        else toast.error("No pudimos enviar la alerta. Llama directamente.");
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Error enviando la alerta.");
      } finally {
        if (!cancelled) {
          setDeliveredTo(total);
          setStage("sent");
        }
      }
    })();

    return () => { cancelled = true; ticks.forEach(clearTimeout); };
  }, [stage, familyCount, userId, sendAlert]);

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
      const user = res.user as TrialUser;
      setUserId(user.id);
      setUserName(String(user.nombre ?? "").split(" ")[0]);
      setContacts(res.contacts as Contact[]);
      setPinConfigured(Boolean(res.pinConfigured));
      setAccountConfigured(true);
      persistSignupHandoff(user.id);
      try { sessionStorage.setItem("seniorsafe_user", JSON.stringify(user)); } catch {}
      try { localStorage.setItem("seniorsafe_user_backup", JSON.stringify(user)); } catch {}
      toast.success(`Hola ${String(user.nombre ?? "").split(" ")[0]}`);
    } catch (e) {
      console.error(e);
      setLoginError("No pudimos cargar tu cuenta. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoginBusy(false);
    }
  };

  const requestGps = () => {
    if (!("geolocation" in navigator)) { toast.error("GPS no disponible en este teléfono."); return; }
    navigator.geolocation.getCurrentPosition(
      () => { setGpsAllowed(true); toast.success("GPS activado."); },
      () => toast.error("Activa el GPS desde permisos del teléfono."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) { toast.error("Notificaciones no disponibles."); return; }
    const permission = await Notification.requestPermission();
    setNotificationsAllowed(permission === "granted");
    if (permission === "granted") toast.success("Notificaciones activadas.");
    else toast.error("Activa las notificaciones desde permisos del teléfono.");
  };

  const markBatteryReady = () => {
    setBatteryChecked(true);
    toast.success("Listo. Recuerda permitir funcionamiento en segundo plano.");
  };

  if (mustInstallBeforeWebPanel) {
    return (
      <PostPaymentInstallScreen
        signupId={userId}
        showPaymentSuccess={false}
      />
    );
  }

  if (configReady && !userId && !loadingContacts) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${DEEP}, #0a3540)` }}
      >
        <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-6 backdrop-blur-sm">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Senior Safe</h1>
        <p className="text-white/80 text-center mb-8 max-w-xs">
          Ingresa el correo con el que te registraste en alarmaseniorsafe.cl
        </p>
        <div className="w-full max-w-sm space-y-3">
          <Label htmlFor="app-email" className="text-white/90">Correo registrado</Label>
          <Input
            id="app-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={loginEmail}
            onChange={(e) => { setLoginEmail(e.target.value); setLoginError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleEmailLogin(); }}
            placeholder="tu@correo.cl"
            className="h-14 text-base bg-white text-foreground"
          />
          {loginError && (
            <p className="text-sm font-medium text-red-200 bg-red-950/40 rounded-xl px-3 py-2" role="alert">
              {loginError}
            </p>
          )}
          <Button
            type="button"
            onClick={handleEmailLogin}
            disabled={loginBusy}
            className="w-full h-14 text-lg font-bold"
            style={{ background: GREEN }}
          >
            {loginBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)" }}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: DEEP }}>
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">Senior Safe</div>
            <div className="text-sm text-muted-foreground">Hola{userName ? `, ${userName}` : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground" aria-label="Estado del dispositivo">
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Battery className="w-4 h-4" aria-hidden="true" /> 82%</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label="Conectado a Wi-Fi"><Wifi className="w-4 h-4" aria-hidden="true" /></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pb-6 max-w-md mx-auto w-full">
        {/* Status banner */}
        <section
          aria-label="Estado actual"
          className="rounded-3xl p-5 mb-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">Estás segura</div>
              <div className="text-sm text-white/90">
                {familyCount > 0 ? "Red familiar configurada" : "Aún sin familiares conectados"}
              </div>
            </div>
          </div>
          {userId && fallMotionSupported && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <button
                type="button"
                onClick={handleFallPermission}
                className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
              >
                <Activity className="w-4 h-4" />
                Caídas {fallMonitoring ? "activo" : "tocar para activar"}
              </button>
              <button
                type="button"
                onClick={probarCuentaRegresiva}
                className="underline underline-offset-2 text-white/85"
              >
                Probar simulación
              </button>
            </div>
          )}
        </section>

        {/* Install app banner — visible only when not installed */}
        {!isInstalled && (
          <section aria-label="Descargar la app" className="mb-5">
            <button
              type="button"
              onClick={() => setInstallOpen(true)}
              className="w-full rounded-3xl p-5 text-white text-left shadow-xl active:scale-[0.99] transition focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
              style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Download className="w-7 h-7" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold leading-tight">📲 DESCARGAR APP SENIOR SAFE</div>
                  <div className="text-sm text-white/95 mt-1">
                    Instala Senior Safe para acceso rápido y alertas más confiables.
                  </div>
                </div>
              </div>
            </button>
          </section>
        )}



        {accountConfigured && (
          <section aria-label="Configuración recuperada" className="bg-card border-2 rounded-3xl p-5 mb-4 shadow-sm" style={{ borderColor: GREEN }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: GREEN }}>
                <Shield className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">Tu cuenta ya está configurada</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cargamos tu nombre, familiares, PIN, WhatsApp y avance de activación. No debes comenzar de nuevo.
                </p>
              </div>
            </div>
          </section>
        )}

        {accountConfigured && (!gpsAllowed || !notificationsAllowed || !batteryChecked || fallNeedsPermission || !fallMotionSupported) && (
          <section aria-label="Permisos del teléfono" className="bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm">
            <h2 className="font-bold text-foreground text-lg mb-1">Solo faltan permisos del teléfono</h2>
            <p className="text-sm text-muted-foreground mb-3">Son necesarios para protegerte en emergencias.</p>
            <div className="space-y-2">
              <PermissionButton icon={MapPin} label="Activar GPS" done={gpsAllowed} onClick={requestGps} />
              <PermissionButton icon={Bell} label="Activar notificaciones" done={notificationsAllowed} onClick={requestNotifications} />
              {fallMotionSupported ? (
                <PermissionButton
                  icon={Activity}
                  label="Activar sensor de caídas"
                  done={fallMonitoring}
                  onClick={handleFallPermission}
                />
              ) : (
                <p className="text-sm text-amber-700 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  Este dispositivo no permite detección automática de caídas en el navegador. Usa el botón de emergencia.
                </p>
              )}
              <PermissionButton icon={Battery} label="Revisar batería / segundo plano" done={batteryChecked} onClick={markBatteryReady} />
            </div>
            {fallMonitoring && (
              <button
                type="button"
                onClick={probarCuentaRegresiva}
                className="mt-3 w-full text-sm font-semibold text-muted-foreground underline underline-offset-2"
              >
                Probar cuenta regresiva de caída (simulación, no envía alerta)
              </button>
            )}
          </section>
        )}

        {trainingPending && !trainingDone && (
          <section
            aria-label="Mock de entrenamiento"
            className="mb-5 rounded-3xl border-2 p-5 shadow-md"
            style={{
              borderColor: "#f59e0b",
              background: "color-mix(in oklab, #f59e0b 10%, white)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                style={{ background: "#f59e0b" }}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Mock de entrenamiento</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Practica el botón de pánico sin enviar WhatsApp, SMS ni llamadas reales (sin costo Twilio).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startEmergencyFlow(true)}
              className="mt-4 w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              Iniciar práctica (simulación)
            </button>
          </section>
        )}

        {/* Botón de emergencia real — habilitado tras entrenamiento o si no aplica onboarding */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          {trainingPending && !trainingDone && (
            <p className="mb-3 text-center text-xs font-semibold text-amber-700 max-w-[18rem]">
              El botón rojo se activa cuando completes el entrenamiento arriba.
            </p>
          )}
          <button
            type="button"
            onClick={() => startEmergencyFlow(false)}
            disabled={trainingPending && !trainingDone}
            aria-label="Botón de emergencia. Pulsa para pedir ayuda a tu familia"
            className={`relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full ${
              trainingPending && !trainingDone ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
            <span className="absolute -inset-3 rounded-full" style={{ background: "rgba(220,38,38,0.10)" }} aria-hidden="true" />
            <span
              className="relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition"
              style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
            >
              <Bell className="w-20 h-20 mb-3" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-3xl tracking-wide">EMERGENCIA</span>
              <span className="mt-1 text-base font-semibold text-white/85">Toca para pedir ayuda</span>
            </span>
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-[18rem]">
            {loadingContacts || !configReady ? (
              <>Cargando tu red familiar…</>
            ) : familyCount > 0 ? (
              <>Avisaremos a <strong className="text-foreground">{familyCount} familiar{familyCount === 1 ? "" : "es"}</strong> con tu ubicación exacta.</>
            ) : (
              <>Agrega un familiar en <strong className="text-foreground">Tu red familiar</strong> para que reciba tus alertas.</>
            )}
          </p>

        </div>

        {/* GPS card */}
        <section aria-label="Tu ubicación actual" className="bg-card border border-border rounded-3xl overflow-hidden mb-4 shadow-sm">
          <div
            className="relative h-32"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(16,185,129,0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), linear-gradient(180deg, #f1f5f9, #e2e8f0)",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/80" />
            <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white/80" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 -m-3 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.45)" }} />
              <span className="relative flex w-7 h-7 rounded-full items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                <MapPin className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PETROL }}>
              <Navigation className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">GPS activo</div>
              <div className="text-lg font-bold text-foreground truncate">En casa · Las Condes</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" aria-hidden="true" /> Actualizado hace 1 min
              </div>
            </div>
          </div>
        </section>

        {/* Family card */}
        <section aria-label="Familiares conectados" className="bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: DEEP }} aria-hidden="true" />
              <h2 className="font-bold text-foreground text-base">Tu red familiar</h2>
            </div>
            {familyCount > 0 && (
              <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: GREEN }}>
                {familyCount} conectado{familyCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loadingContacts ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando familiares…
            </div>
          ) : familyCount === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              Aún no has agregado familiares. {pinConfigured ? "Usa “Administrar familiares” para añadirlos." : "Primero crea tu PIN de seguridad (botón de abajo)."}
            </div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((f, i) => (
                <li key={f.id} className="flex items-center gap-3 py-1.5">
                  <span
                    aria-hidden="true"
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: colorFor(i) }}
                  >
                    {initialOf(f.nombre)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-foreground leading-tight truncate">{f.nombre}</div>
                    <div className="text-sm text-muted-foreground truncate">{f.parentesco} · recibe WhatsApp</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} aria-label="En línea" />
                </li>
              ))}
            </ul>
          )}

          {!pinConfigured && userId && (
            <button
              type="button"
              onClick={() => setPinGateOpen(true)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md"
              style={{ background: DEEP }}
            >
              <KeyRound className="w-4 h-4" /> Crear PIN de seguridad (4 dígitos)
            </button>
          )}

          <button
            type="button"
            onClick={requestManage}
            disabled={!userId}
            className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-foreground font-bold text-sm hover:bg-muted transition disabled:opacity-50 ${pinConfigured ? "mt-3" : "mt-2"}`}
          >
            <KeyRound className="w-4 h-4" /> Administrar familiares
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            {pinConfigured
              ? "Para editar tu red pediremos tu PIN. La emergencia nunca pide PIN."
              : "Crea tu PIN una vez; luego podrás agregar y editar familiares."}
          </p>
        </section>

        <div className="mb-5">
          <WhatsAppActivationButton />
        </div>

        <nav aria-label="Navegación principal" className="grid grid-cols-3 gap-2 bg-card rounded-3xl p-2 border border-border shadow-sm">
          <NavItem icon={Home} label="Inicio" active />
          <NavItem icon={Heart} label="Familia" onClick={requestManage} />
          <NavItem icon={Settings} label="Ajustes" onClick={requestManage} />
        </nav>

        <Link to="/" className="text-center text-sm text-muted-foreground mt-4 hover:text-foreground underline-offset-4 hover:underline">
          Volver al sitio web
        </Link>
      </main>

      {/* PIN gate */}
      <PinGateDialog
        open={pinGateOpen}
        signupId={userId}
        pinConfigured={pinConfigured}
        onClose={() => setPinGateOpen(false)}
        onPinConfigured={() => {
          setPinConfigured(true);
          try {
            const raw = localStorage.getItem("seniorsafe_progress");
            const prog = raw ? JSON.parse(raw) : {};
            localStorage.setItem("seniorsafe_progress", JSON.stringify({ ...prog, pin: true }));
          } catch { /* ignore */ }
        }}
        onSuccess={() => { setPinUnlocked(true); setPinGateOpen(false); setManageOpen(true); }}
      />

      {/* Manage family */}
      <ManageFamilyDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        signupId={userId}
        contacts={contacts}
        setContacts={setContacts}
      />

      {/* Emergency overlay */}
      {stage !== "idle" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in"
        >
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md p-7 text-center">
            {stage === "confirm" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: RED }}>
                    <Bell className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  ¿Necesitas ayuda?
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  {trainingRunActive
                    ? "Simulación: no se contactará a nadie por teléfono ni WhatsApp."
                    : "Avisaremos a tu familia por WhatsApp con tu ubicación."}
                </p>

                <div className="mt-6 flex items-center justify-center" aria-live="polite" aria-atomic="true">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / 5)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-foreground tabular-nums">{countdown}</span>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">segundos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("sending")}
                    className="w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-red-300"
                    style={{ background: RED }}
                  >
                    SÍ, NECESITO AYUDA
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("idle")}
                    className="w-full py-5 rounded-2xl bg-muted text-foreground text-xl font-bold active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  >
                    Estoy bien, cancelar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  aria-label="Cerrar"
                  className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}

            {stage === "sending" && (
              <>
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white mb-5 shadow-lg animate-pulse" style={{ background: RED }}>
                  <MessageCircle className="w-12 h-12" aria-hidden="true" />
                </div>
                <h2 id="emergency-dialog-title" className="text-2xl font-bold text-foreground tracking-tight">
                  Avisando a tu familia
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">Enviando WhatsApp con tu ubicación…</p>

                <ul className="mt-6 space-y-2 text-left" aria-live="polite" aria-atomic="false">
                  {(contacts.length > 0 ? contacts : [{ id: "x", nombre: "Tu familiar", parentesco: "—", telefono: "" }]).map((f, i) => {
                    const done = i < deliveredTo;
                    return (
                      <li
                        key={f.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-2xl transition"
                        style={{ background: done ? "rgba(22,163,74,0.08)" : "hsl(var(--muted))" }}
                      >
                        <span
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ background: colorFor(i) }}
                        >
                          {initialOf(f.nombre)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground truncate">{f.nombre}</div>
                          <div className="text-xs text-muted-foreground truncate">{f.parentesco}</div>
                        </div>
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: GREEN }}>
                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Avisado
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin" aria-label="Enviando" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {stage === "sent" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(22,163,74,0.30)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                    <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  {alertSummary?.training
                    ? "Entrenamiento completado"
                    : alertSummary && alertSummary.delivered > 0
                      ? "Ayuda en camino"
                      : "Alerta procesada"}
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  {alertSummary?.training
                    ? "Simulaste el flujo completo. En una emergencia real, tu familia recibirá WhatsApp, SMS y llamada."
                    : alertSummary
                      ? `WhatsApp, SMS y llamada: ${alertSummary.delivered} de ${alertSummary.total} envíos correctos.`
                      : "Tu familia recibió la alerta con tu ubicación."}
                </p>

                <div className="mt-5 rounded-2xl bg-muted p-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GREEN }} aria-hidden="true" />
                    Compartiste tu ubicación
                  </div>
                  <div className="text-sm text-muted-foreground">En casa · Las Condes</div>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  className="mt-6 w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  style={{ background: DEEP }}
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <FallDetectionOverlay
        isActive={fallCountdownActive}
        countdownSeconds={fallCountdown}
        isDispatching={fallStatus === "dispatching"}
        onCancel={cancelarAlerta}
      />

      <InstallAppModal open={installOpen} onClose={() => setInstallOpen(false)} signupId={userId} />
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-sm font-semibold transition ${active ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
      style={active ? { background: DEEP } : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
}

function PermissionButton({ icon: Icon, label, done, onClick }: { icon: any; label: string; done: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={done}
      className="w-full min-h-14 rounded-2xl border border-border px-4 py-3 flex items-center justify-between gap-3 text-left disabled:opacity-100"
      style={done ? { background: "color-mix(in oklab, #16a34a 8%, white)", borderColor: GREEN } : undefined}
    >
      <span className="inline-flex items-center gap-3 min-w-0">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: done ? GREEN : PETROL }}>
          {done ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <Icon className="w-5 h-5" aria-hidden="true" />}
        </span>
        <span className="font-bold text-foreground text-base leading-tight">{done ? "Listo: " : ""}{label}</span>
      </span>
      {!done && <span className="text-sm font-bold text-muted-foreground">Tocar</span>}
    </button>
  );
}

/* ---------- PIN Gate (crear o verificar) ---------- */
function PinGateDialog({
  open, onClose, signupId, pinConfigured, onPinConfigured, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  signupId: string | null;
  pinConfigured: boolean;
  onPinConfigured: () => void;
  onSuccess: () => void;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [phase, setPhase] = useState<"verify" | "create" | "confirm">("verify");
  const [busy, setBusy] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const confirmStartedRef = useRef(false);
  const verify = useServerFn(verifyPin);
  const savePin = useServerFn(setUserPin);

  const activeSignupId = signupId || readStoredSignupId();

  useEffect(() => {
    if (!open) return;
    setPin("");
    setConfirmPin("");
    setInlineError(null);
    confirmStartedRef.current = false;
    setPhase(pinConfigured ? "verify" : "create");
  }, [open, pinConfigured]);

  useEffect(() => {
    if (!open || phase !== "create" || pin.length !== 4) return;
    const t = setTimeout(() => setPhase("confirm"), 250);
    return () => clearTimeout(t);
  }, [open, phase, pin]);

  const submitVerify = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      toast.error("Sesión no encontrada.");
      return;
    }
    if (pin.length !== 4) { setInlineError("Ingresa los 4 dígitos."); return; }
    setInlineError(null);
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, activeSignupId);
      const res = await verifyPinWithFallback(verify, activeSignupId, pinHash);
      if (!res.configured) {
        setPhase("create");
        setPin("");
        return;
      }
      if (!res.ok) {
        setInlineError("PIN incorrecto.");
        setPin("");
        return;
      }
      toast.success("PIN correcto.");
      onSuccess();
    } catch (e) {
      console.error(e);
      setInlineError("No pudimos verificar el PIN. Revisa tu conexión.");
      toast.error("No pudimos verificar el PIN.");
    } finally { setBusy(false); }
  };

  const submitCreate = () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      return;
    }
    if (pin.length !== 4) { setInlineError("Elige 4 dígitos."); return; }
    setInlineError(null);
    setPhase("confirm");
    setConfirmPin("");
  };

  const submitConfirm = async () => {
    if (!activeSignupId) {
      setInlineError("No encontramos tu cuenta. Inicia sesión con tu correo.");
      toast.error("Sesión no encontrada.");
      return;
    }
    if (confirmPin !== pin) {
      setInlineError("Los PIN no coinciden. Intenta de nuevo.");
      setConfirmPin("");
      setPin("");
      setPhase("create");
      confirmStartedRef.current = false;
      return;
    }
    setInlineError(null);
    setBusy(true);
    try {
      const pinHash = await hashPin(pin, activeSignupId);
      const saved = await saveUserPinWithFallback(savePin, activeSignupId, pinHash);
      if (!saved.ok) {
        setInlineError(savePinErrorMessage(saved.error));
        toast.error(savePinErrorMessage(saved.error));
        confirmStartedRef.current = false;
        return;
      }
      onPinConfigured();
      toast.success("PIN creado. Ya puedes administrar familiares.");
      onSuccess();
    } catch (e) {
      console.error(e);
      setInlineError(savePinErrorMessage());
      toast.error("No pudimos guardar tu PIN.");
      confirmStartedRef.current = false;
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!open || phase !== "confirm" || confirmPin.length !== 4 || busy || confirmStartedRef.current) return;
    confirmStartedRef.current = true;
    void submitConfirm();
  }, [open, phase, confirmPin, busy]);

  const title =
    phase === "verify" ? "Ingresa tu PIN" : phase === "create" ? "Crea tu PIN" : "Confirma tu PIN";
  const description =
    phase === "verify"
      ? "El PIN protege la edición de tu red familiar. La emergencia nunca pide PIN."
      : phase === "create"
        ? "Elige 4 dígitos fáciles de recordar. Los usarás para agregar familiares."
        : "Vuelve a ingresar el mismo PIN para confirmar.";

  const value = phase === "confirm" ? confirmPin : pin;
  const setValue = (v: string) => (phase === "confirm" ? setConfirmPin(v) : setPin(v));

  const onSubmit = () => {
    if (phase === "verify") return submitVerify();
    if (phase === "create") return submitCreate();
    return submitConfirm();
  };

  const primaryLabel =
    phase === "verify" ? "Desbloquear" : phase === "create" ? "Continuar" : "Guardar PIN";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm z-[100]">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: DEEP }}>
            <KeyRound className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            inputMode="numeric"
            autoFocus
            maxLength={4}
            value={value}
            onChange={(e) => {
              setInlineError(null);
              setValue(e.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            placeholder="••••"
            className="text-center text-3xl tracking-[0.6em] h-16"
            onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
          />
          {inlineError && (
            <p className="mt-2 text-sm font-medium text-destructive text-center" role="alert">
              {inlineError}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={onSubmit} disabled={busy || value.length !== 4} style={{ background: DEEP }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Manage Family ---------- */
function ManageFamilyDialog({
  open, onClose, signupId, contacts, setContacts,
}: {
  open: boolean; onClose: () => void; signupId: string | null;
  contacts: Contact[]; setContacts: (c: Contact[]) => void;
}) {
  const [form, setForm] = useState<{ nombre: string; telefono: string; parentesco: string }>({ nombre: "", telefono: "", parentesco: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const add = useServerFn(addFamily);
  const upd = useServerFn(updateFamily);
  const del = useServerFn(deleteFamily);

  const resetForm = () => { setForm({ nombre: "", telefono: "", parentesco: "" }); setEditingId(null); };

  const submit = async () => {
    if (!signupId) return;
    if (!form.nombre.trim() || !form.telefono.trim() || !form.parentesco.trim()) {
      toast.error("Completa todos los campos"); return;
    }
    setBusy(true);
    try {
      if (editingId) {
        const res = await updateFamilyWithFallback(upd, signupId, editingId, form);
        if (!res.contact) {
          toast.error(familyErrorMessage(res.error));
          return;
        }
        setContacts(contacts.map(c => c.id === editingId ? (res.contact as Contact) : c));
        toast.success("Familiar actualizado");
      } else {
        if (contacts.length >= 5) { toast.error("Máximo 5 familiares."); return; }
        const res = await addFamilyWithFallback(add, signupId, form);
        if (!res.contact) {
          toast.error(familyErrorMessage(res.error));
          return;
        }
        setContacts([...contacts, res.contact as Contact]);
        toast.success("Familiar agregado");
      }
      resetForm();
    } catch (e: unknown) {
      console.error(e);
      toast.error(familyErrorMessage(e instanceof Error ? e.message : undefined));
    } finally { setBusy(false); }
  };

  const startEdit = (c: Contact) => {
    setEditingId(c.id);
    setForm({ nombre: c.nombre, telefono: c.telefono, parentesco: c.parentesco });
  };

  const remove = async (c: Contact) => {
    if (!signupId) return;
    if (!confirm(`¿Eliminar a ${c.nombre}?`)) return;
    setBusy(true);
    try {
      const res = await deleteFamilyWithFallback(del, signupId, c.id);
      if (!res.ok) {
        toast.error(familyErrorMessage(res.error));
        return;
      }
      setContacts(contacts.filter(x => x.id !== c.id));
      if (editingId === c.id) resetForm();
      toast.success("Familiar eliminado");
    } catch (e) {
      console.error(e); toast.error("No pudimos eliminar.");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (onClose(), resetForm())}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2" style={{ background: GREEN }}>
            <Users className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl">Administrar familiares</DialogTitle>
          <DialogDescription className="text-base">
            Edita, agrega o elimina hasta 5 personas que reciben tus alertas.
          </DialogDescription>
        </DialogHeader>

        {contacts.length > 0 && (
          <ul className="space-y-2 mb-4">
            {contacts.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: colorFor(i) }}>
                  {initialOf(c.nombre)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground truncate">{c.nombre}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.parentesco} · {c.telefono}</div>
                </div>
                <button type="button" onClick={() => startEdit(c)} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center" aria-label={`Editar ${c.nombre}`}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(c)} className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-red-600" aria-label={`Eliminar ${c.nombre}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="font-bold text-foreground">{editingId ? "Editar familiar" : "Agregar familiar"}</h3>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Pedro" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Parentesco</Label>
              <Input value={form.parentesco} onChange={(e) => setForm({ ...form, parentesco: e.target.value })} placeholder="Hijo, Hija…" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 …" />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          {editingId && <Button variant="outline" onClick={resetForm}>Cancelar edición</Button>}
          <Button onClick={submit} disabled={busy} style={{ background: GREEN }}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              editingId ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Guardar cambios</>
                        : <><Plus className="w-4 h-4 mr-1" /> Agregar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
