import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Clock,
  Heart,
  AlertTriangle,
  Shield,
  MapPin,
  Smartphone,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { getBlogPost, formatBlogDate, blogPostPath } from "@/lib/blog";
import {
  CASCADE_ALGORITHM_ID,
  CASCADE_MARKETING_SUMMARY,
} from "@/lib/emergency-cascade-timing";
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
  "Explicación de cómo el algoritmo en cascada y los sensores móviles discriminan emergencias de salud, caídas o delincuencia en adultos mayores.";
const COVER = "/images/blog-ia-teleasistencia.jpg";
const COVER_ABS = `${PRODUCTION_SITE_URL}${COVER}`;

function techArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: HEADLINE,
    description: TECH_DESCRIPTION,
    image: COVER_ABS,
    datePublished: "2026-08-06T12:00:00-04:00",
    author: {
      "@type": "Organization",
      name: "Equipo de Tecnología Senior Safe",
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

    // Forzar imagen editorial horizontal en OG/Twitter
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
        content: "Teleasistencia familiar con IA para adultos mayores en Chile",
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
const RED = "#dc2626";
const AMBER = "#ea580c";
const VIOLET = "#7c3aed";

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
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                {POST.category} · Tecnología
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-[2.65rem] font-bold leading-tight tracking-wide">
                {HEADLINE}
              </h1>
              <p className="mt-5 text-lg leading-relaxed tracking-wide text-white/85">
                {TECH_DESCRIPTION}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tracking-wide text-white/75">
                <span>Equipo de Tecnología Senior Safe</span>
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
                alt="Teleasistencia familiar con inteligencia artificial para adultos mayores en Chile"
                width={1200}
                height={675}
                fetchPriority="high"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>

            <div className="py-12 md:py-16">
              <P>
                En Chile, miles de familias viven con la misma inquietud:{" "}
                <strong className="text-foreground font-semibold">
                  si mamá o papá se cae, se desorienta o enfrenta un asalto, ¿quién se entera a tiempo?
                </strong>{" "}
                La respuesta ya no tiene que ser una alarma médica cara ni un call center lejano.
                Hoy la inteligencia artificial, los sensores del celular y WhatsApp pueden formar una
                red de rescate familiar en segundos.
              </P>

              {/* ——— Sección 1 ——— */}
              <SectionTitle>
                El costo oculto de las alarmas clásicas: amarras de $30.000 a $80.000 al mes
              </SectionTitle>
              <P>
                Las teleasistencias tradicionales suelen cobrar entre{" "}
                <strong className="text-foreground font-semibold">$30.000 y $80.000 mensuales</strong>,
                con contratos de permanencia, equipos físicos adicionales y un intermediario humano
                que filtra la emergencia antes de llegar a tu familia. Para muchos hogares eso es
                simplemente inalcanzable… y, además, más lento de lo que un hijo necesita cuando el
                tiempo cuenta.
              </P>
              <P>
                Senior Safe nace con otra lógica:{" "}
                <strong className="text-foreground font-semibold">
                  Plan Único desde ${formatPlanPrice(PLAN.monthly)}/mes, sin contratos de amarre
                </strong>
                , usando el smartphone que el adulto mayor ya tiene. La alerta no se queda en un
                centro de llamadas: llega directo a los guardianes por WhatsApp, SMS, GPS y llamada
                automática.
              </P>
              <div
                className="mt-8 rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 5%, white) 100%)",
                }}
              >
                <p className="text-lg leading-relaxed tracking-wide text-foreground">
                  Menos amarras económicas. Más velocidad familiar. Misma prioridad: que alguien de
                  confianza se entere a tiempo.
                </p>
              </div>

              {/* ——— Sección 2 ——— */}
              <SectionTitle>
                Algoritmo en cascada: cómo WhatsApp, SMS y Twilio se coordinan solos
              </SectionTitle>
              <P>
                El corazón técnico de Senior Safe es el algoritmo{" "}
                <code
                  className="rounded-md px-2 py-0.5 text-base font-semibold"
                  style={{ background: "color-mix(in oklab, var(--brand-petrol) 10%, white)", color: DEEP }}
                >
                  {CASCADE_ALGORITHM_ID}
                </code>
                . No espera a que un operador conteste:{" "}
                <strong className="text-foreground font-semibold">{CASCADE_MARKETING_SUMMARY}</strong>
              </P>
              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: MessageCircle,
                    title: "SMS inmediato",
                    body: "En cuanto se confirma la emergencia, el sistema despacha SMS a los guardianes priorizados para que el aviso no dependa solo de datos móviles.",
                  },
                  {
                    icon: MessageCircle,
                    title: "WhatsApp a los 15 segundos",
                    body: "Si la cascada sigue activa, WhatsApp entrega el contexto de la emergencia, la categoría elegida y el enlace de ubicación para actuar sin demora.",
                  },
                  {
                    icon: PhoneCall,
                    title: "Llamada Twilio a los 60 segundos",
                    body: "Si nadie confirma la lectura en la plataforma a tiempo, se dispara una llamada automatizada vía Twilio para insistir por voz — el canal que más cuesta ignorar.",
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm"
                  >
                    <span
                      className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ background: PETROL }}
                    >
                      <item.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold tracking-wide text-foreground">{item.title}</h3>
                      <p className="mt-2 text-lg leading-relaxed tracking-wide text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <P>
                Esta cascada reduce el riesgo de que un mensaje quede sin leer. La familia recibe
                redundancia real: texto, mensajería y voz, en el orden que maximiza la probabilidad de
                respuesta.
              </P>

              {/* ——— Sección 3 ——— */}
              <SectionTitle>
                Tres botones que discriminan la emergencia: Salud, Accidente/Caída y Delincuencia
              </SectionTitle>
              <P>
                Un aviso genérico no basta. Cuando el adulto mayor (o la IA de caídas) activa el
                protocolo, Senior Safe discrimina el tipo de ayuda con tres botones grandes,
                senior-first, para que la familia sepa{" "}
                <strong className="text-foreground font-semibold">qué está pasando antes de actuar</strong>.
              </P>

              <div className="mt-8 space-y-5">
                <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{ background: RED }}
                    >
                      <Heart className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                      1. Salud — crisis médica
                    </h3>
                  </div>
                  <p className="mt-4 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    Malestar fuerte, dificultad para respirar, presión, síntomas que requieren
                    atención rápida. El guardián recibe el contexto de{" "}
                    <strong className="text-foreground">crisis de salud</strong> y puede llamar a
                    urgencias o llegar a la casa con información clara, no con una alarma ambigua.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{ background: AMBER }}
                    >
                      <AlertTriangle className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                      2. Accidente / Caída — sensores + IA
                    </h3>
                  </div>
                  <p className="mt-4 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    Aquí entra el protocolo inteligente del acelerómetro: el celular detecta un
                    impacto brusco compatible con una caída. Luego valida{" "}
                    <strong className="text-foreground">
                      3 segundos de inmovilidad total
                    </strong>{" "}
                    para descartar falsos positivos cotidianos (sentarse fuerte, dejar el teléfono
                    sobre la mesa). Si la persona no cancela la cuenta regresiva con vibración y
                    sirena, se despacha el auxilio a la familia.
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{ background: VIOLET }}
                    >
                      <Shield className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                      3. Delincuencia — portonazos, calle o “cuento del tío”
                    </h3>
                  </div>
                  <p className="mt-4 text-lg leading-relaxed tracking-wide text-muted-foreground">
                    Asaltos, portonazos, intimidación en la vía pública o intentos de fraude
                    presencial. Un toque alcanza para que los guardianes sepan que el riesgo es de{" "}
                    <strong className="text-foreground">seguridad personal</strong>, no solo médico,
                    y puedan coordinar ayuda o presencia de inmediato.
                  </p>
                </div>
              </div>

              {/* ——— Sección 4 ——— */}
              <SectionTitle>
                GPS con Google Maps y Waze: rescate también fuera de casa
              </SectionTitle>
              <P>
                Una emergencia no siempre ocurre en el living. Si el adulto mayor se desorienta en la
                calle, en la feria o de camino al consultorio, Senior Safe envía ubicación en tiempo
                real con{" "}
                <strong className="text-foreground font-semibold">
                  enlaces interactivos a Google Maps y Waze
                </strong>
                . Los guardianes abren la ruta con un toque y pueden llegar sin adivinar la dirección.
              </P>
              <div className="mt-8 flex gap-4 rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: PETROL }}
                >
                  <MapPin className="h-6 w-6" aria-hidden />
                </span>
                <p className="text-lg leading-relaxed tracking-wide text-muted-foreground">
                  El GPS familiar convierte una alerta abstracta en un punto concreto en el mapa:
                  útil en caídas en la vereda, desorientación o cualquier rescate en vía pública.
                </p>
              </div>

              <SectionTitle>Acceso universal: Android, iPhone y precio transparente</SectionTitle>
              <P>
                Senior Safe está pensado para instalarse sin fricción:{" "}
                <strong className="text-foreground font-semibold">Google Play en Android</strong> y{" "}
                <strong className="text-foreground font-semibold">Safari en iPhone</strong> (añadir a
                pantalla de inicio). Un solo plan — el Plan Único — desde{" "}
                <strong className="text-foreground font-semibold">
                  ${formatPlanPrice(PLAN.monthly)}/mes sin contratos
                </strong>
                , con hasta tres guardianes conectados.
              </P>

              <div
                className="mt-10 rounded-3xl border border-border p-7 md:p-9 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 7%, white) 100%)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Smartphone className="mt-1 h-6 w-6 shrink-0" style={{ color: PETROL }} aria-hidden />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                      Empieza hoy la red de cuidado
                    </h3>
                    <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                      IA + cascada multicanal + tres botones claros + GPS navegable. Tecnología con
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
