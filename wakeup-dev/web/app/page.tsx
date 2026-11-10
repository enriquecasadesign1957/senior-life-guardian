import {
  LandingClient,
  type LandingQuery,
} from "@/components/LandingClient";
import { LanguageProvider } from "@/components/LanguageProvider";
import { buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

/** Pick only known landing query keys — never spread searchParams (React reserves `ref`). */
function landingQueryFromSearchParams(
  params: Record<string, string | string[] | undefined>
): LandingQuery {
  const one = (key: keyof LandingQuery): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };
  return {
    auth: one("auth"),
    reason: one("reason"),
    error: one("error"),
    error_code: one("error_code"),
    error_description: one("error_description"),
    billing: one("billing"),
    why: one("why"),
    hint: one("hint"),
  };
}

export const metadata = buildPageMetadata({
  title: "WakeUp Dev — Alertas de voz para DevOps",
  description:
    "Alertas de voz para DevOps y SRE. Grafana, UptimeRobot y webhooks HTTP se vuelven llamadas con confirmación en el 1 y escalación on-call. Critical alerts become phone calls. 5 free voice alerts.",
  path: "/",
});

const PROMO_UNTIL = "2026-11-30T23:59:59-03:00";

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": SITE,
      name: "WakeUp Dev",
      url: SITE,
      description:
        "Alertas de voz para DevOps. WakeUp Dev turns Grafana, UptimeRobot, and HTTP webhooks into on-call phone calls with press-1 acknowledgement. It is not a mass-notification system, a fire voice alarm, or a public warning service.",
      operatingSystem: "All",
      applicationCategory: "DeveloperApplication",
      featureList: [
        "Grafana and UptimeRobot webhooks become phone calls.",
        "Press 1 to acknowledge. Unanswered calls escalate.",
        "On-call cascade across roster, shifts, or the emergency number.",
        "CSV roster and shift import.",
      ],
      offers: [
        {
          "@type": "Offer",
          "@id": `${SITE}/#offer-internacional`,
          name: "Plan Pro Internacional",
          url: `${pageUrl("/")}#precios`,
          availability: "https://schema.org/InStock",
          priceCurrency: "USD",
          price: "29",
          priceSpecification: [
            {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/ListPrice",
              price: "29",
              priceCurrency: "USD",
              unitCode: "MON",
            },
            {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/SalePrice",
              price: "23.20",
              priceCurrency: "USD",
              unitCode: "MON",
              validThrough: PROMO_UNTIL,
            },
          ],
        },
        {
          "@type": "Offer",
          "@id": `${SITE}/#offer-chile`,
          name: "Plan Pro Local",
          url: `${pageUrl("/")}#precios`,
          availability: "https://schema.org/InStock",
          priceCurrency: "CLP",
          price: "25000",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/ListPrice",
            price: "25000",
            priceCurrency: "CLP",
            unitCode: "MON",
          },
        },
      ],
    },
  ],
} as const;

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = landingQueryFromSearchParams(await searchParams);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationLd),
        }}
      />
      <LanguageProvider>
        <LandingClient {...query} />
      </LanguageProvider>
    </>
  );
}
