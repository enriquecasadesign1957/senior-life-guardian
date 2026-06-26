import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  MapPinOff,
  MapPin,
  Battery,
  Clock,
  Loader2,
  LogOut,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getFamilyDashboard } from "@/lib/family-portal.functions";
import {
  clearFamilyPortalSession,
  readFamilyPortalSession,
  writeFamilyPortalSession,
  type FamilyPortalSession,
} from "@/lib/family-session";
import type { LucideIcon } from "lucide-react";
import { LocationMap } from "@/components/location-map";
import { locationShareUrl } from "@/lib/maps";

export const Route = createFileRoute("/familia/dashboard")({
  head: () => ({
    meta: [{ title: "Estado — Portal Familia" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: FamilyDashboard,
});

function FamilyDashboard() {
  const navigate = useNavigate();
  const loadDashboard = useServerFn(getFamilyDashboard);
  const [session, setSession] = useState<FamilyPortalSession | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof loadDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readFamilyPortalSession();
    if (!stored) {
      navigate({ to: "/familia", search: { redirect: "/familia/dashboard" }, replace: true });
      return;
    }
    setSession(stored);
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    const fetchData = async () => {
      try {
        const res = await loadDashboard({
          data: {
            family_member_id: session.family_member_id,
            contract_signup_id: session.contract_signup_id,
            session_token: session.token,
          },
        });
        if (alive) {
          if (
            res.contract_signup_id !== session.contract_signup_id ||
            res.session?.token
          ) {
            const next = writeFamilyPortalSession({
              ...session,
              contract_signup_id: res.contract_signup_id,
              token: res.session?.token ?? session.token,
            });
            setSession(next);
          }
          setData(res);
          setError(null);
        }
      } catch (e) {
        console.error(e);
        if (!alive) return;
        const message = e instanceof Error ? e.message : "No pudimos cargar el Portal Familia.";
        const authError = /Sesión inválida|Token inválido|autenticación|expirada/i.test(message);
        setError(message);
        if (authError) {
          clearFamilyPortalSession();
          toast.error(message);
          navigate({ to: "/familia", search: { redirect: "/familia/dashboard" }, replace: true });
        } else {
          toast.error(message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchData();
    // refresco suave cada 60s (sin polling agresivo)
    const id = setInterval(fetchData, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [session, loadDashboard, navigate]);

  const handleLogout = () => {
    clearFamilyPortalSession();
    navigate({ to: "/familia", search: { redirect: undefined }, replace: true });
  };

  if (loading && !data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Conectando con el Portal Familia…</p>
        {error && <p className="max-w-sm text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <p className="max-w-sm text-sm text-destructive">
          {error ?? "No pudimos cargar el estado. Revisa tu conexión e inténtalo de nuevo."}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const senior = data.senior;
  const device = data.device;
  const status = data.visualStatus;
  const isLiveConnected = data.isLiveConnected;
  const lastActivitySource = data.lastActivitySource;

  const statusConfig = {
    ok: { label: "Bien", color: "#16a34a", icon: CheckCircle2, desc: "Todo en orden" },
    alert: {
      label: "Alerta activa",
      color: "#dc2626",
      icon: AlertTriangle,
      desc: "Se envió una alerta de emergencia",
    },
    inactive: {
      label: "Inactivo",
      color: "#64748b",
      icon: Clock,
      desc: "Sin actividad en más de 24 horas (última señal hace más de 1 día)",
    },
    disconnected: {
      label: "Desconectado",
      color: "#64748b",
      icon: WifiOff,
      desc: "Sin señal de la app hace más de 48 horas",
    },
    no_data: {
      label: "Sin datos",
      color: "#94a3b8",
      icon: Clock,
      desc: "La app del adulto mayor aún no ha reportado estado. Debe abrir la app instalada.",
    },
    no_gps: {
      label: "Sin GPS",
      color: "#f59e0b",
      icon: MapPinOff,
      desc: "GPS desactivado en el dispositivo",
    },
  }[status];

  const StatusIcon = statusConfig.icon;
  const lastSeen = device?.last_seen_at ? new Date(device.last_seen_at) : null;
  const connectionLabel =
    lastActivitySource === "alert" && !isLiveConnected ? "Última alerta" : "Última conexión";

  const batteryLabel =
    device?.battery_level != null
      ? `${device.battery_level}%`
      : isLiveConnected && device?.app_version?.startsWith("native")
        ? "Actualiza app Android"
        : isLiveConnected
          ? "No disponible"
          : "—";

  const internetLabel =
    device?.internet_connected === true || isLiveConnected
      ? "Conectado"
      : device?.internet_connected === false
        ? "Sin conexión"
        : lastActivitySource === "alert"
          ? "Conectado"
          : "—";

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{senior?.nombre ?? "Senior"}</h1>
            <p className="text-xs text-muted-foreground">Portal Familia</p>
          </div>
          <div className="flex gap-2">
            <Link to="/familia/guardianes" search={{ redirect: undefined }}>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1" /> Guardianes
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {!senior && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
            No encontramos la cuenta vinculada. Cierra sesión e ingresa de nuevo con tu teléfono de
            guardián.
          </section>
        )}

        {status === "no_data" && senior && (
          <section className="bg-white border rounded-2xl p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{senior.nombre}</strong> aún no ha abierto la app
            Senior Safe en su teléfono, o no ha enviado señal reciente. Pídele que abra la app desde
            el ícono instalado (no desde el navegador).
          </section>
        )}

        {/* Estado principal grande */}
        <section
          className="rounded-3xl p-6 text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${statusConfig.color}, ${statusConfig.color}cc)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <StatusIcon className="w-12 h-12" />
            </div>
            <div>
              <div className="text-4xl font-extrabold leading-tight">{statusConfig.label}</div>
              <div className="text-white/90 mt-1">{statusConfig.desc}</div>
              {lastSeen && (
                <div className="text-white/80 text-sm mt-1">
                  {isLiveConnected
                    ? "🟢 App activa ahora"
                    : lastActivitySource === "alert"
                      ? `Última alerta hace ${timeAgo(lastSeen)}`
                      : `Última actividad hace ${timeAgo(lastSeen)}`}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Métricas dispositivo */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Clock} label={connectionLabel} value={lastSeen ? timeAgo(lastSeen) : "—"} />
          <Metric
            icon={Battery}
            label="Batería"
            value={batteryLabel}
          />
          <Metric
            icon={MapPin}
            label="GPS"
            value={
              device?.gps_enabled ? "Activo" : device?.gps_enabled === false ? "Desactivado" : "—"
            }
          />
          <Metric
            icon={WifiOff}
            label="Internet"
            value={internetLabel}
          />
        </section>

        {/* Última ubicación */}
        {device?.last_lat != null && device?.last_lng != null && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold mb-3">Última ubicación conocida</h2>
            <LocationMap
              lat={device.last_lat}
              lng={device.last_lng}
              label={senior?.nombre ?? "Ubicación"}
              markerColor={status === "alert" ? "#dc2626" : "#16a34a"}
            />
          </section>
        )}

        {/* Historial */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold mb-3">Historial reciente</h2>
          {data.alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin alertas registradas.</p>
          ) : (
            <ul className="divide-y">
              {data.alerts.map((a) => (
                <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{eventLabel(a.event_type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("es-CL", {
                        timeZone: "America/Santiago",
                      })}
                    </div>
                    {a.acknowledged_at && (
                      <div className="text-xs text-green-700 mt-1">
                        ✓ Recibido
                        {a.acknowledgement_by_name ? ` por ${a.acknowledgement_by_name}` : ""}
                      </div>
                    )}
                    {a.gps_lat != null && a.gps_lng != null && (
                      <a
                        href={locationShareUrl(a.gps_lat, a.gps_lng, senior?.nombre ?? undefined)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline"
                      >
                        Ver en mapa
                      </a>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    delivered: { label: "Entregada", cls: "bg-green-100 text-green-800" },
    partial: { label: "Parcial", cls: "bg-amber-100 text-amber-800" },
    failed: { label: "Fallida", cls: "bg-red-100 text-red-800" },
    pending: { label: "Pendiente", cls: "bg-slate-100 text-slate-700" },
    no_recipients: { label: "Sin destinatarios", cls: "bg-slate-100 text-slate-700" },
  };
  const c = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-700" };
  return <span className={`text-xs px-2 py-1 rounded-full ${c.cls}`}>{c.label}</span>;
}

function eventLabel(e: string) {
  switch (e) {
    case "emergency_pressed":
      return "🚨 Botón de emergencia (SOS)";
    case "wellness_check":
    case "im_ok":
    case "estoy_bien":
      return "✅ Estoy bien";
    case "call_initiated":
    case "call":
      return "📞 Llamada";
    case "acknowledged":
      return "✓ Confirmación recibida";
    default:
      return e;
  }
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}
