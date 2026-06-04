import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, MessageCircle, Users, Clock, Shield,
  ArrowRight, ArrowLeft, CheckCircle2, Phone, MapPin,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial — Cómo usar Senior Safe" },
      { name: "description", content: "Aprende en 5 pasos simples cómo usar Senior Safe: pedir ayuda, alertas, monitoreo familiar y estado seguro." },
    ],
  }),
  component: TutorialPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";
const AMBER = "#f59e0b";

type Screen = {
  badge: string;
  title: string;
  body: string;
  bullets: { icon: typeof Bell; text: string }[];
  illustration: React.ReactNode;
};

function PhoneFrame({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] aspect-[9/18]">
      <div className="absolute inset-0 rounded-[42px] shadow-2xl border-[10px] border-foreground bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground rounded-b-2xl z-10" />
        <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${accent} 14%, white), white 70%)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const SCREENS: Screen[] = [
  {
    badge: "Paso 1",
    title: "Cómo pedir ayuda",
    body: "Presiona el botón rojo cuando necesites ayuda. Es grande y siempre está visible.",
    bullets: [
      { icon: Bell, text: "Botón rojo grande en la pantalla principal" },
      { icon: CheckCircle2, text: "Solo necesitas un toque" },
    ],
    illustration: (
      <PhoneFrame accent={RED}>
        <div className="text-center">
          <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white shadow-xl animate-pulse" style={{ background: RED }}>
            <Bell className="w-16 h-16" />
          </div>
          <div className="mt-5 text-base font-bold text-foreground">EMERGENCIA</div>
          <div className="text-xs text-muted-foreground mt-1">Toca para pedir ayuda</div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    badge: "Paso 2",
    title: "Qué ocurre después",
    body: "La aplicación te pregunta si necesitas ayuda. Si dices SÍ —o no respondes— se envía la alerta automáticamente.",
    bullets: [
      { icon: MessageCircle, text: "Mensaje al WhatsApp familiar" },
      { icon: Phone, text: "Llamada automática de respaldo" },
      { icon: MapPin, text: "Se envía tu ubicación GPS" },
    ],
    illustration: (
      <PhoneFrame accent={AMBER}>
        <div className="text-center w-full">
          <div className="text-base font-bold text-foreground mb-4">¿Necesitas ayuda?</div>
          <div className="space-y-3">
            <div className="w-full py-4 rounded-2xl text-white font-bold shadow-lg" style={{ background: GREEN }}>SÍ, AYUDA</div>
            <div className="w-full py-3 rounded-2xl bg-muted text-muted-foreground font-semibold text-sm">Estoy bien</div>
          </div>
          <div className="mt-4 text-[11px] text-muted-foreground">Enviando en 5 segundos...</div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    badge: "Paso 3",
    title: "Quién recibe las alertas",
    body: "Toda tu familia conectada recibe el aviso al mismo tiempo, con tu ubicación exacta.",
    bullets: [
      { icon: Users, text: "Hijos, nietos y personas de confianza" },
      { icon: MapPin, text: "Mapa con tu ubicación en tiempo real" },
    ],
    illustration: (
      <PhoneFrame accent={PETROL}>
        <div className="text-center w-full">
          <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Familia conectada</div>
          {["María (hija)", "Pedro (hijo)", "Ana (nieta)"].map((n, i) => (
            <div key={n} className="flex items-center gap-3 p-2.5 mb-2 rounded-xl bg-card border border-border">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: [PETROL, DEEP, GREEN][i] }}>
                {n[0]}
              </div>
              <div className="flex-1 text-left text-xs font-semibold text-foreground truncate">{n}</div>
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            </div>
          ))}
        </div>
      </PhoneFrame>
    ),
  },
  {
    badge: "Paso 4",
    title: "Si no respondes, ayuda igual",
    body: "Si no contestas en pocos segundos, la alerta se envía sola. Nunca te quedas solo.",
    bullets: [
      { icon: Clock, text: "Alerta automática en 5 segundos" },
      { icon: Phone, text: "Llamada hasta que un familiar responda" },
    ],
    illustration: (
      <PhoneFrame accent={RED}>
        <div className="text-center">
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-white shadow-xl mb-4" style={{ background: RED }}>
            <Clock className="w-14 h-14" />
          </div>
          <div className="text-3xl font-bold text-foreground">5</div>
          <div className="text-xs font-semibold text-muted-foreground mt-1">Enviando alerta...</div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-2/3 rounded-full" style={{ background: RED }} />
          </div>
        </div>
      </PhoneFrame>
    ),
  },
  {
    badge: "Paso 5",
    title: "Estado seguro",
    body: "Cuando todo está bien, verás el estado verde. Tu familia también lo sabe y está tranquila.",
    bullets: [
      { icon: Shield, text: "Indicador verde de estado seguro" },
      { icon: Users, text: "Tu familia lo ve en su app" },
    ],
    illustration: (
      <PhoneFrame accent={GREEN}>
        <div className="text-center">
          <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-white shadow-xl mb-4" style={{ background: GREEN }}>
            <Shield className="w-14 h-14" />
          </div>
          <div className="text-base font-bold text-foreground">Estado: Seguro</div>
          <div className="text-xs text-muted-foreground mt-1">Todo está bien</div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: "color-mix(in oklab, #16a34a 14%, white)", color: GREEN }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Familia notificada
          </div>
        </div>
      </PhoneFrame>
    ),
  },
];

function TutorialPage() {
  const [i, setI] = useState(0);
  const total = SCREENS.length;
  const s = SCREENS[i];
  const last = i === total - 1;
  const progress = ((i + 1) / total) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 text-sm font-semibold text-muted-foreground">
              <span>Pantalla {i + 1} de {total}</span>
              <Link to="/" className="hover:text-foreground">Saltar tutorial</Link>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PETROL}, ${GREEN})` }} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-3xl shadow-xl p-6 md:p-12 grid md:grid-cols-2 gap-10 items-center animate-fade-in" key={i}>
            <div className="order-2 md:order-1">
              <div className="inline-block text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5" style={{ background: "color-mix(in oklab, var(--brand-petrol) 12%, white)", color: DEEP }}>
                {s.badge}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                {s.title}
              </h2>
              <p className="mt-5 text-lg md:text-2xl text-muted-foreground leading-relaxed">
                {s.body}
              </p>
              <ul className="mt-7 space-y-3.5">
                {s.bullets.map((b, k) => (
                  <li key={k} className="flex items-start gap-3 text-base md:text-lg text-foreground">
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: PETROL }}>
                      <b.icon className="w-5 h-5" />
                    </span>
                    <span className="pt-1.5">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center">
              {s.illustration}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <button
              type="button"
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-border text-foreground font-bold text-base hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2.5" role="tablist">
              {SCREENS.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`Ir a pantalla ${k + 1}`}
                  className={`rounded-full transition-all ${k === i ? "w-8 h-3" : "w-3 h-3 bg-border hover:bg-foreground/30"}`}
                  style={k === i ? { background: DEEP } : undefined}
                />
              ))}
            </div>

            {last ? (
              <Link
                to="/checkout"
                search={{ mode: "contratar", plan: "unico", periodo: "mensual" }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full text-white font-bold text-base shadow-xl hover:scale-[1.02] transition"
                style={{ background: GREEN }}
              >
                Comenzar ahora
                <CheckCircle2 className="w-5 h-5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setI((v) => Math.min(total - 1, v + 1))}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full text-white font-bold text-base shadow-xl hover:scale-[1.02] transition"
                style={{ background: DEEP }}
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
