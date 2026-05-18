import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield, MapPin, Users, Battery, Wifi, Bell, CheckCircle2,
  X, Home, Settings, Heart, MessageCircle, Navigation, Clock,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Senior Safe — Mi protección" },
      { name: "description", content: "Pide ayuda en un solo toque. Tu red familiar te protege 24/7." },
    ],
  }),
  component: AppHome,
});

const DEEP = "var(--brand-petrol-deep)";
const PETROL = "var(--brand-petrol)";
const GREEN = "#16a34a";
const RED = "#dc2626";

type Stage = "idle" | "confirm" | "sending" | "sent";

type Familiar = { nombre: string; parentesco: string; inicial: string; color: string };
const FAMILIA: Familiar[] = [
  { nombre: "Pedro",    parentesco: "Hijo",   inicial: "P", color: "#0ea5e9" },
  { nombre: "Carmen",   parentesco: "Hija",   inicial: "C", color: "#a855f7" },
  { nombre: "Andrés",   parentesco: "Nieto",  inicial: "A", color: "#f59e0b" },
];

function AppHome() {
  const [stage, setStage] = useState<Stage>("idle");
  const [countdown, setCountdown] = useState(5);
  const [deliveredTo, setDeliveredTo] = useState<number>(0);

  // Countdown for auto-confirm (with haptic tick if available)
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    if ("vibrate" in navigator) navigator.vibrate?.(80);
    const id = setInterval(() => {
      setCountdown((c) => {
        if ("vibrate" in navigator) navigator.vibrate?.(30);
        if (c <= 1) {
          clearInterval(id);
          setStage("sending");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  // Simulate "sending" -> "sent" with progressive delivery
  useEffect(() => {
    if (stage !== "sending") return;
    setDeliveredTo(0);
    if ("vibrate" in navigator) navigator.vibrate?.([100, 60, 100]);
    const ticks: ReturnType<typeof setTimeout>[] = [];
    FAMILIA.forEach((_, i) => {
      ticks.push(setTimeout(() => setDeliveredTo(i + 1), 500 + i * 450));
    });
    ticks.push(setTimeout(() => setStage("sent"), 500 + FAMILIA.length * 450 + 300));
    return () => ticks.forEach(clearTimeout);
  }, [stage]);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)" }}>
      {/* Top bar */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: DEEP }}>
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">Senior Safe</div>
            <div className="text-sm text-muted-foreground">Hola, María</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground" aria-label="Estado del dispositivo">
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Battery className="w-4 h-4" aria-hidden="true" /> 82%</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label="Conectado a Wi-Fi"><Wifi className="w-4 h-4" aria-hidden="true" /></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pb-6 max-w-md mx-auto w-full">
        {/* Status banner */}
        <section
          aria-label="Estado actual"
          className="rounded-3xl p-5 mb-6 text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">Estás segura</div>
              <div className="text-sm text-white/90">Tu familia te ve en tiempo real</div>
            </div>
          </div>
        </section>

        {/* GIANT EMERGENCY BUTTON */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <button
            type="button"
            onClick={() => {
              if ("vibrate" in navigator) navigator.vibrate?.(120);
              setStage("confirm");
            }}
            aria-label="Botón de emergencia. Pulsa para pedir ayuda a tu familia"
            className="relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full"
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
            <span className="absolute -inset-3 rounded-full" style={{ background: "rgba(220,38,38,0.10)" }} aria-hidden="true" />
            <span
              className="relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition"
              style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
            >
              <Bell className="w-20 h-20 mb-3" strokeWidth={2.5} aria-hidden="true" />
              <span className="text-3xl tracking-wide">EMERGENCIA</span>
              <span className="mt-1 text-base font-semibold text-white/85">Toca para pedir ayuda</span>
            </span>
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground max-w-[18rem]">
            Avisaremos a <strong className="text-foreground">{FAMILIA.length} familiares</strong> con tu ubicación exacta.
          </p>
        </div>

        {/* GPS card with mini-map */}
        <section aria-label="Tu ubicación actual" className="bg-card border border-border rounded-3xl overflow-hidden mb-4 shadow-sm">
          <div
            className="relative h-32"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(16,185,129,0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(15,76,98,0.06) 0 1px, transparent 1px 24px), linear-gradient(180deg, #f1f5f9, #e2e8f0)",
            }}
            aria-hidden="true"
          >
            {/* Streets */}
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-white/80" />
            <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-white/80" />
            {/* Pulse pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 -m-3 rounded-full animate-ping" style={{ background: "rgba(34,197,94,0.45)" }} />
              <span className="relative flex w-7 h-7 rounded-full items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                <MapPin className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: PETROL }}>
              <Navigation className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">GPS activo</div>
              <div className="text-lg font-bold text-foreground truncate">En casa · Las Condes</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" aria-hidden="true" /> Actualizado hace 1 min
              </div>
            </div>
          </div>
        </section>

        {/* Family card */}
        <section aria-label="Familiares conectados" className="bg-card border border-border rounded-3xl p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: DEEP }} aria-hidden="true" />
              <h2 className="font-bold text-foreground text-base">Tu red familiar</h2>
            </div>
            <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{ background: GREEN }}>
              {FAMILIA.length} conectados
            </span>
          </div>
          <ul className="space-y-2">
            {FAMILIA.map((f) => (
              <li key={f.nombre} className="flex items-center gap-3 py-1.5">
                <span
                  aria-hidden="true"
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: f.color }}
                >
                  {f.inicial}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-foreground leading-tight">{f.nombre}</div>
                  <div className="text-sm text-muted-foreground">{f.parentesco} · recibe WhatsApp</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} aria-label="En línea" />
              </li>
            ))}
          </ul>
        </section>

        {/* Bottom nav */}
        <nav aria-label="Navegación principal" className="grid grid-cols-3 gap-2 bg-card rounded-3xl p-2 border border-border shadow-sm">
          <NavItem icon={Home} label="Inicio" active />
          <NavItem icon={Heart} label="Familia" />
          <NavItem icon={Settings} label="Ajustes" />
        </nav>

        <Link to="/" className="text-center text-sm text-muted-foreground mt-4 hover:text-foreground underline-offset-4 hover:underline">
          Volver al sitio web
        </Link>
      </main>

      {/* Confirmation overlay */}
      {stage !== "idle" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in"
        >
          <div className="relative bg-card rounded-3xl shadow-2xl w-full max-w-md p-7 text-center">
            {stage === "confirm" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: RED }}>
                    <Bell className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  ¿Necesitas ayuda?
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Avisaremos a tu familia por WhatsApp con tu ubicación.
                </p>

                {/* Countdown ring */}
                <div className="mt-6 flex items-center justify-center" aria-live="polite" aria-atomic="true">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={2 * Math.PI * 44 * (1 - countdown / 5)}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-foreground tabular-nums">{countdown}</span>
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">segundos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("sending")}
                    className="w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-red-300"
                    style={{ background: RED }}
                  >
                    SÍ, NECESITO AYUDA
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("idle")}
                    className="w-full py-5 rounded-2xl bg-muted text-foreground text-xl font-bold active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  >
                    Estoy bien, cancelar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  aria-label="Cerrar"
                  className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition focus-visible:ring-2 focus-visible:ring-foreground"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}

            {stage === "sending" && (
              <>
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white mb-5 shadow-lg animate-pulse" style={{ background: RED }}>
                  <MessageCircle className="w-12 h-12" aria-hidden="true" />
                </div>
                <h2 id="emergency-dialog-title" className="text-2xl font-bold text-foreground tracking-tight">
                  Avisando a tu familia
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">Enviando WhatsApp con tu ubicación…</p>

                <ul className="mt-6 space-y-2 text-left" aria-live="polite" aria-atomic="false">
                  {FAMILIA.map((f, i) => {
                    const done = i < deliveredTo;
                    return (
                      <li
                        key={f.nombre}
                        className="flex items-center gap-3 py-2 px-3 rounded-2xl transition"
                        style={{ background: done ? "rgba(22,163,74,0.08)" : "hsl(var(--muted))" }}
                      >
                        <span
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ background: f.color }}
                        >
                          {f.inicial}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground">{f.nombre}</div>
                          <div className="text-xs text-muted-foreground">{f.parentesco}</div>
                        </div>
                        {done ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: GREEN }}>
                            <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> Avisado
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-foreground animate-spin" aria-label="Enviando" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {stage === "sent" && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(22,163,74,0.30)" }} aria-hidden="true" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: GREEN }}>
                    <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
                  </div>
                </div>
                <h2 id="emergency-dialog-title" className="text-3xl font-bold text-foreground tracking-tight">
                  Ayuda en camino
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  <strong className="text-foreground">Pedro</strong> respondió y está atendiendo tu alerta.
                </p>

                <div className="mt-5 rounded-2xl bg-muted p-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GREEN }} aria-hidden="true" />
                    Compartiste tu ubicación
                  </div>
                  <div className="text-sm text-muted-foreground">En casa · Las Condes</div>
                </div>

                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  className="mt-6 w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition focus-visible:ring-4 focus-visible:ring-slate-300"
                  style={{ background: DEEP }}
                >
                  Entendido
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: typeof Bell; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-1 py-3 min-h-11 rounded-2xl transition focus-visible:ring-2 focus-visible:ring-foreground ${active ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
      style={active ? { background: DEEP } : undefined}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
