import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { FaqClient } from "@/components/FaqClient";
import { FAQ_ITEMS, faqJsonLd } from "@/lib/marketing/faq-data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "WakeUp Dev FAQ — Voice On-Call Alerts & Incident Escalation",
  description:
    "Answers about WakeUp Dev, voice-first on-call alerting, phone calls, human acknowledgement, escalation, Grafana, UptimeRobot and webhooks.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ_ITEMS)} />
      <LanguageProvider>
        <FaqClient />
      </LanguageProvider>
    </>
  );
}
