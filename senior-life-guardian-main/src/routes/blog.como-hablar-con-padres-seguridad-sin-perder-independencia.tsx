import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Clock, HeartHandshake } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getBlogPost, formatBlogDate, blogPostPath } from "@/lib/blog";
import { CASCADE_MARKETING_SUMMARY } from "@/lib/emergency-cascade-timing";
import { PLAN, checkoutUrl, formatPlanPrice } from "@/lib/plans";
import {
  buildPublicPageMeta,
  breadcrumbJsonLd,
  jsonLdHeadScript,
} from "@/lib/seo";
import { PRODUCTION_SITE_URL, SENIOR_SAFE_PLAY_STORE_URL } from "@/lib/app-url";

const SLUG = "como-hablar-con-padres-seguridad-sin-perder-independencia";
const POST = getBlogPost(SLUG)!;
const DISCOVER_ROBOTS = "index, follow, max-image-preview:large";
const PATH = blogPostPath(SLUG);

const HEADLINE =
  "¿No quiere usar un botón de pánico? Cómo hablar con tus padres sobre su seguridad sin que sientan que pierden su independencia";
const TECH_DESCRIPTION =
  "Estrategias de comunicación para convencer a adultos mayores de usar teleasistencia móvil sin afectar su autonomía ni dignidad.";
const COVER = "/images/blog-independencia-senior.jpg";
const COVER_ABS = `${PRODUCTION_SITE_URL}${COVER}`;

function techArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: HEADLINE,
    description: TECH_DESCRIPTION,
    image: COVER_ABS,
    datePublished: "2026-08-09T12:00:00-04:00",
    inLanguage: "es-CL",
    author: {
      "@type": "Organization",
      name: "Equipo de Psicología y Bienestar Senior Safe",
    },
  };
}

