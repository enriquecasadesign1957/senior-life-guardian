import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { BlogPostCard } from "@/components/blog-post-card";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { SoroBlogEmbed } from "@/components/soro-blog-embed";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { BLOG_POSTS, getBlogPostsNewestFirst } from "@/lib/blog";
import { buildPublicPageMeta, breadcrumbJsonLd, jsonLdHeadScript } from "@/lib/seo";

const DISCOVER_ROBOTS = "index, follow, max-image-preview:large";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const page = buildPublicPageMeta({
      title: "Blog Senior Safe — Guías de protección para familias en Chile",
      description:
        "Artículos claros sobre caídas, alertas familiares, IA en el celular y cómo cuidar a adultos mayores en casa. Contenido práctico para hijos y cuidadores.",
      pathname: "/blog",
      ogTitle: "Blog Senior Safe — protección familiar sin tecnicismos",
      robots: DISCOVER_ROBOTS,
    });

    return {
      ...page,
      scripts: [
        jsonLdHeadScript(
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ),
      ],
    };
  },
  component: BlogIndexPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";

function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section
          className="relative overflow-hidden text-white"
          style={{
            background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 55%, oklch(0.5 0.14 235) 100%)`,
          }}
        >
          <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              <BookOpen className="h-4 w-4" aria-hidden />
              Blog Senior Safe
            </p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
              Guías claras para cuidar a quien más quieres
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              Explicamos sin tecnicismos cómo funciona la detección de caídas, las alertas
              familiares y la tecnología que ayuda en emergencias domésticas en Chile.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Artículos recientes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {BLOG_POSTS.length} {BLOG_POSTS.length === 1 ? "artículo" : "artículos"} publicados
              </p>
            </div>
            <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: PETROL }}>
              Volver al inicio
            </Link>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getBlogPostsNewestFirst().map((post) => (
              <li key={post.slug}>
                <BlogPostCard post={post} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12 md:pb-16" aria-label="Más artículos">
          <SoroBlogEmbed />
        </section>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
