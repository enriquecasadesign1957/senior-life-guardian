import type { Metadata } from "next";

export const SITE = "https://wakeupdev.com";
export const API_ALERT_URL = "https://api.wakeupdev.com/v1/alert";

export const OG_IMAGE = {
  url: "/og-wakeup-dev.jpg",
  width: 1200,
  height: 630,
  alt: "WakeUp Dev — voice-first on-call alerting from webhooks to phone calls",
} as const;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
};

export function pageUrl(path: string): string {
  if (path === "/") return SITE;
  return `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
}: PageSeo): Metadata {
  const url = pageUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "WakeUp Dev",
      locale: "en_US",
      alternateLocale: ["es_CL"],
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
