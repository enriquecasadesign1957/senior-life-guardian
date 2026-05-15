import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield, MapPin, Users, Battery, Wifi, Bell, CheckCircle2,
  X, Phone, Home, Settings, Heart,
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

function AppHome() {
  const [stage, setStage] = useState<Stage>("idle");
  const [countdown, setCountdown] = useState(5);

  // Countdown for auto-confirm
  useEffect(() => {
    if (stage !== "confirm") return;
    setCountdown(5);
    const id = setInterval(() => {
      setCountdown((c) => {
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

  // Simulate "sending" then "sent"
  useEffect(() => {
    if (stage !== "sending") return;
    const t = setTimeout(() => setStage("sent"), 1800);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef4f9 100%)" }}>
      {/* Top bar */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: DEEP }}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-foreground leading-tight">Senior Safe</div>
            <div className="text-xs text-muted-foreground">Hola, María</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Battery className="w-4 h-4" /> 82%</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold"><Wifi className="w-4 h-4" /></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pb-6 max-w-md mx-auto w-full">
        {/* Status banner */}
        <div className="rounded-3xl p-5 mb-7 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">Estás segura</div>
              <div className="text-sm text-white/85">Tu familia lo sabe</div>
            </div>
          </div>
        </div>

        {/* GIANT EMERGENCY BUTTON */}
        <div className="flex-1 flex items-center justify-center py-4">
          <button
            type="button"
            onClick={() => setStage("confirm")}
            aria-label="Botón de emergencia: pedir ayuda"
            className="relative group focus:outline-none"
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(220,38,38,0.25)" }} />
            <span
              className="relative flex flex-col items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full text-white font-bold shadow-[0_30px_70px_-20px_rgba(220,38,38,0.7)] active:scale-95 transition"
              style={{ background: `radial-gradient(circle at 30% 25%, #ef4444, ${RED} 60%, #991b1b)` }}
            >
              <Bell className="w-20 h-20 mb-3" strokeWidth={2.5} />
              <span className="text-3xl tracking-wide">EMERGENCIA</span>
              <span className="mt-1 text-base font-semibold text-white/80">Toca para pedir ayuda</span>
            </span>
          </button>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatusTile icon={MapPin} label="GPS activo" value="En casa" color={PETROL} />
          <StatusTile icon={Users} label="Familia" value="3 conectados" color={DEEP} />
          <StatusTile icon={Wifi} label="Internet" value="Wi-Fi" color={GREEN} />
          <StatusTile icon={Battery} label="Batería" value="82%" color="#f59e0b" />
        </div>

        {/* Bottom nav */}
        <nav className="grid grid-cols-3 gap-2 bg-card rounded-3xl p-2 border border-border shadow-sm">
          <NavItem icon={Home} label="Inicio" active />
          <NavItem icon={Heart} label="Familia" />
          <NavItem icon={Settings} label="Ajustes" />
        </nav>

        <Link to="/" className="text-center text-sm text-muted-foreground mt-4 hover:text-foreground">
          Volver al sitio web
        </Link>
      </main>

      {/* Confirmation overlay */}
      {stage !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-md p-7 text-center">
            {stage === "confirm" && (
              <>
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white mb-4 shadow-lg" style={{ background: RED }}>
                  <Bell className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">¿Necesitas ayuda?</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Si no respondes, enviaremos la alerta automáticamente.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-muted text-foreground font-bold text-base">
                  Enviando en {countdown}s
                </div>
                <div className="mt-7 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("sending")}
                    className="w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-[0.98] transition"
                    style={{ background: RED }}
                  >
                    SÍ, NECESITO AYUDA
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("idle")}
                    className="w-full py-4 rounded-2xl bg-muted text-foreground text-lg font-bold active:scale-[0.98] transition"
                  >
                    Estoy bien
                  </button>
                </div>
              </>
            )}

            {stage === "sending" && (
              <>
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white mb-4 shadow-lg animate-pulse" style={{ background: RED }}>
                  <Phone className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Avisando a tu familia...</h2>
                <p className="mt-2 text-lg text-muted-foreground">Enviando WhatsApp, SMS y llamada.</p>
                <div className="mt-5 h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full animate-[pulse_1.2s_ease-in-out_infinite] w-2/3" style={{ background: RED }} />
                </div>
              </>
            )}

            {stage === "sent" && (
              <>
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white mb-4 shadow-lg" style={{ background: GREEN }}>
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Ayuda en camino</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  <strong className="text-foreground">Pedro</strong> está atendiendo tu alerta.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("idle")}
                  className="mt-6 w-full py-4 rounded-2xl text-white text-lg font-bold shadow-lg active:scale-[0.98] transition"
                  style={{ background: DEEP }}
                >
                  Entendido
                </button>
              </>
            )}

            {stage === "confirm" && (
              <button
                type="button"
                onClick={() => setStage("idle")}
                aria-label="Cerrar"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
                style={{ position: "absolute" }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, color }: { icon: typeof Bell; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: color }}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-semibold">{label}</div>
        <div className="text-base font-bold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: typeof Bell; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition ${active ? "text-white" : "text-muted-foreground hover:bg-muted"}`}
      style={active ? { background: DEEP } : undefined}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
