import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { OnCallEscalationClient } from "@/components/OnCallEscalationClient";
import {
  onCallEscalationContent,
  onCallEscalationJsonLd,
} from "@/lib/marketing/on-call-escalation-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Servicio de escalación de alertas on-call | WakeUp Dev",
  description:
    "Servicio de escalación de alertas por teléfono para DevOps. Si nadie confirma con el 1, WakeUp Dev llama al siguiente. On-call escalation with human acknowledgement.",
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
