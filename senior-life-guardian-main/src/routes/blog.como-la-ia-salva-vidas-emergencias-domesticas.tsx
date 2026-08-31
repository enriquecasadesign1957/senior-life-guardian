import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Smartphone } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getBlogPost, formatBlogDate, blogPostPath } from "@/lib/blog";
import { PLAN, checkoutUrl, formatPlanPrice } from "@/lib/plans";
import {
  buildPublicPageMeta,
  breadcrumbJsonLd,
  jsonLdHeadScript,
} from "@/lib/seo";
import { PRODUCTION_SITE_URL, SENIOR_SAFE_PLAY_STORE_URL } from "@/lib/app-url";

const SLUG = "como-la-ia-salva-vidas-emergencias-domesticas";
const POST = getBlogPost(SLUG)!;
const DISCOVER_ROBOTS = "index, follow, max-image-preview:large";
const PATH = blogPostPath(SLUG);

const HEADLINE =
  "¿Cómo la Inteligencia Artificial y WhatsApp están salvando vidas ante emergencias domésticas en Chile?";
const TECH_DESCRIPTION =
  "Cascada WhatsApp/SMS/llamada, tres botones de emergencia y GPS a Maps/Waze: cómo la IA familiar protege a adultos mayores sin amarras de $30.000–$80.000 mensuales.";
const COVER = "/images/blog-ia-teleasistencia.jpg";
const COVER_ABS = `${PRODUCTION_SITE_URL}${COVER}`;
const COVER_ALT =
  "Adulto mayor independiente en su hogar utilizando teleasistencia inteligente con smartphone en Chile";

const WAKEUP_DEV_URL = "https://wakeupdev.com";
const WAKEUP_LINK_CLASS =
  "font-semibold underline underline-offset-2 decoration-2 hover:opacity-80 transition-opacity";

function techArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: HEADLINE,
    description: TECH_DESCRIPTION,
    image: COVER_ABS,
    datePublished: "2026-08-06T12:00:00-04:00",
    dateModified: "2026-08-31T12:00:00-04:00",
    inLanguage: "es-CL",
    author: {
      "@type": "Organization",
      name: "Equipo de Producto Senior Safe",
    },
  };
}

