import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  HeartHandshake, Zap, Users, Sparkles, Check, Menu, X,
  Mail, Send,
} from "lucide-react";
import heroApp from "@/assets/hero-app.png";
import familyMode from "@/assets/family-mode.png";
import familyPhoto from "@/assets/family-photo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Life — Seguridad inteligente para adultos mayores" },
      { name: "description", content: "Con un solo botón, Senior Life alerta a familiares mediante WhatsApp, SMS y llamadas. Tranquilidad para toda la familia." },
      { property: "og:title", content: "Senior Life — Seguridad inteligente para adultos mayores" },
      { property: "og:description", content: "Un botón. Toda tu familia notificada al instante." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Cómo funciona", href: "#como" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Modo Familiar", href: "#familiar" },
    { label: "Planes", href: "#planes" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40">
      <nav className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-semibold text-lg">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Shield className="w-5 h-5" />
          </span>
          Senior Life
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition">{l.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="#contacto" className="text-sm text-foreground hover:text-primary transition">Iniciar sesión</a>
          <a href="#contacto" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">Probar gratis</a>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border/40 px-6 py-4 flex flex-col gap-4 bg-background">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground">{l.label}</a>
          ))}
          <a href="#contacto" onClick={() => setOpen(false)} className="px-4 py-3 rounded-full bg-primary text-primary-foreground text-center font-medium">Probar gratis</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: "var(--brand-coral)" }} />
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 backdrop-blur border border-border/50 text-sm text-muted-foreground mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            Tecnología que cuida con corazón
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
            Seguridad inteligente para <span className="text-primary">adultos mayores</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
            Con un solo botón, Senior Life alerta automáticamente a familiares mediante <strong className="text-foreground">WhatsApp</strong>, <strong className="text-foreground">SMS</strong> y <strong className="text-foreground">llamadas</strong>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a href="#planes" className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-accent text-accent-foreground text-lg font-semibold shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-100 transition">
              Probar Senior Life
              <Zap className="w-5 h-5" />
            </a>
            <a href="#contacto" className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-card border border-border text-foreground text-lg font-semibold hover:bg-secondary transition">
              Solicitar Demo
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> 14 días gratis</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Sin tarjeta</div>
          </div>
        </div>
        <div className="relative">
          <img src={heroApp} alt="App Senior Life mostrando botón de emergencia" width={1200} height={1200} className="w-full max-w-md mx-auto drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Bell, title: "Botón emergencia", desc: "Un toque grande y claro inicia la alerta." },
  { icon: CheckCircle2, title: "Confirmación inteligente", desc: "Evita falsas alarmas con doble validación." },
  { icon: MessageCircle, title: "WhatsApp automático", desc: "Mensaje instantáneo al grupo familiar." },
  { icon: Send, title: "SMS respaldo", desc: "Si no hay internet, el SMS llega igual." },
  { icon: Phone, title: "Llamada automática", desc: "Marca a contactos hasta que respondan." },
  { icon: MapPin, title: "Ubicación GPS", desc: "Comparte la ubicación exacta en tiempo real." },
];

function Como() {
  return (
    <section id="como" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Cómo funciona</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Una alerta. Toda la familia notificada.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.title} className="group p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-[var(--shadow-card)] transition">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold text-muted-foreground/30">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { icon: HeartHandshake, title: "Tranquilidad familiar", desc: "Saber que mamá o papá está protegido las 24 horas." },
  { icon: MapPin, title: "Ubicación en tiempo real", desc: "Mapa actualizado al instante en cada alerta." },
  { icon: Sparkles, title: "Uso simple", desc: "Diseñado para que cualquier persona pueda usarlo." },
  { icon: Zap, title: "Respuesta rápida", desc: "Cada segundo cuenta. Senior Life actúa en menos de 3s." },
];

