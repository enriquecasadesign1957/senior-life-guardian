import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { BlogGeneratedArticle } from "@/components/BlogGeneratedArticle";
import { generatedPosts } from "@/lib/blog/generated";
import {
  blogPostingJsonLd,
  getGeneratedPost,
  isReservedBlogSlug,
} from "@/lib/blog/posts";
import { buildPageMetadata, pageUrl } from "@/lib/seo";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams() {
  return generatedPosts
    .filter((post) => !isReservedBlogSlug(post.slug))
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getGeneratedPost(slug);
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  const base = buildPageMetadata({
    title: `${post.title} | WakeUp Dev`,
    description: post.description,
    path,
  });

  return {
    ...base,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.dateIso,
      authors: [post.author],
    },
  };
}

export default async function GeneratedBlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  if (isReservedBlogSlug(slug)) notFound();

  const post = getGeneratedPost(slug);
  if (!post) notFound();

  const canonical = pageUrl(`/blog/${post.slug}`);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, canonical)} />
      <MarketingShell>
        <BlogGeneratedArticle post={post} />
      </MarketingShell>
    </>
  );
}
