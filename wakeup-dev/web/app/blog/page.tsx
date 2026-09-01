import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { MarketingShell } from "@/components/MarketingShell";
import { blogPosts } from "@/lib/blog/posts";
import { buildPageMetadata, pageUrl, SITE } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "WakeUp Dev Blog — SRE Voice Alerts & Edge Escalation",
  description:
    "Technical notes on SRE emergency routing, Cloudflare Workers voice alerts, voicemail false positive mitigation, and production cascades from WakeUp Dev.",
  path: "/blog",
});

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "WakeUp Dev Blog",
  url: pageUrl("/blog"),
  publisher: { "@type": "Organization", name: "WakeUp Dev", url: SITE },
};

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd data={blogLd} />
      <MarketingShell>
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Blog
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Engineering notes
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Architecture from production: edge ingest, voice ACK, and on-call
            cascades — the same engine behind{" "}
            <Link href="/" className="text-accent underline-offset-2 hover:underline">
              WakeUp Dev
            </Link>
            .
          </p>
          <ul className="mt-12 space-y-6">
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <p className="text-xs text-zinc-500">
                    <time dateTime={post.dateIso}>{post.dateLabel}</time>
                    <span className="text-zinc-700"> · </span>
                    {post.author}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-50">
                    <Link
                      href={post.href}
                      className="transition hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {post.description}
                  </p>
                  <Link
                    href={post.href}
                    className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    Read article →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </MarketingShell>
    </>
  );
}
