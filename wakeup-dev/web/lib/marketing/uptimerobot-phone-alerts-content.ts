import type { FaqItem } from "@/components/FaqAccordion";
import type { Locale } from "@/lib/i18n";
import { API_ALERT_URL } from "@/lib/seo";

export type HowStep = {
  title: string;
  body: string;
};

export type UptimeRobotPhoneAlertsContent = {
  h1: string;
  heroSubheading: string;
  heroLead: string;
  heroBody: string;
  flowSteps: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  sendTitle: string;
  sendIntro: string[];
  architectureTitle: string;
  architectureSteps: string[];
  howTitle: string;
  howSteps: HowStep[];
  configTitle: string;
  configIntro: string;
  configSteps: string[];
  configFactsTitle: string;
  configFacts: string[];
  configDifferenceNote: string;
  exampleTitle: string;
  exampleManualTitle: string;
  exampleManualIntro: string;
  exampleCurl: string;
  exampleManualNote: string;
  exampleUptimeRobotTitle: string;
  exampleUptimeRobotBody: string;
  exampleSuccess: string;
  whyTitle: string;
  whyBullets: string[];
  afterTitle: string;
  afterBody: string[];
  pricingTitle: string;
  pricingBody: string;
  integrationsTitle: string;
  integrationsBody: string;
  integrationsList: string[];
  faqTitle: string;
  faqItems: FaqItem[];
  relatedGrafana: string;
  relatedOnCall: string;
  relatedWebhook: string;
  relatedWhatIs: string;
  relatedFaq: string;
  backHome: string;
};

const EXAMPLE_CURL = `curl -X POST ${API_ALERT_URL} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"UptimeRobot: production site down"}'`;

