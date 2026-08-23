import type { FaqItem } from "@/components/FaqAccordion";
import type { Locale } from "@/lib/i18n";

export type ConceptRow = {
  label: string;
  notification: string;
  escalation: string;
};

export type Scenario = {
  title: string;
  body: string;
};

export type HowStep = {
  title: string;
  body: string;
};

export type OnCallEscalationContent = {
  h1: string;
  heroSubheading: string;
  heroLead: string;
  heroBody: string;
  workflowSteps: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  whatIsTitle: string;
  whatIsIntro: string;
  whatIsSteps: string[];
  whyMattersTitle: string;
  whyMattersBody: string[];
  whyMattersClosing: string;
  howHandlesTitle: string;
  howSteps: HowStep[];
  vsNotificationTitle: string;
  conceptRows: ConceptRow[];
  whoNeedsTitle: string;
  whoNeedsBullets: string[];
  whoNeedsNote: string;
  scenariosTitle: string;
  scenarios: Scenario[];
  voiceTitle: string;
  voiceIntro: string;
  voiceBullets: string[];
  voiceClosing: string;
  pricingTitle: string;
  pricingBody: string;
  integrationsTitle: string;
  integrationsBody: string;
  integrationsList: string[];
  faqTitle: string;
  faqItems: FaqItem[];
  relatedPagerDuty: string;
  relatedWhatIs: string;
  relatedWebhook: string;
  relatedFaq: string;
  backHome: string;
  tableNotificationLabel: string;
  tableEscalationLabel: string;
};

