import { PLAN } from "@/lib/plans";
import { PRODUCTION_SITE_URL, SENIOR_SAFE_PLAY_STORE_URL, SENIOR_SAFE_ANDROID_PACKAGE_ID } from "@/lib/app-url";

export const SEO_SITE_NAME = "Senior Safe";
export const SEO_BRAND = "Alarma Senior Safe";
export const SEO_LOCALE = "es_CL";
export const SEO_LANGUAGE = "es-CL";
export const SEO_SUPPORT_EMAIL = "hola@alarmaseniorsafe.cl";

export const SEO_DEFAULT_TITLE =
  "Senior Safe — Alarma familiar para adultos mayores en Chile";
export const SEO_DEFAULT_DESCRIPTION =
  "Botón SOS que alerta a tu familia por WhatsApp, SMS, GPS y llamada automática. Plan desde $6.900/mes, sin permanencia. Chile.";

/** Imagen Open Graph (1200×630) limpia, sin texto — requisito Discover ≥1200px. */
export const SEO_OG_IMAGE = `${PRODUCTION_SITE_URL}/og-senior-safe-v2.jpg`;
export const SEO_OG_IMAGE_WIDTH = "1200";
export const SEO_OG_IMAGE_HEIGHT = "630";

/** URL canónica absoluta (sin query ni hash). Coincide con public/sitemap.xml. */
export function canonicalUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") {
    return `${PRODUCTION_SITE_URL}/`;
  }
  return `${PRODUCTION_SITE_URL}${path.replace(/\/$/, "")}`;
}

export function canonicalLink(pathname: string): {
  rel: "canonical";
  href: string;
} {
  return { rel: "canonical", href: canonicalUrl(pathname) };
}

export function hreflangLink(pathname: string): {
  rel: "alternate";
  hrefLang: string;
  href: string;
} {
  return {
    rel: "alternate",
    hrefLang: SEO_LANGUAGE.toLowerCase(),
    href: canonicalUrl(pathname),
  };
}

type JsonLd = Record<string, unknown>;

/**
 * JSON-LD embebido en <script type="application/ld+json"> via dangerouslySetInnerHTML.
 * JSON.stringify ya escapa " \\ y controles; los acentos (á, é, í, ó, ú, ñ, ¿, ¡)
 * se dejan en UTF-8 (charset utf-8 en <head>) — el validador de Google los acepta.
 * < > & y U+2028/U+2029 se pasan a \\uXXXX para que el parser HTML no cierre el script.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/[&><\u2028\u2029]/g, (ch) => {
    switch (ch) {
      case "&":
        return "\\u0026";
      case ">":
        return "\\u003e";
      case "<":
        return "\\u003c";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        return ch;
    }
  });
}

export function jsonLdHeadScript(data: JsonLd | JsonLd[]) {
  return {
    type: "application/ld+json" as const,
    children: serializeJsonLd(data),
  };
}

/**
 * Único JSON-LD de la Home (Rich Results): Android + oferta 6900 CLP + 3 FAQ canónicas.
 * @id distintos: el mismo URL en app y FAQPage fusiona nodos y rompe el validador.
 * availability completa (InStock); downloadUrl = ficha real de Play Store.
 */
export function homeUnifiedJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${PRODUCTION_SITE_URL}/#android-app`,
        name: SEO_SITE_NAME,
        url: PRODUCTION_SITE_URL,
        operatingSystem: "Android",
        applicationCategory: "HealthApplication",
        downloadUrl: SENIOR_SAFE_PLAY_STORE_URL,
        offers: {
          "@type": "Offer",
          price: String(PLAN.monthly),
          priceCurrency: "CLP",
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${PRODUCTION_SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cómo funciona el sistema de alerta en cascada?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La cascada de alertas Senior Safe (ecosystem_v3_cascade) es un protocolo de canales redundantes: SMS al instante (0 segundos), WhatsApp a los 15 segundos y llamada de voz a los 60 segundos si ningún guardián confirma.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cómo funciona la detección de caídas?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "La detección de caídas de Senior Safe es un protocolo automático en smartphones Android: el acelerómetro registra un impacto, valida 3 segundos de inmovilidad y da 30 segundos para cancelar antes de alertar a la familia.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto cuesta Senior Safe frente a una alarma médica tradicional?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Senior Safe cuesta 6.900 CLP al mes; una alarma médica tradicional con central de monitoreo, pulsera y permanencia cuesta entre 30.000 CLP y 80.000 CLP al mes.",
            },
          },
        ],
      },
    ],
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_BRAND,
    alternateName: SEO_SITE_NAME,
    url: PRODUCTION_SITE_URL,
    logo: `${PRODUCTION_SITE_URL}/senior-safe-512.webp`,
    email: SEO_SUPPORT_EMAIL,
    areaServed: {
      "@type": "Country",
      name: "Chile",
    },
    sameAs: [PRODUCTION_SITE_URL, SENIOR_SAFE_PLAY_STORE_URL],
  };
}

