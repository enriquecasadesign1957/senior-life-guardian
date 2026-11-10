import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { PagerDutyAlternativeClient } from "@/components/PagerDutyAlternativeClient";
import {
  pagerDutyAltContent,
  pagerDutyAltJsonLd,
} from "@/lib/marketing/pagerduty-alternative-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Alternativa a PagerDuty por voz | WakeUp Dev",
  description:
    "Alternativa a PagerDuty centrada en alertas de voz, confirmación humana y escalación, sin cobro por asiento. Voice on-call alerts priced per dispatched alert.",
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
