import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { GrafanaPhoneAlertsClient } from "@/components/GrafanaPhoneAlertsClient";
import {
  grafanaPhoneAlertsContent,
  grafanaPhoneAlertsJsonLd,
} from "@/lib/marketing/grafana-phone-alerts-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title:
    "Grafana Phone Alerts: Send Grafana Alerts to a Phone | WakeUp Dev",
  description:
    "Send critical Grafana alerts to a phone with WakeUp Dev. Use an HTTP webhook to trigger a call, require human ACK, and escalate if unanswered.",
  path: "/grafana-phone-alerts",
});

const enContent = grafanaPhoneAlertsContent("en");
const canonical = pageUrl("/grafana-phone-alerts");

export default function GrafanaPhoneAlertsPage() {
  return (
    <>
      <JsonLd data={grafanaPhoneAlertsJsonLd(enContent, canonical)} />
      <LanguageProvider>
        <GrafanaPhoneAlertsClient />
      </LanguageProvider>
    </>
  );
}
