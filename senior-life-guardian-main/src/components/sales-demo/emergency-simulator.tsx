import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Heart,
  Loader2,
  Phone,
  Radio,
  RotateCcw,
  Shield,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { DemoPhoneFrame } from "@/components/demo/demo-phone-frame";
import { Button } from "@/components/ui/button";
import { checkoutUrl, formatPlanPrice, PLAN } from "@/lib/plans";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EMERGENCY_CATEGORIES,
  type EmergencyCategory,
} from "@/lib/emergency-category";
import {
  buildSimulatorLogScript,
  buildSimulatorWhatsAppMessage,
  SIMULATOR_GPS,
  SIMULATOR_SENDING_MS,
  type SimulatorLogEntry,
} from "@/lib/sales-demo/emergency-simulator-flow";

type Phase = "idle" | "category" | "sending" | "running" | "done";

const RED = "#dc2626";
const PETROL = "#0f766e";

const CATEGORY_ICONS = {
  salud: Heart,
  accidente: AlertTriangle,
  delincuencia: Shield,
} as const;

function statusIcon(status: SimulatorLogEntry["status"]) {
  if (status === "success") {
    return <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" aria-hidden />;
  }
  if (status === "progress") {
    return <Loader2 className="w-4 h-4 shrink-0 text-amber-400 animate-spin" aria-hidden />;
  }
  return <Radio className="w-4 h-4 shrink-0 text-sky-400" aria-hidden />;
}

type EmergencySimulatorProps = {
  /** Integrado en el sitio (sin cabecera oscura de página completa). */
  embedded?: boolean;
  /** Título «Experiencia de usuario» encima del simulador. */
  showIntro?: boolean;
  /** Banner + CTA de cierre cuando termina la simulación (p. ej. /como-funciona). */
  showConversionTrigger?: boolean;
  /** Vista móvil compacta: S.O.S above the fold, panel cuidador tras activar. */
  priorityMobile?: boolean;
};

