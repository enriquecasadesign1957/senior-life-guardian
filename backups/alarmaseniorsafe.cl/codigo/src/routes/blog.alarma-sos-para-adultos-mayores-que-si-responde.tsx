import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Clock, Shield } from "lucide-react";
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

const SLUG = "alarma-sos-para-adultos-mayores-que-si-responde";
const POST = getBlogPost(SLUG)!;
const DISCOVER_ROBOTS = "index, follow, max-image-preview:large";
const PATH = blogPostPath(SLUG);

const HEADLINE = "Alarma SOS para adultos mayores que sí responde";
const TECH_DESCRIPTION =
  "Qué debe resolver una alarma SOS para adultos mayores: botón simple, GPS, alerta en cascada por WhatsApp, SMS y llamada, y una red familiar que confirma quién tomó el caso.";
const COVER = "/images/blog-alarma-sos-responde.png";
const COVER_ABS = `${PRODUCTION_SITE_URL}${COVER}`;

function techArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: HEADLINE,
    description: TECH_DESCRIPTION,
    image: COVER_ABS,
    datePublished: "2026-08-15T12:00:00-04:00",
    inLanguage: "es-CL",
    author: {
      "@type": "Organization",
      name: "Equipo Senior Safe",
    },
  };
}

export const Route = createFileRoute(
  "/blog/alarma-sos-para-adultos-mayores-que-si-responde",
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
                <Shield className="h-3.5 w-3.5" aria-hidden />
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
                className="aspect-[1200/630] w-full object-cover object-top"
              />
            </figure>

            <div className="py-12 md:py-16">
              <P>
                Un martes a las 11:40, tu mamá puede tropezar en la cocina, sentirse descompensada
                en la calle o simplemente no alcanzar el teléfono a tiempo. El problema no es solo
                la emergencia: es que nadie se entere hasta horas después. Una alarma SOS para
                adultos mayores existe para acortar esa distancia y activar a la familia cuando
                realmente importa.
              </P>
              <P>
                Para quienes trabajan, viven en otra comuna o combinan el cuidado de sus hijos con
                el de sus padres, no se trata de controlar cada movimiento. Se trata de contar con
                una red de cuidado que responda rápido, entregue información útil y permita que la
                persona mayor conserve su autonomía.
              </P>

              <SectionTitle>Qué debe resolver una alarma SOS para adultos mayores</SectionTitle>
              <P>
                Un botón de auxilio por sí solo puede ser útil, pero no basta si la alerta queda
                sin respuesta, si no informa dónde está la persona o si depende de que alguien vea
                una notificación justo en ese minuto. Una solución de cuidado bien diseñada debe
                pensar en el escenario completo: la emergencia, la comunicación y la confirmación
                de que alguien tomó el caso.
              </P>
              <P>
                El primer requisito es la simplicidad. En una situación de miedo, dolor o
                confusión, la persona no debería abrir varias aplicaciones, buscar un contacto o
                explicar lo que ocurre. El botón SOS debe ser visible, fácil de activar y
                funcionar desde el celular que ya conoce y lleva consigo.
              </P>
              <P>
                El segundo requisito es la ubicación. Saber que tu papá necesita ayuda no sirve de
                mucho si está fuera de casa y nadie sabe dónde encontrarlo. La geolocalización GPS
                permite enviar su posición a los guardianes para que puedan decidir si llaman, van
                personalmente o coordinan apoyo cercano.
              </P>
              <P>
                El tercero es la respuesta real. Una alerta efectiva no puede depender de una sola
                persona. Si tú estás en una reunión, manejando o sin señal, otro familiar debe
                poder recibir el aviso. Por eso, el sistema necesita comunicación redundante y un
                protocolo de escalamiento que no se detenga en el primer intento.
              </P>

              <SectionTitle>Del botón SOS a una alerta en cascada</SectionTitle>
              <P>
                La diferencia entre una función básica y un sistema de protección está en lo que
                ocurre después de presionar el botón. Una alarma SOS para adultos mayores debe
                iniciar una alerta en cascada: avisar por más de un canal, confirmar la recepción
                y escalar cuando nadie responde.
              </P>
              <P>
                Imagina que tu mamá activa el SOS. Senior Safe envía la alerta por SMS, WhatsApp y
                notificación a los guardianes definidos por la familia. Usar varios canales aumenta
                la resiliencia: {CASCADE_MARKETING_SUMMARY}
              </P>
              <P>
                Si el aviso no recibe respuesta, el escalamiento por voz cobra especial
                importancia. Las llamadas telefónicas son más difíciles de ignorar que una
                notificación silenciosa entre decenas de mensajes. Este mecanismo no reemplaza la
                decisión de la familia, pero sí reduce el riesgo de que una emergencia quede sin
                atención por una omisión involuntaria.
              </P>
              <P>
                La confirmación también es clave. Recibir una alerta no significa que alguien ya
                se está haciendo cargo. Un buen flujo permite saber quién confirmó, quién llamó a
                la persona protegida y si es necesario activar a otro integrante de la red. Esa
                visibilidad evita el clásico grupo familiar donde todos asumen que otra persona
                reaccionó.
              </P>

              <SectionTitle>Caídas: cuando no es posible pedir ayuda</SectionTitle>
              <P>
                Las caídas preocupan a quienes cuidan a adultos mayores, especialmente si viven
                solos o tienen movilidad reducida. En ese contexto, esperar que la persona alcance
                a presionar un botón puede no ser suficiente.
              </P>
              <P>
                La detección de caídas usa sensores del teléfono para identificar movimientos
                bruscos seguidos de un periodo de inmovilidad. No se trata de asumir que cada
                golpe del celular es una emergencia: el sistema verifica una ventana de quietud
                antes de escalar la alerta.
              </P>
              <P>
                La mejor configuración combina ambas posibilidades. Si la persona puede actuar,
                presiona el SOS. Si no puede hacerlo y el teléfono detecta un evento compatible
                con una caída, el protocolo entrega una segunda oportunidad de aviso.
              </P>

              <SectionTitle>Fácil de instalar en tu celular</SectionTitle>
              <P>
                Senior Safe transforma el smartphone que ya tiene la persona en una red de
                protección familiar: botón SOS, GPS y alertas por WhatsApp, SMS y llamada
                automática. El foco es que la familia reciba el aviso directo, sin depender de un
                call center para iniciar la reacción.
              </P>
              <P>
                Chile avanza hacia un envejecimiento de su población. Miles de adultos mayores
                viven de forma independiente mientras sus familias trabajan. Frente a esa
                realidad, Senior Safe busca un modelo accesible: Plan Único desde{" "}
                <strong className="text-foreground font-semibold">
                  ${formatPlanPrice(PLAN.monthly)}/mes
                </strong>
                , sin contratos de permanencia.
              </P>
              <P>
                Ante un problema en casa, en la calle o una situación de inseguridad, el usuario
                pulsa el botón SOS. El sistema geolocaliza a la persona y dispara la cascada a su
                red familiar. Puedes bajarla desde{" "}
                <a
                  href={SENIOR_SAFE_PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: PETROL }}
                >
                  Google Play
                </a>{" "}
                o instalarla en iPhone vía Safari.
              </P>

              <SectionTitle>Cómo configurar una red de cuidado que funcione</SectionTitle>
              <P>
                La tecnología responde mejor cuando la familia acuerda reglas sencillas antes de
                necesitarla. No basta con instalar la aplicación y asumir que todo está
                resuelto. Definir responsables, probar el flujo y ajustar los contactos evita
                dudas en un momento de estrés.
              </P>
              <P>
                Primero, elige guardianes que tengan disponibilidad distinta. Por ejemplo, una
                hija que trabaja cerca durante el día, un hijo que puede responder por teléfono y
                una vecina o cuidador que vive a pocos minutos. La diversidad de horarios y
                ubicaciones es más valiosa que sumar contactos que siempre están ocupados al mismo
                tiempo.
              </P>
              <P>
                Luego, acuerden qué hacer ante cada tipo de aviso. Si llega una alerta con
                ubicación GPS y tu mamá responde una llamada diciendo que está bien, quizá basta
                con verificar. Si no contesta, está desorientada o el punto de ubicación muestra
                que está en la calle, alguien debe tener claridad sobre quién irá, quién llamará
                a un vecino y cuándo se debe contactar a los servicios de emergencia.
              </P>
              <P>
                También es recomendable hacer una prueba inicial. Activen el SOS en un momento
                tranquilo, revisen qué mensajes recibe cada guardián, validen que la ubicación
                sea comprensible y confirmen que las llamadas de escalamiento entren
                correctamente. Una prueba de cinco minutos puede revelar un número mal
                ingresado, permisos de GPS desactivados o una persona que no sabía que sería
                contacto de emergencia.
              </P>

              <SectionTitle>Señales para elegir un servicio confiable</SectionTitle>
              <P>
                Antes de contratar, revisa el funcionamiento y no solo la promesa de seguridad.
                Pregunta qué canales usa para alertar, si confirma recepción, cómo opera cuando el
                primer contacto no responde y si permite actualizar guardianes sin trámites
                complejos.
              </P>
              <P>
                La transparencia comercial también importa. Busca cobertura nacional, activación
                clara, precio visible, medios de pago conocidos y condiciones de cancelación sin
                letra chica. En una herramienta de cuidado familiar, no debieras quedar atrapado
                en un contrato largo solo porque cambió la necesidad de tu padre o madre.
              </P>
              <P>
                Senior Safe convierte el celular en una red de protección con botón SOS, detección
                de caídas, GPS y alertas automáticas por WhatsApp, SMS y llamadas. Su foco en la
                alerta en cascada permite que la familia reciba el aviso directo.
              </P>

              <SectionTitle>La tranquilidad no consiste en vigilar</SectionTitle>
              <P>
                Una alarma bien configurada no le quita independencia a una persona mayor. Al
                contrario: puede darle más seguridad para salir a caminar, ir a controles, visitar
                amistades o quedarse en casa sin sentir que cada actividad requiere supervisión
                constante.
              </P>
              <P>
                Para la familia, la tranquilidad no viene de mirar una pantalla todo el día. Viene
                de saber que, si pasa algo, existe una forma simple de pedir ayuda, una ubicación
                para actuar y una cadena de contactos preparada para responder. Hablarlo hoy,
                probarlo juntos y dejar los roles claros puede hacer una diferencia enorme cuando
                cada minuto cuenta.
              </P>

              <div
                className="mt-12 rounded-3xl border border-border p-7 md:p-9 shadow-sm"
                style={{
                  background:
                    "linear-gradient(145deg, white 0%, color-mix(in oklab, var(--brand-petrol) 7%, white) 100%)",
                }}
              >
                <h3 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">
                  Activa una alarma SOS que sí responde
                </h3>
                <p className="mt-3 text-lg leading-relaxed tracking-wide text-muted-foreground">
                  Plan Único desde ${formatPlanPrice(PLAN.monthly)}/mes, sin permanencia. {CASCADE_MARKETING_SUMMARY}
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
