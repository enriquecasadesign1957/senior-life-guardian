import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { WebhookToPhoneCallClient } from "@/components/WebhookToPhoneCallClient";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Webhook to Phone Call for Critical Alerts | WakeUp Dev",
  description:
    "Learn how WakeUp Dev turns HTTP webhooks from monitoring systems into phone calls with human acknowledgement and escalation.",
  path: "/webhook-to-phone-call",
});

const howToLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": pageUrl("/webhook-to-phone-call"),
      url: pageUrl("/webhook-to-phone-call"),
      name: "Turn Webhooks Into Phone Calls",
    },
    {
      "@type": "HowTo",
      name: "Send a monitoring webhook to WakeUp Dev for a phone call",
      description:
        "Connect Grafana, UptimeRobot, or any HTTP webhook to WakeUp Dev voice alerting with ACK and escalation.",
      step: [
        {
          "@type": "HowToStep",
          name: "Monitoring system fires",
          text: "Grafana, UptimeRobot, or another monitor detects a critical condition.",
        },
        {
          "@type": "HowToStep",
          name: "HTTP webhook",
          text: "The monitor POSTs the alert body to WakeUp Dev with the x-api-key header.",
        },
        {
          "@type": "HowToStep",
          name: "WakeUp Dev accepts",
          text: "WakeUp Dev validates the API key and credits, then starts the on-call cascade (HTTP 202).",
        },
        {
          "@type": "HowToStep",
          name: "Phone call",
          text: "Twilio calls the first on-call phone and reads a voice summary of the alert.",
        },
        {
          "@type": "HowToStep",
          name: "Press 1 to acknowledge",
          text: "The responder presses 1 on the keypad to ACK. The alert stops escalating.",
        },
        {
          "@type": "HowToStep",
          name: "Escalation if unanswered",
          text: "If there is no ACK or no answer, WakeUp Dev calls the next number in the cascade.",
        },
      ],
    },
  ],
};

export default function WebhookToPhonePage() {
  return (
    <>
      <JsonLd data={howToLd} />
      <LanguageProvider>
        <WebhookToPhoneCallClient />
      </LanguageProvider>
    </>
  );
}
