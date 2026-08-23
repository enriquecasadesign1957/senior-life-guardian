import type { FaqItem } from "@/components/FaqAccordion";
import type { Locale } from "@/lib/i18n";

export type ComparisonRow = {
  label: string;
  wakeupDev: string;
  pagerduty: string;
};

export type PagerDutyAltContent = {
  h1: string;
  heroLead: string;
  heroBody: string;
  heroPositioning: string;
  ctaPrimary: string;
  ctaSecondary: string;
  vsTitle: string;
  vsIntro: string;
  comparisonRows: ComparisonRow[];
  betterFitTitle: string;
  betterFitBullets: string[];
  pagerdutyFitTitle: string;
  pagerdutyFitBullets: string[];
  workflowTitle: string;
  workflowSteps: string[];
  workflowBody: string;
  workflowOnCallLinkLabel: string;
  voiceTitle: string;
  voiceBody: string[];
  pricingTitle: string;
  pricingBody: string;
  integrationsTitle: string;
  integrationsBody: string;
  integrationsList: string[];
  faqTitle: string;
  faqItems: FaqItem[];
  relatedWhatIs: string;
  relatedWebhook: string;
  relatedOnCall: string;
  relatedFaq: string;
  backHome: string;
};

const EN: PagerDutyAltContent = {
  h1: "PagerDuty Alternative for Voice On-Call Alerts",
  heroLead: "Looking for a simpler way to wake up your on-call team?",
  heroBody:
    "WakeUp Dev turns critical alerts from Grafana, UptimeRobot, or HTTP webhooks into phone calls. The responder presses 1 to acknowledge the alert. If nobody responds, the on-call cascade continues.",
  heroPositioning:
    "WakeUp Dev is a voice-first on-call alerting product. It requires human acknowledgement and escalates when nobody responds—positioned as a focused alternative, not a full replacement for every PagerDuty use case.",
  ctaPrimary: "Start free — 5 voice alerts",
  ctaSecondary: "See how it works",
  vsTitle: "WakeUp Dev vs PagerDuty",
  vsIntro:
    "PagerDuty is a broader incident-management and on-call platform. WakeUp Dev is intentionally narrower: voice-first alerting with human ACK and escalation.",
  comparisonRows: [
    {
      label: "Primary focus",
      wakeupDev: "Voice-first on-call alerting",
      pagerduty: "Incident management / on-call platform",
    },
    {
      label: "Alert input",
      wakeupDev: "HTTP webhooks",
      pagerduty: "Monitoring and service integrations",
    },
    {
      label: "Phone calls",
      wakeupDev: "Core workflow — every dispatched alert triggers a call",
      pagerduty:
        "Available depending on plan, configuration, and notification rules",
    },
    {
      label: "Human acknowledgement",
      wakeupDev: "Press 1 on the phone keypad to ACK",
      pagerduty:
        "Supported through PagerDuty notification and response workflows",
    },
    {
      label: "Escalation",
      wakeupDev: "On-call cascade (shifts, roster, fallback phone)",
      pagerduty: "Escalation policies and on-call schedules",
    },
    {
      label: "Pricing model",
      wakeupDev: "Pay per dispatched alert",
      pagerduty: "Per-user pricing (plan-dependent)",
    },
    {
      label: "Team size / seats",
      wakeupDev: "No per-seat charge in the current WakeUp Dev model",
      pagerduty: "PagerDuty plans use per-user pricing",
    },
  ],
  betterFitTitle: "When WakeUp Dev may be a better fit",
  betterFitBullets: [
    "You mainly need critical alerts to reach a human by phone.",
    "You want explicit acknowledgement through the phone keypad.",
    "You want an automatic escalation path if nobody responds.",
    "You use Grafana, UptimeRobot, or another HTTP webhook source.",
    "You prefer usage-based alert pricing instead of paying per on-call seat.",
    "You want a focused alerting workflow rather than a broader incident-management platform.",
  ],
  pagerdutyFitTitle: "When PagerDuty may be the better fit",
  pagerdutyFitBullets: [
    "You need broader incident management beyond phone alerting.",
    "You rely on complex on-call schedules and rotation tooling.",
    "You want extensive escalation policies across many teams.",
    "You need multiple notification channels as part of one platform.",
    "You want deeper incident workflows, status pages, or enterprise processes.",
    "Your organization already standardizes on PagerDuty for operational response.",
  ],
  workflowTitle: "The WakeUp Dev workflow",
  workflowSteps: [
    "Critical alert",
    "HTTP webhook",
    "WakeUp Dev",
    "Phone call",
    "Press 1 to ACK",
    "Escalate if unanswered",
  ],
  workflowBody:
    "Your monitor sends an HTTP POST to WakeUp Dev. WakeUp Dev places a phone call to the on-call responder and waits for a human acknowledgement. If the call is unanswered or not acknowledged in time, the cascade continues to the next phone number.",
  workflowOnCallLinkLabel: "Learn how on-call escalation works →",
  voiceTitle: "Why voice-first?",
  voiceBody: [
    "Traditional alerting often relies on push notifications, email, chat, or other notification channels.",
    "WakeUp Dev focuses on the specific situation where an alert is important enough that a human needs to acknowledge it.",
    "A phone call does not guarantee that someone will respond—which is why WakeUp Dev combines phone call, explicit acknowledgement, and escalation.",
  ],
  pricingTitle: "Pay per alert, not per seat",
  pricingBody:
    "WakeUp Dev charges based on dispatched alert volume, not per-seat licenses. Pro plans include 50 monthly alerts; the trial includes 5 free voice alerts with GitHub sign-in. Add on-call users without adding another per-seat license.",
  integrationsTitle: "Integrations",
  integrationsBody:
    "WakeUp Dev accepts alerts from any system that can send HTTP webhooks:",
  integrationsList: ["Grafana", "UptimeRobot", "HTTP webhooks"],
  faqTitle: "PagerDuty alternative FAQ",
  faqItems: [
    {
      id: "complete-replacement",
      question: "Is WakeUp Dev a complete replacement for PagerDuty?",
      answer:
        "Not necessarily. WakeUp Dev is intentionally focused on voice-first alerting, human acknowledgement, and escalation—not on being a full incident-management platform. Teams that need PagerDuty's broader workflows may still choose PagerDuty.",
    },
    {
      id: "phone-calls",
      question: "Does WakeUp Dev make phone calls?",
      answer:
        "Yes. When an alert is accepted, WakeUp Dev initiates a phone call through Twilio to the on-call target. The alert payload is summarized for voice when Groq is configured.",
    },
    {
      id: "requires-ack",
      question: "Does WakeUp Dev require an acknowledgement?",
      answer:
        "Yes. During the call, the responder is prompted to press 1 on the phone keypad to acknowledge. Digit 1 marks the alert as acknowledged and stops escalation for that incident.",
    },
    {
      id: "no-answer",
      question: "What happens if nobody answers?",
      answer:
        "If the call is not answered, fails, or completes without ACK within the wait window, WakeUp Dev escalates to the next phone in the cascade—active shift phones, roster members by escalation order, or your verified emergency number—up to 8 attempts.",
    },
    {
      id: "grafana",
      question: "Can I use Grafana with WakeUp Dev?",
      answer:
        "Yes. Configure Grafana to POST to https://api.wakeupdev.com/v1/alert with your x-api-key header.",
    },
    {
      id: "uptimerobot",
      question: "Can I use UptimeRobot?",
      answer:
        "Yes. Point an UptimeRobot webhook alert to https://api.wakeupdev.com/v1/alert. WakeUp Dev requires the x-api-key header. Check that your UptimeRobot webhook configuration supports custom HTTP headers before using this integration.",
    },
    {
      id: "per-user",
      question: "Does WakeUp Dev charge per user?",
      answer:
        "No. WakeUp Dev uses usage-based pricing per dispatched alert. Unlimited users are included in the workspace on Pro plans shown on the website.",
    },
    {
      id: "who-should",
      question: "Who should consider WakeUp Dev?",
      answer:
        "Teams that need focused voice-first critical alerting—especially when webhook-to-phone-call with human ACK and automatic escalation is the primary requirement.",
    },
  ],
  relatedWhatIs: "What is WakeUp Dev?",
  relatedWebhook: "Webhook to phone call",
  relatedOnCall: "On-call escalation",
  relatedFaq: "Read the FAQ",
  backHome: "← Back to home",
};

