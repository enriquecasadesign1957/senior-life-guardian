import type { FaqItem } from "@/components/FaqAccordion";
import type { Locale } from "@/lib/i18n";
import { API_ALERT_URL } from "@/lib/seo";

export type HowStep = {
  title: string;
  body: string;
};

export type GrafanaPhoneAlertsContent = {
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
  exampleTitle: string;
  exampleIntro: string;
  exampleCurlLabel: string;
  exampleCurl: string;
  exampleBodyNote: string;
  exampleJsonLabel: string;
  exampleJson: string;
  exampleSuccess: string;
  whyTitle: string;
  whyBullets: string[];
  afterTitle: string;
  afterBody: string[];
  pricingTitle: string;
  pricingBody: string;
  faqTitle: string;
  faqItems: FaqItem[];
  relatedOnCall: string;
  relatedWebhook: string;
  relatedWhatIs: string;
  relatedFaq: string;
  backHome: string;
};

const EXAMPLE_JSON = `{
  "message": "Grafana: production API high error rate"
}`;

const EXAMPLE_CURL = `curl -X POST ${API_ALERT_URL} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Grafana: production API high error rate"}'`;

const EN: GrafanaPhoneAlertsContent = {
  h1: "Grafana Phone Alerts: Send Grafana Alerts to a Phone",
  heroSubheading:
    "Turn critical Grafana alerts into phone calls with human acknowledgement and on-call escalation.",
  heroLead:
    "Grafana is excellent at detecting problems. WakeUp Dev handles the part where a critical alert needs to reach a human.",
  heroBody:
    "Connect Grafana alerts to WakeUp Dev using an HTTP webhook—not a native Grafana plugin. When Grafana fires, WakeUp Dev places a phone call, asks the responder to press 1 to ACK, and escalates if nobody acknowledges.",
  flowSteps: [
    "Grafana",
    "HTTP webhook",
    "WakeUp Dev",
    "Phone call",
    "Press 1 to ACK",
    "Escalate if unanswered",
  ],
  ctaPrimary: "Start free — 5 voice alerts",
  ctaSecondary: "See how it works",
  sendTitle: "Send Grafana alerts to a phone",
  sendIntro: [
    "Grafana can send alert notifications through webhooks.",
    "WakeUp Dev accepts an HTTP webhook and turns the incoming alert into a phone call to the configured on-call responder.",
  ],
  architectureTitle: "Basic architecture",
  architectureSteps: [
    "Grafana Alert Rule",
    "Grafana Contact Point / Webhook",
    "WakeUp Dev",
    "Phone call",
    "Human ACK",
    "On-call cascade",
  ],
  howTitle: "How the Grafana integration works",
  howSteps: [
    {
      title: "Create or use a Grafana alert rule",
      body: "Grafana detects the condition you care about.",
    },
    {
      title: "Configure an HTTP webhook",
      body: "Configure Grafana to send the alert to the WakeUp Dev webhook endpoint.",
    },
    {
      title: "Send the alert",
      body: "Grafana sends the HTTP request when the alert fires.",
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
  configTitle: "Grafana webhook configuration",
  configIntro:
    "Use Grafana’s HTTP webhook contact point to POST into WakeUp Dev. The steps below match the live WakeUp Dev alert API—no invented headers or payload schema.",
  configSteps: [
    "In Grafana, create or edit an HTTP webhook contact point.",
    `Set the webhook URL to ${API_ALERT_URL}.`,
    "Set the HTTP method to POST (WakeUp Dev only accepts POST).",
    "Add a custom HTTP header named x-api-key with your WakeUp Dev API key from the dashboard.",
    "Save the contact point.",
    "Attach the contact point to the notification policy or alert rule that should wake someone.",
    "Trigger a test alert and confirm a phone call arrives; press 1 to ACK.",
  ],
  configFactsTitle: "What WakeUp Dev expects",
  configFacts: [
    `Endpoint: POST ${API_ALERT_URL}`,
    "Required header: x-api-key: YOUR_API_KEY",
    "Request body: raw alert text or JSON (WakeUp Dev reads the raw body, up to 4000 bytes)",
    "No proprietary Grafana plugin—integration is HTTP webhook only",
    "On success, the API returns HTTP 202 with accepted: true and starts the on-call cascade",
  ],
  exampleTitle: "Example Grafana webhook",
  exampleIntro:
    "WakeUp Dev does not require a Grafana-specific JSON schema. Send plain text or JSON as the request body. Grafana’s webhook payload can be forwarded as-is, or you can send a short summary body for clearer voice synthesis.",
  exampleCurlLabel: "HTTP request example",
  exampleCurl: EXAMPLE_CURL,
  exampleBodyNote:
    "Authentication is always via the x-api-key header. The body is treated as the alert text WakeUp Dev will summarize for the phone call.",
  exampleJsonLabel: "Example JSON body",
  exampleJson: EXAMPLE_JSON,
  exampleSuccess:
    "A successful acceptance returns HTTP 202 with accepted: true. One alert credit is consumed when the alert is accepted.",
  whyTitle: "Why send Grafana alerts to a phone?",
  whyBullets: [
    "Critical Grafana conditions can fire when the on-call responder is away from Slack or email.",
    "Push and chat notifications are easy to miss overnight or in Do Not Disturb.",
    "A phone call asks for attention in a different way than another dashboard notification.",
    "Press-1 ACK confirms a human saw the alert—not only that Grafana delivered a webhook.",
  ],
  afterTitle: "What happens after Grafana fires",
  afterBody: [
    "When WakeUp Dev accepts the webhook, it starts the on-call cascade and calls the first configured target.",
    "During the call, the responder hears a voice summary of the alert body and is prompted to press 1 to acknowledge.",
    "If the call is unanswered, fails, or ends without ACK, WakeUp Dev moves to the next number in the cascade until someone acknowledges or the cascade is exhausted.",
  ],
  pricingTitle: "Pay per alert, not per seat",
  pricingBody:
    "WakeUp Dev charges based on dispatched alert volume rather than per-seat licensing. Pro plans include 50 monthly alerts; the trial includes 5 free voice alerts with GitHub sign-in. Add Grafana-driven on-call coverage without opening another seat license for every engineer.",
  faqTitle: "Grafana phone alerts FAQ",
  faqItems: [
    {
      id: "plugin",
      question: "Is WakeUp Dev an official Grafana plugin?",
      answer:
        "No. WakeUp Dev is not a native Grafana plugin. You connect Grafana to WakeUp Dev with an HTTP webhook contact point that POSTs to the public alert API.",
    },
    {
      id: "how-phone",
      question: "How can I send Grafana alerts to a phone?",
      answer:
        "Configure Grafana to POST to https://api.wakeupdev.com/v1/alert with your x-api-key header. WakeUp Dev turns the accepted webhook into a phone call to your on-call cascade.",
    },
    {
      id: "headers",
      question: "What URL and authentication does WakeUp Dev require?",
      answer:
        "Use POST https://api.wakeupdev.com/v1/alert and include the header x-api-key with your API key. Missing or invalid keys return HTTP 401.",
    },
    {
      id: "body",
      question: "What request body should Grafana send?",
      answer:
        "Any plain text or JSON body works. WakeUp Dev reads the raw request body (up to 4000 bytes) and uses it as the alert text for voice. There is no required Grafana-only field schema.",
    },
    {
      id: "ack",
      question: "How does acknowledgement work for Grafana alerts?",
      answer:
        "When the phone rings, the responder presses 1 on the keypad to ACK. Digit 1 marks the alert acknowledged and stops escalation for that incident.",
    },
    {
      id: "escalate",
      question: "What if nobody answers the Grafana-triggered call?",
      answer:
        "WakeUp Dev continues the on-call cascade—active shift phones, roster members by escalation order, then the verified emergency number—until someone ACKs or the cascade ends.",
    },
    {
      id: "trial",
      question: "Can I test Grafana phone alerts for free?",
      answer:
        "Yes. Sign in with GitHub to get 5 free voice alerts on the trial. Use a Grafana test alert against your webhook contact point to verify the call and ACK flow.",
    },
  ],
  relatedOnCall: "On-call escalation",
  relatedWebhook: "Webhook to phone call",
  relatedWhatIs: "What is WakeUp Dev",
  relatedFaq: "Full FAQ",
  backHome: "← Back to home",
};

const ES: GrafanaPhoneAlertsContent = {
  h1: "Alertas de Grafana al teléfono: envía alertas de Grafana a una llamada",
  heroSubheading:
    "Convierte alertas críticas de Grafana en llamadas con confirmación humana y escalada on-call.",
  heroLead:
    "Grafana es excelente detectando problemas. WakeUp Dev cubre el momento en que una alerta crítica debe llegar a un humano.",
  heroBody:
    "Conecta alertas de Grafana a WakeUp Dev con un webhook HTTP—no es un plugin nativo de Grafana. Cuando Grafana dispara, WakeUp Dev llama, pide presionar 1 para ACK y escala si nadie confirma.",
  flowSteps: [
    "Grafana",
    "HTTP webhook",
    "WakeUp Dev",
    "Llamada",
    "Presiona 1 para ACK",
    "Escala si no hay respuesta",
  ],
  ctaPrimary: "Empezar gratis — 5 alertas de voz",
  ctaSecondary: "Ver cómo funciona",
  sendTitle: "Enviar alertas de Grafana a un teléfono",
  sendIntro: [
    "Grafana puede enviar notificaciones de alerta mediante webhooks.",
    "WakeUp Dev acepta un webhook HTTP y convierte la alerta entrante en una llamada al on-call configurado.",
  ],
  architectureTitle: "Arquitectura básica",
  architectureSteps: [
    "Regla de alerta de Grafana",
    "Contact Point / Webhook de Grafana",
    "WakeUp Dev",
    "Llamada",
    "ACK humano",
    "Cascada on-call",
  ],
  howTitle: "Cómo funciona la integración con Grafana",
  howSteps: [
    {
      title: "Crea o usa una regla de alerta de Grafana",
      body: "Grafana detecta la condición que te importa.",
    },
    {
      title: "Configura un webhook HTTP",
      body: "Configura Grafana para enviar la alerta al endpoint webhook de WakeUp Dev.",
    },
    {
      title: "Envía la alerta",
      body: "Grafana envía la petición HTTP cuando la alerta se dispara.",
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
  configTitle: "Configuración del webhook de Grafana",
  configIntro:
    "Usa el contact point webhook HTTP de Grafana para hacer POST a WakeUp Dev. Los pasos siguientes coinciden con la API real de alertas—sin headers ni schemas inventados.",
  configSteps: [
    "En Grafana, crea o edita un contact point de tipo HTTP webhook.",
    `Configura la URL del webhook a ${API_ALERT_URL}.`,
    "Configura el método HTTP como POST (WakeUp Dev solo acepta POST).",
    "Agrega un header HTTP personalizado llamado x-api-key con tu API key de WakeUp Dev del dashboard.",
    "Guarda el contact point.",
    "Asocia el contact point a la notification policy o regla de alerta que deba despertar a alguien.",
    "Dispara una alerta de prueba y confirma que llega la llamada; presiona 1 para ACK.",
  ],
  configFactsTitle: "Qué espera WakeUp Dev",
  configFacts: [
    `Endpoint: POST ${API_ALERT_URL}`,
    "Header requerido: x-api-key: YOUR_API_KEY",
    "Body: texto plano o JSON (WakeUp Dev lee el body crudo, hasta 4000 bytes)",
    "Sin plugin propietario de Grafana—solo integración por webhook HTTP",
    "Si se acepta, la API responde HTTP 202 con accepted: true e inicia la cascada on-call",
  ],
  exampleTitle: "Ejemplo de webhook de Grafana",
  exampleIntro:
    "WakeUp Dev no exige un schema JSON específico de Grafana. Envía texto plano o JSON como body. Puedes reenviar el payload del webhook de Grafana tal cual, o un resumen corto para una síntesis de voz más clara.",
  exampleCurlLabel: "Ejemplo de petición HTTP",
  exampleCurl: EXAMPLE_CURL,
  exampleBodyNote:
    "La autenticación siempre va en el header x-api-key. El body se trata como el texto de alerta que WakeUp Dev resume para la llamada.",
  exampleJsonLabel: "Ejemplo de body JSON",
  exampleJson: EXAMPLE_JSON,
  exampleSuccess:
    "Una aceptación exitosa responde HTTP 202 con accepted: true. Se consume un crédito de alerta al aceptar.",
  whyTitle: "¿Por qué enviar alertas de Grafana al teléfono?",
  whyBullets: [
    "Condiciones críticas de Grafana pueden dispararse cuando el on-call está lejos de Slack o el email.",
    "Push y chat son fáciles de perder de noche o en No molestar.",
    "Una llamada pide atención de forma distinta a otra notificación del dashboard.",
    "El ACK con dígito 1 confirma que un humano vio la alerta—no solo que Grafana entregó un webhook.",
  ],
  afterTitle: "Qué pasa después de que Grafana dispara",
  afterBody: [
    "Cuando WakeUp Dev acepta el webhook, inicia la cascada on-call y llama al primer objetivo configurado.",
    "Durante la llamada, el responsable escucha un resumen de voz del body y se le pide presionar 1 para confirmar.",
    "Si la llamada no se contesta, falla o termina sin ACK, WakeUp Dev pasa al siguiente número en la cascada hasta que alguien confirme o se agote la cascada.",
  ],
  pricingTitle: "Pago por alerta, no por asiento",
  pricingBody:
    "WakeUp Dev cobra por volumen de alertas despachadas, no por licencias por asiento. Los planes Pro incluyen 50 alertas mensuales; la prueba incluye 5 alertas de voz gratis con GitHub. Amplía cobertura on-call desde Grafana sin otra licencia por ingeniero.",
  faqTitle: "FAQ de alertas de Grafana al teléfono",
  faqItems: [
    {
      id: "plugin",
      question: "¿WakeUp Dev es un plugin oficial de Grafana?",
      answer:
        "No. WakeUp Dev no es un plugin nativo de Grafana. Conectas Grafana a WakeUp Dev con un contact point webhook HTTP que hace POST a la API pública de alertas.",
    },
    {
      id: "how-phone",
      question: "¿Cómo envío alertas de Grafana a un teléfono?",
      answer:
        "Configura Grafana para hacer POST a https://api.wakeupdev.com/v1/alert con el header x-api-key. WakeUp Dev convierte el webhook aceptado en una llamada a tu cascada on-call.",
    },
    {
      id: "headers",
      question: "¿Qué URL y autenticación requiere WakeUp Dev?",
      answer:
        "Usa POST https://api.wakeupdev.com/v1/alert e incluye el header x-api-key con tu API key. Keys faltantes o inválidas responden HTTP 401.",
    },
    {
      id: "body",
      question: "¿Qué body debe enviar Grafana?",
      answer:
        "Cualquier texto plano o JSON sirve. WakeUp Dev lee el body crudo (hasta 4000 bytes) y lo usa como texto de alerta para voz. No hay un schema de campos obligatorio específico de Grafana.",
    },
    {
      id: "ack",
      question: "¿Cómo funciona el ACK con alertas de Grafana?",
      answer:
        "Cuando suena el teléfono, el responsable presiona 1 en el teclado para ACK. El dígito 1 marca la alerta confirmada y detiene la escalada de ese incidente.",
    },
    {
      id: "escalate",
      question: "¿Qué pasa si nadie contesta la llamada disparada por Grafana?",
      answer:
        "WakeUp Dev continúa la cascada on-call—teléfonos de turnos activos, miembros del roster por orden de escalada y luego el teléfono de emergencia verificado—hasta que alguien confirme o termine la cascada.",
    },
    {
      id: "trial",
      question: "¿Puedo probar alertas de Grafana al teléfono gratis?",
      answer:
        "Sí. Inicia sesión con GitHub para obtener 5 alertas de voz gratis en la prueba. Usa una alerta de prueba de Grafana contra tu contact point webhook para verificar la llamada y el ACK.",
    },
  ],
  relatedOnCall: "Escalada on-call",
  relatedWebhook: "Webhook a llamada",
  relatedWhatIs: "Qué es WakeUp Dev",
  relatedFaq: "FAQ completo",
  backHome: "← Volver al inicio",
};

export function grafanaPhoneAlertsContent(
  locale: Locale
): GrafanaPhoneAlertsContent {
  return locale === "es" ? ES : EN;
}

export function grafanaPhoneAlertsJsonLd(
  content: GrafanaPhoneAlertsContent,
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
        name: "Send Grafana alerts to a phone with WakeUp Dev",
        description:
          "Connect Grafana to WakeUp Dev with an HTTP webhook, place a phone call, require press-1 ACK, and escalate if unanswered.",
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
          "Voice-first on-call alerting that turns Grafana HTTP webhooks into phone calls with human acknowledgement.",
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