const EN: UptimeRobotPhoneAlertsContent = {
  h1: "UptimeRobot Phone Alerts: Send UptimeRobot Alerts to a Phone",
  heroSubheading:
    "Turn critical UptimeRobot alerts into phone calls with human acknowledgement and on-call escalation.",
  heroLead:
    "UptimeRobot is excellent at monitoring availability. WakeUp Dev handles the part where a critical alert needs to reach a human.",
  heroBody:
    "Connect UptimeRobot to WakeUp Dev using an HTTP webhook—not a native UptimeRobot integration. When UptimeRobot sends an alert, WakeUp Dev places a phone call, asks the responder to press 1 to ACK, and escalates if nobody acknowledges.",
  flowSteps: [
    "UptimeRobot",
    "HTTP webhook",
    "WakeUp Dev",
    "Phone call",
    "Press 1 to ACK",
    "Escalate if unanswered",
  ],
  ctaPrimary: "Start free — 5 voice alerts",
  ctaSecondary: "See how it works",
  sendTitle: "Send UptimeRobot alerts to a phone",
  sendIntro: [
    "UptimeRobot can notify you when a monitor goes down or comes back up. For critical availability alerts, you can route those notifications to WakeUp Dev as an HTTP webhook.",
    "WakeUp Dev accepts the webhook, turns the incoming alert into a phone call to the configured on-call responder, and continues the cascade if nobody acknowledges.",
  ],
  architectureTitle: "Basic architecture",
  architectureSteps: [
    "UptimeRobot monitor",
    "Webhook alert",
    "WakeUp Dev",
    "Phone call",
    "Human ACK",
    "On-call escalation",
  ],
  howTitle: "How the UptimeRobot integration works",
  howSteps: [
    {
      title: "Create or use an UptimeRobot monitor",
      body: "UptimeRobot detects the availability problem you care about.",
    },
    {
      title: "Configure the webhook",
      body: "Configure UptimeRobot to send alert notifications to the WakeUp Dev webhook endpoint.",
    },
    {
      title: "Send the alert",
      body: "UptimeRobot sends the HTTP request when the monitor triggers.",
    },
    {
      title: "WakeUp Dev places the call",
      body: "WakeUp Dev calls the configured on-call responder.",
    },
    {
      title: "Press 1 to acknowledge",
      body: "The responder presses 1 to ACK.",
    },
    {
      title: "Escalate if nobody acknowledges",
      body: "If nobody answers or acknowledges, the configured on-call cascade continues.",
    },
  ],
  configTitle: "UptimeRobot webhook configuration",
  configIntro:
    "WakeUp Dev uses the same public alert API for every HTTP webhook source. Configure UptimeRobot to POST into WakeUp Dev with your API key—no WakeUp Dev agent or native UptimeRobot app is required.",
  configSteps: [
    "In UptimeRobot, add or edit a webhook alert contact for the monitor you want to escalate by phone.",
    `Set the webhook URL to ${API_ALERT_URL}.`,
    "Use HTTP POST (WakeUp Dev only accepts POST).",
    "If your UptimeRobot webhook contact supports custom HTTP headers, add x-api-key with your WakeUp Dev API key from the dashboard. WakeUp Dev rejects requests without a valid x-api-key (HTTP 401).",
    "Save the alert contact and attach it to the monitor notification settings that should wake someone.",
    "Trigger a test alert from UptimeRobot and confirm a phone call arrives; press 1 to ACK.",
  ],
  configFactsTitle: "What WakeUp Dev expects",
  configFacts: [
    `Endpoint: POST ${API_ALERT_URL}`,
    "Required header: x-api-key: YOUR_API_KEY (WakeUp Dev requirement—confirm your UptimeRobot plan/UI can send custom headers)",
    "Request body: raw alert text or JSON (WakeUp Dev reads the raw body, up to 4000 bytes)",
    "No native UptimeRobot integration—connection is HTTP webhook only",
    "On success, the API returns HTTP 202 with accepted: true and starts the on-call cascade",
  ],
  configDifferenceNote:
    "Unlike Grafana contact points, UptimeRobot uses webhook alert contacts on monitors. The WakeUp Dev endpoint and POST method are the same; whether UptimeRobot can attach a custom x-api-key header depends on UptimeRobot’s webhook options for your account.",
  exampleTitle: "Examples",
  exampleManualTitle: "Manual test",
  exampleManualIntro:
    "Use curl to verify WakeUp Dev accepts alerts before wiring UptimeRobot. This is a direct API test—not UptimeRobot’s native payload format.",
  exampleCurl: EXAMPLE_CURL,
  exampleManualNote:
    "Authentication is via the x-api-key header. The body is treated as alert text for the phone call.",
  exampleUptimeRobotTitle: "UptimeRobot webhook body",
  exampleUptimeRobotBody:
    "WakeUp Dev does not require a UptimeRobot-specific JSON schema. UptimeRobot’s default webhook payload can be forwarded as-is; WakeUp Dev reads the raw request body and uses it as the alert text for voice synthesis.",
  exampleSuccess:
    "A successful acceptance returns HTTP 202 with accepted: true. One alert credit is consumed when the alert is accepted.",
  whyTitle: "Why send UptimeRobot alerts to a phone?",
  whyBullets: [
    "Availability alerts can fire outside normal working hours when the on-call responder is away from email or chat.",
    "Push, email, and chat notifications can be missed overnight or in Do Not Disturb.",
    "A phone call can provide another notification channel when a monitor is down.",
    "Press-1 ACK asks for explicit human acknowledgement—not only that UptimeRobot delivered a webhook.",
    "On-call cascade escalation provides a path when the first responder does not acknowledge.",
  ],
  afterTitle: "What happens after the alert",
  afterBody: [
    "When WakeUp Dev accepts the webhook, it starts the configured on-call cascade.",
    "The first responder receives a phone call with a voice summary of the alert body and is prompted to press 1 to acknowledge.",
    "If the call is unanswered, fails, or ends without ACK, WakeUp Dev moves to the next number in the cascade until someone acknowledges or the cascade is exhausted.",
  ],
  pricingTitle: "Pay per alert, not per seat",
  pricingBody:
    "WakeUp Dev charges based on dispatched alert volume rather than per-seat licensing. Pro plans include 50 monthly alerts; the trial includes 5 free voice alerts with GitHub sign-in. Add UptimeRobot-driven on-call coverage without opening another seat license for every engineer.",
  integrationsTitle: "Integrations",
  integrationsBody:
    "WakeUp Dev accepts critical alerts from monitors that send HTTP webhooks:",
  integrationsList: ["UptimeRobot", "Grafana", "HTTP webhooks"],
  faqTitle: "UptimeRobot phone alerts FAQ",
  faqItems: [
    {
      id: "how-phone",
      question: "Can I send UptimeRobot alerts to a phone?",
      answer:
        "Yes. Point an UptimeRobot webhook alert to https://api.wakeupdev.com/v1/alert. WakeUp Dev requires the x-api-key header—if your UptimeRobot webhook contact can send custom headers, include your API key there. Accepted webhooks become a phone call to your on-call cascade.",
    },
    {
      id: "native",
      question: "Does WakeUp Dev have a native UptimeRobot integration?",
      answer:
        "No. The integration uses HTTP webhooks. UptimeRobot sends a POST to WakeUp Dev’s public alert API; WakeUp Dev is not an official UptimeRobot app or plugin.",
    },
    {
      id: "configure",
      question: "How do I configure UptimeRobot to call my on-call team?",
      answer:
        "Add a webhook alert in UptimeRobot pointing to https://api.wakeupdev.com/v1/alert and attach it to the monitor that should trigger a call. Where UptimeRobot allows custom HTTP headers, set x-api-key to your WakeUp Dev API key. Configure your on-call cascade in the WakeUp Dev dashboard.",
    },
    {
      id: "url",
      question: "What URL does WakeUp Dev use for alerts?",
      answer:
        "POST https://api.wakeupdev.com/v1/alert. This is the same endpoint used for Grafana and other HTTP webhook sources.",
    },
    {
      id: "auth",
      question: "What authentication does the WakeUp Dev webhook require?",
      answer:
        "WakeUp Dev requires the header x-api-key with your API key. Missing or invalid keys return HTTP 401. Confirm in UptimeRobot that your webhook contact can send that custom header—support can vary by UptimeRobot plan or UI.",
    },
    {
      id: "ack",
      question: "How does phone acknowledgement work?",
      answer:
        "During the call, the responder is prompted to press 1 on the keypad. Digit 1 marks the alert acknowledged and stops escalation for that incident.",
    },
    {
      id: "escalate",
      question: "What happens if nobody answers?",
      answer:
        "WakeUp Dev continues the on-call cascade—active shift phones, roster members by escalation order, then the verified emergency number—until someone ACKs or the cascade ends.",
    },
    {
      id: "trial",
      question: "Can I test UptimeRobot phone alerts for free?",
      answer:
        "Yes. Sign in with GitHub to get 5 free voice alerts on the trial. Trigger a test alert from UptimeRobot against your webhook contact to verify the call and ACK flow.",
    },
  ],
  relatedGrafana: "Grafana phone alerts",
  relatedOnCall: "On-call escalation",
  relatedWebhook: "Webhook to phone call",
  relatedWhatIs: "What is WakeUp Dev",
  relatedFaq: "Full FAQ",
  backHome: "← Back to home",
};

