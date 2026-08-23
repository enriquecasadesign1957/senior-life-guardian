import { LandingClient } from "@/components/LandingClient";
import { LanguageProvider } from "@/components/LanguageProvider";
import { buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "WakeUp Dev — Voice-first on-call alerting",
  description:
    "Critical alerts from Grafana, UptimeRobot, and HTTP webhooks become phone calls with press-1 acknowledgement and automatic escalation. 5 free voice alerts with GitHub.",
  path: "/",
});

const PROMO_UNTIL = "2026-09-10T23:59:59Z";

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": SITE,
      name: "WakeUp Dev",
      url: SITE,
      operatingSystem: "All",
      applicationCategory: "DeveloperApplication",
      featureList: [
        "Webhook Grafana/UptimeRobot convertido en llamada de voz.",
        "TwiML: Gather, ACK con dígito 1 y bucles de repetición de voz.",
        "Cascada on-call automatizada.",
        "CSV roster/turnos: import con preview y reemplazo atómico.",
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
  searchParams: Promise<{
    auth?: string;
    reason?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
    billing?: string;
    why?: string;
    hint?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationLd),
        }}
      />
      <LanguageProvider>
        <LandingClient {...params} />
      </LanguageProvider>
    </>
  );
}
