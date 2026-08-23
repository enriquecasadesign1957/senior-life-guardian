import type { FaqItem } from "@/components/FaqAccordion";
import type { Locale } from "@/lib/i18n";

export type FaqSection = {
  title: string;
  items: FaqItem[];
};

export type FaqPageContent = {
  h1: string;
  intro: string;
  sections: FaqSection[];
  ctaPrimary: string;
  relatedWhatIs: string;
  relatedWebhook: string;
};

const EN_ITEMS: FaqItem[] = [
  {
    id: "what-is",
    question: "What is WakeUp Dev?",
    answer:
      "WakeUp Dev is a voice-first on-call alerting platform. It receives critical alerts from monitoring systems via HTTP webhook, places a phone call to the on-call responder, and requires explicit acknowledgement by pressing 1 on the phone keypad.",
  },
  {
    id: "problem",
    question: "What problem does WakeUp Dev solve?",
    answer:
      "Push notifications, email, and chat can be missed when you are asleep or away from your desk. WakeUp Dev is designed for incidents where a human must actually respond—not just receive another notification.",
  },
  {
    id: "who-for",
    question: "Who is WakeUp Dev for?",
    answer:
      "DevOps engineers, SREs, and small teams that need critical production alerts to reach a human on call. It fits teams using Grafana, UptimeRobot, or any monitor that can send HTTP webhooks.",
  },
  {
    id: "how-work",
    question: "How does WakeUp Dev work?",
    answer:
      "Your monitor sends POST https://api.wakeupdev.com/v1/alert with your x-api-key. WakeUp Dev validates credits, summarizes the payload for voice when Groq is configured, starts an on-call cascade, and calls the first target. The responder presses 1 to ACK or the system escalates.",
  },
  {
    id: "pagerduty-alt",
    question: "Is WakeUp Dev an alternative to PagerDuty?",
    answer:
      "WakeUp Dev is a lightweight, voice-first option focused on webhook-to-phone-call alerting with human ACK and usage-based pricing (not per-seat licensing). It is not a full incident management suite like PagerDuty. Teams often use it when they need phone escalation without adding another seat license for every engineer.",
  },
  {
    id: "why-phone",
    question: "Why use a phone call for a critical alert?",
    answer:
      "A phone call can provide a more direct notification when someone may not be watching their usual alert channels—push, email, or chat. WakeUp Dev adds an explicit ACK step so you know someone confirmed the alert—not just that a message was delivered.",
  },
  {
    id: "what-ack",
    question: "What is ACK?",
    answer:
      "ACK (acknowledgement) means a human confirms they received the alert. During the call, WakeUp Dev asks the responder to press 1 on the keypad. When digit 1 is received, the alert is marked ACKNOWLEDGED and escalation stops for that incident.",
  },
  {
    id: "phone-ack-how",
    question: "How does phone acknowledgement work?",
    answer:
      "Twilio connects the call, plays a voice summary of the alert, then prompts: press 1 to confirm. The IVR callback records digit 1 and marks the alert acknowledged in the database via oncall_marcar_ack.",
  },
  {
    id: "no-answer",
    question: "What happens if nobody answers?",
    answer:
      "If the call is not answered, fails, or completes without ACK within the wait window (about 45 seconds while calling), WakeUp Dev claims the timeout and calls the next phone in the cascade—up to 8 attempts across shift phones, roster members, or your verified emergency number.",
  },
  {
    id: "escalation",
    question: "How does escalation work?",
    answer:
      "Targets are chosen in order: active on-call shift phones, then roster members sorted by orden_escalamiento, then your account verified emergency phone. Each failed or unanswered attempt moves to the next target until someone ACKs or the list is exhausted (EXHAUSTED).",
  },
  {
    id: "grafana",
    question: "Does WakeUp Dev work with Grafana?",
    answer:
      "Yes. Configure Grafana to send an HTTP webhook to POST /v1/alert with your x-api-key header. Send the alert body as plain text or JSON—WakeUp Dev reads the raw request body.",
  },
  {
    id: "uptimerobot",
    question: "Does WakeUp Dev work with UptimeRobot?",
    answer:
      "Yes. Point an UptimeRobot webhook alert to https://api.wakeupdev.com/v1/alert. WakeUp Dev requires the x-api-key header. Check that your UptimeRobot webhook configuration supports custom HTTP headers before using this integration. UptimeRobot's default webhook payload can be used as the alert body.",
  },
  {
    id: "webhooks",
    question: "Can I send HTTP webhooks from other systems?",
    answer:
      "Yes. Any system that can POST HTTP with a custom header can integrate. The endpoint expects POST, header x-api-key, and a request body up to 4000 bytes.",
  },
  {
    id: "other-monitor",
    question: "Can I connect another monitoring system?",
    answer:
      "Yes, as long as it supports outbound HTTP POST webhooks. There is no proprietary agent—only the public /v1/alert API.",
  },
  {
    id: "cascade-def",
    question: "What is an on-call cascade?",
    answer:
      "A cascade is the ordered list of phone numbers WakeUp Dev calls for one alert. It can include shift-based phones, a CSV-imported roster, and a fallback verified phone on the account.",
  },
  {
    id: "escalate-other",
    question: "Can alerts escalate to another responder?",
    answer:
      "Yes. Import multiple roster members with escalation order, or define weekly shifts. If the first person does not ACK, the next number is called automatically.",
  },
  {
    id: "roster",
    question: "How does the responder roster work?",
    answer:
      "In the dashboard you can import a CSV with columns: nombre, telefono, orden, email. orden (orden_escalamiento) sets call priority—1 is first. The same import replaces the roster atomically.",
  },
  {
    id: "pricing-trial",
    question: "What does the free trial include?",
    answer:
      "Signing up with GitHub includes 5 free voice alerts for testing. No credit card is required for the trial plan shown on the website.",
  },
  {
    id: "pricing-pro",
    question: "What are the Pro plans?",
    answer:
      "Pro International: 50 monthly alerts for $29 USD/month (Lemon Squeezy), +$0.50 USD per extra dispatched alert. Pro Chile: 50 monthly alerts for 25,000 CLP/month (Transbank Oneclick), +450 CLP per extra alert. Both include unlimited users.",
  },
  {
    id: "pricing-seats",
    question: "Do you charge per user or per seat?",
    answer:
      "No. WakeUp Dev charges based on dispatched alert volume, not per-seat licenses. You can add engineers to the workspace without opening a new license line for each person.",
  },
  {
    id: "security-api-key",
    question: "How are API keys stored?",
    answer:
      "API keys are stored as hashes in Supabase (with optional pepper on the Worker). The dashboard shows a newly generated key only once; the Worker validates x-api-key against the hash, never the plain text.",
  },
  {
    id: "security-auth",
    question: "How do I sign in to the dashboard?",
    answer:
      "GitHub OAuth is the primary sign-in method. After Chile checkout, a magic link can be sent to the payer email to claim the account without GitHub.",
  },
];

