import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  Send, Menu, X, Mail, ArrowRight, ArrowUpRight,
} from "lucide-react";
import heroApp from "@/assets/hero-app.png";
import familyMode from "@/assets/family-mode.png";
import familyPhoto from "@/assets/family-photo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Life — Seguridad inteligente para adultos mayores" },
      { name: "description", content: "Con un solo botón, Senior Life alerta a familiares mediante WhatsApp, SMS y llamadas." },
      { property: "og:title", content: "Senior Life — Seguridad inteligente para adultos mayores" },
      { property: "og:description", content: "Un botón. Toda tu familia notificada al instante." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-foreground">
      <span className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
        <Shield className="w-3.5 h-3.5" strokeWidth={2.2} />
      </span>
      <span>Senior Life</span>
    </a>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Cómo funciona", href: "#como" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Familiar", href: "#familiar" },
    { label: "Planes", href: "#planes" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-9 text-[13px] text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>
        <a href="#contacto" className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:opacity-70 transition">
          <span>Solicitar demo</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border/60 px-6 py-5 flex flex-col gap-4 bg-background">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground text-sm">{l.label}</a>
          ))}
          <a href="#contacto" onClick={() => setOpen(false)} className="text-foreground text-sm font-medium">Solicitar demo →</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground mb-10">
            <span className="w-6 h-px bg-muted-foreground/60" />
            <span>Tecnología que cuida</span>
          </div>
          <h1 className="text-[42px] md:text-[68px] lg:text-[82px] leading-[0.98] tracking-[-0.03em] text-foreground font-light">
            Seguridad inteligente <br className="hidden md:block" />
            <span className="italic font-light text-foreground/85">para adultos </span>
            <span className="italic font-light" style={{ color: "var(--brand-coral)" }}>mayores.</span>
          </h1>
          <p className="mt-10 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Con un solo botón, Senior Life alerta automáticamente a familiares mediante WhatsApp, SMS y llamadas.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <a href="#planes" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
              <span>Probar Senior Life</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#contacto" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-border text-foreground text-sm font-medium hover:bg-secondary transition">
              <span>Solicitar demo</span>
            </a>
          </div>
        </div>

        <div className="mt-24 md:mt-32 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7 relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem]" style={{ background: "var(--gradient-warm)" }} />
            <img src={heroApp} alt="App Senior Life" width={1200} height={1200} className="w-full max-w-md mx-auto" />
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-x-10 gap-y-8">
            <Stat value="12k+" label="Familias protegidas" />
            <Stat value="3 s" label="Tiempo de respuesta" />
            <Stat value="24/7" label="Monitoreo activo" />
            <Stat value="99.9%" label="Disponibilidad" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-border pt-4">
      <div className="text-3xl md:text-4xl font-light tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-6 mb-16">
      <span className="text-xs text-muted-foreground tabular-nums">{index}</span>
      <h2 className="text-3xl md:text-5xl font-light tracking-[-0.02em] text-foreground">{title}</h2>
    </div>
  );
}

const steps = [
  { icon: Bell, title: "Botón de emergencia", desc: "Un toque grande y claro inicia la alerta." },
  { icon: CheckCircle2, title: "Confirmación inteligente", desc: "Doble validación para evitar falsas alarmas." },
  { icon: MessageCircle, title: "WhatsApp automático", desc: "Mensaje instantáneo al grupo familiar." },
  { icon: Send, title: "SMS de respaldo", desc: "Si no hay internet, el SMS llega igual." },
  { icon: Phone, title: "Llamada automática", desc: "Marca a contactos hasta que respondan." },
  { icon: MapPin, title: "Ubicación GPS", desc: "Comparte la ubicación exacta en tiempo real." },
];