export function webSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_SITE_NAME,
    alternateName: SEO_BRAND,
    url: PRODUCTION_SITE_URL,
    inLanguage: SEO_LANGUAGE,
    publisher: {
      "@type": "Organization",
      name: SEO_BRAND,
      url: PRODUCTION_SITE_URL,
    },
  };
}

export function serviceJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Senior Safe — Plan Único",
    description: SEO_DEFAULT_DESCRIPTION,
    provider: {
      "@type": "Organization",
      name: SEO_BRAND,
      url: PRODUCTION_SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "Chile",
    },
    offers: {
      "@type": "Offer",
      price: String(PLAN.monthly),
      priceCurrency: "CLP",
      url: `${PRODUCTION_SITE_URL}/planes`,
      availability: "https://schema.org/InStock",
    },
    serviceType: "Emergency alert service for seniors and families",
  };
}

export function mobileApplicationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: SEO_SITE_NAME,
    operatingSystem: "Android",
    applicationCategory: "UtilitiesApplication",
    installUrl: SENIOR_SAFE_PLAY_STORE_URL,
    downloadUrl: SENIOR_SAFE_PLAY_STORE_URL,
    sameAs: [SENIOR_SAFE_PLAY_STORE_URL],
    identifier: SENIOR_SAFE_ANDROID_PACKAGE_ID,
    offers: {
      "@type": "Offer",
      price: String(PLAN.monthly),
      priceCurrency: "CLP",
    },
    url: PRODUCTION_SITE_URL,
  };
}

/**
 * Graph educativo para Google Discover: app + protocolo HowTo de caídas
 * (empaqueta secciones de la landing sin blog).
 * Actualizar SEO_PRICE_VALID_UNTIL cuando renueves vigencia comercial.
 */
export const SEO_PRICE_VALID_UNTIL = "2027-12-31";

export function discoverEducationalGraphJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${PRODUCTION_SITE_URL}/#software`,
        name: SEO_SITE_NAME,
        url: PRODUCTION_SITE_URL,
        operatingSystem: "Android",
        applicationCategory: "HealthApplication",
        offers: {
          "@type": "Offer",
          name: "Plan Único",
          price: String(PLAN.monthly),
          priceCurrency: "CLP",
          priceValidUntil: SEO_PRICE_VALID_UNTIL,
          availability: "https://schema.org/InStock",
          url: `${PRODUCTION_SITE_URL}/planes`,
        },
      },
      {
        "@type": "HowTo",
        "@id": `${PRODUCTION_SITE_URL}/#deteccion-caidas`,
        name: "Cómo funciona el sistema de detección de caídas en adultos mayores",
        description:
          "Protocolo inteligente de tres pasos para detectar impactos y notificar de emergencia a los familiares en Chile.",
        url: `${PRODUCTION_SITE_URL}/#deteccion-caidas`,
        image: {
          "@type": "ImageObject",
          url: `${PRODUCTION_SITE_URL}/images/deteccion-caidas-senior.jpg`,
          width: 1200,
          height: 675,
        },
        inLanguage: SEO_LANGUAGE,
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Sensor de movimiento",
            text: "El acelerómetro del celular detecta caídas bruscas y activa el protocolo automáticamente.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Validación de Inmovilidad",
            text: "El sistema verifica una ventana de quietud total durante 3 segundos continuos para descartar falsos positivos.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Alerta Progresiva",
            text: "Activa una cuenta regresiva de 30 segundos con vibración y sirena antes de despachar el auxilio simultáneo por WhatsApp y SMS.",
          },
        ],
      },
    ],
  };
}

