import { generatedPosts } from "./generated";
import type { BlogIndexEntry, GeneratedPost } from "./types";

export type { BlogBlock, BlogIndexEntry, GeneratedPost } from "./types";

export const CASE_STUDY_SLUG = "case-study-senior-safe";
export const CASE_STUDY_PATH = `/blog/${CASE_STUDY_SLUG}`;

export const BLOG_AUTHOR = "Enrique Drack";

export const RESERVED_BLOG_SLUGS = [CASE_STUDY_SLUG] as const;

export function isReservedBlogSlug(slug: string): boolean {
  return (RESERVED_BLOG_SLUGS as readonly string[]).includes(slug);
}

export const caseStudySeniorSafe = {
  title:
    "Case Study: Scaling Smart Teleassistance Voice Routing with Edge Compute and Zero-Cold-Start Cascades",
  description:
    "How Senior Safe leverages WakeUp Dev's core engine, Cloudflare Workers, and Twilio voice bridges to process critical domestic emergency alerts in milliseconds — covering SRE emergency routing, Cloudflare Workers voice alerts, and voicemail false positive mitigation.",
  dateIso: "2026-08-31",
  dateLabel: "August 31, 2026",
  author: BLOG_AUTHOR,
  keywords: [
    "SRE emergency routing",
    "Cloudflare Workers voice alerts",
    "Voicemail false positive mitigation",
  ],
} as const;

export function blogPostingJsonLd(
  post: {
    title: string;
    description: string;
    dateIso: string;
    author: string;
    keywords?: readonly string[];
    coverImage?: string;
  },
  canonical: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.dateIso,
    dateModified: post.dateIso,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "WakeUp Dev",
      url: "https://wakeupdev.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    keywords: (post.keywords ?? []).join(", "),
    url: canonical,
    ...(post.coverImage ? { image: post.coverImage } : {}),
  };
}

export function caseStudySeniorSafeJsonLd(canonical: string) {
  return blogPostingJsonLd(caseStudySeniorSafe, canonical);
}

const featuredPosts: BlogIndexEntry[] = [
  {
    slug: CASE_STUDY_SLUG,
    href: CASE_STUDY_PATH,
    title: caseStudySeniorSafe.title,
    description: caseStudySeniorSafe.description,
    dateIso: caseStudySeniorSafe.dateIso,
    dateLabel: caseStudySeniorSafe.dateLabel,
    author: caseStudySeniorSafe.author,
  },
];

function toIndexEntry(post: GeneratedPost): BlogIndexEntry {
  return {
    slug: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    dateIso: post.dateIso,
    dateLabel: post.dateLabel,
    author: post.author,
    generated: true,
  };
}

export function getGeneratedPost(slug: string): GeneratedPost | undefined {
  return generatedPosts.find((post) => post.slug === slug);
}

export const blogPosts: BlogIndexEntry[] = [
  ...featuredPosts,
  ...generatedPosts.map(toIndexEntry),
].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

/** Paths for sitemap.xml — featured + every slug in generated.ts. */
export function blogSitemapPaths(): string[] {
  const paths = new Set<string>(["/blog"]);
  for (const post of blogPosts) paths.add(post.href);
  for (const post of generatedPosts) paths.add(`/blog/${post.slug}`);
  return [...paths];
}
