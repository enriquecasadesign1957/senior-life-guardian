import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Clock, ExternalLink, Newspaper } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getBlogPost, formatBlogDate, blogPostPath } from "@/lib/blog";
import { PLAN, checkoutUrl, formatPlanPrice } from "@/lib/plans";
import {
  buildPublicPageMeta,
  breadcrumbJsonLd,
  jsonLdHeadScript,
} from "@/lib/seo";
import { PRODUCTION_SITE_URL } from "@/lib/app-url";

const SLUG = "revista-seguridad-destaca-lanzamiento-senior-safe";
const POST = getBlogPost(SLUG)!;
const DISCOVER_ROBOTS = "index, follow, max-image-preview:large";
const PATH = blogPostPath(SLUG);

const HEADLINE =
  'Revista Seguridad destaca el lanzamiento de Senior Safe en Chile: "Tecnología con corazón"';
const TECH_DESCRIPTION =
  "Reseña del reportaje de Revista Seguridad & Defensa sobre la plataforma chilena de teleasistencia con IA y algoritmo en cascada.";
const COVER = "/images/blog-prensa-seguridad.jpg";
const COVER_ABS = `${PRODUCTION_SITE_URL}${COVER}`;

/** Enlace canónico del reportaje original (tinyurl del brief era placeholder). */
const PRESS_URL =
  "https://revistaseguridad.cl/2026/07/10/tecnologia-con-corazon-lanzan-en-chile-alarma-inteligente-con-ia-para-optimizar-la-seguridad-de-los-adultos-mayores/";

function techArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: HEADLINE,
    description: TECH_DESCRIPTION,
    image: COVER_ABS,
    datePublished: "2026-07-10T12:00:00-04:00",
    inLanguage: "es-CL",
    author: {
      "@type": "Person",
      name: "robertogutter",
    },
    publisher: {
      "@type": "Organization",
      name: "Revista Seguridad & Defensa",
    },
  };
}