export function faqPageJsonLd(items: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

const GEO_IDS = {
  webpage: `${PRODUCTION_SITE_URL}/#webpage`,
  techArticle: `${PRODUCTION_SITE_URL}/#techarticle`,
  faq: `${PRODUCTION_SITE_URL}/#faq`,
  product: `${PRODUCTION_SITE_URL}/#producto`,
  offer: `${PRODUCTION_SITE_URL}/#oferta-plan-unico`,
  chile: `${PRODUCTION_SITE_URL}/#chile`,
  cascade: `${PRODUCTION_SITE_URL}/#ecosystem_v3_cascade`,
  whatsapp: `${PRODUCTION_SITE_URL}/#whatsapp`,
  sms: `${PRODUCTION_SITE_URL}/#sms`,
  twilio: `${PRODUCTION_SITE_URL}/#twilio`,
  gps: `${PRODUCTION_SITE_URL}/#gps`,
} as const;

function ref(id: string): JsonLd {
  return { "@id": id };
}

/**
 * Grafo GEO para la home: TechArticle + FAQPage con about/mentions
 * enlazados por @id (producto, Chile, oferta $6.900 CLP, WhatsApp, SMS, Twilio, GPS).
 * Sustituye un FAQPage suelto para no duplicar el tipo en la misma URL.
 */
export function techArticleFaqGraphJsonLd(items: { q: string; a: string }[]): JsonLd {
  const monthlyLabel = `$${PLAN.monthly.toLocaleString("es-CL")}/mes`;
  const questions = items.map((item, index) => ({
    "@type": "Question",
    "@id": `${PRODUCTION_SITE_URL}/#faq-q-${index + 1}`,
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Country",
        "@id": GEO_IDS.chile,
        name: "Chile",
        alternateName: "CL",
        sameAs: "https://www.wikidata.org/wiki/Q298",
      },
      {
        "@type": "SoftwareApplication",
        "@id": GEO_IDS.whatsapp,
        name: "WhatsApp",
        applicationCategory: "CommunicationApplication",
        sameAs: ["https://www.whatsapp.com", "https://www.wikidata.org/wiki/Q1049511"],
      },
      {
        "@type": "Service",
        "@id": GEO_IDS.sms,
        name: "SMS",
        alternateName: "Short Message Service",
        sameAs: "https://www.wikidata.org/wiki/Q1321914",
      },
      {
        "@type": "Organization",
        "@id": GEO_IDS.twilio,
        name: "Twilio",
        url: "https://www.twilio.com",
        sameAs: ["https://www.twilio.com", "https://www.wikidata.org/wiki/Q7857511"],
      },
      {
        "@type": "Thing",
        "@id": GEO_IDS.gps,
        name: "GPS",
        alternateName: "Global Positioning System",
        sameAs: "https://www.wikidata.org/wiki/Q18822",
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": GEO_IDS.cascade,
        name: "ecosystem_v3_cascade",
        description:
          "Protocolo de canales redundantes Senior Safe: SMS al instante, WhatsApp a los 15 segundos y llamada de voz a los 60 segundos si ningún guardián confirma. El GPS viaja en cada alerta.",
      },
      {
        "@type": "Offer",
        "@id": GEO_IDS.offer,
        name: "Plan Único Senior Safe",
        price: String(PLAN.monthly),
        priceCurrency: "CLP",
        priceValidUntil: SEO_PRICE_VALID_UNTIL,
        availability: "https://schema.org/InStock",
        url: `${PRODUCTION_SITE_URL}/planes`,
        description: `Plan único ${monthlyLabel}, sin permanencia.`,
        areaServed: ref(GEO_IDS.chile),
      },
      {
        "@type": ["SoftwareApplication", "Product"],
        "@id": GEO_IDS.product,
        name: SEO_SITE_NAME,
        alternateName: SEO_BRAND,
        url: PRODUCTION_SITE_URL,
        operatingSystem: "Android",
        applicationCategory: "UtilitiesApplication",
        identifier: SENIOR_SAFE_ANDROID_PACKAGE_ID,
        offers: ref(GEO_IDS.offer),
        areaServed: ref(GEO_IDS.chile),
        description: SEO_DEFAULT_DESCRIPTION,
        sameAs: [PRODUCTION_SITE_URL, SENIOR_SAFE_PLAY_STORE_URL],
      },
      {
        "@type": "TechArticle",
        "@id": GEO_IDS.techArticle,
        headline:
          "Cascada de alertas Senior Safe: WhatsApp, SMS, GPS y llamada Twilio en Chile",
        alternativeHeadline: `Teleasistencia familiar móvil en Chile desde ${monthlyLabel}`,
        description: SEO_DEFAULT_DESCRIPTION,
        inLanguage: SEO_LANGUAGE,
        url: PRODUCTION_SITE_URL,
        image: SEO_OG_IMAGE,
        isAccessibleForFree: true,
        author: {
          "@type": "Organization",
          name: SEO_BRAND,
          url: PRODUCTION_SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: SEO_BRAND,
          url: PRODUCTION_SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${PRODUCTION_SITE_URL}/senior-safe-512.webp`,
          },
        },
        mainEntityOfPage: ref(GEO_IDS.webpage),
        about: [
          ref(GEO_IDS.product),
          ref(GEO_IDS.chile),
          ref(GEO_IDS.offer),
          ref(GEO_IDS.cascade),
        ],
        mentions: [
          ref(GEO_IDS.whatsapp),
          ref(GEO_IDS.sms),
          ref(GEO_IDS.twilio),
          ref(GEO_IDS.gps),
        ],
        articleSection: "Teleasistencia familiar",
        keywords: [
          "Senior Safe",
          "Chile",
          monthlyLabel,
          "WhatsApp",
          "SMS",
          "Twilio",
          "GPS",
          "ecosystem_v3_cascade",
          "teleasistencia",
          "detección de caídas",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": GEO_IDS.faq,
        url: `${PRODUCTION_SITE_URL}/#faq`,
        inLanguage: SEO_LANGUAGE,
        isPartOf: ref(GEO_IDS.webpage),
        about: [ref(GEO_IDS.product), ref(GEO_IDS.chile), ref(GEO_IDS.offer)],
        mentions: [
          ref(GEO_IDS.whatsapp),
          ref(GEO_IDS.sms),
          ref(GEO_IDS.twilio),
          ref(GEO_IDS.gps),
          ref(GEO_IDS.cascade),
        ],
        mainEntity: questions,
      },
      {
        "@type": "WebPage",
        "@id": GEO_IDS.webpage,
        url: PRODUCTION_SITE_URL,
        name: SEO_DEFAULT_TITLE,
        inLanguage: SEO_LANGUAGE,
        isPartOf: {
          "@type": "WebSite",
          name: SEO_SITE_NAME,
          url: PRODUCTION_SITE_URL,
        },
        about: [ref(GEO_IDS.product), ref(GEO_IDS.chile)],
        mentions: [
          ref(GEO_IDS.offer),
          ref(GEO_IDS.whatsapp),
          ref(GEO_IDS.sms),
          ref(GEO_IDS.twilio),
          ref(GEO_IDS.gps),
          ref(GEO_IDS.cascade),
        ],
        mainEntity: [ref(GEO_IDS.techArticle), ref(GEO_IDS.faq)],
      },
    ],
  };
}

export function blogArticleJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  authorName: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: {
      "@type": "ImageObject",
      url: input.imageUrl.startsWith("http")
        ? input.imageUrl
        : `${PRODUCTION_SITE_URL}${input.imageUrl}`,
      width: input.imageWidth,
      height: input.imageHeight,
    },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: {
      "@type": "Organization",
      name: input.authorName,
      url: PRODUCTION_SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SEO_BRAND,
      logo: {
        "@type": "ImageObject",
        url: `${PRODUCTION_SITE_URL}/senior-safe-512.webp`,
      },
    },
    mainEntityOfPage: canonicalUrl(input.pathname),
    inLanguage: SEO_LANGUAGE,
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

export type SeoPageMetaInput = {
  title: string;
  description: string;
  pathname: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  robots?: string;
};

/** Meta tags on-page completos para rutas públicas indexables. */
export function buildPublicPageMeta(input: SeoPageMetaInput) {
  const {
    title,
    description,
    pathname,
    ogTitle = title,
    ogDescription = description,
    ogType = "website",
    robots = "index, follow, max-image-preview:large",
  } = input;

  const url = canonicalUrl(pathname);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: SEO_BRAND },
      { name: "robots", content: robots },
      { name: "geo.region", content: "CL" },
      { name: "language", content: SEO_LANGUAGE },
      { property: "og:site_name", content: SEO_SITE_NAME },
      { property: "og:locale", content: SEO_LOCALE },
      { property: "og:type", content: ogType },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:url", content: url },
      { property: "og:image", content: SEO_OG_IMAGE },
      { property: "og:image:width", content: SEO_OG_IMAGE_WIDTH },
      { property: "og:image:height", content: SEO_OG_IMAGE_HEIGHT },
      { property: "og:image:alt", content: `${SEO_SITE_NAME} — botón SOS y alertas familiares` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: ogDescription },
      { name: "twitter:image", content: SEO_OG_IMAGE },
    ],
    links: [canonicalLink(pathname), hreflangLink(pathname)],
  };
}

/** Meta mínimo para rutas privadas / transaccionales. */
export function buildPrivatePageMeta(title: string, description?: string) {
  return {
    meta: [
      { title },
      ...(description ? [{ name: "description", content: description }] : []),
      { name: "robots", content: "noindex,nofollow" },
    ],
  };
}

export function globalJsonLdScripts(pathname: string) {
  if (pathname === "/" || pathname === "") {
    return [];
  }

  return [jsonLdHeadScript([organizationJsonLd(), webSiteJsonLd()])];
}
