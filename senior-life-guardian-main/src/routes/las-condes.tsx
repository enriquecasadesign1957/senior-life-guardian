import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-layout";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { buildPublicPageMeta } from "@/lib/seo";
import { PLAN_KEY } from "@/lib/plans";
import {
  CONVENIO_LAS_CONDES,
  CONVENIO_LAS_CONDES_URL,
  convenioCheckoutPath,
  convenioPrecio,
} from "@/lib/convenio-las-condes";

const GRAPHICS = [
  {
    src: "/convenio-las-condes/banner.png",
    title: "Banner para web",
    detail: "1200 × 628 px",
    href: "/convenio-las-condes/banner.png",
  },
  {
    src: "/convenio-las-condes/cuadrado.png",
    title: "Pieza para redes",
    detail: "1080 × 1080 px",
    href: "/convenio-las-condes/cuadrado.png",
  },
  {
    src: "/convenio-las-condes/ficha.png",
    title: "Ficha para imprimir",
    detail: "Ficha A4",
    href: "/convenio-las-condes/ficha.png",
  },
] as const;

const PLANTILLA = [
  {
    src: "/convenio-las-condes/tv-feed-1.png",
    title: "Lámina 1",
    detail: "Feed 1080 × 1350",
    href: "/convenio-las-condes/tv-feed-1.png",
  },
  {
    src: "/convenio-las-condes/tv-feed-2.png",
    title: "Lámina 2",
    detail: "Feed 1080 × 1350",
    href: "/convenio-las-condes/tv-feed-2.png",
  },
  {
    src: "/convenio-las-condes/tv-historia.png",
    title: "Historia",
    detail: "1080 × 1920",
    href: "/convenio-las-condes/tv-historia.png",
  },
] as const;

const INSTAGRAM = [
  {
    src: "/convenio-las-condes/ig-anuncio.png",
    title: "Anuncio",
    detail: "Feed 1080 × 1350",
    href: "/convenio-las-condes/ig-anuncio.png",
  },
  {
    src: "/convenio-las-condes/ig-precios.png",
    title: "Precios",
    detail: "Feed 1080 × 1350",
    href: "/convenio-las-condes/ig-precios.png",
  },
  {
    src: "/convenio-las-condes/ig-como.png",
    title: "Qué es",
    detail: "Feed 1080 × 1350",
    href: "/convenio-las-condes/ig-como.png",
  },
  {
    src: "/convenio-las-condes/ig-historia.png",
    title: "Historia",
    detail: "1080 × 1920",
    href: "/convenio-las-condes/ig-historia.png",
  },
] as const;

export const Route = createFileRoute("/las-condes")({
  head: () =>
    buildPublicPageMeta({
      title: "Convenio Tarjeta Vecino Las Condes — Senior Safe",
      description:
        "Vecinos de Las Condes: 15% con Tarjeta Vecino o 20% con Tarjeta Vecino Adulto Mayor en el Plan Único de Senior Safe. App en el celular, botón de emergencia y aviso a hasta 3 familiares.",
      pathname: "/las-condes",
      ogTitle: "Convenio Tarjeta Vecino · Las Condes",
      ogDescription:
        "Plan Único desde $5.520 al mes con Tarjeta Vecino Adulto Mayor. Aplicación en el celular, no es un aparato ni una central de monitoreo.",
    }),
  component: LasCondesPage,
});

