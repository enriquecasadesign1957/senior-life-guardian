import type { MetadataRoute } from "next";

const SITE = "https://wakeupdev.com";

const PRIVATE_PATHS = ["/dashboard", "/billing", "/auth", "/gracias"] as const;

const AI_AND_SEARCH_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Googlebot",
  "PerplexityBot",
  "Applebot-Extended",
] as const;

type RobotRule = {
  userAgent: string;
  allow: string;
  disallow: string[];
};

function allowPublicCrawl(userAgent: string): RobotRule {
  return {
    userAgent,
    allow: "/",
    disallow: [...PRIVATE_PATHS],
  };
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      allowPublicCrawl("*"),
      ...AI_AND_SEARCH_BOTS.map((bot) => allowPublicCrawl(bot)),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
