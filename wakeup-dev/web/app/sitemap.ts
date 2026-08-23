import type { MetadataRoute } from "next";

const SITE = "https://wakeupdev.com";

type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

const publicRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/what-is-wakeup-dev", priority: 0.9, changeFrequency: "monthly" },
  { path: "/webhook-to-phone-call", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.85, changeFrequency: "monthly" },
  { path: "/pagerduty-alternative", priority: 0.85, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString();

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
