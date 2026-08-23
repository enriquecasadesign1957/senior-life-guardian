import type { Locale } from "@/lib/i18n";
import { API_ALERT_URL } from "@/lib/seo";

export type WhatIsContent = {
  h1: string;
  lead: string;
  body: string;
  problemTitle: string;
  problemBody: string;
  whoTitle: string;
  whoBullets: string[];
  howTitle: string;
  howSteps: string[];
  ackTitle: string;
  ackBody: string;
  integrationsTitle: string;
  integrations: { name: string; detail: string }[];
  ctaBody: string;
  ctaPrimary: string;
  relatedWebhook: string;
  relatedFaq: string;
  backHome: string;
};

const EN: WhatIsContent = {
  h1: "What is WakeUp Dev?",
  lead:
    "WakeUp Dev is a voice-first on-call alerting platform for critical technical incidents.",
  body: `When Grafana, UptimeRobot, or any HTTP-capable monitor fires an alert, WakeUp Dev can turn that webhook into a phone call to the engineer on call—not just another push notification. The responder must press 1 to acknowledge (ACK). If nobody answers or ACKs in time, the alert escalates through your configured on-call cascade.`,
  problemTitle: "What problem does it solve?",
  problemBody:
    "Critical alerts sent only to Slack, email, or mobile push can be missed at 3 AM. WakeUp Dev is for teams that need a human to actually respond during incident response—not merely be notified.",
  whoTitle: "Who uses WakeUp Dev?",
  whoBullets: [
    "DevOps and SRE engineers on call",
    "Small teams without per-seat budget for classic paging tools",
    "Teams in Chile and internationally (CLP and USD billing paths)",
  ],
  howTitle: "How WakeUp Dev works",
  howSteps: [
    "A monitoring system generates a critical alert.",
    `WakeUp Dev receives the alert at POST ${API_ALERT_URL} with your x-api-key.`,
    "WakeUp Dev validates credits, summarizes the payload for voice (when Groq is configured), and starts the on-call cascade.",
    "WakeUp Dev initiates a phone call to the first on-call target.",
    "The on-call responder hears the alert and presses 1 to acknowledge.",
    "If nobody acknowledges within the wait window, or the call is unanswered, WakeUp Dev escalates to the next phone in the cascade (shift roster, team CSV, or verified emergency number).",
  ],
  ackTitle: "Don't just notify. Get an acknowledgement.",
  ackBody:
    "Traditional notifications tell you that something happened. WakeUp Dev is designed for situations where someone needs to actually respond. A phone call plus digit-1 ACK gives you a clearer signal that a human confirmed the alert—not that a message was merely delivered to a device.",
  integrationsTitle: "Integrations",
  integrations: [
    { name: "Grafana", detail: "HTTP contact point / webhook" },
    { name: "UptimeRobot", detail: "webhook alerts" },
    {
      name: "HTTP webhooks",
      detail: "any monitor that can POST with a custom header",
    },
  ],
  ctaBody:
    "WakeUp Dev is designed as a lightweight voice-first alternative for teams that need critical alerts to reach a human—without adding a per-seat license for every engineer on the rotation.",
  ctaPrimary: "Start free — 5 voice alerts",
  relatedWebhook: "See how webhooks become calls",
  relatedFaq: "Read the FAQ",
  backHome: "← Back to home",
};

const ES: WhatIsContent = {
  h1: "¿Qué es WakeUp Dev?",
  lead:
    "WakeUp Dev es una plataforma de alertas on-call por voz para incidentes técnicos críticos.",
  body: `Cuando Grafana, UptimeRobot o cualquier monitor HTTP dispara una alerta, WakeUp Dev puede convertir ese webhook en una llamada al ingeniero on-call—no solo otro push. El responsable debe presionar 1 para confirmar (ACK). Si nadie contesta o confirma a tiempo, la alerta escala por la cascada on-call configurada.`,
  problemTitle: "¿Qué problema resuelve?",
  problemBody:
    "Las alertas críticas solo en Slack, email o push se pueden perder a las 3 AM. WakeUp Dev es para equipos que necesitan que un humano responda de verdad durante la respuesta a incidentes—no solo que lo notifiquen.",
  whoTitle: "¿Quién usa WakeUp Dev?",
  whoBullets: [
    "Ingenieros DevOps y SRE on-call",
    "Equipos pequeños sin presupuesto por asiento para herramientas clásicas de paging",
    "Equipos en Chile e internacionalmente (facturación CLP y USD)",
  ],
  howTitle: "Cómo funciona WakeUp Dev",
  howSteps: [
    "Un sistema de monitoreo genera una alerta crítica.",
    `WakeUp Dev recibe la alerta en POST ${API_ALERT_URL} con tu x-api-key.`,
    "WakeUp Dev valida créditos, resume el payload para voz (cuando Groq está configurado) e inicia la cascada on-call.",
    "WakeUp Dev inicia una llamada al primer objetivo on-call.",
    "El on-call escucha la alerta y presiona 1 para confirmar.",
    "Si nadie confirma en la ventana de espera, o la llamada no se contesta, WakeUp Dev escala al siguiente teléfono de la cascada (turnos, CSV del equipo o teléfono de emergencia verificado).",
  ],
  ackTitle: "No solo notifiques. Obtén una confirmación.",
  ackBody:
    "Las notificaciones tradicionales te dicen que algo pasó. WakeUp Dev está pensado para situaciones donde alguien debe responder de verdad. Una llamada más ACK con dígito 1 da una señal más clara de que un humano confirmó la alerta—no solo de que un mensaje llegó a un dispositivo.",
  integrationsTitle: "Integraciones",
  integrations: [
    { name: "Grafana", detail: "contact point / webhook HTTP" },
    { name: "UptimeRobot", detail: "alertas webhook" },
    {
      name: "Webhooks HTTP",
      detail: "cualquier monitor que pueda hacer POST con un header personalizado",
    },
  ],
  ctaBody:
    "WakeUp Dev está pensado como alternativa ligera voice-first para equipos que necesitan que las alertas críticas lleguen a un humano—sin añadir una licencia por asiento por cada ingeniero en la rotación.",
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  relatedWebhook: "Ver cómo los webhooks se convierten en llamadas",
  relatedFaq: "Leer el FAQ",
  backHome: "← Volver al inicio",
};

export function whatIsWakeUpDevContent(locale: Locale): WhatIsContent {
  return locale === "es" ? ES : EN;
}