export function EmergencySimulator({
  embedded = false,
  showIntro,
  showConversionTrigger = false,
  priorityMobile = false,
}: EmergencySimulatorProps) {
  const showPageIntro = showIntro ?? !embedded;
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [logs, setLogs] = useState<SimulatorLogEntry[]>([]);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const conversionRef = useRef<HTMLDivElement>(null);
  const monthlyPrice = `$${formatPlanPrice(PLAN.monthly)}/mes`;

  const simulationComplete =
    phase === "done" &&
    logs.some((entry) => entry.message.includes(SIMULATOR_GPS.label));

  useEffect(() => {
    if (!showConversionTrigger || !simulationComplete || !conversionRef.current) return;
    const timer = window.setTimeout(() => {
      conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [showConversionTrigger, simulationComplete]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setSelectedCategory(null);
    setWhatsappMessage("");
    setLogs([]);
    setWhatsappOpen(false);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const showCategoryScreen = useCallback(() => {
    if (phase !== "idle") return;
    clearTimers();
    setLogs([]);
    setSelectedCategory(null);
    setPhase("category");
  }, [clearTimers, phase]);

  const confirmCategory = useCallback(
    (category: EmergencyCategory) => {
      if (phase !== "category") return;

      clearTimers();
      setLogs([]);
      setSelectedCategory(category);
      setWhatsappMessage(buildSimulatorWhatsAppMessage(category));
      setPhase("sending");

      schedule(() => {
        setPhase("running");
        const entries: SimulatorLogEntry[] = buildSimulatorLogScript(category).map((row, index) => ({
          ...row,
          id: `log-${index}`,
        }));

        for (const entry of entries) {
          schedule(() => {
            setLogs((prev) => [...prev, entry]);
            if (entry.status === "progress") {
              setPhase("done");
            }
          }, entry.offsetMs);
        }
      }, SIMULATOR_SENDING_MS);
    },
    [clearTimers, phase, schedule],
  );

  const sosDisabled = phase !== "idle";
  const mobilePriority = priorityMobile && embedded;
  const showCaregiverOnMobile =
    !mobilePriority || phase === "running" || phase === "done" || phase === "sending";
  const hideCaregiverMobile = mobilePriority && !showCaregiverOnMobile;

  const resetButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={reset}
      className={
        embedded
          ? "gap-2"
          : "gap-2 border-white/20 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white"
      }
    >
      <RotateCcw className="w-4 h-4" />
      Reiniciar simulador
    </Button>
  );

  const simulatorGrid = (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-start">
          {/* PANTALLA 1 — Dispositivo */}
          <section className="rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl p-3 sm:p-5 md:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3 md:mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                <span className="md:hidden">Toca S.O.S para probar</span>
                <span className="hidden md:inline">Pantalla 1 · Dispositivo del adulto mayor</span>
              </h2>
            </div>

            <DemoPhoneFrame accent={RED} className="mx-auto max-w-[280px] md:max-w-none">
              <div className="w-full text-center">
                <p className="text-[10px] font-semibold text-slate-500 mb-1">Senior Safe</p>
                <p className="text-xs font-bold text-slate-700 mb-3 md:mb-5">María González</p>

                {phase === "category" ? (
                  <div className="w-full text-left">
                    <div className="relative w-14 h-14 mx-auto mb-3">
                      <span
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{ background: "rgba(220,38,38,0.25)" }}
                        aria-hidden
                      />
                      <div
                        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg mx-auto"
                        style={{ background: RED }}
                      >
                        <Bell className="w-7 h-7" aria-hidden />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight text-center">
                      ¿Qué tipo de ayuda necesitas?
                    </h3>
                    <p className="mt-1.5 text-[10px] text-slate-500 mb-3 text-center">
                      Toca una opción y avisaremos a tu familia al instante.
                    </p>
                    <div className="space-y-1.5">
                      {EMERGENCY_CATEGORIES.map((category) => {
                        const Icon = CATEGORY_ICONS[category.id];
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => confirmCategory(category.id)}
                            className="w-full py-2.5 px-2.5 rounded-xl text-white text-left font-bold shadow-md flex items-center gap-2 transition hover:scale-[1.02] ring-2 ring-transparent hover:ring-white/40"
                            style={{ background: category.color }}
                          >
                            <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" aria-hidden />
                            </span>
                            <span>
                              <span className="block text-xs leading-tight">{category.label}</span>
                              <span className="block text-[9px] font-medium text-white/90">
                                {category.subtitle}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="mt-2 w-full py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-[10px] hover:bg-slate-200"
                    >
                      Cancelar — estoy bien
                    </button>
                  </div>
                ) : phase === "sending" ? (
                  <div className="py-8 space-y-4" aria-live="polite">
                    <Loader2 className="w-12 h-12 mx-auto text-red-500 animate-spin" />
                    <p className="text-sm font-bold text-red-600">Enviando alerta…</p>
                    <p className="text-[11px] text-slate-500 leading-snug px-2">
                      Conectando GPS, central IA y contactos de emergencia
                    </p>
                  </div>
                ) : phase === "done" ? (
                  <>
                    <div className="sos-wrap mx-auto">
                      <span
                        className={`relative flex flex-col items-center justify-center w-32 h-32 md:w-44 md:h-44 rounded-full text-white font-extrabold opacity-90 border-4 border-red-300/40`}
                        style={{
                          background: `radial-gradient(circle at 30% 25%, #f87171, ${RED} 55%, #7f1d1d)`,
                        }}
                      >
                        <span className="text-base leading-tight px-2">ALERTA</span>
                        <span className="text-[9px] font-semibold text-white/90 mt-1 uppercase tracking-wide">
                          ACTIVA
                        </span>
                      </span>
                    </div>
                    <p className="mt-5 text-[11px] text-slate-500 leading-snug px-1">
                      Alerta
                      {selectedCategory
                        ? ` (${EMERGENCY_CATEGORIES.find((c) => c.id === selectedCategory)?.label})`
                        : ""}{" "}
                      en curso. Usa «Reiniciar simulador» para probar de nuevo.
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={sosDisabled}
                      onClick={showCategoryScreen}
                      className="relative mx-auto block focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label="Presionar en caso de emergencia"
                    >
                      {!sosDisabled && (
                        <>
                          <span
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ background: "rgba(220,38,38,0.3)" }}
                            aria-hidden
                          />
                          <span
                            className="absolute -inset-3 rounded-full"
                            style={{ background: "rgba(220,38,38,0.12)" }}
                            aria-hidden
                          />
                        </>
                      )}
                      <span
                        className="relative flex flex-col items-center justify-center w-32 h-32 md:w-44 md:h-44 rounded-full text-white font-extrabold shadow-[0_24px_60px_-18px_rgba(220,38,38,0.75)] border-4 border-red-300/40"
                        style={{
                          background: `radial-gradient(circle at 30% 25%, #f87171, ${RED} 55%, #7f1d1d)`,
                        }}
                      >
                        <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 mb-1" strokeWidth={2.5} aria-hidden />
                        <span className="text-sm sm:text-base leading-tight px-2">S.O.S</span>
                        <span className="text-[8px] sm:text-[9px] font-semibold text-white/90 mt-0.5 uppercase tracking-wide px-2">
                          Presionar en caso de emergencia
                        </span>
                      </span>
                    </button>
                    <p className="mt-5 text-[11px] text-slate-500 leading-snug px-1">
                      Un toque abre el selector de emergencia; luego avisamos por WhatsApp, SMS y llamada.
                    </p>
                  </>
                )}
              </div>
            </DemoPhoneFrame>
          </section>

          {/* PANTALLA 2 — Panel cuidador */}
          <section
            className={`rounded-2xl md:rounded-3xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col p-3 sm:p-5 md:p-6 lg:p-8 min-h-0 md:min-h-[520px] ${
              hideCaregiverMobile ? "max-md:hidden" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    phase === "idle" ? "bg-slate-600" : phase === "done" ? "bg-amber-400" : "bg-green-400"
                  } ${phase !== "idle" ? "animate-pulse" : ""}`}
                />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Pantalla 2 · Panel del cuidador / central
                </h2>
              </div>
              {phase !== "idle" && (
                <span className="text-[10px] font-mono text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                  LIVE
                </span>
              )}
            </div>

            <div
              className="flex-1 rounded-2xl border border-white/5 bg-black/40 p-4 font-mono text-[13px] leading-relaxed overflow-y-auto max-h-[420px]"
              aria-live="polite"
              aria-label="Log de eventos de envío"
            >
              {logs.length === 0 ? (
                <p className="text-slate-500 text-center py-16">
                  {phase === "category"
                    ? "Esperando que el adulto mayor elija el tipo de emergencia…"
                    : phase === "sending"
                      ? "Esperando confirmación del dispositivo…"
                      : "El log de envíos aparecerá aquí cuando se active el S.O.S."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {logs.map((entry) => (
                    <li key={entry.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                      {statusIcon(entry.status)}
                      <div className="min-w-0 flex-1">
                        <span className="text-teal-400">[{entry.clock}]</span>{" "}
                        <span className="text-slate-200">{entry.message}</span>
                        {entry.actionLabel && (
                          <>
                            {" "}
                            <button
                              type="button"
                              onClick={() => setWhatsappOpen(true)}
                              className="text-sky-400 underline underline-offset-2 hover:text-sky-300"
                            >
                              → {entry.actionLabel}
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {logs.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <MessageCircle className="w-4 h-4 mx-auto text-green-400 mb-1" />
                  WhatsApp OK
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 mx-auto text-green-400 mb-1" />
                  SMS OK
                </div>
                <div className="rounded-xl bg-white/5 p-2 border border-white/5">
                  <Phone className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                  Voz en curso
                </div>
              </div>
            )}

            {phase === "done" && !showConversionTrigger && (
              <p className="mt-4 text-xs text-slate-400 flex items-center gap-2" style={{ color: PETROL }}>
                <Shield className="w-3.5 h-3.5" />
                Simulación completa — en producción la central IA y los familiares reciben estos eventos de verdad.
              </p>
            )}
          </section>
        </div>

        {showConversionTrigger && simulationComplete && (
          <div
            ref={conversionRef}
            role="alert"
            className="mt-6 md:mt-8 rounded-2xl border-2 border-[#00845a]/60 bg-gradient-to-br from-[#00845a]/20 via-emerald-950/40 to-slate-900 p-5 sm:p-6 md:p-7 shadow-[0_0_40px_-8px_rgba(0,132,90,0.55)] animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="flex shrink-0 items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00845a] text-white shadow-lg">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-4">
                <p className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug">
                  ¡Alerta simulada con éxito! 🚀 Así de rápido recibirás la notificación en tu WhatsApp real.
                  Protege a tu familia hoy mismo por solo {monthlyPrice}.
                </p>
                <Link
                  to={checkoutUrl()}
                  className="flex w-full sm:w-auto sm:inline-flex items-center justify-center gap-2 min-h-[52px] px-6 py-3.5 rounded-full text-white text-base font-bold shadow-xl bg-[#00845a] hover:bg-[#006b48] ring-2 ring-white/20 hover:ring-white/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white animate-pulse hover:animate-none"
                >
                  Proteger a mi familia ahora
                  <ArrowRight className="w-5 h-5 shrink-0" aria-hidden />
                </Link>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
                  Pago seguro con Transbank · Sin permanencia · Cancela cuando quieras
                </p>
              </div>
            </div>
          </div>
        )}

      <p className="text-center text-[10px] md:text-[11px] text-slate-600 mt-4 md:mt-8">
        Coordenadas demo: {SIMULATOR_GPS.lat.toFixed(4)}, {SIMULATOR_GPS.lng.toFixed(4)} ·{" "}
        {SIMULATOR_GPS.label}
      </p>
    </>
  );

  return (
    <div className={embedded ? "" : "min-h-dvh bg-slate-950 text-slate-100"}>
      {!embedded && (
        <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-teal-400" aria-hidden />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-300/90">
                  Simulador comercial
                </p>
                <h1 className="text-lg font-bold leading-tight">Senior Safe Chile</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-400 px-3 py-1 rounded-full border border-white/10">
                Sin backend · datos ficticios
              </span>
              {resetButton}
            </div>
          </div>
        </header>
      )}

      {showPageIntro && embedded && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Experiencia de usuario
            </p>
            <h1 className="text-3xl font-bold mt-1 text-foreground">Flujo SOS en pantalla</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Pulsa el botón de emergencia, elige el tipo de ayuda (Salud, Accidente o Delincuencia) y observa
              en tiempo real cómo se envían WhatsApp, SMS y llamada al panel del cuidador. Datos simulados.
            </p>
          </div>
          {resetButton}
        </div>
      )}

      <div className={embedded ? "rounded-2xl md:rounded-3xl bg-slate-950 text-slate-100 p-2 sm:p-3 md:p-8" : ""}>
        <main className={embedded ? "" : "max-w-7xl mx-auto px-4 py-8"}>
          {!embedded && showPageIntro && (
            <p className="text-center text-slate-400 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
              Demostración aislada para clientes potenciales. Pulsa el botón de emergencia del adulto mayor y
              observa cómo reacciona el panel del cuidador en tiempo real.
            </p>
          )}

          {simulatorGrid}
        </main>
      </div>

      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Mensaje WhatsApp simulado
            </DialogTitle>
            <DialogDescription>
              Vista previa del mensaje que recibiría el Contacto 1 (Carmen R.).
            </DialogDescription>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm bg-green-50 border border-green-200 rounded-xl p-4 text-green-950 font-sans leading-relaxed">
            {whatsappMessage}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
