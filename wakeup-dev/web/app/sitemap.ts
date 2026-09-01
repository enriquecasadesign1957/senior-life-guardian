import type { MetadataRoute } from "next";
import { blogSitemapPaths } from "@/lib/blog/posts";

const SITE = "https://wakeupdev.com";

type PublicRoute = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

const marketingRoutes: PublicRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/what-is-wakeup-dev", priority: 0.9, changeFrequency: "monthly" },
  { path: "/webhook-to-phone-call", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.85, changeFrequency: "monthly" },
  { path: "/pagerduty-alternative", priority: 0.85, changeFrequency: "monthly" },
  { path: "/on-call-escalation", priority: 0.85, changeFrequency: "monthly" },
  { path: "/grafana-phone-alerts", priority: 0.85, changeFrequency: "monthly" },
  { path: "/uptimerobot-phone-alerts", priority: 0.85, changeFrequency: "monthly" },
];

const blogRoutes: PublicRoute[] = blogSitemapPaths().map((path) => ({
  path,
  priority: path === "/blog" ? 0.8 : 0.85,
  changeFrequency: path === "/blog" ? ("weekly" as const) : ("monthly" as const),
}));

const publicRoutes: PublicRoute[] = [...marketingRoutes, ...blogRoutes];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString();

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
