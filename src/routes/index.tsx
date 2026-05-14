import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  Mail, Globe, Menu, X, ArrowRight, Heart, AlertCircle,
  Users, Zap, Smartphone, Clock,
} from "lucide-react";
import emergencyButton from "@/assets/emergency-button.jpg";
import seniorCouple from "@/assets/senior-couple.jpg";
import seniorPhone from "@/assets/senior-phone.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senior Life — Seguridad inteligente para adultos mayores" },
      { name: "description", content: "Una app simple para pedir ayuda en segundos, conectando con la familia con un solo botón." },
      { property: "og:title", content: "Senior Life — Más que una app, una red de cuidado" },
      { property: "og:description", content: "WhatsApp, SMS, llamada y ubicación al instante. Un solo botón." },
    ],
  }),
  component: Landing,
});

const BLUE = "var(--brand-petrol)";
const BLUE_DEEP = "var(--brand-petrol-deep)";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-2.5 font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
      <span className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: light ? "white" : BLUE_DEEP }}>
        <Shield className="w-6 h-6" style={{ color: light ? BLUE_DEEP : "white" }} fill="currentColor" strokeWidth={1.5} />
        <Heart className="absolute w-3 h-3 fill-red-500 text-red-500" />
      </span>
      <span className="text-lg">SENIOR LIFE</span>
    </a>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "¿Qué es?", href: "#que-es" },
    { label: "Cómo funciona", href: "#como" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Planes", href: "#planes" },
    { label: "Contacto", href: "#contacto" },
  ];
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>
        <a href="#contacto" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition" style={{ background: BLUE }}>
          Probar gratis
        </a>
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-border px-6 py-5 flex flex-col gap-4 bg-background">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-foreground py-1">{l.label}</a>
          ))}
          <a href="#contacto" onClick={() => setOpen(false)} className="px-5 py-4 rounded-full text-white font-semibold text-center" style={{ background: BLUE }}>Probar gratis</a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${BLUE_DEEP} 0%, ${BLUE} 100%)` }}>
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm mb-7">
            <Shield className="w-4 h-4" fill="currentColor" />
            <span>Más que una app, una red de cuidado</span>
          </div>
          <h1 className="text-[42px] md:text-[58px] lg:text-[68px] font-bold leading-[1.02] tracking-tight text-[#91f132]">
            SENIOR LIFE
          </h1>
          <p className="mt-4 text-2xl md:text-3xl text-white/90 font-light italic">
            Seguridad inteligente para adultos mayores
          </p>
          <p className="mt-8 text-lg md:text-xl text-white/85 leading-relaxed max-w-xl">
            Una app simple para pedir ayuda en segundos, conectando con <strong className="font-semibold text-white">la familia</strong> con un solo botón.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a href="#planes" className="inline-flex items-center justify-center gap-3 px-9 py-5 rounded-full bg-white text-base font-bold shadow-xl hover:scale-[1.02] transition" style={{ color: BLUE_DEEP }}>
              Probar Senior Life
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#como" className="inline-flex items-center justify-center gap-3 px-9 py-5 rounded-full border-2 border-white/40 text-white text-base font-semibold hover:bg-white/10 transition">
              Ver cómo funciona
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
            <img src={emergencyButton} alt="Botón de emergencia Senior Life" width={1024} height={1024} className="w-full aspect-square object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white text-foreground p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[240px]">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: BLUE }}>
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Respuesta</div>
              <div className="font-bold text-sm">en menos de 3 segundos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardTitle({ icon: Icon, color, children }: { icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: color }}>
        <Icon className="w-5 h-5" fill="currentColor" strokeWidth={2} />
      </span>
      <h2 className="text-2xl font-bold text-foreground">{children}</h2>
    </div>
  );
}

function QueEs() {
  return (
    <section id="que-es" className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="rounded-2xl p-8 md:p-10 border border-border" style={{ background: "var(--gradient-soft)" }}>
            <CardTitle icon={Heart} color="#e11d48">¿Qué es Senior Life?</CardTitle>
            <p className="text-lg text-foreground leading-relaxed mb-8">
              Una <strong>app simple</strong> para pedir ayuda en segundos conectando con <strong>la familia</strong> con un <strong>solo botón</strong>.
            </p>
            <CardTitle icon={AlertCircle} color="#f59e0b">¿Para quién es?</CardTitle>
            <ul className="space-y-3">
              {[
                ["Adultos mayores", " solos o acompañados"],
                ["Familias", " que quieren tranquilidad"],
                ["Personas", " que necesitan asistencia rápida"],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-start gap-3 text-base">
                  <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: BLUE }} />
                  <span><strong className="font-bold">{bold}</strong>{rest}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="relative">
          <img src={seniorCouple} alt="Pareja mayor feliz" width={1200} height={1000} loading="lazy" className="w-full rounded-3xl object-cover aspect-[5/4] shadow-xl" />
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "1", icon: Bell, color: "#dc2626", title: "Botón de Emergencia", desc: "Un toque grande y claro inicia la alerta." },
  { n: "2", icon: CheckCircle2, color: "#16a34a", title: "Confirmación Inteligente", desc: "¿Necesitas ayuda? SÍ / NO. Doble validación." },
  { n: "3", icon: MessageCircle, color: "#22c55e", title: "WhatsApp", desc: "Mensaje instantáneo al grupo familiar." },
  { n: "4", icon: Mail, color: "#f59e0b", title: "SMS", desc: "Texto de respaldo si no hay internet." },
  { n: "5", icon: Phone, color: "#dc2626", title: "Llamada de Emergencia", desc: "Marca a contactos hasta que respondan." },
  { n: "6", icon: MapPin, color: BLUE_DEEP, title: "Ubicación GPS", desc: "Enlace a mapa y ubicación exacta." },
];

function Como() {
  return (
    <section id="como" className="py-20 md:py-28" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="rounded-2xl px-6 py-4 text-white inline-flex items-center gap-3 mb-10" style={{ background: BLUE_DEEP }}>
          <AlertCircle className="w-5 h-5" fill="currentColor" />
          <h2 className="text-xl md:text-2xl font-bold">¿Cómo funciona?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-2xl p-7 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: BLUE_DEEP }}>
                  {s.n}
                </span>
                <span className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: s.color }}>
                  <s.icon className="w-5 h-5" strokeWidth={2.5} />
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: MapPin, color: BLUE, title: "Ubicación en Tiempo Real", desc: "Enlace a mapa y ubicación exacta del usuario en todo momento." },
  { icon: Smartphone, color: "#16a34a", title: "Estado en Tiempo Real", desc: "Usuario \"Seguro\" o alertas registradas, siempre a la vista." },
  { icon: Zap, color: "#f59e0b", title: "Alertas Escaladas", desc: "Si nadie responde, Senior Life pasa al siguiente contacto." },
  { icon: MessageCircle, color: "#22c55e", title: "WhatsApp, SMS y Llamada", desc: "Tres vías simultáneas para garantizar que la alerta llegue." },
];

function Tecnologia() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BLUE }}>Tecnología Inteligente</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Todo lo que necesitas, en un solo lugar.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-5 p-7 rounded-2xl bg-card border border-border hover:shadow-lg transition">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: f.color }}>
                <f.icon className="w-6 h-6" strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  { icon: Heart, title: "Tranquilidad Familiar", desc: "Saber que mamá o papá está protegido las 24 horas." },
  { icon: Zap, title: "Respuesta Rápida", desc: "Senior Life actúa en menos de 3 segundos." },
  { icon: Smartphone, title: "Fácil de Usar", desc: "Botones grandes y texto claro para personas mayores." },
  { icon: Shield, title: "Un Solo Botón", desc: "Toda la red de cuidado activada con un toque." },
];

function Beneficios() {
  return (
    <section id="beneficios" className="py-20 md:py-28" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative order-2 lg:order-1">
          <img src={seniorPhone} alt="Pareja mayor usando la app" width={1200} height={1400} loading="lazy" className="w-full rounded-3xl object-cover aspect-[4/5] shadow-xl" />
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl max-w-[260px] border border-border">
            <Heart className="w-5 h-5 fill-red-500 text-red-500 mb-2" />
            <p className="text-sm leading-relaxed text-foreground">"Por fin puedo dormir tranquila sabiendo que mi madre está protegida."</p>
            <p className="text-xs text-muted-foreground mt-2">— Carmen, hija</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "#16a34a" }}>
              <CheckCircle2 className="w-5 h-5" fill="currentColor" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Beneficios Clave</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-6">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-4" style={{ background: BLUE }}>
                  <b.icon className="w-5 h-5" fill="currentColor" />
                </span>
                <h3 className="font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Básico",
    price: "5.900",
    yearly: "65.000",
    desc: "Protección esencial para empezar.",
    features: ["Botón de emergencia", "WhatsApp + SMS", "Hasta 3 contactos", "Ubicación GPS"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "7.900",
    yearly: "85.000",
    desc: "Tranquilidad completa para toda la familia.",
    features: [
      "Todo lo del plan Básico",
      "Llamadas automáticas",
      "Contactos ilimitados",
      "Modo Familiar avanzado",
      "Historial de alertas",
      "Soporte 24/7",
    ],
    highlight: true,
  },
];

function Planes() {
  return (
    <section id="planes" className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: BLUE }}>Planes</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Un plan para cada familia.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className="p-10 rounded-3xl relative transition"
              style={{
                background: p.highlight ? `linear-gradient(135deg, ${BLUE_DEEP}, ${BLUE})` : "var(--card)",
                border: p.highlight ? "none" : "1px solid var(--border)",
                color: p.highlight ? "white" : undefined,
              }}
            >
              {p.highlight && (
                <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider" style={{ color: BLUE_DEEP }}>
                  Recomendado
                </span>
              )}
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${p.highlight ? "text-white/80" : ""}`} style={!p.highlight ? { color: BLUE } : undefined}>{p.name}</h3>
              <p className={`text-base mb-7 ${p.highlight ? "text-white/85" : "text-muted-foreground"}`}>{p.desc}</p>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold tracking-tight">${p.price}</span>
                  <span className={p.highlight ? "text-white/80" : "text-muted-foreground"}>/mes</span>
                </div>
                <div className={`mt-2 text-sm ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                  o <strong className={p.highlight ? "text-white" : "text-foreground"}>${p.yearly}</strong> /año
                </div>
              </div>
              <ul className="space-y-3 mb-10">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base">
                    <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${p.highlight ? "text-white" : ""}`} style={!p.highlight ? { color: BLUE } : undefined} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contacto"
                className="block text-center py-4 rounded-full font-bold text-base transition"
                style={
                  p.highlight
                    ? { background: "white", color: BLUE_DEEP }
                    : { background: BLUE, color: "white" }
                }
              >
                {p.highlight ? "Probar 14 días gratis" : "Comenzar"}
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
    <section id="contacto" className="py-20 md:py-28" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl">
          <div className="p-10 md:p-12 text-white" style={{ background: `linear-gradient(135deg, ${BLUE_DEEP}, ${BLUE})` }}>
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </span>
              <h2 className="text-2xl font-bold">Contacto</h2>
            </div>
            <p className="text-base text-white/85 leading-relaxed mb-8">
              Cuéntanos sobre ti y te contactaremos en menos de 24 horas.
            </p>
            <div className="space-y-4 text-base">
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-white/70" /><span>+34 900 123 456</span></div>
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-white/70" /><span>hola@seniorlife.app</span></div>
              <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-white/70" /><span>www.seniorlife.app</span></div>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="bg-card p-10 md:p-12 flex flex-col gap-5">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white" style={{ background: "#16a34a" }}>
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">¡Gracias!</h3>
                <p className="text-muted-foreground">Te contactaremos muy pronto.</p>
              </div>
            ) : (
              <>
                <Field label="Nombre" placeholder="María García" />
                <Field label="Email" type="email" placeholder="maria@ejemplo.com" />
                <Field label="Teléfono" type="tel" placeholder="+569 ..." />
                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 py-4 rounded-full text-white text-base font-bold transition" style={{ background: BLUE }}>
                  Enviar mensaje
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        </div>
        <p className="text-center mt-12 text-xl md:text-2xl italic text-foreground/80 font-light">
          "Más que una app, una red de cuidado"
        </p>
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
        className="w-full px-5 py-4 rounded-xl border border-input bg-background text-base focus:outline-none transition"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="text-white" style={{ background: BLUE_DEEP }}>
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-white/70 max-w-sm leading-relaxed">
            Tecnología con corazón. Cuidando a quienes nos cuidaron toda la vida.
          </p>
        </div>
        <FooterCol title="Producto" links={[["¿Qué es?", "#que-es"], ["Cómo funciona", "#como"], ["Planes", "#planes"]]} />
        <FooterCol title="Empresa" links={[["Contacto", "#contacto"], ["Privacidad", "#"], ["Términos", "#"]]} />
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between gap-2 text-sm text-white/60">
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
      <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4 font-bold">{title}</h4>
      <ul className="space-y-3 text-sm">
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
        <QueEs />
        <Como />
        <Tecnologia />
        <Beneficios />
        <Planes />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