const ES_ITEMS: FaqItem[] = [
  {
    id: "what-is",
    question: "¿Qué es WakeUp Dev?",
    answer:
      "WakeUp Dev es una plataforma de alertas on-call por voz. Recibe alertas críticas de sistemas de monitoreo vía webhook HTTP, llama al on-call y exige confirmación explícita presionando 1 en el teclado del teléfono.",
  },
  {
    id: "problem",
    question: "¿Qué problema resuelve WakeUp Dev?",
    answer:
      "Push, email y chat se pueden perder si estás dormido o lejos del escritorio. WakeUp Dev está pensado para incidentes donde un humano debe responder de verdad—no solo recibir otra notificación.",
  },
  {
    id: "who-for",
    question: "¿Para quién es WakeUp Dev?",
    answer:
      "Ingenieros DevOps, SRE y equipos pequeños que necesitan que las alertas críticas de producción lleguen a un humano on-call. Encaja con Grafana, UptimeRobot o cualquier monitor que envíe webhooks HTTP.",
  },
  {
    id: "how-work",
    question: "¿Cómo funciona WakeUp Dev?",
    answer:
      "Tu monitor envía POST https://api.wakeupdev.com/v1/alert con tu x-api-key. WakeUp Dev valida créditos, resume el payload para voz cuando Groq está configurado, inicia la cascada on-call y llama al primer objetivo. El responsable presiona 1 para ACK o el sistema escala.",
  },
  {
    id: "pagerduty-alt",
    question: "¿WakeUp Dev es una alternativa a PagerDuty?",
    answer:
      "WakeUp Dev es una opción ligera y voice-first enfocada en webhook → llamada con ACK humano y precio por uso (no por asiento). No es una suite completa de gestión de incidentes como PagerDuty. Los equipos lo usan cuando necesitan escalada telefónica sin otra licencia por ingeniero.",
  },
  {
    id: "why-phone",
    question: "¿Por qué usar una llamada para una alerta crítica?",
    answer:
      "Una llamada puede ofrecer una notificación más directa cuando alguien puede no estar mirando sus canales habituales de alerta—push, email o chat. WakeUp Dev añade un ACK explícito para saber que alguien confirmó la alerta—no solo que se entregó un mensaje.",
  },
  {
    id: "what-ack",
    question: "¿Qué es ACK?",
    answer:
      "ACK (acknowledgement) significa que un humano confirma haber recibido la alerta. Durante la llamada, WakeUp Dev pide presionar 1. Cuando llega el dígito 1, la alerta se marca ACKNOWLEDGED y se detiene la escalada de ese incidente.",
  },
  {
    id: "phone-ack-how",
    question: "¿Cómo funciona la confirmación por teléfono?",
    answer:
      "Twilio conecta la llamada, reproduce un resumen de voz de la alerta y pide: presiona 1 para confirmar. El callback IVR registra el dígito 1 y marca la alerta confirmada en la base de datos vía oncall_marcar_ack.",
  },
  {
    id: "no-answer",
    question: "¿Qué pasa si nadie contesta?",
    answer:
      "Si la llamada no se contesta, falla o termina sin ACK en la ventana de espera (unos 45 segundos mientras llama), WakeUp Dev registra el timeout y llama al siguiente teléfono de la cascada—hasta 8 intentos entre turnos, roster o teléfono de emergencia verificado.",
  },
  {
    id: "escalation",
    question: "¿Cómo funciona la escalada?",
    answer:
      "Los objetivos se eligen en orden: teléfonos de turnos on-call activos, luego miembros del roster por orden_escalamiento, luego el teléfono de emergencia verificado de la cuenta. Cada intento fallido o sin respuesta pasa al siguiente hasta que alguien confirme o se agote la lista (EXHAUSTED).",
  },
  {
    id: "grafana",
    question: "¿WakeUp Dev funciona con Grafana?",
    answer:
      "Sí. Configura Grafana para enviar un webhook HTTP a POST /v1/alert con el header x-api-key. Envía el body como texto plano o JSON—WakeUp Dev lee el body crudo.",
  },
  {
    id: "uptimerobot",
    question: "¿WakeUp Dev funciona con UptimeRobot?",
    answer:
      "Sí. Apunta una alerta webhook de UptimeRobot a https://api.wakeupdev.com/v1/alert. WakeUp Dev exige el header x-api-key. Comprueba que tu configuración de webhook en UptimeRobot permita headers HTTP personalizados antes de usar esta integración. El payload webhook por defecto de UptimeRobot puede usarse como body de la alerta.",
  },
  {
    id: "webhooks",
    question: "¿Puedo enviar webhooks HTTP desde otros sistemas?",
    answer:
      "Sí. Cualquier sistema que pueda hacer POST HTTP con un header personalizado puede integrarse. El endpoint espera POST, header x-api-key y un body de hasta 4000 bytes.",
  },
  {
    id: "other-monitor",
    question: "¿Puedo conectar otro sistema de monitoreo?",
    answer:
      "Sí, siempre que soporte webhooks HTTP POST salientes. No hay agente propietario—solo la API pública /v1/alert.",
  },
  {
    id: "cascade-def",
    question: "¿Qué es una cascada on-call?",
    answer:
      "Una cascada es la lista ordenada de teléfonos que WakeUp Dev llama para una alerta. Puede incluir teléfonos de turnos, un roster importado por CSV y un teléfono de emergencia verificado de respaldo.",
  },
  {
    id: "escalate-other",
    question: "¿Las alertas pueden escalar a otro responsable?",
    answer:
      "Sí. Importa varios miembros del roster con orden de escalada, o define turnos semanales. Si el primero no confirma, se llama automáticamente al siguiente número.",
  },
  {
    id: "roster",
    question: "¿Cómo funciona el roster de responsables?",
    answer:
      "En el dashboard puedes importar un CSV con columnas: nombre, telefono, orden, email. orden (orden_escalamiento) define la prioridad de llamada—1 es el primero. La misma importación reemplaza el roster de forma atómica.",
  },
  {
    id: "pricing-trial",
    question: "¿Qué incluye la prueba gratuita?",
    answer:
      "Registrarte con GitHub incluye 5 alertas de voz gratis para pruebas. No se pide tarjeta de crédito en el plan de prueba mostrado en el sitio.",
  },
  {
    id: "pricing-pro",
    question: "¿Cuáles son los planes Pro?",
    answer:
      "Pro International: 50 alertas mensuales por $29 USD/mes (Lemon Squeezy), +$0.50 USD por alerta extra despachada. Pro Chile: 50 alertas mensuales por 25.000 CLP/mes (Transbank Oneclick), +450 CLP por alerta extra. Ambos incluyen usuarios ilimitados.",
  },
  {
    id: "pricing-seats",
    question: "¿Cobran por usuario o por asiento?",
    answer:
      "No. WakeUp Dev cobra por volumen de alertas despachadas, no por licencias por asiento. Puedes agregar ingenieros al workspace sin abrir otra línea de licencia por persona.",
  },
  {
    id: "security-api-key",
    question: "¿Cómo se almacenan las API keys?",
    answer:
      "Las API keys se almacenan como hashes en Supabase (con pepper opcional en el Worker). El dashboard muestra una key nueva solo una vez; el Worker valida x-api-key contra el hash, nunca el texto en claro.",
  },
  {
    id: "security-auth",
    question: "¿Cómo inicio sesión en el dashboard?",
    answer:
      "GitHub OAuth es el método principal. Tras el checkout en Chile, se puede enviar un magic link al email del pagador para reclamar la cuenta sin GitHub.",
  },
];

