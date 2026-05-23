import { createFileRoute } from "@tanstack/react-router";
import {
  Shield, MapPin, Phone, MessageCircle, Bell, Heart, Activity,
  Battery, Wifi, Clock, CheckCircle2, AlertTriangle, Plus, ChevronRight,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";
import { WhatsAppActivationButton } from "@/components/whatsapp-activation-button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard familiar — Senior Safe" },
      { name: "description", content: "Monitorea el estado, ubicación y alertas de tu familiar en tiempo real con Senior Safe." },
    ],
  }),
  component: DashboardPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";
const AMBER = "#f59e0b";

const ALERTS = [
  { type: "ok", icon: CheckCircle2, color: GREEN, title: "Estado seguro confirmado", time: "Hace 10 minutos" },
  { type: "info", icon: Activity, color: PETROL, title: "Movimiento detectado en casa", time: "Hace 1 hora" },
  { type: "warn", icon: AlertTriangle, color: AMBER, title: "Recordatorio de medicamento atendido", time: "Hace 3 horas" },
  { type: "ok", icon: Heart, color: RED, title: "Rutina diaria completada", time: "Ayer 21:40" },
];

const CONTACTS = [
  { name: "Pedro González", role: "Hijo", initial: "P", color: DEEP },
  { name: "Ana Soto", role: "Nieta", initial: "A", color: GREEN },
  { name: "Dr. Ramírez", role: "Médico de cabecera", initial: "R", color: PETROL },
];

function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">

          {/* Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Panel familiar</div>
              <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight text-foreground">Hola, Carmen</h1>
              <p className="text-muted-foreground mt-1">Esto es lo que pasa con tu mamá hoy.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-card border border-border">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: GREEN }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: GREEN }} />
              </span>
              <span className="text-foreground">En línea</span>
              <span className="text-muted-foreground">· Actualizado hace 1 min</span>
            </div>
          </div>

          {/* Hero status card */}
          <section
            className="relative overflow-hidden rounded-3xl p-7 md:p-10 text-white shadow-xl mb-6"
            style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-7 items-center">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white/15 border-4 border-white/30 flex items-center justify-center text-3xl md:text-4xl font-bold backdrop-blur-sm">
                  M
                </div>
                <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center" style={{ background: GREEN }}>
                  <Shield className="w-4 h-4" />
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-sm mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Estado seguro
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                  María está segura
                </h2>
                <p className="mt-2 text-white/80 text-base md:text-lg">
                  Última actividad: hace 10 minutos · En casa
                </p>
              </div>
              <div className="flex md:flex-col gap-3 md:items-stretch">
                <a href="https://wa.me/56971404580?text=Hola%20Senior%20Safe%2C%20necesito%20ayuda" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-white font-bold shadow-lg hover:scale-[1.02] transition" style={{ background: "#25D366" }}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Mini stats */}
            <div className="relative mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat icon={Battery} label="Batería" value="82%" />
              <MiniStat icon={Wifi} label="Conexión" value="Wi-Fi" />
              <MiniStat icon={Heart} label="Pulso" value="74 bpm" />
              <MiniStat icon={Clock} label="Activa hace" value="10 min" />
            </div>
          </section>

          <div className="mb-6">
            <WhatsAppActivationButton />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Última ubicación</h3>
                  <p className="text-xs text-muted-foreground">Av. Providencia 1234, Santiago · hace 8 min</p>
                </div>
                <button className="text-xs font-bold inline-flex items-center gap-1 hover:underline" style={{ color: DEEP }}>
                  Abrir mapa <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <MockMap />
            </div>

            {/* Recent alerts */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-lg">Alertas recientes</h3>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <ul className="space-y-3">
                {ALERTS.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-background border border-border">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: a.color }}>
                      <a.icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground leading-snug">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full text-sm font-bold py-2.5 rounded-full border border-border hover:bg-muted transition" style={{ color: DEEP }}>
                Ver historial completo
              </button>
            </div>

            {/* Emergency contacts */}
            <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Contactos de emergencia</h3>
                  <p className="text-xs text-muted-foreground">Reciben las alertas al instante</p>
                </div>
                <button className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border border-border hover:bg-muted transition" style={{ color: DEEP }}>
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {CONTACTS.map((c) => (
                  <li key={c.name} className="flex items-center gap-3 p-3.5 rounded-2xl bg-background border border-border">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: c.color }}>
                      {c.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.role}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button aria-label="Llamar" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition" style={{ color: DEEP }}>
                        <Phone className="w-4 h-4" />
                      </button>
                      <button aria-label="WhatsApp" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition" style={{ color: "#25D366" }}>
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Daily summary */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground text-lg mb-4">Resumen del día</h3>
              <div className="space-y-4">
                <SummaryRow label="Pasos" value="2.480" pct={62} color={PETROL} />
                <SummaryRow label="Tiempo activa" value="3h 12m" pct={45} color={GREEN} />
                <SummaryRow label="Sueño anoche" value="7h 30m" pct={88} color={DEEP} />
              </div>
              <div className="mt-5 p-4 rounded-2xl flex items-start gap-3" style={{ background: "color-mix(in oklab, #16a34a 8%, white)" }}>
                <Heart className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                <p className="text-sm text-foreground leading-relaxed">
                  María ha tenido un <strong>excelente día</strong>. Sigue su rutina habitual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-3">
      <div className="flex items-center gap-2 text-white/70 text-xs">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function MockMap() {
  return (
    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)" }}>
      {/* Grid streets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14,116,144,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#grid)" />
        <path d="M 0 130 Q 120 100 220 140 T 400 110" stroke="rgba(14,116,144,0.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M 180 0 L 200 250" stroke="rgba(14,116,144,0.25)" strokeWidth="4" fill="none" />
        <circle cx="80" cy="60" r="22" fill="rgba(34,197,94,0.18)" />
        <circle cx="320" cy="190" r="30" fill="rgba(59,130,246,0.15)" />
      </svg>

      {/* Pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.35)" }} />
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white" style={{ background: RED }}>
            <MapPin className="w-5 h-5" />
          </div>
          <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white rounded-xl px-3 py-1.5 shadow-lg text-xs font-bold text-foreground border border-border">
            María · En casa
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 text-[11px] flex items-center gap-2 border border-border shadow-sm">
        <span className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
        <span className="font-semibold text-foreground">GPS activo</span>
      </div>
    </div>
  );
}
