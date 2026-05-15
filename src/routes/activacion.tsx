import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, Download, Smartphone, Apple, KeyRound, Users,
  MapPin, Bell, ArrowRight, Shield,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-layout";

export const Route = createFileRoute("/activacion")({
  head: () => ({
    meta: [
      { title: "Activación — Bienvenido a Senior Safe" },
      { name: "description", content: "Configura Senior Safe en 5 pasos: descarga la app, crea tu PIN, agrega familiares, activa GPS y prueba el botón de emergencia." },
    ],
  }),
  component: ActivacionPage,
});

const PETROL = "var(--brand-petrol)";
const DEEP = "var(--brand-petrol-deep)";
const GREEN = "#16a34a";
const RED = "#dc2626";

const STEPS = [
  { icon: Download, color: PETROL, title: "Descargar la aplicación", desc: "Disponible para Android y iPhone." },
  { icon: KeyRound, color: DEEP, title: "Crear tu PIN de seguridad", desc: "Un código de 4 dígitos fácil de recordar." },
  { icon: Users, color: GREEN, title: "Agregar a tus familiares", desc: "Hasta 5 personas que recibirán las alertas." },
  { icon: MapPin, color: "#f59e0b", title: "Activar el GPS", desc: "Para enviar tu ubicación en caso de emergencia." },
  { icon: Bell, color: RED, title: "Probar el botón de emergencia", desc: "Una prueba simple para asegurarnos que todo funciona." },
];

function ActivacionPage() {
  const [completed, setCompleted] = useState<boolean[]>(Array(STEPS.length).fill(false));
  const total = STEPS.length;
  const doneCount = completed.filter(Boolean).length;
  const progress = useMemo(() => Math.round((doneCount / total) * 100), [doneCount, total]);
  const allDone = doneCount === total;

  const toggle = (i: number) => setCompleted((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1" style={{ background: "var(--gradient-soft)" }}>
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white mb-5 shadow-lg" style={{ background: `linear-gradient(135deg, ${DEEP}, ${PETROL})` }}>
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Bienvenido a Senior Safe
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-muted-foreground">
              Tu red de cuidado familiar ya está lista.
            </p>
          </div>

          {/* Progress */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-7 shadow-sm mb-8">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-base font-bold text-foreground">Tu progreso</span>
              <span className="text-2xl font-bold tracking-tight" style={{ color: DEEP }}>{progress}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${PETROL}, ${GREEN})` }}
              />
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {doneCount} de {total} pasos completados
            </div>
          </div>

          {/* Download buttons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <a href="#" className="inline-flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-white font-bold text-lg shadow-md hover:scale-[1.02] transition" style={{ background: DEEP }}>
              <Smartphone className="w-6 h-6" />
              Descargar Android
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-white font-bold text-lg shadow-md hover:scale-[1.02] transition bg-foreground">
              <Apple className="w-6 h-6" />
              Descargar iPhone
            </a>
          </div>

          {/* Steps */}
          <ol className="space-y-4">
            {STEPS.map((s, i) => {
              const done = completed[i];
              return (
                <li key={i} className={`bg-card border-2 rounded-3xl p-5 md:p-6 transition ${done ? "" : "border-border"}`} style={done ? { borderColor: GREEN, background: "color-mix(in oklab, #16a34a 5%, white)" } : undefined}>
                  <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: s.color }}>
                        <s.icon className="w-8 h-8" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-border flex items-center justify-center text-sm font-bold text-foreground">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{s.title}</h3>
                      <p className="mt-1 text-base text-muted-foreground">{s.desc}</p>
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        className={`mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold transition ${done ? "text-white" : "border-2 text-foreground hover:bg-muted"}`}
                        style={done ? { background: GREEN } : { borderColor: "var(--brand-petrol-deep)" }}
                      >
                        {done ? (<><CheckCircle2 className="w-5 h-5" /> Completado</>) : (<>Marcar como hecho <ArrowRight className="w-5 h-5" /></>)}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Continue */}
          <div className="mt-10 bg-card border border-border rounded-3xl p-6 md:p-8 text-center shadow-sm">
            {allDone ? (
              <>
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white mb-4" style={{ background: GREEN }}>
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">¡Todo listo!</h3>
                <p className="mt-2 text-muted-foreground text-base">Tu familia ya está conectada y protegida.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">¿Necesitas ayuda?</h3>
                <p className="mt-2 text-muted-foreground text-base">Nuestro equipo está disponible 24/7 para acompañarte.</p>
              </>
            )}
            <Link
              to="/"
              className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full text-white font-bold text-lg shadow-xl hover:scale-[1.02] transition"
              style={{ background: DEEP }}
            >
              Continuar configuración
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          {/* Contact footer note */}
          <div className="mt-8 text-center text-base text-muted-foreground">
            ¿Dudas? Escríbenos a <a href="mailto:hola@alarmaseniorsafe.cl" className="font-semibold" style={{ color: DEEP }}>hola@alarmaseniorsafe.cl</a>
            <br />
            o llámanos al <a href="tel:+56971404580" className="font-semibold" style={{ color: DEEP }}>+56 9 7140 4580</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
