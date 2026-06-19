/**
 * Simulación de cascada SOS (ecosystem_v4_cascade_15_30) sin Twilio ni escritura en producción.
 * Réplica la lógica documentada en emergency-alert.functions.ts.
 */

import { DEMO_GUARDIANS, DEMO_SENIORS } from "@/lib/demo/demo-data";

export type DemoCascadeStep = {
  phase: "sms" | "whatsapp" | "call" | "ack" | "closed";
  channel: string;
  to: string;
  status: "sent" | "delivered" | "read" | "answered" | "skipped";
  message: string;
  at: string;
};

export type DemoEmergencyCase = {
  id: string;
  seniorNombre: string;
  gps: { lat: number; lng: number; accuracy: number; mapsLink: string };
  startedAt: string;
  closedAt?: string;
  steps: DemoCascadeStep[];
  status: "running" | "acknowledged" | "closed";
};

const ALGORITHM = "ecosystem_v4_cascade_15_30";
const SMS_DELAY = 0;
const WA_DELAY = 15_000;
const CALL_DELAY = 30_000;

function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function createDemoEmergencyCase(): DemoEmergencyCase {
  const senior = DEMO_SENIORS[0];
  const lat = -33.4172;
  const lng = -70.6062;
  const now = Date.now();
  const id = `demo-sos-${now}`;

  const contacts = DEMO_GUARDIANS.slice(0, 3);
  const steps: DemoCascadeStep[] = [];

  for (const c of contacts.filter((x) => x.recibe_sms)) {
    steps.push({
      phase: "sms",
      channel: "SMS",
      to: c.telefono,
      status: "delivered",
      message: `🚨 SOS Senior Safe — ${senior.nombre}. Ubicación: ${mapsLink(lat, lng)}. Responda: ${ALGORITHM}`,
      at: new Date(now + SMS_DELAY).toISOString(),
    });
  }

  for (const c of contacts.filter((x) => x.recibe_whatsapp)) {
    steps.push({
      phase: "whatsapp",
      channel: "WhatsApp",
      to: c.telefono,
      status: "read",
      message: `Alerta de emergencia para ${senior.nombre}. Botón SOS activado.`,
      at: new Date(now + WA_DELAY).toISOString(),
    });
  }

  return {
    id,
    seniorNombre: senior.nombre,
    gps: { lat, lng, accuracy: 12, mapsLink: mapsLink(lat, lng) },
    startedAt: new Date(now).toISOString(),
    steps,
    status: "running",
  };
}

export function advanceDemoEmergency(caseData: DemoEmergencyCase): DemoEmergencyCase {
  const contacts = DEMO_GUARDIANS.slice(0, 3);
  const now = Date.now();
  const base = new Date(caseData.startedAt).getTime();

  const hasCall = caseData.steps.some((s) => s.phase === "call");
  if (!hasCall) {
    const callSteps: DemoCascadeStep[] = contacts
      .filter((c) => c.recibe_llamada)
      .map((c) => ({
        phase: "call" as const,
        channel: "Llamada de voz",
        to: c.telefono,
        status: "skipped" as const,
        message: "Escalación omitida: familiar confirmó recepción vía WhatsApp",
        at: new Date(base + CALL_DELAY).toISOString(),
      }));
    return { ...caseData, steps: [...caseData.steps, ...callSteps], status: "acknowledged" };
  }

  const ackStep: DemoCascadeStep = {
    phase: "ack",
    channel: "Confirmación",
    to: contacts[0].nombre,
    status: "answered",
    message: "«Recibido, voy en camino» — vía enlace /a/…",
    at: new Date(now).toISOString(),
  };

  const closedStep: DemoCascadeStep = {
    phase: "closed",
    channel: "Sistema",
    to: "Supervisión del programa (demo)",
    status: "delivered",
    message: "Caso cerrado. Tiempo de respuesta: 4 min 12 s",
    at: new Date(now + 500).toISOString(),
  };

  return {
    ...caseData,
    steps: [...caseData.steps, ackStep, closedStep],
    status: "closed",
    closedAt: new Date(now + 500).toISOString(),
  };
}

export async function runDemoEmergencyTimeline(
  onUpdate: (c: DemoEmergencyCase) => void,
  signal?: AbortSignal,
): Promise<DemoEmergencyCase> {
  let current = createDemoEmergencyCase();
  onUpdate(current);

  await sleep(WA_DELAY, signal);
  current = advanceDemoEmergency(current);
  onUpdate(current);

  await sleep(2000, signal);
  current = advanceDemoEmergency(current);
  onUpdate(current);

  return current;
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
