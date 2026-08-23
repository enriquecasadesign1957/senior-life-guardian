import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { UptimeRobotPhoneAlertsClient } from "@/components/UptimeRobotPhoneAlertsClient";
import {
  uptimeRobotPhoneAlertsContent,
  uptimeRobotPhoneAlertsJsonLd,
} from "@/lib/marketing/uptimerobot-phone-alerts-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title:
    "UptimeRobot Phone Alerts: Send UptimeRobot Alerts to a Phone | WakeUp Dev",
  description:
    "Send UptimeRobot alerts to a phone with WakeUp Dev. Use an HTTP webhook to trigger a voice call, require human acknowledgement, and escalate if nobody responds.",
  path: "/uptimerobot-phone-alerts",
});

const enContent = uptimeRobotPhoneAlertsContent("en");
const canonical = pageUrl("/uptimerobot-phone-alerts");

export default function UptimeRobotPhoneAlertsPage() {
  return (
    <>
      <JsonLd data={uptimeRobotPhoneAlertsJsonLd(enContent, canonical)} />
      <LanguageProvider>
        <UptimeRobotPhoneAlertsClient />
      </LanguageProvider>
    </>
  );
}