function Como() {
  return (
    <section id="como" className="py-28 md:py-36 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel index="01 — Cómo funciona" title="Una alerta. Toda la familia notificada." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-y border-border">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={`p-10 ${i >= 3 ? "lg:border-t lg:border-border" : ""}`}
            >
              <s.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              <div className="mt-8 text-xs text-muted-foreground tabular-nums">/ 0{i + 1}</div>
              <h3 className="mt-2 text-lg font-medium text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { title: "Tranquilidad familiar", desc: "Saber que mamá o papá está protegido las 24 horas." },
  { title: "Ubicación en tiempo real", desc: "Mapa actualizado al instante en cada alerta." },
  { title: "Uso simple", desc: "Diseñado para que cualquier persona pueda usarlo." },
  { title: "Respuesta rápida", desc: "Senior Life actúa en menos de 3 segundos." },
];

function Beneficios() {
  return (
    <section id="beneficios" className="py-28 md:py-36 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div className="lg:sticky lg:top-28">
          <img src={familyPhoto} alt="Familia" width={1200} height={1000} loading="lazy" className="w-full rounded-2xl object-cover aspect-[4/5] grayscale-[15%]" />
        </div>
        <div>
          <SectionLabel index="02 — Beneficios" title="Pensado para quienes más amas." />
          <div className="space-y-px bg-border">
            {benefits.map((b, i) => (
              <div key={b.title} className="bg-background py-8 grid grid-cols-12 gap-6">
                <div className="col-span-2 text-xs text-muted-foreground tabular-nums pt-1">0{i + 1}</div>
                <div className="col-span-10">
                  <h3 className="text-xl font-light text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModoFamiliar() {
  return (
    <section id="familiar" className="py-28 md:py-36 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel index="03 — Modo Familiar" title="El panel que mantiene unida a tu familia." />
          <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-md">
            Recibe alertas, ubicación y estado de tu ser querido en tiempo real. Comparte el acceso con hermanos, hijos o cuidadores en segundos.
          </p>
          <ul className="space-y-4 max-w-md">
            {[
              "Alertas activas con prioridad visual",
              "Mapa en vivo y historial de movimientos",
              "Múltiples cuidadores conectados",
              "Notificaciones push y por WhatsApp",
            ].map((t) => (
              <li key={t} className="flex items-start gap-4 py-3 border-b border-border text-sm text-foreground">
                <span className="text-muted-foreground">—</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-6 -z-10 rounded-[2.5rem]" style={{ background: "var(--gradient-warm)" }} />
          <img src={familyMode} alt="Panel Modo Familiar" width={1000} height={1200} loading="lazy" className="w-full max-w-md mx-auto" />
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Básico",
    price: "9",
    desc: "Protección esencial para empezar.",
    features: ["Botón de emergencia", "WhatsApp + SMS", "Hasta 3 contactos", "Ubicación GPS"],
    cta: "Comenzar",
    highlight: false,
  },
  {
    name: "Premium",
    price: "19",
    desc: "Tranquilidad completa para toda la familia.",
    features: [
      "Todo lo del plan Básico",
      "Llamadas automáticas",
      "Contactos ilimitados",
      "Modo Familiar avanzado",
      "Historial de alertas",
      "Soporte prioritario 24/7",
    ],
    cta: "Probar 14 días",
    highlight: true,
  },
];

function Planes() {
  return (
    <section id="planes" className="py-28 md:py-36 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel index="04 — Planes" title="Un plan para cada familia." />
        <div className="grid md:grid-cols-2 border border-border rounded-2xl overflow-hidden">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`p-10 md:p-12 ${i === 1 ? "md:border-l border-border bg-secondary/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">{p.name}</h3>
                {p.highlight && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Recomendado</span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-5xl font-light tracking-tight text-foreground">${p.price}</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground mb-10">{p.desc}</p>
              <ul className="space-y-3 mb-12">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground border-b border-border/70 pb-3">
                    <span className="text-muted-foreground">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={`group inline-flex items-center gap-2 text-sm font-medium ${
                  p.highlight ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                } transition`}
              >
                <span>{p.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contacto" className="py-28 md:py-36 border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <SectionLabel index="05 — Contacto" title="Hablemos de cómo cuidar a tu familia." />
          <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-md">
            Cuéntanos sobre ti y un asesor te contactará en menos de 24 horas con una demo personalizada.
          </p>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-foreground">
              <Mail className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>hola@seniorlife.app</span>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span>+34 900 123 456</span>
            </div>
          </div>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="space-y-6"
        >
          {sent ? (
            <div className="border border-border rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-6 h-6 text-foreground mx-auto" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg font-light text-foreground">Gracias.</h3>
              <p className="mt-2 text-sm text-muted-foreground">Te contactaremos muy pronto.</p>
            </div>
          ) : (
            <>
              <Field label="Nombre" placeholder="María García" />
              <Field label="Email" type="email" placeholder="maria@ejemplo.com" />
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">Mensaje</label>
                <textarea
                  rows={4}
                  className="w-full bg-transparent border-b border-border py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
                <span>Enviar mensaje</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-3">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border py-2 text-sm text-foreground focus:outline-none focus:border-foreground transition"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 text-sm text-muted-foreground max-w-sm leading-relaxed">
            Tecnología con corazón. Cuidando a quienes nos cuidaron toda la vida.
          </p>
        </div>
        <FooterCol title="Producto" links={[["Cómo funciona", "#como"], ["Beneficios", "#beneficios"], ["Planes", "#planes"]]} />
        <FooterCol title="Empresa" links={[["Sobre nosotros", "#"], ["Contacto", "#contacto"], ["Privacidad", "#"]]} />
      </div>
      <div className="border-t border-border py-6 px-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
        <span>© 2026 Senior Life. Hecho con cuidado.</span>
        <span>Madrid · Buenos Aires · Ciudad de México</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}><a href={href} className="text-foreground hover:opacity-60 transition">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <main>
        <Hero />
        <Como />
        <Beneficios />
        <ModoFamiliar />
        <Planes />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
