import { createFileRoute, Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEMO_NAV_SECTIONS } from "@/lib/demo/demo-data";
import { useDemo } from "@/lib/demo/demo-context";
import {
  DemoFlowCategoryScreen,
  DemoFlowEmergencyButtonScreen,
  DemoFlowGeolocationScreen,
  DemoFlowGuardianMessageScreen,
} from "@/components/demo/demo-flow-screens";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

export const Route = createFileRoute("/demo/presentacion")({
  component: DemoPresentacionPage,
});

const demoRouteApi = getRouteApi("/demo");

type SlideBase = { title: string; body: string };
type SlideLink = SlideBase & { link: string };
type SlideAction = SlideBase & { action: "sos" };
type SlideFlujo = SlideBase & {
  flujo: "sos" | "tipo" | "guardian" | "mapa";
};

type Slide = SlideBase | SlideLink | SlideAction | SlideFlujo;

const FLUJO_SLIDES: SlideFlujo[] = [
  {
    flujo: "sos",
    title: "1. Botón de emergencia",
    body: "Pantalla del adulto mayor: botón rojo visible con pulso. Un toque inicia el protocolo.",
  },
  {
    flujo: "tipo",
    title: "2. ¿Qué tipo de ayuda?",
    body: "Salud, accidente o delincuencia — la familia recibe el contexto antes de actuar.",
  },
  {
    flujo: "guardian",
    title: "3. Mensaje al guardián",
    body: "SMS y WhatsApp con enlace de confirmación, tipo de emergencia y ubicación GPS.",
  },
  {
    flujo: "mapa",
    title: "4. Geolocalización",
    body: "El familiar abre el mapa y puede ir en camino con Google Maps.",
  },
];

const SLIDES: Slide[] = [
  {
    title: "Senior Safe",
    body: "Protección inteligente para adultos mayores con alertas multicanal a la familia.",
  },
  ...FLUJO_SLIDES,
  ...DEMO_NAV_SECTIONS.filter((s) => s.to !== "/demo/presentacion" && s.to !== "/demo/flujo").map((s) => ({
    title: s.label,
    body: s.desc,
    link: s.to,
  })),
  {
    title: "Simular emergencia",
    body: "Demostración en vivo de la cascada SOS (SMS → WhatsApp → confirmación) sin afectar producción.",
    action: "sos",
  },
];

function FlujoScreen({ flujo }: { flujo: SlideFlujo["flujo"] }) {
  switch (flujo) {
    case "sos":
      return <DemoFlowEmergencyButtonScreen />;
    case "tipo":
      return <DemoFlowCategoryScreen selected="salud" />;
    case "guardian":
      return <DemoFlowGuardianMessageScreen category="salud" channel="whatsapp" />;
    case "mapa":
      return <DemoFlowGeolocationScreen />;
  }
}

function DemoPresentacionPage() {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const { institucion } = demoRouteApi.useSearch();
  const { setPresentationMode, simulateEmergency } = useDemo();

  useEffect(() => {
    setPresentationMode(true);
    return () => setPresentationMode(false);
  }, [setPresentationMode]);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 8000);
    return () => clearInterval(t);
  }, [auto]);

  const slide = SLIDES[idx];
  const link = "link" in slide ? slide.link : undefined;
  const flujo = "flujo" in slide ? slide.flujo : undefined;

  return (
    <div className="min-h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Modo Presentación</h1>
        <Button variant="outline" size="sm" onClick={() => setAuto((a) => !a)} className="gap-2">
          {auto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {auto ? "Pausar tour" : "Tour automático"}
        </Button>
      </div>

      <div
        className={`flex-1 rounded-3xl p-8 md:p-12 text-white transition-all duration-500 ${
          flujo ? "lg:p-10" : "p-10 md:p-16"
        }`}
        style={{ background: "linear-gradient(145deg, var(--brand-petrol-deep), #0e7490)" }}
      >
        <div className={flujo ? "grid lg:grid-cols-[1fr_auto] gap-8 items-center" : ""}>
          <div className={flujo ? "min-w-0" : "flex flex-col justify-center"}>
            <p className="text-white/60 text-sm mb-2">
              Paso {idx + 1} / {SLIDES.length}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
              {slide.title}
            </h2>
            <p className="mt-4 text-lg text-white/85 max-w-xl animate-in fade-in duration-700">{slide.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {link && (
                <Button asChild variant="secondary">
                  <Link to={link} search={{ institucion }}>
                    Abrir módulo
                  </Link>
                </Button>
              )}
              {flujo && (
                <Button asChild variant="secondary">
                  <Link to="/demo/flujo" search={{ institucion }}>
                    Ver flujo interactivo
                  </Link>
                </Button>
              )}
              {"action" in slide && slide.action === "sos" && (
                <Button variant="secondary" onClick={() => void simulateEmergency()}>
                  Simular SOS ahora
                </Button>
              )}
            </div>
          </div>

          {flujo && (
            <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-700">
              <div className="scale-[0.92] md:scale-100 origin-center drop-shadow-2xl">
                <FlujoScreen flujo={flujo} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        <div className="flex gap-1 max-w-[50vw] overflow-x-auto">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full shrink-0 transition ${i === idx ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
        <Button variant="ghost" disabled={idx === SLIDES.length - 1} onClick={() => setIdx((i) => i + 1)}>
          Siguiente <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
