import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Shield, Phone, MessageCircle, MapPin, Bell, CheckCircle2,
  Mail, ArrowRight, Heart, AlertCircle, Users, Zap, Smartphone,
  Clock, Activity, Cloud, Star, UserCheck, Accessibility, Home, Loader2,
} from "lucide-react";
import emergencyButton from "@/assets/emergency-button.jpg";
import seniorCouple from "@/assets/senior-couple.jpg";
import seniorPhone from "@/assets/senior-phone.jpg";
import logo from "@/assets/logo-senior-safe.png";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { activateTrialSignup } from "@/lib/trial-signup.functions";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alarma Senior Safe — Seguridad inteligente para adultos mayores" },
      { name: "description", content: "Protección inmediata para quienes más quieres. Botón de emergencia, GPS, WhatsApp, SMS y llamada automática conectados con la familia." },
      { property: "og:title", content: "Alarma Senior Safe — Más que una app, una red de cuidado" },
      { property: "og:description", content: "Conecta automáticamente a adultos mayores con sus familiares mediante alertas inteligentes." },
    ],
  }),
  component: Landing,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const RED = "#dc2626";
const GREEN = "#16a34a";

function Hero() {
  return (
    <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${DEEP} 0%, ${PETROL} 100%)` }}>
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="bg-white inline-flex p-3 rounded-2xl shadow-lg mb-6">
            <img src={logo} alt="Alarma Senior Safe" className="h-14 md:h-16 w-auto" />
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-light italic mb-6">
            Seguridad inteligente para adultos mayores
          </p>
          <h1 className="text-[38px] md:text-[54px] lg:text-[62px] font-bold leading-[1.05] tracking-tight animate-fade-in">
            Protección inmediata <br />para quienes <span className="text-[#ffd66b]">más quieres</span>.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-white/85 leading-relaxed max-w-xl animate-fade-in" style={{ animationDelay: "120ms", animationFillMode: "both" }}>
            Senior Safe conecta automáticamente a adultos mayores con sus familiares mediante alertas inteligentes, ubicación GPS, llamadas, SMS y WhatsApp.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <a href="#prueba" className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-white text-base font-bold shadow-xl hover:scale-[1.02] transition" style={{ color: DEEP }}>
              Probar gratis 7 días
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#como" className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full border-2 border-white/40 text-white text-base font-semibold hover:bg-white/10 transition">
              Cómo funciona
            </a>
          </div>
          <div className="mt-8 flex items-center gap-5 text-sm text-white/80">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sin permanencia</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cancelación simple</div>
          </div>
        </div>
        <div className="relative animate-fade-in" style={{ animationDelay: "240ms", animationFillMode: "both" }}>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 hover-scale">
            <img src={emergencyButton} alt="Botón de emergencia Senior Safe" className="w-full aspect-square object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white text-foreground p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[260px]">
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: RED }}>
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Respuesta</div>
              <div className="font-bold text-sm">en menos de 3 segundos</div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white text-foreground p-3 rounded-2xl shadow-2xl flex items-center gap-2">
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: GREEN }}>
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div className="text-xs">
              <div className="font-bold">Estado: Seguro</div>
              <div className="text-muted-foreground">Modo familiar activo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueEs() {
  const items = [
    { icon: Bell, color: RED, title: "Botón de emergencia", desc: "Grande, visible y fácil de presionar." },
    { icon: Zap, color: "#f59e0b", title: "Alertas automáticas", desc: "WhatsApp, SMS y llamada en segundos." },
    { icon: MapPin, color: PETROL, title: "Ubicación GPS", desc: "Mapa con la ubicación exacta del usuario." },
    { icon: Users, color: GREEN, title: "Conexión familiar", desc: "Toda la familia recibe la alerta a la vez." },
    { icon: Smartphone, color: DEEP, title: "Facilidad de uso", desc: "Diseñado para adultos mayores: simple y claro." },
  ];
  return (
    <section id="que-es" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>¿Qué es?</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Una red de cuidado familiar, en un solo botón.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Alarma Senior Safe es una aplicación simple y segura que permite a los adultos mayores pedir ayuda en segundos, conectándose automáticamente con sus familiares.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {items.map((it) => (
            <div key={it.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: it.color }}>
                <it.icon className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-foreground mb-1.5">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full text-white font-bold text-lg" style={{ background: DEEP }}>
            <Heart className="w-5 h-5" fill="currentColor" />
            Todo funciona con un solo botón.
          </div>
        </div>
      </div>
    </section>
  );
}

function ParaQuien() {
  const cards = [
    { icon: Home, title: "Adultos mayores", desc: "Que viven solos y necesitan tranquilidad diaria." },
    { icon: Heart, title: "Familias", desc: "Que buscan saber que mamá o papá están bien." },
    { icon: Activity, title: "Asistencia rápida", desc: "Personas con condiciones médicas o riesgo de caídas." },
    { icon: Accessibility, title: "Movilidad reducida", desc: "Quienes necesitan ayuda inmediata en casa." },
  ];
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>¿Para quién es?</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Pensado para tu familia.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="bg-card border border-border rounded-2xl p-7 text-center hover:shadow-xl transition">
              <span className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white mb-5" style={{ background: PETROL }}>
                <c.icon className="w-7 h-7" />
              </span>
              <h3 className="font-bold text-foreground mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Como() {
  const steps = [
    { n: "1", icon: Bell, color: RED, title: "Botón de Emergencia", desc: "El usuario presiona un botón grande y visible en su teléfono." },
    { n: "2", icon: CheckCircle2, color: "#f59e0b", title: "Confirmación inteligente", desc: "La app pregunta: ¿Necesitas ayuda? SÍ activa la alerta, sin respuesta también la activa automáticamente." },
    { n: "3", icon: MessageCircle, color: GREEN, title: "Sistema automático", desc: "WhatsApp con ubicación, SMS de respaldo, llamada urgente y enlace GPS al mapa." },
    { n: "4", icon: UserCheck, color: PETROL, title: "Familiar confirma", desc: "Botón \"Estoy atendiendo\" detiene las alertas y confirma que la ayuda está en camino." },
  ];
  return (
    <section id="como" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: RED }}>Cómo funciona</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">4 pasos. Menos de 3 segundos.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.n} className="bg-card border border-border rounded-2xl p-7 hover:shadow-xl transition relative">
              <span className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: DEEP }}>
                {s.n}
              </span>
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ml-8" style={{ background: s.color }}>
                <s.icon className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-foreground mb-2 text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Funciones() {
  const features = [
    { icon: Bell, color: RED, title: "Emergencia inmediata", desc: "Un toque activa toda la red de cuidado." },
    { icon: MapPin, color: PETROL, title: "Ubicación en tiempo real", desc: "Mapa con la ubicación exacta del usuario." },
    { icon: MessageCircle, color: GREEN, title: "WhatsApp automático", desc: "Mensaje al grupo familiar al instante." },
    { icon: Mail, color: "#f59e0b", title: "SMS automático", desc: "Texto de respaldo si no hay internet." },
    { icon: Phone, color: RED, title: "Llamada automática", desc: "Marca a contactos hasta que respondan." },
    { icon: Shield, color: GREEN, title: "Estado seguro", desc: "Indicador visible de que el usuario está bien." },
    { icon: Users, color: PETROL, title: "Monitoreo familiar", desc: "Toda la familia ve el estado y alertas." },
    { icon: Cloud, color: DEEP, title: "Plataforma cloud segura", desc: "Datos protegidos y disponibles 24/7." },
  ];
  return (
    <section id="funciones" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Funciones principales</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Todo lo que necesitas, en un solo lugar.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: f.color }}>
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Beneficios() {
  const benefits = [
    { icon: Heart, title: "Tranquilidad para la familia", desc: "Saber que mamá o papá está protegido las 24 horas." },
    { icon: Zap, title: "Protección inmediata", desc: "Senior Safe actúa en menos de 3 segundos." },
    { icon: Smartphone, title: "Fácil de usar", desc: "Botones grandes y texto claro." },
    { icon: Users, title: "Diseñada para adultos mayores", desc: "Probada con familias reales." },
    { icon: Activity, title: "Funciona incluso en estrés", desc: "La alerta se envía aunque no haya respuesta." },
    { icon: Shield, title: "Conexión directa con familiares", desc: "Sin intermediarios. Sin demoras." },
  ];
  return (
    <section id="beneficios" className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative">
          <img src={seniorPhone} alt="Pareja mayor usando la app" loading="lazy" className="w-full rounded-3xl object-cover aspect-[4/5] shadow-xl" />
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl max-w-[260px] border border-border">
            <Heart className="w-5 h-5 fill-red-500 text-red-500 mb-2" />
            <p className="text-sm leading-relaxed text-foreground">"Por fin puedo dormir tranquila sabiendo que mi madre está protegida."</p>
            <p className="text-xs text-muted-foreground mt-2">— Carmen, hija</p>
          </div>
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: GREEN }}>Beneficios</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-8">Más que una app, una red de cuidado.</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="bg-card border border-border rounded-2xl p-5">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-3" style={{ background: PETROL }}>
                  <b.icon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-foreground mb-1 text-sm">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Planes() {
  const [yearly, setYearly] = useState(false);
  const plans = [
    {
      name: "Básico",
      monthly: "5.900",
      yearlyPrice: "65.000",
      desc: "Protección esencial para empezar.",
      features: [
        "Botón de emergencia",
        "WhatsApp + SMS",
        "Llamada automática",
        "Ubicación GPS",
        "1 familiar conectado",
        "Soporte básico",
      ],
      highlight: false,
      cta: "Comenzar",
    },
    {
      name: "Premium",
      monthly: "7.900",
      yearlyPrice: "85.000",
      desc: "Tranquilidad completa para toda la familia.",
      features: [
        "Todo lo del plan Básico",
        "Múltiples familiares",
        "Monitoreo de inactividad",
        "Historial de alertas",
        "Recordatorios inteligentes",
        "Alertas inteligentes",
        "Soporte prioritario 24/7",
      ],
      highlight: true,
      cta: "Probar Premium",
    },
  ];
  return (
    <section id="planes" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Planes</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Un plan para cada familia.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Sin permanencia. Cancela cuando quieras.</p>
          <div className="mt-7 inline-flex items-center bg-card border border-border rounded-full p-1.5 shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${!yearly ? "text-white" : "text-muted-foreground"}`}
              style={!yearly ? { background: DEEP } : undefined}
            >
              Mensual
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${yearly ? "text-white" : "text-muted-foreground"}`}
              style={yearly ? { background: DEEP } : undefined}
            >
              Anual
              <span className="px-2 py-0.5 rounded-full bg-[#16a34a] text-white text-[10px] font-bold">AHORRA</span>
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => {
            const price = yearly ? p.yearlyPrice : p.monthly;
            const suffix = yearly ? "/año" : "/mes";
            return (
              <div
                key={p.name}
                className="p-10 rounded-3xl relative transition shadow-sm"
                style={{
                  background: p.highlight ? `linear-gradient(135deg, ${DEEP}, ${PETROL})` : "var(--card)",
                  border: p.highlight ? "none" : "1px solid var(--border)",
                  color: p.highlight ? "white" : undefined,
                }}
              >
                {p.highlight && (
                  <span className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-white text-xs font-bold uppercase tracking-wider" style={{ color: DEEP }}>
                    Recomendado
                  </span>
                )}
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${p.highlight ? "text-white/80" : ""}`} style={!p.highlight ? { color: PETROL } : undefined}>{p.name}</h3>
                <p className={`text-base mb-7 ${p.highlight ? "text-white/85" : "text-muted-foreground"}`}>{p.desc}</p>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-bold tracking-tight">${price}</span>
                    <span className={p.highlight ? "text-white/80" : "text-muted-foreground"}>{suffix}</span>
                  </div>
                  {yearly && (
                    <div className={`mt-2 text-sm ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>
                      Equivale a ${(parseInt(p.yearlyPrice.replace(/\./g, "")) / 12).toLocaleString("es-CL", { maximumFractionDigits: 0 })}/mes
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-10">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${p.highlight ? "text-white" : ""}`} style={!p.highlight ? { color: PETROL } : undefined} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#prueba"
                  className="block text-center py-4 rounded-full font-bold text-base transition"
                  style={p.highlight ? { background: "white", color: DEEP } : { background: PETROL, color: "white" }}
                >
                  {p.cta}
                </a>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Próximamente con Webpay y Stripe · Pagos 100% seguros
        </p>
      </div>
    </section>
  );
}

