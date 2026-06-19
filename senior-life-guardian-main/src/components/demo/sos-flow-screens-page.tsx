import { useEffect, useState } from "react";
import type { EmergencyCategory } from "@/lib/emergency-category";
import {
  DemoFlowCategoryScreen,
  DemoFlowEmergencyButtonScreen,
  DemoFlowGeolocationScreen,
  DemoFlowGuardianMessageScreen,
} from "@/components/demo/demo-flow-screens";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const STEPS = [
  {
    id: "sos",
    title: "1. Botón de emergencia",
    desc: "Pantalla principal del adulto mayor: botón rojo grande, siempre visible, con animación de pulso («latiendo») para indicar que está activo.",
  },
  {
    id: "tipo",
    title: "2. Tipo de ayuda",
    desc: "Tras pulsar SOS, la app pregunta qué tipo de emergencia es (Salud, Accidente o Delincuencia) antes de avisar a la familia.",
  },
  {
    id: "guardian",
    title: "3. Mensaje al guardián",
    desc: "SMS y WhatsApp con el mismo contenido de producción: tipo de emergencia, enlace de confirmación y ubicación GPS.",
  },
  {
    id: "mapa",
    title: "4. Geolocalización",
    desc: "El familiar abre el mapa con la posición precisa del adulto mayor y puede ir en camino con Google Maps.",
  },
] as const;

type SosFlowScreensPageProps = {
  /** Oculta título introductorio (p. ej. dentro del layout demo). */
  showIntro?: boolean;
};

export function SosFlowScreensPage({ showIntro = true }: SosFlowScreensPageProps) {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const [category, setCategory] = useState<EmergencyCategory>("salud");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 5000);
    return () => clearInterval(t);
  }, [auto]);

  const current = STEPS[step];

  return (
    <div className="space-y-8">
      {showIntro && (
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Experiencia de usuario</p>
          <h1 className="text-3xl font-bold mt-1">Flujo SOS en pantalla</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Vistas reales de la app móvil y del mensaje que recibe el guardián. Datos simulados; mismo diseño y textos
            que producción.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={`text-xs px-3 py-2 rounded-full border font-semibold transition ${
              step === i
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s.title}
          </button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto gap-2" onClick={() => setAuto((a) => !a)}>
          {auto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {auto ? "Pausar recorrido" : "Reproducir flujo"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10 flex flex-col items-center min-h-[520px] justify-center">
          {step === 0 && <DemoFlowEmergencyButtonScreen />}
          {step === 1 && <DemoFlowCategoryScreen selected={category} onSelect={setCategory} />}
          {step === 2 && (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {(["whatsapp", "sms"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
                      channel === c ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {c === "whatsapp" ? "WhatsApp" : "SMS"}
                  </button>
                ))}
              </div>
              <DemoFlowGuardianMessageScreen category={category} channel={channel} />
            </div>
          )}
          {step === 3 && <DemoFlowGeolocationScreen />}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Paso {step + 1} de {STEPS.length}
            </p>
            <h2 className="text-xl font-bold mt-1">{current.title}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{current.desc}</p>
          </div>

          {step === 1 && (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-950">
              Categoría seleccionada: <strong>{category}</strong>. El mensaje al guardián (paso 3) se actualiza con
              este tipo.
            </div>
          )}

          <div className="flex justify-between gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
