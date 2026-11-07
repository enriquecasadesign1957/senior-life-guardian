import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { WhatIsWakeUpDevClient } from "@/components/WhatIsWakeUpDevClient";
import { buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Qué es WakeUp Dev | Alertas de voz para DevOps",
  description:
    "Alertas de voz para DevOps: Grafana, UptimeRobot y webhooks HTTP se vuelven llamadas on-call con confirmación en el 1. No es alerta masiva, ni alarma de incendio, ni aviso a la población.",
  path: "/what-is-wakeup-dev",
});

const webPageLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": pageUrl("/what-is-wakeup-dev"),
      url: pageUrl("/what-is-wakeup-dev"),
      name: "What is WakeUp Dev?",
      description:
        "Alertas de voz para DevOps. On-call phone calls with press-1 acknowledgement. Not mass notification, fire alarm, or public warning.",
      isPartOf: { "@id": SITE },
    },
    {
      "@type": "SoftwareApplication",
      name: "WakeUp Dev",
      url: SITE,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      description:
        "WakeUp Dev turns Grafana, UptimeRobot, and HTTP webhooks into on-call phone calls with press-1 acknowledgement. It is not a mass-notification system, a fire voice alarm, or a public warning service.",
      featureList: [
        "HTTP webhook alert ingestion",
        "Phone call with press-1 acknowledgement",
        "Automatic on-call cascade escalation",
        "Grafana and UptimeRobot compatible",
        "CSV on-call roster and shift import",
      ],
    },
  ],
};

export default function WhatIsPage() {
  return (
    <>
      <JsonLd data={webPageLd} />
      <LanguageProvider>
        <WhatIsWakeUpDevClient />
      </LanguageProvider>
    </>
  );
}