const ES: PagerDutyAltContent = {
  h1: "Alternativa a PagerDuty para alertas on-call por voz",
  heroLead: "¿Buscas una forma más simple de despertar a tu equipo on-call?",
  heroBody:
    "WakeUp Dev convierte alertas críticas de Grafana, UptimeRobot o webhooks HTTP en llamadas telefónicas. El on-call presiona 1 para confirmar la alerta. Si nadie responde, continúa la cascada on-call.",
  heroPositioning:
    "WakeUp Dev es un producto de alertas on-call por voz. Exige confirmación humana y escala cuando nadie responde—una alternativa enfocada, no un reemplazo completo para todos los casos de uso de PagerDuty.",
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  ctaSecondary: "Ver cómo funciona",
  vsTitle: "WakeUp Dev vs PagerDuty",
  vsIntro:
    "PagerDuty es una plataforma más amplia de gestión de incidentes y on-call. WakeUp Dev es intencionalmente más acotado: alertas por voz con ACK humano y escalada.",
  comparisonRows: [
    {
      label: "Enfoque principal",
      wakeupDev: "Alertas on-call por voz",
      pagerduty: "Plataforma de gestión de incidentes / on-call",
    },
    {
      label: "Entrada de alertas",
      wakeupDev: "Webhooks HTTP",
      pagerduty: "Integraciones de monitoreo y servicios",
    },
    {
      label: "Llamadas telefónicas",
      wakeupDev: "Flujo central — cada alerta despachada dispara una llamada",
      pagerduty:
        "Disponible según plan, configuración y reglas de notificación",
    },
    {
      label: "Confirmación humana",
      wakeupDev: "Presiona 1 en el teléfono para ACK",
      pagerduty:
        "Soportado mediante flujos de notificación y respuesta de PagerDuty",
    },
    {
      label: "Escalada",
      wakeupDev: "Cascada on-call (turnos, roster, teléfono de respaldo)",
      pagerduty: "Políticas de escalada y horarios on-call",
    },
    {
      label: "Modelo de precios",
      wakeupDev: "Pago por alerta despachada",
      pagerduty: "Precio por usuario (según plan)",
    },
    {
      label: "Equipo / asientos",
      wakeupDev: "Sin cobro por asiento en el modelo actual de WakeUp Dev",
      pagerduty: "Los planes de PagerDuty usan precio por usuario",
    },
  ],
  betterFitTitle: "Cuándo WakeUp Dev puede encajar mejor",
  betterFitBullets: [
    "Necesitas que alertas críticas lleguen a un humano por teléfono.",
    "Quieres confirmación explícita mediante el teclado del teléfono.",
    "Quieres escalada automática si nadie responde.",
    "Usas Grafana, UptimeRobot u otra fuente HTTP webhook.",
    "Prefieres precio por uso de alertas en lugar de pagar por asiento on-call.",
    "Quieres un flujo de alertas enfocado, no una plataforma amplia de gestión de incidentes.",
  ],
  pagerdutyFitTitle: "Cuándo PagerDuty puede ser mejor opción",
  pagerdutyFitBullets: [
    "Necesitas gestión de incidentes más amplia que alertas telefónicas.",
    "Dependes de horarios on-call y rotaciones complejas.",
    "Quieres políticas de escalada extensas entre varios equipos.",
    "Necesitas múltiples canales de notificación en una sola plataforma.",
    "Quieres flujos de incidentes más profundos o procesos enterprise.",
    "Tu organización ya estandarizó PagerDuty para respuesta operacional.",
  ],
  workflowTitle: "El flujo de WakeUp Dev",
  workflowSteps: [
    "Alerta crítica",
    "Webhook HTTP",
    "WakeUp Dev",
    "Llamada",
    "Presiona 1 para ACK",
    "Escalar si no hay respuesta",
  ],
  workflowBody:
    "Tu monitor envía un POST HTTP a WakeUp Dev. WakeUp Dev llama al on-call y espera confirmación humana. Si la llamada no se contesta o no se confirma a tiempo, la cascada continúa al siguiente número.",
  workflowOnCallLinkLabel: "Cómo funciona la escalada on-call →",
  voiceTitle: "¿Por qué voz primero?",
  voiceBody: [
    "Las alertas tradicionales suelen depender de push, email, chat u otros canales.",
    "WakeUp Dev se enfoca en situaciones donde la alerta es lo bastante importante como para exigir confirmación humana.",
    "Una llamada no garantiza que alguien responda—por eso WakeUp Dev combina llamada, confirmación explícita y escalada.",
  ],
  pricingTitle: "Pago por alerta, no por asiento",
  pricingBody:
    "WakeUp Dev cobra por volumen de alertas despachadas, no por licencias por asiento. Los planes Pro incluyen 50 alertas mensuales; la prueba incluye 5 alertas de voz gratis con GitHub. Agrega usuarios on-call sin abrir otra licencia por persona.",
  integrationsTitle: "Integraciones",
  integrationsBody:
    "WakeUp Dev acepta alertas de cualquier sistema que envíe webhooks HTTP:",
  integrationsList: ["Grafana", "UptimeRobot", "Webhooks HTTP"],
  faqTitle: "FAQ — alternativa a PagerDuty",
  faqItems: [
    {
      id: "complete-replacement",
      question: "¿WakeUp Dev reemplaza por completo a PagerDuty?",
      answer:
        "No necesariamente. WakeUp Dev está enfocado en alertas por voz, confirmación humana y escalada—no en ser una plataforma completa de gestión de incidentes. Equipos que necesitan los flujos amplios de PagerDuty pueden seguir eligiéndolo.",
    },
    {
      id: "phone-calls",
      question: "¿WakeUp Dev hace llamadas telefónicas?",
      answer:
        "Sí. Cuando una alerta es aceptada, WakeUp Dev inicia una llamada vía Twilio al on-call. El payload se resume para voz cuando Groq está configurado.",
    },
    {
      id: "requires-ack",
      question: "¿WakeUp Dev exige confirmación?",
      answer:
        "Sí. Durante la llamada, se pide presionar 1 en el teclado. El dígito 1 marca la alerta como confirmada y detiene la escalada para ese incidente.",
    },
    {
      id: "no-answer",
      question: "¿Qué pasa si nadie contesta?",
      answer:
        "Si la llamada no se contesta, falla o termina sin ACK a tiempo, WakeUp Dev escala al siguiente teléfono en la cascada—turnos activos, roster por orden de escalada o teléfono de emergencia verificado—hasta 8 intentos.",
    },
    {
      id: "grafana",
      question: "¿Puedo usar Grafana con WakeUp Dev?",
      answer:
        "Sí. Configura Grafana para POST a https://api.wakeupdev.com/v1/alert con el header x-api-key.",
    },
    {
      id: "uptimerobot",
      question: "¿Puedo usar UptimeRobot?",
      answer:
        "Sí. Apunta una alerta webhook de UptimeRobot a https://api.wakeupdev.com/v1/alert. WakeUp Dev exige el header x-api-key. Comprueba que tu configuración de webhook en UptimeRobot permita headers HTTP personalizados antes de usar esta integración.",
    },
    {
      id: "per-user",
      question: "¿WakeUp Dev cobra por usuario?",
      answer:
        "No. WakeUp Dev usa precio por alerta despachada. Los planes Pro incluyen usuarios ilimitados en el workspace.",
    },
    {
      id: "who-should",
      question: "¿Quién debería considerar WakeUp Dev?",
      answer:
        "Equipos que necesitan alertas críticas por voz—especialmente cuando webhook → llamada → ACK humano → escalada es el requisito principal.",
    },
  ],
  relatedWhatIs: "Qué es WakeUp Dev",
  relatedWebhook: "Webhook a llamada",
  relatedOnCall: "Escalada on-call",
  relatedFaq: "Leer el FAQ",
  backHome: "← Volver al inicio",
};

export function pagerDutyAltContent(locale: Locale): PagerDutyAltContent {
  return locale === "es" ? ES : EN;
}

export function pagerDutyAltJsonLd(
  content: PagerDutyAltContent,
  pageUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: content.h1,
        description: content.heroBody,
      },
      {
        "@type": "SoftwareApplication",
        name: "WakeUp Dev",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        description:
          "Voice-first on-call alerting with phone calls, press-1 acknowledgement, and automatic escalation.",
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
