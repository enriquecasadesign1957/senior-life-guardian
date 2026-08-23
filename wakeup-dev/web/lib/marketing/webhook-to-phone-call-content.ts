import type { Locale } from "@/lib/i18n";
import { API_ALERT_URL } from "@/lib/seo";

export type WebhookToPhoneContent = {
  h1: string;
  lead: string;
  flowSteps: string[];
  apiTitle: string;
  apiIntro: string;
  apiCurl: string;
  apiSuccess: string;
  whyTitle: string;
  whyBullets: string[];
  questionsTitle: string;
  questions: { q: string; a: string }[];
  relatedFaq: string;
  ctaPrimary: string;
  relatedWhatIs: string;
};

const EXAMPLE_CURL = `curl -X POST ${API_ALERT_URL} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"API production down - HTTP 503"}'`;

const EN: WebhookToPhoneContent = {
  h1: "Turn Webhooks Into Phone Calls",
  lead:
    "WakeUp Dev connects monitoring webhooks to voice calls with human acknowledgement—built for DevOps and SRE on-call workflows.",
  flowSteps: [
    "Monitoring system",
    "HTTP webhook",
    "WakeUp Dev",
    "Phone call",
    "Press 1 to acknowledge",
    "Escalation if unanswered",
  ],
  apiTitle: "API example",
  apiIntro:
    "The public alert endpoint accepts the raw alert body (plain text or JSON). Authentication is via the x-api-key header.",
  apiCurl: EXAMPLE_CURL,
  apiSuccess:
    "On success the API returns HTTP 202 with accepted: true and starts the cascade asynchronously. One credit is consumed when the alert is accepted.",
  whyTitle: "Why use phone calls for critical alerts?",
  whyBullets: [
    "Push notifications can be silenced or ignored when the phone is in Do Not Disturb.",
    "Email may not be read immediately during an overnight incident.",
    "A phone call can demand attention in a different way than text channels.",
    "WakeUp Dev adds explicit ACK (press 1) so you know someone confirmed—not just that a notification was sent.",
  ],
  questionsTitle: "Quick questions",
  questions: [
    {
      q: "What is a webhook-to-phone-call alert?",
      a: "Your monitor sends HTTP POST to WakeUp Dev; WakeUp Dev places a voice call instead of (or in addition to) passive notifications.",
    },
    {
      q: "How does WakeUp Dev acknowledge an alert?",
      a: "During the call, the responder presses 1. That digit is captured via Twilio Gather and marks the alert ACKNOWLEDGED.",
    },
    {
      q: "What happens if nobody answers?",
      a: "WakeUp Dev escalates to the next phone in the cascade—shift roster, team members by order, or your verified emergency number—up to 8 attempts.",
    },
    {
      q: "Can I use any monitoring system that supports HTTP webhooks?",
      a: "Yes. Grafana, UptimeRobot, and custom scripts that can POST with a custom header are supported. WakeUp Dev requires the x-api-key header—for UptimeRobot, check that your webhook configuration supports custom HTTP headers before using this integration.",
    },
  ],
  relatedFaq: "Full FAQ →",
  ctaPrimary: "Start free — 5 voice alerts",
  relatedWhatIs: "What is WakeUp Dev?",
};

const ES: WebhookToPhoneContent = {
  h1: "Convierte webhooks en llamadas telefónicas",
  lead:
    "WakeUp Dev conecta webhooks de monitoreo con llamadas de voz y confirmación humana—pensado para flujos on-call de DevOps y SRE.",
  flowSteps: [
    "Sistema de monitoreo",
    "HTTP webhook",
    "WakeUp Dev",
    "Llamada",
    "Presiona 1 para confirmar",
    "Escalada si no hay respuesta",
  ],
  apiTitle: "Ejemplo de API",
  apiIntro:
    "El endpoint público de alertas acepta el body crudo (texto plano o JSON). La autenticación va en el header x-api-key.",
  apiCurl: EXAMPLE_CURL,
  apiSuccess:
    "Si se acepta, la API responde HTTP 202 con accepted: true e inicia la cascada de forma asíncrona. Se consume un crédito al aceptar la alerta.",
  whyTitle: "¿Por qué usar llamadas para alertas críticas?",
  whyBullets: [
    "Las notificaciones push se pueden silenciar o ignorar en No molestar.",
    "El email puede no leerse de inmediato en un incidente nocturno.",
    "Una llamada puede pedir atención de forma distinta a los canales de texto.",
    "WakeUp Dev añade ACK explícito (presiona 1) para saber que alguien confirmó—no solo que se envió una notificación.",
  ],
  questionsTitle: "Preguntas rápidas",
  questions: [
    {
      q: "¿Qué es una alerta webhook → llamada?",
      a: "Tu monitor envía HTTP POST a WakeUp Dev; WakeUp Dev hace una llamada de voz en lugar de (o además de) notificaciones pasivas.",
    },
    {
      q: "¿Cómo confirma WakeUp Dev una alerta?",
      a: "Durante la llamada, el responsable presiona 1. Ese dígito se captura vía Twilio Gather y marca la alerta ACKNOWLEDGED.",
    },
    {
      q: "¿Qué pasa si nadie contesta?",
      a: "WakeUp Dev escala al siguiente teléfono de la cascada—turnos, miembros del equipo por orden o teléfono de emergencia verificado—hasta 8 intentos.",
    },
    {
      q: "¿Puedo usar cualquier sistema de monitoreo con webhooks HTTP?",
      a: "Sí. Grafana, UptimeRobot y scripts personalizados que puedan hacer POST con un header personalizado están soportados. WakeUp Dev exige el header x-api-key—en UptimeRobot, comprueba que tu configuración de webhook permita headers HTTP personalizados antes de usar esta integración.",
    },
  ],
  relatedFaq: "FAQ completo →",
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  relatedWhatIs: "¿Qué es WakeUp Dev?",
};

export function webhookToPhoneCallContent(
  locale: Locale
): WebhookToPhoneContent {
  return locale === "es" ? ES : EN;
}
