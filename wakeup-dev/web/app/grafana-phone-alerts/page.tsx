import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { GrafanaPhoneAlertsClient } from "@/components/GrafanaPhoneAlertsClient";
import {
  grafanaPhoneAlertsContent,
  grafanaPhoneAlertsJsonLd,
} from "@/lib/marketing/grafana-phone-alerts-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Integración con Grafana: alertas al teléfono | WakeUp Dev",
  description:
    "Integración con Grafana para alertas de voz. Un webhook HTTP dispara una llamada, pide confirmación en el 1 y escala si nadie responde. Grafana phone alerts for DevOps on-call.",
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