function Beneficios() {
  return (
    <section id="beneficios" className="py-24 md:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img src={familyPhoto} alt="Familia feliz" width={1200} height={1000} loading="lazy" className="w-full rounded-[2rem] shadow-[var(--shadow-card)] object-cover aspect-[5/4]" />
          <div className="absolute -bottom-6 -right-6 bg-card p-5 rounded-2xl shadow-[var(--shadow-soft)] border border-border/50 max-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1"><Users className="w-4 h-4" /> +12.000</div>
            <p className="text-xs text-muted-foreground">familias protegidas en Latinoamérica</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Beneficios</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">Pensado para quienes más amas.</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-accent border border-border/60">
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{b.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
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
    <section id="familiar" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Modo Familiar</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">El panel que mantiene unida a tu familia.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Recibe alertas, ubicación y estado de tu ser querido en tiempo real. Comparte el acceso con hermanos, hijos o cuidadores en segundos.
          </p>
          <ul className="space-y-4">
            {["Alertas activas con prioridad visual", "Mapa en vivo y historial de movimientos", "Múltiples cuidadores conectados", "Notificaciones push y por WhatsApp"].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center"><Check className="w-3 h-3" /></span>
                <span className="text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="absolute inset-8 -z-10 rounded-[3rem]" style={{ background: "var(--gradient-warm)" }} />
          <img src={familyMode} alt="Panel Modo Familiar" width={1000} height={1200} loading="lazy" className="w-full max-w-lg mx-auto drop-shadow-2xl" />
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Básico",
    price: "$9",
    desc: "Protección esencial para empezar.",
    features: ["Botón de emergencia", "WhatsApp + SMS", "Hasta 3 contactos", "Ubicación GPS"],
    cta: "Comenzar",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$19",
    desc: "Tranquilidad completa para toda la familia.",
    features: ["Todo lo del plan Básico", "Llamadas automáticas", "Contactos ilimitados", "Modo Familiar avanzado", "Historial de alertas", "Soporte prioritario 24/7"],
    cta: "Probar 14 días",
    highlight: true,
  },
];

function Planes() {
  return (
    <section id="planes" className="py-24 md:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Planes</p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Un plan para cada familia.</h2>
          <p className="mt-4 text-muted-foreground text-lg">Sin permanencia. Cancela cuando quieras.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-10 rounded-3xl border transition ${
                p.highlight
                  ? "bg-foreground text-background border-foreground shadow-[var(--shadow-soft)] relative"
                  : "bg-card border-border/60"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">Más elegido</span>
              )}
              <h3 className={`text-xl font-semibold mb-2 ${p.highlight ? "text-background" : "text-foreground"}`}>{p.name}</h3>
              <p className={`text-sm mb-6 ${p.highlight ? "text-background/70" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">{p.price}</span>
                <span className={p.highlight ? "text-background/70" : "text-muted-foreground"}>/mes</span>
              </div>
              <ul className="space-y-3 mb-10">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 ${p.highlight ? "text-accent" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className={`block text-center py-4 rounded-2xl font-semibold transition ${
                  p.highlight
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
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
    <section id="contacto" className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-[2.5rem] overflow-hidden grid md:grid-cols-2" style={{ background: "var(--gradient-hero)" }}>
          <div className="p-10 md:p-14">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Contacto</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">Hablemos de cómo cuidar a tu familia.</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">Cuéntanos sobre ti y un asesor te contactará en menos de 24 horas con una demo personalizada.</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> hola@seniorlife.app</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +34 900 123 456</div>
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="bg-card p-10 md:p-14 flex flex-col gap-4"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">¡Gracias!</h3>
                <p className="text-muted-foreground">Te contactaremos muy pronto.</p>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Nombre</span>
                  <input required className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition" placeholder="María García" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input required type="email" className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition" placeholder="maria@ejemplo.com" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Mensaje</span>
                  <textarea rows={3} className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary transition resize-none" placeholder="¿En qué podemos ayudarte?" />
                </label>
                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
                  Enviar mensaje <Send className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-semibold text-lg mb-4">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Shield className="w-5 h-5" />
            </span>
            Senior Life
          </div>
          <p className="text-muted-foreground max-w-sm leading-relaxed">Tecnología con corazón. Cuidando a quienes nos cuidaron toda la vida.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Producto</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#como" className="hover:text-foreground">Cómo funciona</a></li>
            <li><a href="#beneficios" className="hover:text-foreground">Beneficios</a></li>
            <li><a href="#planes" className="hover:text-foreground">Planes</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Sobre nosotros</a></li>
            <li><a href="#contacto" className="hover:text-foreground">Contacto</a></li>
            <li><a href="#" className="hover:text-foreground">Privacidad</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Senior Life. Hecho con cuidado.
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