const EN: OnCallEscalationContent = {
  h1: "On-Call Escalation That Reaches a Human",
  heroSubheading:
    "Turn critical alerts into phone calls, require a human acknowledgement, and escalate automatically when nobody responds.",
  heroLead: "A notification is not the same as a response.",
  heroBody:
    "WakeUp Dev is designed for critical alerts where someone needs to actually acknowledge the incident—not just receive another message on a screen.",
  workflowSteps: [
    "Critical alert",
    "HTTP webhook",
    "Phone call",
    "Press 1 to ACK",
    "Escalate if unanswered",
  ],
  ctaPrimary: "Start free — 5 voice alerts",
  ctaSecondary: "See how it works",
  whatIsTitle: "What is on-call escalation?",
  whatIsIntro:
    "On-call escalation is the process of moving a critical alert to another responder when the first person does not acknowledge it within the expected time.",
  whatIsSteps: [
    "A monitoring system detects a critical condition.",
    "The alert reaches the on-call responder.",
    "The responder receives a phone call.",
    "The responder presses 1 to acknowledge.",
    "If nobody answers or acknowledges, the alert moves to the next responder in the on-call cascade.",
  ],
  whyMattersTitle: "Why escalation matters",
  whyMattersBody: [
    "A missed notification can become a missed incident.",
    "Push notifications, email, chat, and dashboards are useful—but critical incidents sometimes require an explicit human response.",
  ],
  whyMattersClosing:
    "For alerts that require a human response, a phone call combined with explicit acknowledgement can provide a clearer escalation path.",
  howHandlesTitle: "How WakeUp Dev handles on-call escalation",
  howSteps: [
    {
      title: "Alert arrives",
      body: "Grafana, UptimeRobot, or another HTTP webhook source sends an alert to WakeUp Dev.",
    },
    {
      title: "WakeUp Dev calls the responder",
      body: "WakeUp Dev initiates a phone call to the first target in the configured on-call cascade—active shift phones, roster members, or your verified emergency number.",
    },
    {
      title: "Human acknowledgement",
      body: "During the call, the responder hears the alert summary and is prompted to press 1 on the phone keypad to acknowledge (ACK).",
    },
    {
      title: "Escalation",
      body: "If the call is not answered, fails, or completes without ACK, WakeUp Dev moves to the next phone number in the cascade until someone acknowledges or the cascade is exhausted.",
    },
  ],
  vsNotificationTitle: "On-call escalation vs notification",
  conceptRows: [
    {
      label: "Goal",
      notification: "Delivers an alert",
      escalation: "Seeks a response",
    },
    {
      label: "When nobody responds",
      notification: "May end with a push or email",
      escalation: "Continues if nobody acknowledges",
    },
    {
      label: "Confirmation",
      notification: "Depends on someone noticing",
      escalation: "Uses an explicit ACK",
    },
    {
      label: "Coverage",
      notification: "Often one notification channel",
      escalation: "Can move to the next responder",
    },
  ],
  whoNeedsTitle: "Who needs on-call escalation?",
  whoNeedsBullets: [
    "DevOps teams responsible for production systems",
    "SRE teams monitoring uptime and reliability",
    "Small engineering teams without a dedicated NOC",
    "Teams accountable for production uptime",
    "Developers maintaining critical services",
    "Teams that need alerts to reach a human outside normal working hours",
  ],
  whoNeedsNote:
    "WakeUp Dev is not limited to these groups—it is built for any team that needs voice-first critical alerting with human ACK and cascade escalation.",
  scenariosTitle: "Common on-call escalation scenarios",
  scenarios: [
    {
      title: "Production outage",
      body: "Monitoring detects that a critical service is unavailable. The alert triggers a phone call; if nobody ACKs, the on-call cascade continues.",
    },
    {
      title: "Database failure",
      body: "A critical database condition fires an alert. WakeUp Dev calls the on-call engineer and waits for press-1 acknowledgement before stopping escalation.",
    },
    {
      title: "API availability",
      body: "An uptime monitor detects repeated failures. The webhook becomes a phone call with explicit human ACK and escalation if unanswered.",
    },
    {
      title: "Infrastructure incident",
      body: "A monitoring system flags a production infrastructure problem. Alert → call → ACK → escalate if nobody responds.",
    },
  ],
  voiceTitle: "Voice-first escalation",
  voiceIntro:
    "WakeUp Dev focuses on the point where an alert needs to reach a person. The product combines:",
  voiceBullets: [
    "Phone calls",
    "Human acknowledgement",
    "On-call roster and shifts",
    "On-call cascade escalation",
  ],
  voiceClosing:
    "For critical alerts, teams may want a notification path that explicitly asks a human to respond—not merely that a message was delivered.",
  pricingTitle: "Pay per alert, not per seat",
  pricingBody:
    "WakeUp Dev charges based on dispatched alert volume rather than per-seat licensing. Pro plans include 50 monthly alerts; the trial includes 5 free voice alerts with GitHub sign-in. Add on-call users without adding another per-seat license.",
  integrationsTitle: "Integrations",
  integrationsBody:
    "WakeUp Dev accepts critical alerts from systems that send HTTP webhooks:",
  integrationsList: ["Grafana", "UptimeRobot", "HTTP webhooks"],
  faqTitle: "On-call escalation FAQ",
  faqItems: [
    {
      id: "what-is",
      question: "What is on-call escalation?",
      answer:
        "On-call escalation is moving a critical alert to the next responder when the first person does not acknowledge it in time. WakeUp Dev implements this as an on-call cascade of phone calls with press-1 acknowledgement.",
    },
    {
      id: "phone-based",
      question: "How does phone-based on-call escalation work?",
      answer:
        "A webhook alert triggers a phone call to the first on-call target. The responder presses 1 to ACK. If the call is unanswered, fails, or ends without ACK, WakeUp Dev calls the next number in the cascade.",
    },
    {
      id: "no-answer",
      question: "What happens when the first responder does not answer?",
      answer:
        "WakeUp Dev escalates to the next phone in the cascade—active shift phones, roster members ordered by escalation priority, or your verified emergency number. The cascade continues until someone ACKs or all targets are exhausted.",
    },
    {
      id: "human-ack",
      question: "What is a human acknowledgement?",
      answer:
        "ACK means a human confirms they received the alert. On a live call, WakeUp Dev asks the responder to press 1 on the keypad. Digit 1 marks the alert acknowledged and stops escalation for that incident.",
    },
    {
      id: "grafana",
      question: "Can Grafana trigger an on-call escalation?",
      answer:
        "Yes. Configure Grafana to send an HTTP webhook to WakeUp Dev. When the alert is accepted, the on-call cascade and phone-based escalation flow begins.",
    },
    {
      id: "uptimerobot",
      question: "Can UptimeRobot trigger an on-call escalation?",
      answer:
        "Yes. Point UptimeRobot webhook alerts to WakeUp Dev. WakeUp Dev requires the x-api-key header—check that your UptimeRobot webhook configuration supports custom HTTP headers before using this integration. The same phone call and cascade escalation behavior applies.",
    },
    {
      id: "per-user",
      question: "Does WakeUp Dev charge per user?",
      answer:
        "No. WakeUp Dev uses usage-based pricing per dispatched alert. Unlimited users are included in the workspace on Pro plans shown on the website.",
    },
    {
      id: "incident-platform",
      question: "Is WakeUp Dev an incident-management platform?",
      answer:
        "No. WakeUp Dev is focused on voice-first alerting, human acknowledgement, and on-call cascade escalation—not on being a full incident-management platform with broader workflows.",
    },
  ],
  relatedPagerDuty: "PagerDuty alternative",
  relatedWhatIs: "What is WakeUp Dev?",
  relatedWebhook: "Webhook to phone call",
  relatedFaq: "Read the FAQ",
  backHome: "← Back to home",
  tableNotificationLabel: "Notification",
  tableEscalationLabel: "Escalation",
};

