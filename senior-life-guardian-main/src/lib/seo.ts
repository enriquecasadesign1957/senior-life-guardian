import { PRODUCTION_SITE_URL } from "@/lib/app-url";

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
