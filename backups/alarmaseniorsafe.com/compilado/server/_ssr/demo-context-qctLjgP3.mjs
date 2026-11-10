import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as DEMO_ALERTS, a as DEMO_KPIS, b as DEMO_ALERTS_BY_COMUNA, c as DEMO_SENIORS, d as DEMO_GUARDIANS } from "./demo-data-CXO5wtMy.mjs";
import { a as isPresentationMode, s as setPresentationMode } from "./demo-config-D1XL_8ap.mjs";
const BASE_KPIS = { ...DEMO_KPIS };
const DEMO_INSTITUTION_PRESETS = {
  "las-condes": {
    slug: "las-condes",
    label: "Las Condes",
    municipality: {
      nombre: "Municipalidad de Las Condes",
      slug: "las-condes",
      programa: "Programa Vecino Senior Safe",
      codigo_descuento: "VECINO-LASCONDES"
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 1247, alertas_mes: 89 },
    alertsByComuna: DEMO_ALERTS_BY_COMUNA,
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=las-condes"
  },
  providencia: {
    slug: "providencia",
    label: "Providencia",
    municipality: {
      nombre: "Municipalidad de Providencia",
      slug: "providencia",
      programa: "Adulto Mayor Conectado",
      codigo_descuento: "VECINO-PROVIDENCIA"
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 892, alertas_mes: 64, casos_criticos_mes: 9 },
    alertsByComuna: [
      { comuna: "Providencia", alertas: 28 },
      { comuna: "Las Condes", alertas: 14 },
      { comuna: "Ñuñoa", alertas: 12 }
    ],
    alerts: DEMO_ALERTS.map(
      (a, i) => i === 1 ? { ...a, comuna: "Providencia", senior_nombre: "Pedro Ramírez" } : a
    ),
    meetingUrl: "/demo?institucion=providencia"
  },
  nunoa: {
    slug: "nunoa",
    label: "Ñuñoa",
    municipality: {
      nombre: "Municipalidad de Ñuñoa",
      slug: "nunoa",
      programa: "Red Mayor Segura",
      codigo_descuento: "VECINO-NUNOA"
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 654, alertas_mes: 52, cobertura_comunas: 5 },
    alertsByComuna: [
      { comuna: "Ñuñoa", alertas: 22 },
      { comuna: "Providencia", alertas: 15 },
      { comuna: "Macul", alertas: 8 }
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=nunoa"
  },
  vitacura: {
    slug: "vitacura",
    label: "Vitacura",
    municipality: {
      nombre: "Municipalidad de Vitacura",
      slug: "vitacura",
      programa: "Senior Safe Vitacura",
      codigo_descuento: "VECINO-VITACURA"
    },
    kpis: { ...BASE_KPIS, usuarios_protegidos: 428, alertas_mes: 31, familiares_vinculados: 980 },
    alertsByComuna: [
      { comuna: "Vitacura", alertas: 18 },
      { comuna: "Las Condes", alertas: 8 }
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=vitacura"
  },
  maipu: {
    slug: "maipu",
    label: "Maipú",
    municipality: {
      nombre: "Municipalidad de Maipú",
      slug: "maipu",
      programa: "Adulto Mayor Protegido",
      codigo_descuento: "VECINO-MAIPU"
    },
    kpis: {
      ...BASE_KPIS,
      usuarios_protegidos: 2103,
      alertas_mes: 112,
      casos_criticos_mes: 18,
      cobertura_comunas: 12
    },
    alertsByComuna: [
      { comuna: "Maipú", alertas: 45 },
      { comuna: "Estación Central", alertas: 22 }
    ],
    alerts: DEMO_ALERTS,
    meetingUrl: "/demo?institucion=maipu"
  }
};
function resolveDemoInstitution(slug) {
  const key = slug?.trim().toLowerCase() ?? "las-condes";
  return DEMO_INSTITUTION_PRESETS[key] ?? DEMO_INSTITUTION_PRESETS["las-condes"];
}
const ALGORITHM = "ecosystem_v4_cascade_15_30";
const SMS_DELAY = 0;
const WA_DELAY = 15e3;
const CALL_DELAY = 3e4;
function mapsLink(lat, lng) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}
function createDemoEmergencyCase() {
  const senior = DEMO_SENIORS[0];
  const lat = -33.4172;
  const lng = -70.6062;
  const now = Date.now();
  const id = `demo-sos-${now}`;
  const contacts = DEMO_GUARDIANS.slice(0, 3);
  const steps = [];
  for (const c of contacts.filter((x) => x.recibe_sms)) {
    steps.push({
      phase: "sms",
      channel: "SMS",
      to: c.telefono,
      status: "delivered",
      message: `🚨 SOS Senior Safe — ${senior.nombre}. Ubicación: ${mapsLink(lat, lng)}. Responda: ${ALGORITHM}`,
      at: new Date(now + SMS_DELAY).toISOString()
    });
  }
  for (const c of contacts.filter((x) => x.recibe_whatsapp)) {
    steps.push({
      phase: "whatsapp",
      channel: "WhatsApp",
      to: c.telefono,
      status: "read",
      message: `Alerta de emergencia para ${senior.nombre}. Botón SOS activado.`,
      at: new Date(now + WA_DELAY).toISOString()
    });
  }
  return {
    id,
    seniorNombre: senior.nombre,
    gps: { lat, lng, accuracy: 12, mapsLink: mapsLink(lat, lng) },
    startedAt: new Date(now).toISOString(),
    steps,
    status: "running"
  };
}
function advanceDemoEmergency(caseData) {
  const contacts = DEMO_GUARDIANS.slice(0, 3);
  const now = Date.now();
  const base = new Date(caseData.startedAt).getTime();
  const hasCall = caseData.steps.some((s) => s.phase === "call");
  if (!hasCall) {
    const callSteps = contacts.filter((c) => c.recibe_llamada).map((c) => ({
      phase: "call",
      channel: "Llamada de voz",
      to: c.telefono,
      status: "skipped",
      message: "Escalación omitida: familiar confirmó recepción vía WhatsApp",
      at: new Date(base + CALL_DELAY).toISOString()
    }));
    return { ...caseData, steps: [...caseData.steps, ...callSteps], status: "acknowledged" };
  }
  const ackStep = {
    phase: "ack",
    channel: "Confirmación",
    to: contacts[0].nombre,
    status: "answered",
    message: "«Recibido, voy en camino» — vía enlace /a/…",
    at: new Date(now).toISOString()
  };
  const closedStep = {
    phase: "closed",
    channel: "Sistema",
    to: "Supervisión del programa (demo)",
    status: "delivered",
    message: "Caso cerrado. Tiempo de respuesta: 4 min 12 s",
    at: new Date(now + 500).toISOString()
  };
  return {
    ...caseData,
    steps: [...caseData.steps, ackStep, closedStep],
    status: "closed",
    closedAt: new Date(now + 500).toISOString()
  };
}
async function runDemoEmergencyTimeline(onUpdate, signal) {
  let current = createDemoEmergencyCase();
  onUpdate(current);
  await sleep(WA_DELAY, signal);
  current = advanceDemoEmergency(current);
  onUpdate(current);
  await sleep(2e3, signal);
  current = advanceDemoEmergency(current);
  onUpdate(current);
  return current;
}
function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
const DemoContext = reactExports.createContext(null);
function DemoProvider({
  children,
  institutionSlug
}) {
  const preset = reactExports.useMemo(() => resolveDemoInstitution(institutionSlug), [institutionSlug]);
  const [alerts, setAlerts] = reactExports.useState(() => [...preset.alerts]);
  const [activeEmergency, setActiveEmergency] = reactExports.useState(null);
  const [emergencyRunning, setEmergencyRunning] = reactExports.useState(false);
  const [presentationMode, setPresentationModeState] = reactExports.useState(() => isPresentationMode());
  const [abortRef, setAbortRef] = reactExports.useState(null);
  const setPresentation = reactExports.useCallback((v) => {
    setPresentationMode(v);
    setPresentationModeState(v);
  }, []);
  const cancelEmergency = reactExports.useCallback(() => {
    abortRef?.abort();
    setAbortRef(null);
    setEmergencyRunning(false);
  }, [abortRef]);
  const simulateEmergency = reactExports.useCallback(async () => {
    if (emergencyRunning) return;
    const ac = new AbortController();
    setAbortRef(ac);
    setEmergencyRunning(true);
    setActiveEmergency(null);
    try {
      const final = await runDemoEmergencyTimeline((c) => setActiveEmergency({ ...c }), ac.signal);
      setAlerts((prev) => [
        {
          id: final.id,
          event_type: "sos",
          status: "delivered",
          gps_lat: final.gps.lat,
          gps_lng: final.gps.lng,
          gps_accuracy: final.gps.accuracy,
          created_at: final.startedAt,
          acknowledged_at: final.closedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
          acknowledged_by: "Ana González (demo)",
          senior_id: "demo-senior-1",
          senior_nombre: final.seniorNombre,
          comuna: preset.municipality.slug === "las-condes" ? "Las Condes" : preset.label
        },
        ...prev
      ]);
    } catch {
    } finally {
      setEmergencyRunning(false);
      setAbortRef(null);
    }
  }, [emergencyRunning, preset.label, preset.municipality.slug]);
  const value = reactExports.useMemo(
    () => ({
      preset,
      alerts,
      activeEmergency,
      emergencyRunning,
      presentationMode,
      setPresentationMode: setPresentation,
      simulateEmergency,
      cancelEmergency
    }),
    [
      preset,
      alerts,
      activeEmergency,
      emergencyRunning,
      presentationMode,
      setPresentation,
      simulateEmergency,
      cancelEmergency
    ]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoContext.Provider, { value, children });
}
function useDemo() {
  const ctx = reactExports.useContext(DemoContext);
  if (!ctx) throw new Error("useDemo debe usarse dentro de DemoProvider");
  return ctx;
}
export {
  DemoProvider as D,
  DEMO_INSTITUTION_PRESETS as a,
  useDemo as u
};
