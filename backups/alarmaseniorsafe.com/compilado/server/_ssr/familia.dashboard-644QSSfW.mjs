import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { g as getFamilyDashboard } from "./family-portal.functions-cokhooLA.mjs";
import { r as readFamilyPortalSession, w as writeFamilyPortalSession, c as clearFamilyPortalSession } from "./family-session-DoAl0Qru.mjs";
import { L as LocationMap } from "./location-map-B45PcvbX.mjs";
import { l as locationShareUrl } from "./maps-BhXedqc-.mjs";

import "../_libs/mapbox-gl.mjs";
import { L as LoaderCircle, ag as MapPinOff, j as Clock, ah as WifiOff, T as TriangleAlert, C as CircleCheck, U as Users, ai as LogOut, k as Battery, M as MapPin } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "./createSsrRpc-14pD3De2.mjs";
import "./createServerFn-CqTdkD5n.mjs";
import "./senior-access-auth-Bmk7iyGS.mjs";
import "../_libs/zod.mjs";
function FamilyDashboard() {
  const navigate = useNavigate();
  const loadDashboard = useServerFn(getFamilyDashboard);
  const [session, setSession] = reactExports.useState(null);
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const stored = readFamilyPortalSession();
    if (!stored) {
      navigate({
        to: "/familia",
        search: {
          redirect: "/familia/dashboard"
        },
        replace: true
      });
      return;
    }
    setSession(stored);
  }, [navigate]);
  reactExports.useEffect(() => {
    if (!session) return;
    let alive = true;
    const fetchData = async () => {
      try {
        const res = await loadDashboard({
          data: {
            family_member_id: session.family_member_id,
            contract_signup_id: session.contract_signup_id,
            session_token: session.token
          }
        });
        if (alive) {
          if (res.contract_signup_id !== session.contract_signup_id || res.session?.token) {
            const next = writeFamilyPortalSession({
              ...session,
              contract_signup_id: res.contract_signup_id,
              token: res.session?.token ?? session.token
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
          navigate({
            to: "/familia",
            search: {
              redirect: "/familia/dashboard"
            },
            replace: true
          });
        } else {
          toast.error(message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 6e4);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [session, loadDashboard, navigate]);
  const handleLogout = () => {
    clearFamilyPortalSession();
    navigate({
      to: "/familia",
      search: {
        redirect: void 0
      },
      replace: true
    });
  };
  if (loading && !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh flex flex-col items-center justify-center gap-3 bg-background p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Conectando con el Portal Familia…" }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm text-sm text-destructive", children: error })
    ] });
  }
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh flex flex-col items-center justify-center gap-3 bg-background p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-sm text-sm text-destructive", children: error ?? "No pudimos cargar el estado. Revisa tu conexión e inténtalo de nuevo." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => window.location.reload(), children: "Reintentar" })
    ] });
  }
  const senior = data.senior;
  const device = data.device;
  const status = data.visualStatus;
  const isLiveConnected = data.isLiveConnected;
  const lastActivitySource = data.lastActivitySource;
  const statusConfig = {
    ok: {
      label: "Bien",
      color: "#16a34a",
      icon: CircleCheck,
      desc: "Todo en orden"
    },
    alert: {
      label: "Alerta activa",
      color: "#dc2626",
      icon: TriangleAlert,
      desc: "Se envió una alerta de emergencia"
    },
    inactive: {
      label: "Inactivo",
      color: "#64748b",
      icon: Clock,
      desc: "Sin actividad en más de 24 horas (última señal hace más de 1 día)"
    },
    disconnected: {
      label: "Desconectado",
      color: "#64748b",
      icon: WifiOff,
      desc: "Sin señal de la app hace más de 48 horas"
    },
    no_data: {
      label: "Sin datos",
      color: "#94a3b8",
      icon: Clock,
      desc: "La app del adulto mayor aún no ha reportado estado. Debe abrir la app instalada."
    },
    no_gps: {
      label: "Sin GPS",
      color: "#f59e0b",
      icon: MapPinOff,
      desc: "GPS desactivado en el dispositivo"
    }
  }[status];
  const StatusIcon = statusConfig.icon;
  const lastSeen = device?.last_seen_at ? new Date(device.last_seen_at) : null;
  const connectionLabel = lastActivitySource === "alert" && !isLiveConnected ? "Última alerta" : "Última conexión";
  const batteryLabel = device?.battery_level != null ? `${device.battery_level}%` : isLiveConnected && device?.app_version?.startsWith("native") ? "Actualiza app Android" : isLiveConnected ? "No disponible" : "—";
  const internetLabel = device?.internet_connected === true || isLiveConnected ? "Conectado" : device?.internet_connected === false ? "Sin conexión" : lastActivitySource === "alert" ? "Conectado" : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh bg-slate-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white border-b sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-3 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg", children: senior?.nombre ?? "Senior" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Portal Familia" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/familia/guardianes", search: {
          redirect: void 0
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 mr-1" }),
          " Guardianes"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: handleLogout, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "w-4 h-4 mr-1" }),
          " Salir"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-4xl mx-auto p-4 space-y-4", children: [
      !senior && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900", children: "No encontramos la cuenta vinculada. Cierra sesión e ingresa de nuevo con tu teléfono de guardián." }),
      status === "no_data" && senior && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white border rounded-2xl p-4 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: senior.nombre }),
        " aún no ha abierto la app Senior Safe en su teléfono, o no ha enviado señal reciente. Pídele que abra la app desde el ícono instalado (no desde el navegador)."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-3xl p-6 text-white shadow-xl", style: {
        background: `linear-gradient(135deg, ${statusConfig.color}, ${statusConfig.color}cc)`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-12 h-12" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-extrabold leading-tight", children: statusConfig.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/90 mt-1", children: statusConfig.desc }),
          lastSeen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/80 text-sm mt-1", children: isLiveConnected ? "🟢 App activa ahora" : lastActivitySource === "alert" ? `Última alerta hace ${timeAgo(lastSeen)}` : `Última actividad hace ${timeAgo(lastSeen)}` })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: Clock, label: connectionLabel, value: lastSeen ? timeAgo(lastSeen) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: Battery, label: "Batería", value: batteryLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: MapPin, label: "GPS", value: device?.gps_enabled ? "Activo" : device?.gps_enabled === false ? "Desactivado" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { icon: WifiOff, label: "Internet", value: internetLabel })
      ] }),
      device?.last_lat != null && device?.last_lng != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-2xl p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Última ubicación conocida" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LocationMap, { lat: device.last_lat, lng: device.last_lng, label: senior?.nombre ?? "Ubicación", markerColor: status === "alert" ? "#dc2626" : "#16a34a" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-2xl p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold mb-3", children: "Historial reciente" }),
        data.alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin alertas registradas." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: data.alerts.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: eventLabel(a.event_type) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(a.created_at).toLocaleString("es-CL", {
              timeZone: "America/Santiago"
            }) }),
            a.acknowledged_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-green-700 mt-1", children: [
              "✓ Recibido",
              a.acknowledgement_by_name ? ` por ${a.acknowledgement_by_name}` : ""
            ] }),
            a.gps_lat != null && a.gps_lng != null && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: locationShareUrl(a.gps_lat, a.gps_lng, senior?.nombre ?? void 0), target: "_blank", rel: "noreferrer", className: "text-xs text-primary underline", children: "Ver en mapa" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: a.status })
        ] }, a.id)) })
      ] })
    ] })
  ] });
}
function Metric({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl p-3 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-3.5 h-3.5" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-bold mt-1", children: value })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    delivered: {
      label: "Entregada",
      cls: "bg-green-100 text-green-800"
    },
    partial: {
      label: "Parcial",
      cls: "bg-amber-100 text-amber-800"
    },
    failed: {
      label: "Fallida",
      cls: "bg-red-100 text-red-800"
    },
    pending: {
      label: "Pendiente",
      cls: "bg-slate-100 text-slate-700"
    },
    no_recipients: {
      label: "Sin destinatarios",
      cls: "bg-slate-100 text-slate-700"
    }
  };
  const c = map[status] ?? {
    label: status,
    cls: "bg-slate-100 text-slate-700"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-1 rounded-full ${c.cls}`, children: c.label });
}
function eventLabel(e) {
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
function timeAgo(d) {
  const s = Math.floor((Date.now() - d.getTime()) / 1e3);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}
export {
  FamilyDashboard as component
};