export const Route = createFileRoute("/blog/como-la-ia-salva-vidas-emergencias-domesticas")({
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
      { property: "og:image:alt", content: COVER_ALT },
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

function WakeUpLink({
  children,
}: {
  children: "sistema de monitoreo de alertas críticas" | "cascada de guardia automatizada";
}) {
  return (
    <a
      href={WAKEUP_DEV_URL}
      target="_blank"
      rel="noopener"
      className={WAKEUP_LINK_CLASS}
      style={{ color: PETROL }}
    >
      {children}
    </a>
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
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Teleasistencia familiar · Inteligencia artificial
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight tracking-wide">
                {HEADLINE}
              </h1>
              <p className="mt-5 text-lg leading-relaxed tracking-wide text-white/85">
                {TECH_DESCRIPTION}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tracking-wide text-white/75">
                <span>Por el Equipo de Producto Senior Safe</span>
                <span aria-hidden>·</span>
                <time dateTime={POST.publishedAt}>{formatBlogDate(POST.publishedAt)}</time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {POST.readingMinutes} min de lectura
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-6">
            <figure className="-mt-8 md:-mt-10 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
              <img
                src={COVER}
                alt={COVER_ALT}
                width={1200}
                height={675}
                fetchPriority="high"
                decoding="async"
                className="aspect-[16/9] w-full max-h-[400px] object-cover"
              />
              <figcaption className="px-4 py-3 text-center text-xs italic leading-relaxed text-muted-foreground">
                La tecnología móvil y la IA permiten redes de protección familiar inmediatas sin
                estigmatizar la independencia de nuestros padres.
              </figcaption>
            </figure>

            <div className="space-y-6 py-12 text-base leading-relaxed tracking-wide text-muted-foreground sm:text-lg md:py-16">
              <p>
                El ecosistema de la teleasistencia en Chile ha permanecido estancado durante décadas
                bajo un modelo costoso e ineficiente. Las empresas tradicionales atan a las familias
                a contratos de arriendo rígidos por un botón de pánico físico tipo collar o pulsera,
                cobrando mensualidades que oscilan entre los{" "}
                <strong className="font-semibold text-foreground">$30.000 y $80.000</strong> pesos.
                Sin embargo, el verdadero problema ocurre cuando ese botón se queda sobre el velador,
                sin batería, o cuando la central de llamadas no responde a tiempo.
              </p>

              <p>
                Hoy en día, la penetración de los teléfonos inteligentes y la flexibilidad de
                herramientas cotidianas como WhatsApp abren una alternativa mucho más accesible,
                humana y eficiente. Al transformar el celular en un nodo de protección inteligente,
                se elimina el costo del hardware dedicado y se empodera a los familiares como los
                guardianes directos del adulto mayor.
              </p>

              <aside
                className="my-10 rounded-r-2xl border border-border border-l-4 bg-muted/40 py-6 pl-6 pr-4 shadow-sm"
                style={{ borderLeftColor: PETROL }}
                aria-labelledby="infraestructura-critica"
              >
                <h2
                  id="infraestructura-critica"
                  className="mb-4 text-2xl font-bold tracking-tight text-foreground"
                >
                  Infraestructura crítica detrás de Senior Safe
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Cuando el objetivo es salvar vidas, un servidor convencional que “a veces se cae”
                  no es una opción. Un corte de hosting, una cola saturada o un centro de datos fuera
                  de servicio en el minuto de la emergencia equivale a silencio. Por eso la
                  teleasistencia de Senior Safe no corre sobre máquinas aisladas: las alertas se
                  procesan en{" "}
                  <strong className="font-semibold text-foreground">milisegundos</strong> en el borde
                  de la red, con{" "}
                  <strong className="font-semibold text-foreground">edge computing</strong> sobre{" "}
                  <strong className="font-semibold text-foreground">Cloudflare Workers</strong>, de
                  modo que la lógica de despacho se ejecuta cerca del usuario y no depende de un
                  único rack que pueda fallar.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Esa misma exigencia aplica a la voz. No basta con enviar un mensaje y esperar. Es
                  por esto que delegamos el enrutamiento de llamadas en un{" "}
                  <WakeUpLink>sistema de monitoreo de alertas críticas</WakeUpLink> de nivel DevOps,
                  con telefonía automatizada distribuida globalmente: si un nodo o un operador
                  regional no responde, la llamada se origina desde otra región sin que la familia
                  perciba la complejidad. El resultado es disponibilidad continua, no “mejor
                  esfuerzo”.
                </p>

                <h3 className="mb-3 mt-6 text-xl font-bold tracking-tight text-foreground">
                  De la alerta a una llamada interactiva que exige confirmación
                </h3>
                <p className="mb-4 text-muted-foreground">
                  El mecanismo de cascada transforma una emergencia en un protocolo cerrado, no en un
                  aviso que puede quedar sin leer. Tras SMS y WhatsApp, el sistema escala a{" "}
                  <strong className="font-semibold text-foreground">llamada telefónica interactiva</strong>:
                  el familiar debe{" "}
                  <strong className="font-semibold text-foreground">presionar 1</strong> para
                  confirmar que recibió el aviso y tomó el caso. Si no hay respuesta, si la llamada
                  cae al buzón o si nadie marca la tecla, el motor{" "}
                  <strong className="font-semibold text-foreground">
                    salta automáticamente al siguiente contacto
                  </strong>{" "}
                  de la red de guardianes. No hay operador humano que se distraiga, ni lista que se
                  quede a medias.
                </p>
                <p className="text-muted-foreground">
                  Esa orquestación —prioridad de contactos, timeouts, reintentos y confirmación
                  DTMF— es lo que nos permite activar una{" "}
                  <WakeUpLink>cascada de guardia automatizada</WakeUpLink> que contacta a los
                  familiares secuencialmente sin errores humanos. WhatsApp y SMS entregan contexto y
                  coordenadas GPS listas para abrir en Waze o Google Maps; la llamada telefónica
                  exige un acuse de recibo inequívoco. Infraestructura de grado crítico, pensada para
                  el segundo en que no hay segunda oportunidad.
                </p>
              </aside>

              <p>
                Al automatizar este enrutamiento mediante flujos inteligentes, el sistema de tres
                botones de nuestra PWA (Salud, Accidente/Caída o Delincuencia) garantiza que la red
                de guardianes actúe de inmediato, coordinando la asistencia en minutos y ofreciendo
                una protección con corazón, transparente, sin cobros abusivos ni contratos
                permanentes.
              </p>

              <div
                className="mt-10 rounded-3xl border border-border p-7 shadow-sm md:p-9"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 7%, white) 100%)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-1 h-6 w-6 shrink-0" style={{ color: PETROL }} aria-hidden />
                  <div>
                    <h2 className="text-xl font-bold tracking-wide text-foreground md:text-2xl">
                      Empieza hoy la red de cuidado
                    </h2>
                    <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                      IA, cascada multicanal, confirmación por voz y GPS navegable. Tecnología con
                      corazón, al alcance de la familia chilena.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={checkoutUrl()}
                        className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-bold tracking-wide text-white transition hover:opacity-90"
                        style={{ background: DEEP }}
                      >
                        Contratar desde ${formatPlanPrice(PLAN.monthly)}/mes
                      </a>
                      <a
                        href={SENIOR_SAFE_PLAY_STORE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3.5 text-base font-bold tracking-wide text-foreground transition hover:bg-muted/40"
                      >
                        Ver en Google Play
                      </a>
                      <Link
                        to="/guia"
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3.5 text-base font-bold tracking-wide text-foreground transition hover:bg-muted/40"
                      >
                        Guía iPhone (Safari)
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-10 text-base leading-relaxed tracking-wide text-muted-foreground">
                Este artículo es informativo y no sustituye orientación médica ni policial de
                urgencia. Fuente:{" "}
                <a
                  href={`${PRODUCTION_SITE_URL}/`}
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: PETROL }}
                >
                  alarmaseniorsafe.cl
                </a>
                .
              </p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
