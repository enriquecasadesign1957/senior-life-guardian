import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { PagerDutyAlternativeClient } from "@/components/PagerDutyAlternativeClient";
import {
  pagerDutyAltContent,
  pagerDutyAltJsonLd,
} from "@/lib/marketing/pagerduty-alternative-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "PagerDuty Alternative for Voice On-Call Alerts | WakeUp Dev",
  description:
    "Looking for a PagerDuty alternative? WakeUp Dev focuses on voice-first on-call alerts, human acknowledgement, and escalation with pay-per-alert pricing.",
  path: "/pagerduty-alternative",
});

const enContent = pagerDutyAltContent("en");
const canonical = pageUrl("/pagerduty-alternative");

export default function PagerDutyAlternativePage() {
  return (
    <>
      <JsonLd data={pagerDutyAltJsonLd(enContent, canonical)} />
      <LanguageProvider>
        <PagerDutyAlternativeClient />
      </LanguageProvider>
    </>
  );
}