function sectionsFromItems(
  items: FaqItem[],
  titles: [string, string, string, string, string, string]
): FaqSection[] {
  return [
    { title: titles[0], items: items.slice(0, 5) },
    { title: titles[1], items: items.slice(5, 10) },
    { title: titles[2], items: items.slice(10, 14) },
    { title: titles[3], items: items.slice(14, 17) },
    { title: titles[4], items: items.slice(17, 20) },
    { title: titles[5], items: items.slice(20) },
  ];
}

const EN: FaqPageContent = {
  h1: "WakeUp Dev FAQ",
  intro:
    "Voice on-call alerts, human ACK, escalation, integrations, and pricing—based on what WakeUp Dev implements today.",
  sections: sectionsFromItems(EN_ITEMS, [
    "General",
    "Alerts and acknowledgement",
    "Integrations",
    "On-call",
    "Pricing",
    "Security",
  ]),
  ctaPrimary: "Start free — 5 voice alerts",
  relatedWhatIs: "What is WakeUp Dev?",
  relatedWebhook: "Webhook to phone call",
};

const ES: FaqPageContent = {
  h1: "FAQ de WakeUp Dev",
  intro:
    "Alertas on-call por voz, ACK humano, escalada, integraciones y precios—según lo que WakeUp Dev implementa hoy.",
  sections: sectionsFromItems(ES_ITEMS, [
    "General",
    "Alertas y confirmación",
    "Integraciones",
    "On-call",
    "Precios",
    "Seguridad",
  ]),
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  relatedWhatIs: "¿Qué es WakeUp Dev?",
  relatedWebhook: "Webhook a llamada",
};

/** EN FAQ items for JSON-LD (default locale). */
export const FAQ_ITEMS = EN_ITEMS;

export function faqPageContent(locale: Locale): FaqPageContent {
  return locale === "es" ? ES : EN;
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
