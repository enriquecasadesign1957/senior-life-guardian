import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, WifiOff, MapPinOff, MapPin, Battery, Clock, Loader2, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFamilyDashboard } from "@/lib/family-portal.functions";

export const Route = createFileRoute("/familia/dashboard")({
  head: () => ({
    meta: [
      { title: "Estado — Portal Familia" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FamilyDashboard,
});

type Session = { family_member_id: string; trial_signup_id: string; nombre?: string };

function FamilyDashboard() {
  const navigate = useNavigate();
  const loadDashboard = useServerFn(getFamilyDashboard);
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof loadDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("seniorsafe_family_session");
      if (!raw) { navigate({ to: "/familia" }); return; }
      setSession(JSON.parse(raw));
    } catch { navigate({ to: "/familia" }); }
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    const fetchData = async () => {
      try {
        const res = await loadDashboard({ data: { family_member_id: session.family_member_id, trial_signup_id: session.trial_signup_id } });
        if (alive) setData(res);
      } catch (e) {
        console.error(e);
        navigate({ to: "/familia" });
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchData();
    // refresco suave cada 60s (sin polling agresivo)
    const id = setInterval(fetchData, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, [session, loadDashboard, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("seniorsafe_family_session");
    navigate({ to: "/familia" });
  };

  if (loading || !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const senior = data.senior;
  const device = data.device;
  const status = data.visualStatus;

  const statusConfig = {
    ok: { label: "Bien", color: "#16a34a", icon: CheckCircle2, desc: "Todo en orden" },
    alert: { label: "Alerta activa", color: "#dc2626", icon: AlertTriangle, desc: "Se envió una alerta de emergencia" },
    disconnected: { label: "Desconectado", color: "#64748b", icon: WifiOff, desc: "El dispositivo no se reporta hace más de 10 min" },
    no_gps: { label: "Sin GPS", color: "#f59e0b", icon: MapPinOff, desc: "GPS desactivado en el dispositivo" },
  }[status];

  const StatusIcon = statusConfig.icon;
  const lastSeen = device?.last_seen_at ? new Date(device.last_seen_at) : null;

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{senior?.nombre ?? "Senior"}</h1>
            <p className="text-xs text-muted-foreground">Portal Familia</p>
          </div>
          <div className="flex gap-2">
            <Link to="/familia/guardianes">
              <Button variant="outline" size="sm"><Users className="w-4 h-4 mr-1" /> Guardianes</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Estado principal grande */}
        <section
          className="rounded-3xl p-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${statusConfig.color}, ${statusConfig.color}cc)` }}
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
                  {status === "ok" && Date.now() - lastSeen.getTime() < 5 * 60 * 1000
                    ? "🟢 Activo ahora"
                    : `Última actividad hace ${timeAgo(lastSeen)}`}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Métricas dispositivo */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Clock} label="Última conexión" value={lastSeen ? timeAgo(lastSeen) : "—"} />
          <Metric icon={Battery} label="Batería" value={device?.battery_level != null ? `${device.battery_level}%` : "—"} />
          <Metric icon={MapPin} label="GPS" value={device?.gps_enabled ? "Activo" : device?.gps_enabled === false ? "Desactivado" : "—"} />
          <Metric icon={WifiOff} label="Internet" value={device?.internet_connected ? "Conectado" : device?.internet_connected === false ? "Sin conexión" : "—"} />
        </section>

        {/* Última ubicación */}
        {device?.last_lat != null && device?.last_lng != null && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold mb-2">Última ubicación conocida</h2>
            <a
              href={`https://maps.google.com/?q=${device.last_lat},${device.last_lng}`}
              target="_blank" rel="noreferrer"
              className="text-primary underline text-sm break-all"
            >
              Ver en Google Maps
            </a>
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
                      {new Date(a.created_at).toLocaleString("es-CL", { timeZone: "America/Santiago" })}
                    </div>
                    {a.acknowledged_at && (
                      <div className="text-xs text-green-700 mt-1">
                        ✓ Recibido{a.acknowledgement_by_name ? ` por ${a.acknowledgement_by_name}` : ""}
                      </div>
                    )}
                    {a.gps_lat != null && a.gps_lng != null && (
                      <a
                        href={`https://maps.google.com/?q=${a.gps_lat},${a.gps_lng}`}
                        target="_blank" rel="noreferrer"
                        className="text-xs text-primary underline"
                      >
                        Ver ubicación
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

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
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
    case "emergency_pressed": return "🚨 Botón de emergencia (SOS)";
    case "wellness_check":
    case "im_ok":
    case "estoy_bien": return "✅ Estoy bien";
    case "call_initiated":
    case "call": return "📞 Llamada";
    case "acknowledged": return "✓ Confirmación recibida";
    default: return e;
  }
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}
