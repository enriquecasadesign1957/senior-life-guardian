import {
  emergencyCategoryMessageLine,
  type EmergencyCategory,
} from "@/lib/emergency-category";
import { DEMO_GUARDIANS, DEMO_SENIORS } from "@/lib/demo/demo-data";

export const DEMO_FLOW_GPS = {
  lat: -33.4172,
  lng: -70.6062,
  accuracy: 12,
  label: "Av. Apoquindo 4500 · Las Condes",
  mapsLink: "https://maps.google.com/?q=-33.4172,-70.6062",
};

/** Réplica del cuerpo SMS/WhatsApp de `buildEmergencyAlertMessage` (producción). */
export function buildDemoGuardianAlertMessage(category: EmergencyCategory = "salud"): string {
  const senior = DEMO_SENIORS[0];
  const { mapsLink } = DEMO_FLOW_GPS;
  const timestamp = new Date().toLocaleString("es-CL", { timeZone: "America/Santiago" });
  const ackUrl = "https://demo.alarmaseniorsafe.cl/a/demo-alert/ejemplo-token";

  const categoryBlock = `🏷️ Tipo de emergencia:\n${emergencyCategoryMessageLine(category)}`;
  const locationBlock = `📍 Ubicación (GPS preciso):\n${mapsLink}`;
  const confirmBlock =
    `✅ CONFIRMA QUE RECIBISTE ESTA ALERTA\n` +
    `Toca este enlace (evita la llamada a los 30 s):\n` +
    ackUrl;

  const details = [categoryBlock, locationBlock, `⏰ Hora:\n${timestamp}`].join("\n\n");

  return (
    `🚨 URGENTE ALERTA SENIOR\n\n` +
    `${senior.nombre} necesita ayuda.\n\n` +
    `${confirmBlock}\n\n` +
    `────────────────────\n` +
    `Detalle\n\n` +
    `${details}\n\n` +
    `Contacta de inmediato al usuario.`
  );
}

export function demoGuardianRecipient() {
  return DEMO_GUARDIANS[0];
}

export function demoSeniorName() {
  return DEMO_SENIORS[0].nombre;
}