export const Route = createFileRoute(
  "/blog/como-hablar-con-padres-seguridad-sin-perder-independencia",
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
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: POST.coverAlt },
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
                <HeartHandshake className="h-3.5 w-3.5" aria-hidden />
                {POST.category}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight tracking-wide">
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
                height={630}
                fetchPriority="high"
                decoding="async"
                className="aspect-[1200/630] w-full object-cover"
              />
            </figure>

            <div className="py-12 md:py-16">
              <P>
                A medida que nuestros padres envejecen, es natural que nos preocupe su seguridad
                cuando están solos en casa. Sin embargo, proponerles soluciones tradicionales de
                teleasistencia suele chocar con una barrera invisible pero muy fuerte: la
                resistencia al cambio y el miedo a perder su autonomía.
              </P>
              <P>
                Para muchos adultos mayores en Chile, aceptar un collar de emergencia, una pulsera
                médica o un botón de pánico físico es sinónimo de &ldquo;sentirse enfermos&rdquo; o
                perder el control de sus vidas. ¿Cómo podemos protegerlos sin herir su orgullo ni
                vulnerar su dignidad? La clave está en cambiar el enfoque de la conversación.
              </P>

              <SectionTitle>1. Evita el lenguaje de la &ldquo;fragilidad&rdquo;</SectionTitle>
              <P>
                El primer error que cometemos los hijos es abordar la conversación desde el miedo o
                la sobreprotección. Frases como &ldquo;ya no puedes estar solo&rdquo; o &ldquo;te
                vas a caer&rdquo; generan defensas inmediatas.
              </P>
              <P>
                En lugar de centrar la charla en sus limitaciones, enfócala en{" "}
                <strong className="text-foreground font-semibold">tu tranquilidad</strong> y en la
                continuidad de sus actividades cotidianas. Explícales que la tecnología actual no
                busca vigilarlos ni controlarlos, sino ser un respaldo invisible para que sigan
                disfrutando de sus talleres, paseos en la plaza o momentos de descanso con total
                libertad.
              </P>

              <SectionTitle>2. El rechazo a los dispositivos estigmatizantes</SectionTitle>
              <P>
                Los collares y pulseras de asistencia clásicos tienen un problema de diseño social:
                son evidentes y exponen la vulnerabilidad del usuario ante los demás. Además, las
                empresas tradicionales suelen amarrar a las familias con contratos forzosos y
                mensualidades de entre{" "}
                <strong className="text-foreground font-semibold">$30.000 y $80.000</strong>.
              </P>
              <P>
                La alternativa moderna es aprovechar las herramientas que ellos ya dominan. Hoy en
                día, casi todos los adultos mayores en Chile utilizan un teléfono celular para
                comunicarse con su familia por WhatsApp. Transformar ese mismo dispositivo que ya
                sienten como propio en su red de protección es una transición natural y cero
                invasiva.
              </P>

              <SectionTitle>3. Explicar el sistema como una &ldquo;Red de Guardianes&rdquo;</SectionTitle>
              <P>
                Cuando les muestres cómo funciona la tecnología de Senior Safe, no hables de una
                &ldquo;alarma de ancianos&rdquo;. Preséntaselo como una{" "}
                <strong className="text-foreground font-semibold">
                  red de comunicación inteligente
                </strong>{" "}
                donde ellos tienen el control:
              </P>

              <ul className="mt-8 space-y-5">
                <li className="rounded-3xl border border-border bg-white p-6 md:p-7 shadow-sm">
                  <h3 className="text-xl font-bold tracking-wide text-foreground">
                    Activación por decisión propia
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    Si se sienten en una situación de riesgo (un problema de{" "}
                    <strong className="text-foreground">Salud</strong>, un{" "}
                    <strong className="text-foreground">Accidente</strong> o un problema de{" "}
                    <strong className="text-foreground">Delincuencia</strong> como el &ldquo;cuento
                    del tío&rdquo;), basta con un toque en la pantalla de su celular o mediante los
                    sensores automatizados de detección de caídas.
                  </p>
                </li>
                <li className="rounded-3xl border border-border bg-white p-6 md:p-7 shadow-sm">
                  <h3 className="text-xl font-bold tracking-wide text-foreground">
                    Inteligencia en cascada
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    Explícales que el sistema es robusto: ante una emergencia, el algoritmo ejecuta
                    un despacho multicanal automático. En la práctica:{" "}
                    <strong className="text-foreground">{CASCADE_MARKETING_SUMMARY}</strong>
                  </p>
                </li>
                <li className="rounded-3xl border border-border bg-white p-6 md:p-7 shadow-sm">
                  <h3 className="text-xl font-bold tracking-wide text-foreground">
                    Invisible pero potente
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    No hay collares que recargar ni aparatos extraños en la casa. Todo opera desde
                    su teléfono Android (vía{" "}
                    <a
                      href={SENIOR_SAFE_PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline-offset-2 hover:underline"
                      style={{ color: PETROL }}
                    >
                      Google Play
                    </a>
                    ) o iPhone (vía Safari).
                  </p>
                </li>
              </ul>

              <SectionTitle>Una solución accesible para toda la familia</SectionTitle>
              <P>
                Proteger la autonomía de los padres no tiene por qué transformarse en una carga
                financiera. Actualmente, es posible activar esta red de teleasistencia inteligente
                con un Plan Único desde{" "}
                <strong className="text-foreground font-semibold">
                  ${formatPlanPrice(PLAN.monthly)} mensuales
                </strong>
                , sin contratos de permanencia ni cobros por equipos.
              </P>
              <P>
                Hablar de seguridad con los padres no se trata de imponer restricciones, sino de
                regalarles una capa invisible de protección para que sigan siendo los dueños de su
                tiempo e independencia.
              </P>

              <div
                className="mt-12 rounded-3xl border border-border p-7 md:p-9 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 7%, white) 100%)",
                }}
              >
                <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                  Empieza la conversación con un plan claro
                </h3>
                <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                  Plan Único desde ${formatPlanPrice(PLAN.monthly)}/mes, sin permanencia. Protección
                  familiar sin estigma.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={checkoutUrl()}
                    className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-bold tracking-wide text-white transition hover:opacity-90"
                    style={{ background: DEEP }}
                  >
                    Contratar Plan Único
                  </a>
                  <Link
                    to="/guia"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3.5 text-base font-bold tracking-wide text-foreground transition hover:bg-muted/40"
                  >
                    Ver guía de instalación
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
