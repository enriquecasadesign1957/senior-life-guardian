import {
  emergencyCategoryMessageLine,
  type EmergencyCategory,
} from "@/lib/emergency-category";

export type SimulatorLogStatus = "pending" | "success" | "progress" | "info";

export type SimulatorLogEntry = {
  id: string;
  offsetMs: number;
  clock: string;
  message: string;
  status: SimulatorLogStatus;
  actionLabel?: string;
};

export const SIMULATOR_GPS = {
  lat: -33.4489,
  lng: -70.6693,
  label: "Plaza de Armas, Santiago, Chile",
};

export function buildSimulatorWhatsAppMessage(category: EmergencyCategory): string {
  const tipo = emergencyCategoryMessageLine(category);
  return `🚨 ALERTA SENIOR SAFE — María González

Tipo: ${tipo}
Botón S.O.S activado desde la app.

📍 Ubicación:
https://alarmaseniorsafe.cl/ubicacion?lat=-33.448900&lng=-70.669300&nombre=María+González

Responda RECIBIDO si va en camino.
Central Senior Safe · IA supervisando el caso.`;
}

export function buildSimulatorLogScript(category: EmergencyCategory): Omit<SimulatorLogEntry, "id">[] {
  const tipo = emergencyCategoryMessageLine(category);
  return [
  {
    offsetMs: 0,
    clock: "00:00",
    message: `Botón S.O.S presionado por usuario. Seleccionado el tipo de emergencia: ${tipo}.`,
    status: "info",
  },
  {
    offsetMs: 1000,
    clock: "00:01",
    message: `Geolocalización GPS obtenida exitosamente (${SIMULATOR_GPS.label}).`,
    status: "success",
  },
  {
    offsetMs: 1000,
    clock: "00:01",
    message: "Alerta enviada a Central Senior Safe con Inteligencia Artificial.",
    status: "success",
  },
  {
    offsetMs: 2000,
    clock: "00:02",
    message: "WhatsApp enviado con éxito al Contacto 1 (Hijo/a — Carmen R.)",
    status: "success",
    actionLabel: "Ver mensaje simulado",
  },
  {
    offsetMs: 2000,
    clock: "00:02",
    message: "SMS de respaldo enviado con éxito al Contacto 2 (Cuidador — Pedro M.)",
    status: "success",
  },
  {
    offsetMs: 3000,
    clock: "00:03",
    message: "Llamada de voz automatizada en curso al Contacto 3 (Vecina — Rosa L.)…",
    status: "progress",
  },
];
}

/** Latencia inicial tras elegir tipo de emergencia antes de mostrar el log. */
export const SIMULATOR_SENDING_MS = 2000;
