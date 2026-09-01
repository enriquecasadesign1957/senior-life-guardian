import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { BlogCaseStudySeniorSafeArticle } from "@/components/BlogCaseStudySeniorSafeArticle";
import {
  CASE_STUDY_PATH,
  caseStudySeniorSafe,
  caseStudySeniorSafeJsonLd,
} from "@/lib/blog/posts";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

const path = CASE_STUDY_PATH;

const base = buildPageMetadata({
  title: `${caseStudySeniorSafe.title} | WakeUp Dev`,
  description: caseStudySeniorSafe.description,
  path,
});

export const metadata = {
  ...base,
  keywords: [...caseStudySeniorSafe.keywords],
  authors: [{ name: caseStudySeniorSafe.author }],
  openGraph: {
    ...base.openGraph,
    type: "article",
    publishedTime: caseStudySeniorSafe.dateIso,
    authors: [caseStudySeniorSafe.author],
  },
};

export default function CaseStudySeniorSafePage() {
  const canonical = pageUrl(path);
  return (
    <>
      <JsonLd data={caseStudySeniorSafeJsonLd(canonical)} />
      <MarketingShell>
        <BlogCaseStudySeniorSafeArticle />
      </MarketingShell>
    </>
  );
}
