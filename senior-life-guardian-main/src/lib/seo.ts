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

/** Imagen Open Graph (1200×630) servida desde el dominio oficial — requisito Discover ≥1200px. */
export const SEO_OG_IMAGE = `${PRODUCTION_SITE_URL}/og-senior-safe.jpg`;
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

export function jsonLdHeadScript(data: JsonLd | JsonLd[]) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify(data),
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
  const scripts = [
    jsonLdHeadScript([organizationJsonLd(), webSiteJsonLd()]),
  ];

  if (pathname === "/") {
    return scripts;
  }

  return scripts;
}
