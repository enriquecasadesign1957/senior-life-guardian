import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { WhatIsWakeUpDevClient } from "@/components/WhatIsWakeUpDevClient";
import { buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "What is WakeUp Dev? | Voice-First On-Call Alerting",
  description:
    "WakeUp Dev turns critical technical alerts into phone calls, requires human acknowledgement and automatically escalates unanswered incidents.",
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
        "Voice-first on-call alerting with phone calls, human ACK, and automatic escalation.",
      isPartOf: { "@id": SITE },
    },
    {
      "@type": "SoftwareApplication",
      name: "WakeUp Dev",
      url: SITE,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "All",
      description:
        "Voice-first on-call alerting platform that converts monitoring webhooks into phone calls with digit-1 acknowledgement and cascade escalation.",
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
