import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { OnCallEscalationClient } from "@/components/OnCallEscalationClient";
import {
  onCallEscalationContent,
  onCallEscalationJsonLd,
} from "@/lib/marketing/on-call-escalation-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "On-Call Escalation by Phone | Human ACK & Voice Alerts | WakeUp Dev",
  description:
    "Learn how on-call escalation works with phone alerts, human acknowledgement, and automatic escalation when nobody responds.",
  path: "/on-call-escalation",
});

const enContent = onCallEscalationContent("en");
const canonical = pageUrl("/on-call-escalation");

export default function OnCallEscalationPage() {
  return (
    <>
      <JsonLd data={onCallEscalationJsonLd(enContent, canonical)} />
      <LanguageProvider>
        <OnCallEscalationClient />
      </LanguageProvider>
    </>
  );
}
