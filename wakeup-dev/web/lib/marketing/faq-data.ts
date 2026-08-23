import type { FaqItem } from "@/components/FaqAccordion";

export const FAQ_ITEMS: FaqItem[] = [
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
      "A phone call can cut through silent-mode push, unread email, and busy chat channels in a different way than text notifications. WakeUp Dev adds an explicit ACK step so you know someone confirmed the alert—not just that a message was delivered.",
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
      "Yes. Add a webhook alert in UptimeRobot pointing to https://api.wakeupdev.com/v1/alert and include your x-api-key header. UptimeRobot's default webhook payload works as the alert body.",
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