const ES: UptimeRobotPhoneAlertsContent = {
  h1: "Alertas de UptimeRobot al teléfono: envía alertas de UptimeRobot a una llamada",
  heroSubheading:
    "Convierte alertas críticas de UptimeRobot en llamadas con confirmación humana y escalada on-call.",
  heroLead:
    "UptimeRobot es excelente monitoreando disponibilidad. WakeUp Dev cubre el momento en que una alerta crítica debe llegar a un humano.",
  heroBody:
    "Conecta UptimeRobot a WakeUp Dev con un webhook HTTP—no es una integración nativa de UptimeRobot. Cuando UptimeRobot envía una alerta, WakeUp Dev llama, pide presionar 1 para ACK y escala si nadie confirma.",
  flowSteps: [
    "UptimeRobot",
    "HTTP webhook",
    "WakeUp Dev",
    "Llamada",
    "Presiona 1 para ACK",
    "Escala si no hay respuesta",
  ],
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  ctaSecondary: "Ver cómo funciona",
  sendTitle: "Enviar alertas de UptimeRobot a un teléfono",
  sendIntro: [
    "UptimeRobot puede avisarte cuando un monitor cae o se recupera. Para alertas críticas de disponibilidad, puedes enrutar esas notificaciones a WakeUp Dev como webhook HTTP.",
    "WakeUp Dev acepta el webhook, convierte la alerta en una llamada al on-call configurado y continúa la cascada si nadie confirma.",
  ],
  architectureTitle: "Arquitectura básica",
  architectureSteps: [
    "Monitor de UptimeRobot",
    "Alerta webhook",
    "WakeUp Dev",
    "Llamada",
    "ACK humano",
    "On-call escalation",
  ],
  howTitle: "Cómo funciona la integración con UptimeRobot",
  howSteps: [
    {
      title: "Crea o usa un monitor de UptimeRobot",
      body: "UptimeRobot detecta el problema de disponibilidad que te importa.",
    },
    {
      title: "Configura el webhook",
      body: "Configura UptimeRobot para enviar notificaciones de alerta al endpoint webhook de WakeUp Dev.",
    },
    {
      title: "Envía la alerta",
      body: "UptimeRobot envía la petición HTTP cuando el monitor se dispara.",
    },
    {
      title: "WakeUp Dev realiza la llamada",
      body: "WakeUp Dev llama al on-call configurado.",
    },
    {
      title: "Presiona 1 para confirmar",
      body: "El responsable presiona 1 para ACK.",
    },
    {
      title: "Escala si nadie confirma",
      body: "Si nadie contesta o confirma, continúa la cascada on-call configurada.",
    },
  ],
  configTitle: "Configuración del webhook de UptimeRobot",
  configIntro:
    "WakeUp Dev usa la misma API pública de alertas para cualquier webhook HTTP. Configura UptimeRobot para hacer POST a WakeUp Dev con tu API key—no hace falta agente de WakeUp Dev ni app nativa de UptimeRobot.",
  configSteps: [
    "En UptimeRobot, agrega o edita un contacto de alerta webhook para el monitor que quieras escalar por teléfono.",
    `Configura la URL del webhook a ${API_ALERT_URL}.`,
    "Usa HTTP POST (WakeUp Dev solo acepta POST).",
    "Si tu contacto webhook de UptimeRobot permite headers HTTP personalizados, agrega x-api-key con tu API key de WakeUp Dev del dashboard. WakeUp Dev rechaza peticiones sin un x-api-key válido (HTTP 401).",
    "Guarda el contacto de alerta y asígnalo a la configuración de notificaciones del monitor que deba despertar a alguien.",
    "Dispara una alerta de prueba desde UptimeRobot y confirma que llega la llamada; presiona 1 para ACK.",
  ],
  configFactsTitle: "Qué espera WakeUp Dev",
  configFacts: [
    `Endpoint: POST ${API_ALERT_URL}`,
    "Header requerido: x-api-key: YOUR_API_KEY (requisito de WakeUp Dev—confirma que tu plan/UI de UptimeRobot puede enviar headers personalizados)",
    "Body: texto plano o JSON (WakeUp Dev lee el body crudo, hasta 4000 bytes)",
    "Sin integración nativa de UptimeRobot—solo conexión por webhook HTTP",
    "Si se acepta, la API responde HTTP 202 con accepted: true e inicia la cascada on-call",
  ],
  configDifferenceNote:
    "A diferencia de los contact points de Grafana, UptimeRobot usa contactos de alerta webhook en los monitores. El endpoint y el método POST de WakeUp Dev son los mismos; si UptimeRobot puede adjuntar un header x-api-key personalizado depende de las opciones webhook de tu cuenta.",
  exampleTitle: "Ejemplos",
  exampleManualTitle: "Prueba manual",
  exampleManualIntro:
    "Usa curl para verificar que WakeUp Dev acepta alertas antes de conectar UptimeRobot. Es una prueba directa de la API—no el formato nativo de payload de UptimeRobot.",
  exampleCurl: EXAMPLE_CURL,
  exampleManualNote:
    "La autenticación va en el header x-api-key. El body se trata como texto de alerta para la llamada.",
  exampleUptimeRobotTitle: "Body del webhook de UptimeRobot",
  exampleUptimeRobotBody:
    "WakeUp Dev no exige un schema JSON específico de UptimeRobot. El payload webhook por defecto de UptimeRobot puede reenviarse tal cual; WakeUp Dev lee el body crudo y lo usa como texto de alerta para la síntesis de voz.",
  exampleSuccess:
    "Una aceptación exitosa responde HTTP 202 con accepted: true. Se consume un crédito de alerta al aceptar.",
  whyTitle: "¿Por qué enviar alertas de UptimeRobot al teléfono?",
  whyBullets: [
    "Las alertas de disponibilidad pueden dispararse fuera del horario laboral, cuando el on-call está lejos del email o el chat.",
    "Push, email y chat son fáciles de perder de noche o en No molestar.",
    "Una llamada puede ser otro canal de notificación cuando un monitor está caído.",
    "El ACK con dígito 1 pide confirmación humana explícita—no solo que UptimeRobot entregó un webhook.",
    "La cascada on-call da un camino cuando el primer responsable no confirma.",
  ],
  afterTitle: "Qué pasa después de la alerta",
  afterBody: [
    "Cuando WakeUp Dev acepta el webhook, inicia la cascada on-call configurada.",
    "El primer responsable recibe una llamada con un resumen de voz del body y se le pide presionar 1 para confirmar.",
    "Si la llamada no se contesta, falla o termina sin ACK, WakeUp Dev pasa al siguiente número en la cascada hasta que alguien confirme o se agote la cascada.",
  ],
  pricingTitle: "Pago por alerta, no por asiento",
  pricingBody:
    "WakeUp Dev cobra por volumen de alertas despachadas, no por licencias por asiento. Los planes Pro incluyen 50 alertas mensuales; la prueba incluye 5 alertas de voz gratis con GitHub. Amplía cobertura on-call desde UptimeRobot sin otra licencia por ingeniero.",
  integrationsTitle: "Integraciones",
  integrationsBody:
    "WakeUp Dev acepta alertas críticas de monitores que envían webhooks HTTP:",
  integrationsList: ["UptimeRobot", "Grafana", "Webhooks HTTP"],
  faqTitle: "FAQ de alertas de UptimeRobot al teléfono",
  faqItems: [
    {
      id: "how-phone",
      question: "¿Puedo enviar alertas de UptimeRobot a un teléfono?",
      answer:
        "Sí. Apunta una alerta webhook de UptimeRobot a https://api.wakeupdev.com/v1/alert. WakeUp Dev exige el header x-api-key—si tu contacto webhook de UptimeRobot puede enviar headers personalizados, incluye ahí tu API key. Los webhooks aceptados se convierten en una llamada a tu cascada on-call.",
    },
    {
      id: "native",
      question: "¿WakeUp Dev tiene integración nativa con UptimeRobot?",
      answer:
        "No. La integración usa webhooks HTTP. UptimeRobot envía un POST a la API pública de alertas de WakeUp Dev; WakeUp Dev no es una app ni plugin oficial de UptimeRobot.",
    },
    {
      id: "configure",
      question: "¿Cómo configuro UptimeRobot para llamar a mi equipo on-call?",
      answer:
        "Agrega una alerta webhook en UptimeRobot apuntando a https://api.wakeupdev.com/v1/alert y asígnala al monitor que debe disparar la llamada. Donde UptimeRobot permita headers HTTP personalizados, configura x-api-key con tu API key de WakeUp Dev. Configura tu cascada on-call en el dashboard de WakeUp Dev.",
    },
    {
      id: "url",
      question: "¿Qué URL usa WakeUp Dev para alertas?",
      answer:
        "POST https://api.wakeupdev.com/v1/alert. Es el mismo endpoint que Grafana y otras fuentes webhook HTTP.",
    },
    {
      id: "auth",
      question: "¿Qué autenticación requiere el webhook de WakeUp Dev?",
      answer:
        "WakeUp Dev exige el header x-api-key con tu API key. Keys faltantes o inválidas responden HTTP 401. Confirma en UptimeRobot que tu contacto webhook puede enviar ese header personalizado—el soporte puede variar según plan o UI de UptimeRobot.",
    },
    {
      id: "ack",
      question: "¿Cómo funciona la confirmación por teléfono?",
      answer:
        "Durante la llamada, se pide presionar 1 en el teclado. El dígito 1 marca la alerta confirmada y detiene la escalada de ese incidente.",
    },
    {
      id: "escalate",
      question: "¿Qué pasa si nadie contesta?",
      answer:
        "WakeUp Dev continúa la cascada on-call—teléfonos de turnos activos, miembros del roster por orden de escalada y luego el teléfono de emergencia verificado—hasta que alguien confirme o termine la cascada.",
    },
    {
      id: "trial",
      question: "¿Puedo probar alertas de UptimeRobot al teléfono gratis?",
      answer:
        "Sí. Inicia sesión con GitHub para obtener 5 alertas de voz gratis en la prueba. Dispara una alerta de prueba desde UptimeRobot contra tu contacto webhook para verificar la llamada y el ACK.",
    },
  ],
  relatedGrafana: "Alertas Grafana al teléfono",
  relatedOnCall: "Escalada on-call",
  relatedWebhook: "Webhook a llamada",
  relatedWhatIs: "Qué es WakeUp Dev",
  relatedFaq: "FAQ completo",
  backHome: "← Volver al inicio",
};

export function uptimeRobotPhoneAlertsContent(
  locale: Locale
): UptimeRobotPhoneAlertsContent {
  return locale === "es" ? ES : EN;
}

export function uptimeRobotPhoneAlertsJsonLd(
  content: UptimeRobotPhoneAlertsContent,
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
        "@type": "HowTo",
        name: "Send UptimeRobot alerts to a phone with WakeUp Dev",
        description:
          "Connect UptimeRobot to WakeUp Dev with an HTTP webhook, place a phone call, require press-1 ACK, and escalate if unanswered.",
        step: content.howSteps.map((step) => ({
          "@type": "HowToStep",
          name: step.title,
          text: step.body,
        })),
      },
      {
        "@type": "SoftwareApplication",
        name: "WakeUp Dev",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "All",
        description:
          "Voice-first on-call alerting that turns UptimeRobot HTTP webhooks into phone calls with human acknowledgement.",
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