function LasCondesPage() {
  const offer = CONVENIO_LAS_CONDES;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section
          className="text-white"
          style={{ background: "linear-gradient(135deg, var(--brand-petrol-deep), var(--brand-petrol))" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-14 md:py-20">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#ffd66b]">
              Convenio Tarjeta Vecino · Municipalidad de Las Condes
            </p>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl">
              La alarma va en el celular del adulto mayor
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              Botón de emergencia. Aviso a hasta 3 familiares por WhatsApp, SMS y llamada.
            </p>
            <p className="mt-4 text-sm md:text-base text-white/80 max-w-2xl">
              Es una aplicación. No es un aparato ni una central de monitoreo.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-5">
            <OfferCard
              title={offer.adultoMayor.label}
              percent={offer.adultoMayor.percent}
              monthly={offer.adultoMayor.monthly}
              yearly={offer.adultoMayor.yearly}
              code={offer.adultoMayor.code}
              emphasized
            />
            <OfferCard
              title={offer.vecino.label}
              percent={offer.vecino.percent}
              monthly={offer.vecino.monthly}
              yearly={offer.vecino.yearly}
              code={offer.vecino.code}
            />
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            El precio de lista del Plan Único es {convenioPrecio(offer.listMonthly)} al mes
            o {convenioPrecio(offer.listYearly)} al año. El descuento se confirma al verificar que la Tarjeta Vecino esté activa.
          </p>
        </section>

        <section className="bg-[var(--brand-cream)] border-y border-border">
          <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-3 gap-6">
            <Step n="1" title="Abre la aplicación" text="Está en el celular del adulto mayor." />
            <Step n="2" title="Presiona el botón" text="El botón de emergencia avisa de inmediato." />
            <Step n="3" title="La familia recibe el aviso" text="Hasta 3 familiares, por WhatsApp, SMS y llamada." />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Material para difundir el convenio</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Estas piezas se pueden enviar a la Municipalidad de Las Condes y usar en la web. El enlace público es {CONVENIO_LAS_CONDES_URL}.
          </p>
          <h3 className="mt-8 text-lg font-bold">Plantilla oficial Tarjeta Vecino</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Categoría Salud. Lámina 1, lámina 2 e historia, listas para la Municipalidad.
          </p>
          <div className="mt-4 grid md:grid-cols-3 gap-6">
            {PLANTILLA.map((item) => (
              <GraphicCard key={item.src} item={item} />
            ))}
          </div>
          <h3 className="mt-10 text-lg font-bold">Instagram</h3>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSTAGRAM.map((item) => (
              <GraphicCard key={item.src} item={item} />
            ))}
          </div>
          <h3 className="mt-10 text-lg font-bold">Municipalidad y web</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-6">
            {GRAPHICS.map((item) => (
              <GraphicCard key={item.src} item={item} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

function OfferCard({
  title,
  percent,
  monthly,
  yearly,
  code,
  emphasized = false,
}: {
  title: string;
  percent: number;
  monthly: number;
  yearly: number;
  code: string;
  emphasized?: boolean;
}) {
  return (
    <article
      className="rounded-3xl border p-6 md:p-7 shadow-sm"
      style={emphasized ? { borderColor: "var(--brand-petrol)", background: "color-mix(in oklab, var(--brand-petrol) 6%, white)" } : undefined}
    >
      <div className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--brand-petrol-deep)" }}>
        {percent}% de descuento
      </div>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-4 text-4xl font-bold tracking-tight">
        {convenioPrecio(monthly)}
        <span className="text-lg font-semibold text-muted-foreground">/mes</span>
      </p>
      <p className="mt-1 text-muted-foreground">o {convenioPrecio(yearly)} al año</p>
      <p className="mt-1 text-sm text-muted-foreground line-through">
        Antes {convenioPrecio(CONVENIO_LAS_CONDES.listMonthly)} / {convenioPrecio(CONVENIO_LAS_CONDES.listYearly)}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          to="/checkout"
          search={{ mode: "contratar", plan: PLAN_KEY, periodo: "mensual", codigo: code }}
          className="inline-flex justify-center px-5 py-3 rounded-full text-white font-semibold"
          style={{ background: "#16a34a" }}
        >
          Mensual
        </Link>
        <Link
          to="/checkout"
          search={{ mode: "contratar", plan: PLAN_KEY, periodo: "anual", codigo: code }}
          className="inline-flex justify-center px-5 py-3 rounded-full font-semibold border"
          style={{ borderColor: "var(--brand-petrol)", color: "var(--brand-petrol-deep)" }}
        >
          Anual
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground break-all">
        alarmaseniorsafe.cl{convenioCheckoutPath(code, "mensual")}
      </p>
    </article>
  );
}

function GraphicCard({ item }: { item: { src: string; title: string; detail: string; href: string } }) {
  return (
    <figure className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
      <img src={item.src} alt={item.title} className="w-full h-auto bg-[#0d4f5c]" />
      <figcaption className="p-4">
        <div className="font-bold">{item.title}</div>
        <div className="text-sm text-muted-foreground">{item.detail}</div>
        <a href={item.href} download className="inline-block mt-3 text-sm font-semibold underline" style={{ color: "var(--brand-petrol-deep)" }}>
          Descargar
        </a>
      </figcaption>
    </figure>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <div
        className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center"
        style={{ background: "var(--brand-petrol-deep)" }}
      >
        {n}
      </div>
      <h3 className="mt-3 font-bold text-lg">{title}</h3>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}
