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
    await ensureGeoPermission();
    const { coords, error } = await getCurrentCoordsWithError({
      highAccuracy: true,
      timeoutMs: 6000,
      maximumAgeMs: 0,
    });
    if (coords) {
      setGpsOk(true);
      setLastCoords(coords);
      if (interactive) toast.success("Ubicación activada.");
      return;
    }
    setGpsOk(false);
  };

  // Fetch GPS rápido para uso inmediato en SOS
  const fetchGpsFast = async (): Promise<{ lat: number; lng: number; accuracy?: number } | null> => {
    const c = await getCurrentCoords({ highAccuracy: true, timeoutMs: 6000, maximumAgeMs: 0 });
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

  // 2b) Heartbeat cada 60s
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const ping = async () => {
      if (!alive) return;
      try {
        await heartbeat({
          data: {
            signupId: userId,
            battery_level: null,
            gps_enabled: gpsOk,
            internet_connected: true,
            app_version: "native-1.0",
            last_lat: lastCoords?.lat ?? null,
            last_lng: lastCoords?.lng ?? null,
          },
        });
      } catch { /* silenciar */ }
    };
    ping();
    const id = setInterval(ping, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [userId, gpsOk, lastCoords, heartbeat]);

  // Trigger automático al pasar a stage "sending"
  useEffect(() => {
    if (stage !== "sending" || !userId) return;
    (async () => {
      try {
        // Ejecución en paralelo: dispara el GPS nativo mientras se procesa el evento
        const gps = await fetchGpsFast();
        const res = await sendAlert({
          data: {
            signupId: userId,
            lat: gps?.lat ?? lastCoords?.lat ?? null,
            lng: gps?.lng ?? lastCoords?.lng ?? null,
            accuracy: gps?.accuracy ?? lastCoords?.accuracy ?? null
          }
        });
        setSummary({
          delivered: res.delivered ?? 0,
          total: res.total ?? 0,
          status: "Alertas despachadas en segundo plano."
        });
        setStage("sent");
      } catch (err) {
        toast.error("Error al transmitir la alerta.");
        setStage("idle");
      }
    })();
  }, [stage, userId, sendAlert, lastCoords]);

  // Countdown emergencia
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); setStage("sending"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setLoginBusy(true);
    try {
      const res = await loadConfig({ data: { email: loginEmail } });
      if (res.configured && res.user) {
        setUserId(res.user.id);
        setUserName(String(res.user.nombre ?? "").split(" ")[0]);
        setContacts(res.contacts as Contact[]);
        localStorage.setItem("seniorsafe_native_user", JSON.stringify(res.user));
        toast.success("Sesión iniciada.");
      } else {
        toast.error("El correo electrónico no corresponde a un afiliado activo.");
      }
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoginBusy(false);
    }
  };

  if (bootLoading && !userId) {
    return (
      <div className="min-h-screen bg-[#0d4f5c] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg">Iniciando Senior Safe...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0d4f5c] flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-[#115e6e] rounded-3xl p-6 shadow-xl border border-[#177487]">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Ingreso Afiliados</h1>
          <p className="text-sm text-center text-slate-3xl text-opacity-80 mb-6">
            Escribe el correo electrónico registrado en tu afiliación para activar el dispositivo móvil.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                className="bg-[#0d4f5c] border-[#177487] text-white rounded-xl mt-1"
                placeholder="ejemplo@correo.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loginBusy} className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl py-6 font-bold text-lg">
              {loginBusy ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
              Activar Dispositivo
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d4f5c] flex flex-col justify-between p-6 pb-12 text-white select-none">
      <div className="flex items-center justify-between border-b border-[#177487] pb-4">
        <div>
          <h2 className="text-xl font-bold">Hola, {userName}</h2>
          <p className="text-xs text-[#22c55e] flex items-center mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Dispositivo Protegido
          </p>
        </div>
        <Shield className="w-8 h-8 text-[#16a34a]" />
      </div>

      <div className="flex flex-col items-center justify-center my-auto py-8">
        {stage === "idle" && (
          <button
            onClick={() => setStage("confirm")}
 
