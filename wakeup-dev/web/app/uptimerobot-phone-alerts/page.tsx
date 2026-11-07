import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import { UptimeRobotPhoneAlertsClient } from "@/components/UptimeRobotPhoneAlertsClient";
import {
  uptimeRobotPhoneAlertsContent,
  uptimeRobotPhoneAlertsJsonLd,
} from "@/lib/marketing/uptimerobot-phone-alerts-content";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Alertas de UptimeRobot por teléfono | WakeUp Dev",
  description:
    "Alertas de UptimeRobot por teléfono: el webhook se convierte en una llamada con confirmación humana y escalación. UptimeRobot phone alerts for DevOps on-call.",
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