export const Route = createFileRoute(
  "/blog/revista-seguridad-destaca-lanzamiento-senior-safe",
)({
  head: () => {
    const page = buildPublicPageMeta({
      title: `${HEADLINE} — Blog Senior Safe`,
      description: TECH_DESCRIPTION,
      pathname: PATH,
      ogTitle: HEADLINE,
      ogDescription: TECH_DESCRIPTION,
      ogType: "article",
      robots: DISCOVER_ROBOTS,
    });

    const meta = [
      ...page.meta.filter(
        (m) =>
          !("property" in m && (m as { property?: string }).property?.startsWith("og:image")) &&
          !("name" in m && (m as { name?: string }).name === "twitter:image"),
      ),
      { property: "og:image", content: COVER_ABS },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "675" },
      {
        property: "og:image:alt",
        content: POST.coverAlt,
      },
      { name: "twitter:image", content: COVER_ABS },
    ];

    return {
      ...page,
      meta,
      scripts: [
        jsonLdHeadScript(
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: HEADLINE, path: PATH },
          ]),
        ),
        jsonLdHeadScript(techArticleJsonLd()),
      ],
    };
  },
  component: BlogArticlePage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-14 first:mt-0 text-2xl md:text-3xl font-bold tracking-wide text-foreground leading-snug">
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 text-lg leading-relaxed tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function BlogArticlePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article>
          <header
            className="relative overflow-hidden text-white"
            style={{
              background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 58%, oklch(0.48 0.12 235) 100%)`,
            }}
          >
            <div className="relative mx-auto max-w-3xl px-6 py-12 md:py-16">
              <Link
                to="/blog"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white/85 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Volver al blog
              </Link>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                <Newspaper className="h-3.5 w-3.5" aria-hidden />
                {POST.category} · Revista Seguridad & Defensa
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight tracking-wide">
                {HEADLINE}
              </h1>
              <p className="mt-5 text-lg leading-relaxed tracking-wide text-white/85">
                {TECH_DESCRIPTION}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tracking-wide text-white/75">
                <span>{POST.author}</span>
                <span aria-hidden>·</span>
                <time dateTime={POST.publishedAt}>{formatBlogDate(POST.publishedAt)}</time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {POST.readingMinutes} min
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-6">
            <figure className="-mt-8 md:-mt-10 overflow-hidden rounded-3xl border border-border bg-white shadow-xl">
              <img
                src={COVER}
                alt={POST.coverAlt}
                width={1200}
                height={675}
                fetchPriority="high"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>

            <div className="py-12 md:py-16">
              <P>
                La{" "}
                <strong className="text-foreground font-semibold">
                  Revista Seguridad & Defensa
                </strong>
                , medio líder en el sector, ha destacado a{" "}
                <strong className="text-foreground font-semibold">Senior Safe</strong> en su
                artículo{" "}
                <em className="text-foreground">
                  &ldquo;Tecnología con corazón: Lanzan en Chile alarma inteligente con IA para
                  optimizar la seguridad de los adultos mayores&rdquo;
                </em>
                . La nota resalta cómo la plataforma revoluciona la teleasistencia, ofreciendo una
                alternativa innovadora y accesible frente a las alarmas tradicionales y costosas.
              </P>

              <SectionTitle>Innovación ante el envejecimiento poblacional</SectionTitle>
              <P>
                El reportaje subraya la necesidad de soluciones tecnológicas en un Chile que
                envejece. Senior Safe responde a este desafío transformando smartphones en
                guardianes autónomos, democratizando la seguridad, con un enfoque en accesibilidad y
                eficiencia.
              </P>

              <SectionTitle>Alto rendimiento y accesibilidad</SectionTitle>
              <P>
                Se destaca la resiliencia de la nube, con latencias inferiores a{" "}
                <strong className="text-foreground font-semibold">1,5 segundos</strong> en pruebas
                técnicas. Enrique Drack, fundador, enfatiza en el reportaje el propósito de ofrecer
                tranquilidad con un costo accesible (
                <strong className="text-foreground font-semibold">
                  ${formatPlanPrice(PLAN.monthly)} mensuales
                </strong>
                ), eliminando contratos abusivos.
              </P>

              <SectionTitle>Algoritmo en cascada y alertas inteligentes</SectionTitle>
              <P>
                La publicación detalla el funcionamiento del algoritmo de comunicación en cascada.
                Ante emergencias (salud, caídas, delincuencia), el sistema activa alertas masivas vía
                WhatsApp con IA, SMS y llamadas automatizadas en segundos.
              </P>

              <blockquote
                className="mt-10 rounded-3xl border border-border p-6 md:p-8 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 6%, white) 100%)",
                }}
              >
                <p className="text-lg leading-relaxed tracking-wide text-foreground">
                  Lee el reportaje completo y verifica la publicación original en el portal de
                  prensa oficial:
                </p>
                <a
                  href={PRESS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-lg font-bold tracking-wide underline-offset-4 hover:underline"
                  style={{ color: PETROL }}
                >
                  Revista Seguridad — Lanzamiento Senior Safe
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </blockquote>

              <div
                className="mt-12 rounded-3xl border border-border p-7 md:p-9 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 7%, white) 100%)",
                }}
              >
                <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                  Protege a tu familia con el Plan Único
                </h3>
                <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                  Misma tecnología destacada por la prensa especializada: desde $
                  {formatPlanPrice(PLAN.monthly)}/mes, sin permanencia.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={checkoutUrl()}
                    className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-bold tracking-wide text-white transition hover:opacity-90"
                    style={{ background: DEEP }}
                  >
                    Contratar Senior Safe
                  </a>
                  <Link
                    to="/blog/como-la-ia-salva-vidas-emergencias-domesticas"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3.5 text-base font-bold tracking-wide text-foreground transition hover:bg-muted/40"
                  >
                    Cómo funciona la IA
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
