import { Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onActivate: () => void;
  onDismiss: () => void;
  busy?: boolean;
};

/** Recordatorio opcional día 2–3: activar sensor de caídas. */
export function FallSensorDeferredPrompt({ onActivate, onDismiss, busy }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <div className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-center">¿Activar detección de caídas?</h2>
        <p className="mt-3 text-sm text-muted-foreground text-center leading-relaxed">
          Es <strong className="text-foreground">opcional</strong>. Si se cae, la app puede avisar a
          tu familia automáticamente. Puedes activarlo ahora o más tarde desde ajustes.
        </p>
        <div className="mt-6 space-y-2">
          <Button className="w-full h-12 text-base font-bold" onClick={onActivate} disabled={busy}>
            {busy ? "Activando…" : "Sí, activar"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDismiss} disabled={busy}>
            Ahora no
          </Button>
        </div>
      </div>
    </div>
  );
}
