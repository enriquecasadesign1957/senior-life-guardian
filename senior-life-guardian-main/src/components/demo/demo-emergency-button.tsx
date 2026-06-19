import { AlertTriangle, Loader2, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo/demo-context";
import { DemoMapVisual } from "@/components/demo/demo-map-visual";

export function DemoEmergencyButton() {
  const { activeEmergency, emergencyRunning, simulateEmergency, cancelEmergency } = useDemo();
  const open = emergencyRunning || activeEmergency?.status === "running";

  return (
    <>
      <Button
        type="button"
        onClick={() => void simulateEmergency()}
        disabled={emergencyRunning}
        className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full shadow-2xl font-bold gap-2 animate-in fade-in"
        style={{ background: "var(--brand-petrol-deep)" }}
      >
        {emergencyRunning ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
        Simular Emergencia
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && cancelEmergency()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-destructive animate-pulse" />
              Emergencia SOS — simulación en vivo
            </DialogTitle>
          </DialogHeader>

          {activeEmergency && (
            <div className="space-y-4">
              <DemoMapVisual label={`${activeEmergency.seniorNombre} · SOS`} alertMode />
              <p className="text-sm text-muted-foreground">
                Cascada: SMS → WhatsApp (15 s) → confirmación familiar
              </p>
              <ol className="space-y-2 text-sm">
                {activeEmergency.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 p-2 rounded-xl bg-muted/60 border border-border">
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {new Date(step.at).toLocaleTimeString("es-CL")}
                    </span>
                    <div>
                      <div className="font-semibold">
                        {step.channel} → {step.to}
                      </div>
                      <div className="text-muted-foreground text-xs">{step.message}</div>
                    </div>
                  </li>
                ))}
              </ol>
              {activeEmergency.status === "closed" && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-900 text-sm font-medium">
                  Caso cerrado — flujo completo simulado
                </div>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full mt-2" onClick={cancelEmergency}>
            <X className="w-4 h-4 mr-2" /> Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
