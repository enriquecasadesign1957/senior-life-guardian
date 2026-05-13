import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  Send, Menu, X, Mail, ArrowRight, Heart, Users, Clock,
} from "lucide-react";
import appMockup from "@/assets/app-mockup-real.png";
import heroEmotional from "@/assets/hero-emotional.jpg";
import familyPhoto from "@/assets/family-photo.jpg";
import familyMode from "@/assets/family-mode.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Life — Cuidamos de ti y de quienes te quieren" },
      { name: "description", content: "Con un solo botón, Senior Life alerta a familiares por WhatsApp, SMS y llamadas. Tranquilidad para toda la familia." },
      { property: "og:title", content: "Senior Life — Seguridad inteligente para adultos mayores" },
      { property: "og:description", content: "Un botón. Toda tu familia notificada al instante." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-2.5 text-base font-semibold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${light ? "bg-white text-[var(--brand-petrol-deep)]" : "bg-[var(--brand-petrol)] text-white"}`}>
        <Heart className="w-4 h-4 fill-current" strokeWidth={2} />
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
    { label: "Modo Familiar", href: "#familiar" },
    { label: "Planes", href: "#planes" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-border/60">
      <nav className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-[15px] text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>
        <a href="#contacto" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--brand-petrol)] text-white text-[15px] font-semibold hover:bg-[var(--brand-petrol-deep)] transition">
          Solicitar demo
        </a>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border px-6 py-5 flex flex-col gap-4 bg-background">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground text-base py-1">{l.label}</a>
          ))}
          <a href="#contacto" onClick={() => setOpen(false)} className="mt-2 px-5 py-4 rounded-full bg-[var(--brand-petrol)] text-white font-semibold text-center">Solicitar demo</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <img src={heroEmotional} alt="" width={1600} height={1400} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-petrol-deep)] via-[var(--brand-petrol-deep)]/80 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm text-white/90 mb-8">
            <Heart className="w-4 h-4 fill-current" />
            <span>Cuidamos de ti y de quienes te quieren</span>
          </div>
          <h1 className="text-[44px] md:text-[64px] lg:text-[76px] leading-[1.02] tracking-[-0.025em] font-semibold text-white">
            Cuando algo pase, <br />
            <span className="text-white/95">tu familia lo sabrá</span> <br />
            <span className="italic font-light text-white/80">al instante.</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-white/85 leading-relaxed max-w-2xl font-light">
            Un solo botón. Senior Life avisa a tus seres queridos por WhatsApp, SMS y llamadas — esté donde esté.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <a href="#planes" className="inline-flex items-center justify-center gap-3 px-9 py-6 rounded-full bg-white text-[var(--brand-petrol-deep)] text-lg font-semibold shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-100 transition">
              Probar Senior Life
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#contacto" className="inline-flex items-center justify-center gap-3 px-9 py-6 rounded-full border-2 border-white/40 text-white text-lg font-semibold hover:bg-white/10 transition">
              Solicitar demo
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span>14 días gratis</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span>Sin tarjeta</span></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span>Cancela cuando quieras</span></div>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <img src={appMockup} alt="App Senior Life" width={900} height={1200} className="w-full max-w-sm mx-auto drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: Users, value: "+12.000", label: "Familias protegidas" },
    { icon: Clock, value: "< 3 s", label: "Tiempo de respuesta" },
    { icon: Shield, value: "24/7", label: "Monitoreo activo" },
    { icon: Heart, value: "99.9%", label: "Disponibilidad" },
  ];
  return (
    <section className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-4">
            <span className="w-11 h-11 rounded-full bg-[var(--brand-petrol)]/10 text-[var(--brand-petrol)] flex items-center justify-center">
              <it.icon className="w-5 h-5" strokeWidth={2} />
            </span>
            <div>
              <div className="text-2xl font-semibold text-foreground tracking-tight">{it.value}</div>
              <div className="text-sm text-muted-foreground">{it.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-2xl mb-16">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-petrol-light)] mb-4">{tag}</div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">{title}</h2>
      {subtitle ? <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{subtitle}</p> : null}
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
    <section id="como" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader tag="01 — Cómo funciona" title="Una alerta. Toda la familia notificada." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="group p-8 rounded-2xl bg-card border border-border hover:border-[var(--brand-petrol)] hover:shadow-[var(--shadow-card)] transition">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-petrol)]/10 text-[var(--brand-petrol)] group-hover:bg-[var(--brand-petrol)] group-hover:text-white flex items-center justify-center transition">
                  <s.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <span className="text-2xl font-light text-muted-foreground/40 tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { title: "Tranquilidad familiar", desc: "Saber que mamá o papá está protegido las 24 horas del día." },
  { title: "Ubicación en tiempo real", desc: "Mapa actualizado al instante en cada alerta recibida." },
  { title: "Uso simple", desc: "Botones grandes, texto claro. Pensado para personas mayores." },
  { title: "Respuesta rápida", desc: "Senior Life actúa en menos de 3 segundos cuando importa." },
];

function Beneficios() {
  return (
    <section id="beneficios" className="py-24 md:py-32" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative">
          <img src={familyPhoto} alt="Familia feliz" width={1200} height={1000} loading="lazy" className="w-full rounded-3xl object-cover aspect-[4/5] shadow-[var(--shadow-card)]" />
          <div className="absolute -bottom-6 -left-6 bg-[var(--brand-petrol-deep)] text-white p-6 rounded-2xl shadow-[var(--shadow-soft)] max-w-[240px]">
            <Heart className="w-5 h-5 fill-current text-white/80 mb-3" />
            <p className="text-sm leading-relaxed">"Por fin puedo dormir tranquila sabiendo que mi madre está protegida."</p>
            <p className="text-xs text-white/60 mt-2">— Carmen, hija</p>
          </div>
        </div>
        <div>
          <SectionHeader tag="02 — Beneficios" title="Pensado para quienes más amas." />
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <div key={b.title} className="grid grid-cols-12 gap-4 py-6 border-b border-border last:border-0">
                <div className="col-span-2 text-sm font-semibold text-[var(--brand-petrol-light)] tabular-nums pt-1">0{i + 1}</div>
                <div className="col-span-10">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{b.desc}</p>
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
    <section id="familiar" className="py-24 md:py-32 bg-[var(--brand-petrol-deep)] text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60 mb-4">03 — Modo Familiar</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-6">
            El panel que mantiene unida a tu familia.
          </h2>
          <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-md">
            Recibe alertas, ubicación y estado de tu ser querido en tiempo real. Comparte el acceso con hermanos, hijos o cuidadores en segundos.
          </p>
          <ul className="space-y-4 max-w-md mb-10">
            {[
              "Alertas activas con prioridad visual",
              "Mapa en vivo y historial de movimientos",
              "Múltiples cuidadores conectados",
              "Notificaciones push y por WhatsApp",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-base">
                <CheckCircle2 className="w-5 h-5 text-white/80 mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <a href="#contacto" className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-white text-[var(--brand-petrol-deep)] text-base font-semibold hover:scale-[1.02] transition">
            Ver demo del panel
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="relative">
          <img src={familyMode} alt="Panel Modo Familiar" width={1000} height={1200} loading="lazy" className="w-full max-w-md mx-auto drop-shadow-2xl" />
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
    cta: "Probar 14 días gratis",
    highlight: true,
  },
];

function Planes() {
  return (
    <section id="planes" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-petrol-light)] mb-4">04 — Planes</div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-foreground leading-[1.05]">Un plan para cada familia.</h2>
          <p className="mt-6 text-lg text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-10 md:p-12 rounded-3xl transition relative ${
                p.highlight
                  ? "bg-[var(--brand-petrol-deep)] text-white shadow-[var(--shadow-soft)]"
                  : "bg-card border border-border"
              }`}
            >
              {p.highlight ? (
                <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-white text-[var(--brand-petrol-deep)] text-xs font-semibold uppercase tracking-wider">Recomendado</span>
              ) : null}
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${p.highlight ? "text-white/70" : "text-[var(--brand-petrol-light)]"}`}>{p.name}</h3>
              <p className={`text-base mb-8 ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-6xl font-semibold tracking-tight">${p.price}</span>
                <span className={p.highlight ? "text-white/70" : "text-muted-foreground"}>/mes</span>
              </div>
              <ul className="space-y-3 mb-10">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${p.highlight ? "text-white" : "text-[var(--brand-petrol)]"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={`block text-center py-5 rounded-full font-semibold text-base transition ${
                  p.highlight
                    ? "bg-white text-[var(--brand-petrol-deep)] hover:scale-[1.02]"
                    : "bg-[var(--brand-petrol)] text-white hover:bg-[var(--brand-petrol-deep)]"
                }`}
              >
                {p.cta}
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
    <section id="contacto" className="py-24 md:py-32" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-[2rem] overflow-hidden grid md:grid-cols-2 shadow-[var(--shadow-card)]">
          <div className="p-10 md:p-14 text-white" style={{ background: "var(--gradient-hero)" }}>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70 mb-4">05 — Contacto</div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight">Hablemos de cómo cuidar a tu familia.</h2>
            <p className="text-base text-white/80 leading-relaxed mb-10">Cuéntanos sobre ti y un asesor te contactará en menos de 24 horas con una demo personalizada.</p>
            <div className="space-y-4 text-base">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/70" />
                <span>hola@seniorlife.app</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white/70" />
                <span>+34 900 123 456</span>
              </div>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="bg-card p-10 md:p-14 flex flex-col gap-5">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-10">
                <div className="w-16 h-16 rounded-full bg-[var(--brand-petrol)]/10 flex items-center justify-center text-[var(--brand-petrol)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">¡Gracias!</h3>
                <p className="text-muted-foreground">Te contactaremos muy pronto.</p>
              </div>
            ) : (
              <>
                <Field label="Nombre" placeholder="María García" />
                <Field label="Email" type="email" placeholder="maria@ejemplo.com" />
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Mensaje</label>
                  <textarea
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl border border-input bg-background text-base focus:outline-none focus:border-[var(--brand-petrol)] transition resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>
                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 py-5 rounded-full bg-[var(--brand-petrol)] text-white text-base font-semibold hover:bg-[var(--brand-petrol-deep)] transition">
                  Enviar mensaje
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
        className="w-full px-5 py-4 rounded-xl border border-input bg-background text-base focus:outline-none focus:border-[var(--brand-petrol)] transition"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--brand-petrol-deep)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 text-base text-white/70 max-w-sm leading-relaxed">
            Tecnología con corazón. Cuidando a quienes nos cuidaron toda la vida.
          </p>
        </div>
        <FooterCol title="Producto" links={[["Cómo funciona", "#como"], ["Beneficios", "#beneficios"], ["Planes", "#planes"]]} />
        <FooterCol title="Empresa" links={[["Sobre nosotros", "#"], ["Contacto", "#contacto"], ["Privacidad", "#"]]} />
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-2 text-sm text-white/60">
          <span>© 2026 Senior Life. Hecho con cuidado.</span>
          <span>Madrid · Buenos Aires · Ciudad de México</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-semibold">{title}</h4>
      <ul className="space-y-3 text-base">
        {links.map(([label, href]) => (
          <li key={label}><a href={href} className="text-white/85 hover:text-white transition">{label}</a></li>
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
        <Trust />
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
