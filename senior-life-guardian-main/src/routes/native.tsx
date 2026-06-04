import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Shield, MapPin, Users, CheckCircle2, Loader2, X, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppConfiguration, listFamily } from "@/lib/family.functions";
import { sendEmergencyAlert } from "@/lib/emergency-alert.functions";
import { sendWellnessNotice } from "@/lib/wellness.functions";
import { upsertHeartbeat } from "@/lib/heartbeat.functions";
import { checkLastAlertAck } from "@/lib/family-portal.functions";
import { Link } from "@tanstack/react-router";
import { getCurrentCoordsWithError, getCurrentCoords, ensureGeoPermission } from "@/lib/geo";

export const Route = createFileRoute("/native")({
  head: () => ({
    meta: [
      { title: "Senior Safe" },
      { name: "description", content: "App de emergencia Senior Safe." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
    ],
  }),
  component: NativeApp,
});

const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";

type Stage = "idle" | "confirm" | "sending" | "sent";
type Contact = { id: string; nombre: string; parentesco: string; telefono: string };

function NativeApp() {
  const loadConfig = useServerFn(getAppConfiguration);
  const list = useServerFn(listFamily);
  const sendAlert = useServerFn(sendEmergencyAlert);
  const sendWellness = useServerFn(sendWellnessNotice);
  const heartbeat = useServerFn(upsertHeartbeat);
  const checkAck = useServerFn(checkLastAlertAck);
  const [wellnessBusy, setWellnessBusy] = useState(false);
  const [ackInfo, setAckInfo] = useState<{ at: string; name: string | null } | null>(null);

  const [bootLoading, setBootLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [gpsOk, setGpsOk] = useState(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const pendingGpsRef = useRef<Promise<{ lat: number; lng: number; accuracy?: number } | null> | null>(null);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // emergency state
  const [stage, setStage] = useState<Stage>("idle");
  const [countdown, setCountdown] = useState(5);
  const [summary, setSummary] = useState<{ delivered: number; total: number; status: string } | null>(null);

  // 1) Auto-hidratar desde almacenamiento local
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = localStorage.getItem("seniorsafe_native_user") || localStorage.getItem("seniorsafe_user_backup");
        if (!raw) return;
        const stored = JSON.parse(raw) as { id?: string; email?: string; telefono?: string; nombre?: string };
        const res = await loadConfig({
          data: { signupId: stored.id, email: stored.email, telefono: stored.telefono },
        });
        if (!alive) return;
        if (res.configured && res.user) {
          setUserId(res.user.id);
          setUserName(String(res.user.nombre ?? "").split(" ")[0]);
          setContacts(res.contacts as Contact[]);
          localStorage.setItem("seniorsafe_native_user", JSON.stringify(res.user));
        }
      } catch (e) {
        console.warn("native boot", e);
      } finally {
        if (alive) setBootLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [loadConfig]);

  // 2) Pedir GPS apenas haya sesión + refrescar coordenadas periódicamente
  const requestGps = async (interactive = false) => {
    // En APK pide permiso nativo primero (no depende del bridge web).
    await ensureGeoPermission();
    const { coords, error } = await getCurrentCoordsWithError({
      highAccuracy: true,
      timeoutMs: 15000,
      maximumAgeMs: 30000,
    });
    if (coords) {
      setGpsOk(true);
      setLastCoords(coords);
      if (interactive) toast.success("Ubicación activada.");
      return;
    }
    setGpsOk(false);
    if (!interactive) return;
    if (error === "denied") {
      toast.error("Permiso de ubicación bloqueado. Activa la ubicación en Ajustes del teléfono y reintenta.");
    } else if (error === "unavailable") {
      toast.error("GPS no disponible. Activa la ubicación del teléfono y reintenta.");
    } else if (error === "unsupported") {
      toast.error("Este teléfono no soporta GPS.");
    } else {
      toast.error("No pudimos obtener tu ubicación. Reintenta cerca de una ventana.");
    }
  };

  // Fetch GPS rápido (low-accuracy) para uso inmediato en SOS
  const fetchGpsFast = async (): Promise<{ lat: number; lng: number; accuracy?: number } | null> => {
    const c = await getCurrentCoords({ highAccuracy: false, timeoutMs: 8000, maximumAgeMs: 30000 });
    if (c) {
      setGpsOk(true);
      setLastCoords(c);
    }
    return c;
  };

  useEffect(() => {
    if (!userId) return;
    requestGps(false);
    const id = setInterval(() => requestGps(false), 120_000);
    return () => clearInterval(id);
  }, [userId]);


  // 2b) Heartbeat cada 60s — solo si pestaña visible + online + sesión
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const ping = async () => {
      if (!alive) return;
      if (typeof document !== "undefined" && document.hidden) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      try {
        const bat: any = await (navigator as any).getBattery?.().catch(() => null);
        await heartbeat({
          data: {
            signupId: userId,
            battery_level: bat ? Math.round(bat.level * 100) : null,
            gps_enabled: gpsOk,
            internet_connected: typeof navigator !== "undefined" ? navigator.onLine : null,
            app_version: "native-1.0",
            last_lat: lastCoords?.lat ?? null,
            last_lng: lastCoords?.lng ?? null,
          },
        });
      } catch { /* silencioso */ }
    };
    ping();
    const id = setInterval(ping, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [userId, gpsOk, lastCoords, heartbeat]);

  // 2c) Tras enviar alerta, verificar ack durante 60s (sin polling permanente)
  useEffect(() => {
    if (stage !== "sent" || !userId) return;
    let alive = true;
    let attempts = 0;
    const poll = async () => {
      if (!alive || attempts >= 6) return;
      attempts++;
      try {
        const r = await checkAck({ data: { signupId: userId } });
        if (r.alert?.acknowledged_at) {
          setAckInfo({ at: r.alert.acknowledged_at, name: r.alert.acknowledgement_by_name });
          return;
        }
      } catch { /* silencioso */ }
      setTimeout(poll, 10_000);
    };
    poll();
    return () => { alive = false; };
  }, [stage, userId, checkAck]);

  // 3) Refrescar familiares en background
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      try {
        const res = await list({ data: { signupId: userId } });
        if (alive) setContacts(res.contacts as Contact[]);
      } catch (e) { console.warn("list family", e); }
    })();
    return () => { alive = false; };
  }, [userId, list]);

  // 4) Countdown emergencia
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    if ("vibrate" in navigator) navigator.vibrate?.(80);
    const id = setInterval(() => {
      setCountdown((c) => {
        if ("vibrate" in navigator) navigator.vibrate?.(30);
        if (c <= 1) { clearInterval(id); triggerAlert(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  // 5) Envío AUTOMÁTICO: disparado por el handler del botón (NO useEffect).
  //    Bloquea reentradas con sendingRef y congela la UI con stage="sending".
  const sendingRef = useRef(false);
  const triggerAlert = async () => {
    if (sendingRef.current) return;
    if (!userId) return;
    sendingRef.current = true;





    // 1) Estado síncrono: congela la UI antes de cualquier await.
    setStage("sending");
    setSummary(null);
    if ("vibrate" in navigator) navigator.vibrate?.([100, 60, 100]);

    try {
      const phones = contacts
        .map((c) => String(c.telefono ?? "").replace(/[^\d+]/g, ""))
        .filter((p) => p.length >= 6);

      // FASE 1 (Segundo 0): Llamada telefónica INMEDIATA al primer guardián.
      if (phones.length > 0) {
        try {
          window.open(`tel:${phones[0]}`, "_system");
        } catch {
          try { window.location.href = `tel:${phones[0]}`; } catch {}
        }
      }

      // FASE 2 (paralelo): GPS real con timeout 3s; si falla, mandamos sin GPS.
      setLocating(true);
      const gpsPromise = getCurrentCoords({ highAccuracy: true, timeoutMs: 3000, maximumAgeMs: 0 });
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const gps = await Promise.race([gpsPromise, timeout]);
      setLocating(false);
      if (gps) {
        setLastCoords(gps);
        setGpsOk(true);
      }
      const coords = gps ?? lastCoords;

      // FASE 3: Disparar backend Twilio (SMS + WhatsApp automáticos, invisible).
      try {
        const res = await sendAlert({
          data: {
            signupId: userId,
            gps: coords ? { lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy } : null,
          },
        });
        const results = (res as any)?.results ?? [];
        const delivered = results.filter((r: any) => r.status === "sent").length;
        const total = results.length || phones.length;
        setSummary({ delivered, total, status: (res as any)?.status ?? "sent" });
        if (delivered > 0) {
          toast.success(`Alerta enviada (${delivered}/${total} canales).`);
        } else if (phones.length === 0) {
          toast.error("No hay guardianes configurados en tu cuenta.");
        } else {
          toast.error("No se pudo enviar la alerta. Reintenta.");
        }
      } catch (e) {
        console.error("sendAlert", e);
        toast.error("Error al enviar la alerta automática.");
        setSummary({ delivered: 0, total: phones.length, status: "failed" });
      }

      setStage("sent");
    } finally {
      sendingRef.current = false;
    }

  };







  const handleLogin = async () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email) { toast.error("Ingresa tu correo."); return; }
    setLoginBusy(true);
    try {
      const res = await loadConfig({ data: { email } });
      if (!res.configured || !res.user) {
        toast.error("No encontramos tu cuenta. Regístrate en alarmaseniorsafe.cl");
        return;
      }
      setUserId(res.user.id);
      setUserName(String(res.user.nombre ?? "").split(" ")[0]);
      setContacts(res.contacts as Contact[]);
      localStorage.setItem("seniorsafe_native_user", JSON.stringify(res.user));
      toast.success(`Hola ${String(res.user.nombre ?? "").split(" ")[0]}`);
    } catch (e) {
      console.error(e);
      toast.error("No pudimos cargar tu cuenta.");
    } finally {
      setLoginBusy(false);
    }
  };

  // ====================== UI ======================

  if (bootLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: DEEP }}>
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  // Pantalla de inicio de sesión (solo si no hay cuenta vinculada)
  if (!userId) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-white" style={{ background: `linear-gradient(135deg, ${DEEP}, #0a3540)` }}>
        <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mb-6 backdrop-blur-sm">
          <Shield className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Senior Safe</h1>
        <p className="text-white/80 text-center mb-8 max-w-xs">
          Ingresa el correo con el que te registraste en alarmaseniorsafe.cl
        </p>
        <div className="w-full max-w-sm space-y-3">
          <Label htmlFor="email" className="text-white/90">Correo registrado</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="tu@correo.cl"
            className="h-14 text-base bg-white text-foreground"
          />
          <Button
            onClick={handleLogin}
            disabled={loginBusy}
            className="w-full h-14 text-lg font-bold"
            style={{ background: GREEN }}
          >
            {loginBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </Button>
          <p className="text-xs text-white/70 text-center mt-4">
            ¿Aún no tienes cuenta? Regístrate en{" "}
            <span className="font-bold">alarmaseniorsafe.cl</span>
          </p>
        </div>
      </div>
    );
  }

  const familyCount = contacts.length;

  // App principal
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)" }}>
      <header className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: DEEP }}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">Senior Safe</div>
            <div className="text-sm text-muted-foreground">Hola{userName ? `, ${userName}` : ""}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
        {/* Estado */}
        <section
          aria-label="Estado actual"
          className="rounded-3xl p-5 mb-5 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">Protección activa 24/7</div>
              <div className="text-sm text-white/90">
                {familyCount > 0 ? `${familyCount} guardián${familyCount === 1 ? "" : "es"} conectado${familyCount === 1 ? "" : "s"}` : "Sin guardianes configurados"}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => requestGps(true)}
              className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
              aria-label={gpsOk ? "GPS activo" : "Activar GPS"}
            >
              <MapPin className="w-4 h-4" /> GPS {gpsOk ? "activo" : "tocar para activar"}
            </button>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {familyCount}
            </span>
          </div>

        </section>

        {/* BOTÓN EMERGENCIA */}
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <button
            type="button"
            onClick={() => { if ("vibrate" in navigator) navigator.vibrate?.(120); setStage("confirm"); }}
            aria-label="Botón de emergencia"
            className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full"
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} />
            <span className="absolute -inset-3 rounded-full" style={{ background: "rgba(220,38,38,0.10)" }} />
            <span
              className="relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition"
              style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
            >
              <Bell className="w-20 h-20 mb-3" strokeWidth={2.5} />
              <span className="text-3xl tracking-wide">EMERGENCIA</span>
              <span className="mt-1 text-base font-semibold text-white/85">Toca para pedir ayuda</span>
            </span>
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-[18rem]">
            {familyCount > 0 ? (
              <>Avisaremos a <strong className="text-foreground">{familyCount} guardián{familyCount === 1 ? "" : "es"}</strong> con tu ubicación.</>
            ) : (
              <>Configura tus guardianes en alarmaseniorsafe.cl</>
            )}
          </p>
        </div>

        {/* BOTÓN ESTOY BIEN — flujo independiente (NO emergencia, NO llamadas, NO escalamiento) */}
        <button
          type="button"
          disabled={!userId || wellnessBusy}
          onClick={async () => {
            if (!userId) return;
            setWellnessBusy(true);
            // GPS opcional, sin bloquear si falla o no se otorga.
            try {
              const gps = await getCurrentCoords({ highAccuracy: false, timeoutMs: 4000, maximumAgeMs: 60_000 });
              const res = await sendWellness({ data: { signupId: userId, gps } });
              if (res.recipients === 0) {
                toast.success("Marcado como: Estoy bien 💚", { description: "No hay guardianes configurados." });
              } else {
                toast.success("Estoy bien 💚 — aviso enviado", {
                  description: `Tus ${res.recipients} guardián${res.recipients === 1 ? "" : "es"} recibirá${res.recipients === 1 ? "" : "n"} un mensaje informativo.`,
                });
              }
            } catch (e: any) {
              toast.error("No se pudo enviar el aviso", { description: e?.message ?? "Reintenta." });
            } finally {
              setWellnessBusy(false);
            }
          }}
          className="mt-4 w-full h-16 rounded-2xl text-white text-lg font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition disabled:opacity-60"
          style={{ background: GREEN }}
        >
          {wellnessBusy ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Heart className="w-6 h-6" /> Estoy bien</>}
        </button>

        {/* Banner ack: tu familia ya fue notificada (no bloqueante) */}
        {ackInfo && (
          <div
            className="mt-3 rounded-2xl p-3 text-sm flex items-center gap-2 border"
            style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}
            role="status"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>
              Tu familia ya fue notificada ✓
              {ackInfo.name ? ` por ${ackInfo.name}` : ""}
            </span>
          </div>
        )}

        {/* Acceso a Mis Guardianes (discreto, no compite con SOS) */}
        <Link
          to="/familia/guardianes"
          search={{ redirect: undefined }}
          className="mt-3 w-full h-12 rounded-2xl border text-foreground text-sm font-semibold flex items-center justify-center gap-2 bg-white/70"
        >
          <Users className="w-4 h-4" /> Mis Guardianes
        </Link>
      </main>


      {/* MODAL CONFIRMACIÓN */}
      {stage === "confirm" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white" style={{ background: RED }}>
              <Bell className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Enviando alerta en {countdown}s</h2>
            <p className="text-muted-foreground mb-3">Cancela si fue un error.</p>
            <div className="mb-4 text-sm flex items-center justify-center gap-2 text-muted-foreground">
              {locating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Obteniendo ubicación…</>
              ) : lastCoords ? (
                <><MapPin className="w-4 h-4 text-green-600" /> Ubicación lista</>
              ) : (
                <><MapPin className="w-4 h-4 text-amber-600" /> Sin ubicación aún</>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14 text-base" onClick={() => setStage("idle")}>
                <X className="w-5 h-5 mr-1" /> Cancelar
              </Button>
              <Button className="flex-1 h-14 text-base text-white" disabled={sendingRef.current} style={{ background: RED }} onClick={() => triggerAlert()}>
                Enviar ya
              </Button>

            </div>
          </div>
        </div>
      )}

      {stage === "sending" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" style={{ color: RED }} />
            <h2 className="text-xl font-bold">{locating ? "Obteniendo ubicación…" : "Enviando WhatsApp, SMS y llamada…"}</h2>
            <p className="text-muted-foreground mt-1 text-sm">No cierres la app.</p>
          </div>
        </div>
      )}

      {stage === "sent" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white" style={{ background: GREEN }}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Alerta enviada</h2>
            {summary && (
              <p className="text-muted-foreground mb-5">
                {summary.delivered} de {summary.total} envíos completados.
              </p>
            )}
            <Button className="w-full h-14 text-base" onClick={() => setStage("idle")}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