function Prueba() {
  const navigate = useNavigate();
  const activateTrial = useServerFn(activateTrialSignup);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nombre = form.nombre.trim();
    const email = form.email.trim().toLowerCase();
    const telefono = form.telefono.trim();

    if (nombre.length < 2) return setErrorMsg("Ingresa tu nombre completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorMsg("Correo inválido.");
    if (telefono.replace(/\D/g, "").length < 8) return setErrorMsg("Teléfono inválido.");

    setLoading(true);
    try {
      const result = await activateTrial({ data: {
        nombre,
        email,
        telefono,
        plan: "premium",
        periodo: "mensual",
      } });
      const data = result.signup;

      // Disparar email + WhatsApp (no bloquean el flujo si fallan)
      fetch("/api/public/send-welcome-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId: data.id }),
      }).catch((err) => console.warn("welcome email trigger failed", err));

      fetch("/api/public/send-welcome-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId: data.id }),
      }).catch((err) => console.warn("welcome whatsapp trigger failed", err));

      try {
        sessionStorage.setItem("seniorsafe_user", JSON.stringify({
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          plan: data.plan,
          periodo: data.periodo,
          trial_active: data.trial_active,
          trial_end: data.trial_end,
        }));
      } catch { /* ignore */ }

      navigate({ to: "/activacion" });
    } catch (err) {
      console.error("Trial signup error:", err);
      setErrorMsg("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <section id="prueba" className="py-20 md:py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl border border-border">
          <div className="p-10 md:p-12 text-white" style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider mb-5">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> 7 días gratis
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prueba Senior Safe gratis por 7 días.</h2>
            <p className="text-base text-white/85 leading-relaxed mb-7">
              Sin tarjeta de crédito. Sin compromisos. Cancela cuando quieras.
            </p>
            <ul className="space-y-3 text-base">
              {["Activación inmediata", "Acceso completo a todas las funciones", "Cancelación simple en 1 clic"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={onSubmit} className="bg-card p-10 md:p-12 flex flex-col gap-5">
            <h3 className="text-xl font-bold text-foreground">Comenzar prueba gratis</h3>
            <Field label="Nombre completo" placeholder="María García" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
            <Field label="Email" type="email" placeholder="maria@ejemplo.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Teléfono" type="tel" placeholder="+569 ..." value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />

            {errorMsg && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 py-4 rounded-full text-white text-base font-bold transition disabled:opacity-80 disabled:cursor-wait"
              style={{ background: PETROL }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando tu cuenta Senior Safe…
                </>
              ) : (
                <>
                  Comenzar prueba gratis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Al continuar aceptas nuestros términos y política de privacidad.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Capturas() {
  const screens = [
    { title: "Botón de emergencia", color: RED, icon: Bell },
    { title: "Ubicación GPS", color: PETROL, icon: MapPin },
    { title: "Alerta familiar", color: "#f59e0b", icon: MessageCircle },
    { title: "Modo familiar", color: GREEN, icon: Users },
  ];
  return (
    <section className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>La app</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Diseñada para ser usada en segundos.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screens.map((s) => (
            <div key={s.title} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl transition">
              <div className="aspect-[9/16] rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${DEEP}, ${PETROL})` }}>
                <div className="absolute inset-x-0 top-0 h-6 flex justify-center items-end">
                  <div className="w-20 h-4 bg-black/40 rounded-b-2xl" />
                </div>
                <div className="text-center text-white px-4">
                  <span className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ background: s.color }}>
                    <s.icon className="w-10 h-10" />
                  </span>
                  <div className="text-base font-bold">{s.title}</div>
                </div>
              </div>
              <h3 className="font-bold text-foreground text-center">{s.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonios() {
  const items = [
    { name: "Carmen R.", role: "Hija", quote: "Ahora puedo estar tranquila sabiendo que mi madre puede avisarnos inmediatamente." },
    { name: "Jorge M.", role: "Adulto mayor, 74", quote: "Es muy fácil de usar. Un solo botón y mis hijos saben que necesito ayuda." },
    { name: "Familia Pérez", role: "Familia conectada", quote: "Por primera vez sentimos que toda la familia está protegida y unida." },
  ];
  return (
    <section className="py-20 md:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Testimonios</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Familias que confían en nosotros.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-2xl p-7">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-base text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: PETROL }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section id="contacto" className="py-20 md:py-24" style={{ background: "var(--gradient-soft)" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-sm font-bold uppercase tracking-[0.18em] mb-3" style={{ color: PETROL }}>Contacto</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Hablemos.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Estamos aquí para ayudarte a proteger a tu familia.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <ContactCard icon={Phone} title="Teléfono" value="+56 9 7140 4580" />
          <ContactCard icon={Mail} title="Email" value="hola@alarmaseniorsafe.cl" />
          <ContactCard icon={Clock} title="Horario" value="Soporte 24/7" />
        </div>
        <p className="text-center mt-12 text-xl md:text-2xl italic text-foreground/80 font-light">
          "Más que una app, una red de cuidado"
        </p>
      </div>
    </section>
  );
}

function ContactCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-7 text-center">
      <span className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-white mb-4" style={{ background: PETROL }}>
        <Icon className="w-6 h-6" />
      </span>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{title}</div>
      <div className="font-bold text-foreground">{value}</div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <input
        required
        type={type}
        placeholder={placeholder}
        maxLength={120}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full px-5 py-4 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-[var(--brand-petrol)]/30 transition"
      />
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <main>
        <Hero />
        <QueEs />
        <ParaQuien />
        <Como />
        <Funciones />
        <Beneficios />
        <Capturas />
        <Planes />
        <Prueba />
        <Testimonios />
        <Contacto />
      </main>
      <SiteFooter />
    </div>
  );
}
