import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { blogPostPath, formatBlogDate } from "@/lib/blog";

const PETROL = "var(--brand-petrol)";

export function BlogPostCard({ post }: { post: BlogPost }) {
  const href = blogPostPath(post.slug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <Link to={href} className="block overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.coverAlt}
          width={post.coverWidth}
          height={post.coverHeight}
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span style={{ color: PETROL }}>{post.category}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
        </div>
        <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground md:text-2xl">
          <Link to={href} className="hover:underline decoration-2 underline-offset-4">
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
          {post.excerpt}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readingMinutes} min de lectura
          </span>
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:opacity-80"
            style={{ color: PETROL }}
          >
            Leer artículo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