const ES: OnCallEscalationContent = {
  h1: "Escalada on-call que llega a un humano",
  heroSubheading:
    "Convierte alertas críticas en llamadas, exige confirmación humana y escala automáticamente cuando nadie responde.",
  heroLead: "Una notificación no es lo mismo que una respuesta.",
  heroBody:
    "WakeUp Dev está pensado para alertas críticas donde alguien debe confirmar el incidente—no solo recibir otro mensaje en pantalla.",
  workflowSteps: [
    "Alerta crítica",
    "Webhook HTTP",
    "Llamada",
    "Presiona 1 para ACK",
    "Escalar si no hay respuesta",
  ],
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  ctaSecondary: "Ver cómo funciona",
  whatIsTitle: "¿Qué es la escalada on-call?",
  whatIsIntro:
    "La escalada on-call es el proceso de pasar una alerta crítica a otro responsable cuando la primera persona no la confirma a tiempo.",
  whatIsSteps: [
    "Un sistema de monitoreo detecta una condición crítica.",
    "La alerta llega al on-call.",
    "El responsable recibe una llamada telefónica.",
    "Presiona 1 para confirmar.",
    "Si nadie contesta o confirma, la alerta pasa al siguiente responsable en la cascada on-call.",
  ],
  whyMattersTitle: "Por qué importa la escalada",
  whyMattersBody: [
    "Una notificación perdida puede convertirse en un incidente perdido.",
    "Push, email, chat y dashboards son útiles—pero incidentes críticos a veces exigen respuesta humana explícita.",
  ],
  whyMattersClosing:
    "Para alertas que requieren respuesta humana, una llamada con confirmación explícita puede dar un camino de escalada más claro.",
  howHandlesTitle: "Cómo maneja WakeUp Dev la escalada on-call",
  howSteps: [
    {
      title: "Llega la alerta",
      body: "Grafana, UptimeRobot u otra fuente HTTP webhook envía una alerta a WakeUp Dev.",
    },
    {
      title: "WakeUp Dev llama al on-call",
      body: "WakeUp Dev inicia una llamada al primer objetivo en la cascada configurada—turnos activos, roster o teléfono de emergencia verificado.",
    },
    {
      title: "Confirmación humana",
      body: "Durante la llamada, el on-call escucha el resumen y se le pide presionar 1 en el teclado para confirmar (ACK).",
    },
    {
      title: "Escalada",
      body: "Si la llamada no se contesta, falla o termina sin ACK, WakeUp Dev pasa al siguiente número en la cascada hasta que alguien confirme o se agoten los objetivos.",
    },
  ],
  vsNotificationTitle: "Escalada on-call vs notificación",
  conceptRows: [
    {
      label: "Objetivo",
      notification: "Entrega una alerta",
      escalation: "Busca una respuesta",
    },
    {
      label: "Si nadie responde",
      notification: "Puede quedar en un push o email",
      escalation: "Continúa si nadie confirma",
    },
    {
      label: "Confirmación",
      notification: "Depende de que alguien la vea",
      escalation: "Usa un ACK explícito",
    },
    {
      label: "Cobertura",
      notification: "A menudo un solo canal",
      escalation: "Puede pasar al siguiente responsable",
    },
  ],
  whoNeedsTitle: "¿Quién necesita escalada on-call?",
  whoNeedsBullets: [
    "Equipos DevOps responsables de producción",
    "Equipos SRE de uptime y confiabilidad",
    "Equipos pequeños sin NOC dedicado",
    "Equipos accountable de disponibilidad",
    "Desarrolladores de servicios críticos",
    "Equipos que necesitan alertas fuera del horario laboral",
  ],
  whoNeedsNote:
    "WakeUp Dev no se limita a estos grupos—sirve a cualquier equipo que necesite alertas críticas por voz con ACK humano y cascada on-call.",
  scenariosTitle: "Escenarios comunes de escalada on-call",
  scenarios: [
    {
      title: "Caída de producción",
      body: "El monitoreo detecta un servicio crítico caído. La alerta dispara una llamada; si nadie confirma, continúa la cascada on-call.",
    },
    {
      title: "Fallo de base de datos",
      body: "Una condición crítica de base de datos dispara la alerta. WakeUp Dev llama al on-call y espera confirmación con dígito 1.",
    },
    {
      title: "Disponibilidad de API",
      body: "Un monitor de uptime detecta fallos repetidos. El webhook se convierte en llamada con ACK humano y escalada si no hay respuesta.",
    },
    {
      title: "Incidente de infraestructura",
      body: "El monitoreo señala un problema de infraestructura en producción. Alerta → llamada → ACK → escalar si nadie responde.",
    },
  ],
  voiceTitle: "Escalada voice-first",
  voiceIntro:
    "WakeUp Dev se enfoca en el momento en que una alerta debe llegar a una persona. El producto combina:",
  voiceBullets: [
    "Llamadas telefónicas",
    "Confirmación humana",
    "Roster y turnos on-call",
    "Escalada por cascada on-call",
  ],
  voiceClosing:
    "Para alertas críticas, los equipos pueden querer un canal que pida respuesta humana explícita—no solo que se entregó un mensaje.",
  pricingTitle: "Pago por alerta, no por asiento",
  pricingBody:
    "WakeUp Dev cobra por volumen de alertas despachadas, no por licencias por asiento. Los planes Pro incluyen 50 alertas mensuales; la prueba incluye 5 alertas de voz gratis con GitHub. Agrega usuarios on-call sin otra licencia por persona.",
  integrationsTitle: "Integraciones",
  integrationsBody:
    "WakeUp Dev acepta alertas críticas de sistemas que envían webhooks HTTP:",
  integrationsList: ["Grafana", "UptimeRobot", "Webhooks HTTP"],
  faqTitle: "FAQ — escalada on-call",
  faqItems: [
    {
      id: "what-is",
      question: "¿Qué es la escalada on-call?",
      answer:
        "Es pasar una alerta crítica al siguiente responsable cuando el primero no la confirma a tiempo. WakeUp Dev lo implementa como cascada on-call de llamadas con confirmación presionando 1.",
    },
    {
      id: "phone-based",
      question: "¿Cómo funciona la escalada on-call por teléfono?",
      answer:
        "Una alerta webhook dispara una llamada al primer on-call. El responsable presiona 1 para ACK. Si no contesta, falla o termina sin ACK, WakeUp Dev llama al siguiente número en la cascada.",
    },
    {
      id: "no-answer",
      question: "¿Qué pasa si el primer responsable no contesta?",
      answer:
        "WakeUp Dev escala al siguiente teléfono en la cascada—turnos activos, roster por orden de escalada o teléfono de emergencia verificado—hasta que alguien confirme o se agoten los objetivos.",
    },
    {
      id: "human-ack",
      question: "¿Qué es la confirmación humana?",
      answer:
        "ACK significa que un humano confirma haber recibido la alerta. En la llamada, WakeUp Dev pide presionar 1. Ese dígito marca la alerta confirmada y detiene la escalada para ese incidente.",
    },
    {
      id: "grafana",
      question: "¿Grafana puede disparar escalada on-call?",
      answer:
        "Sí. Configura Grafana para enviar un webhook HTTP a WakeUp Dev. Cuando la alerta se acepta, comienza la cascada on-call y el flujo de escalada por llamada.",
    },
    {
      id: "uptimerobot",
      question: "¿UptimeRobot puede disparar escalada on-call?",
      answer:
        "Sí. Apunta los webhooks de UptimeRobot a WakeUp Dev. WakeUp Dev exige el header x-api-key—comprueba que tu configuración de webhook en UptimeRobot permita headers HTTP personalizados antes de usar esta integración. Aplica el mismo comportamiento de llamada y cascada.",
    },
    {
      id: "per-user",
      question: "¿WakeUp Dev cobra por usuario?",
      answer:
        "No. WakeUp Dev usa precio por alerta despachada. Los planes Pro incluyen usuarios ilimitados en el workspace.",
    },
    {
      id: "incident-platform",
      question: "¿WakeUp Dev es una plataforma de gestión de incidentes?",
      answer:
        "No. WakeUp Dev se enfoca en alertas por voz, confirmación humana y escalada por cascada on-call—no en ser una plataforma completa de gestión de incidentes.",
    },
  ],
  relatedPagerDuty: "Alternativa a PagerDuty",
  relatedWhatIs: "Qué es WakeUp Dev",
  relatedWebhook: "Webhook a llamada",
  relatedFaq: "Leer el FAQ",
  backHome: "← Volver al inicio",
  tableNotificationLabel: "Notificación",
  tableEscalationLabel: "Escalada",
};

export function onCallEscalationContent(locale: Locale): OnCallEscalationContent {
  return locale === "es" ? ES : EN;
}

export function onCallEscalationJsonLd(
  content: OnCallEscalationContent,
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
        description: content.heroSubheading,
      },
      {
        "@type": "SoftwareApplication",
        name: "WakeUp Dev",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        description:
          "Voice-first on-call alerting with phone calls, human acknowledgement, and on-call cascade escalation.",
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
