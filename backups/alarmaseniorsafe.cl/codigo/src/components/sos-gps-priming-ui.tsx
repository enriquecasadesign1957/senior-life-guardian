import { Bell, CheckCircle2, Loader2, MapPin, X } from "lucide-react";

const RED = "#dc2626";
const GREEN = "#16a34a";

export type SosGpsPrimingUiStage = "intro" | "loading" | "success" | null;

type Props = {
  uiStage: SosGpsPrimingUiStage;
  gpsOk: boolean;
  onIntroDismiss: () => void;
  onSuccessClose: () => void;
};

export function SosGpsPrimingUi({
  uiStage,
  gpsOk,
  onIntroDismiss,
  onSuccessClose,
}: Props) {
  if (!uiStage) return null;

  if (uiStage === "intro") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-priming-intro-title"
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6"
      >
        <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
            style={{ background: RED }}
          >
            <Bell className="w-10 h-10" aria-hidden="true" />
          </div>
          <h2 id="sos-priming-intro-title" className="text-2xl font-bold text-foreground">
            Presiona el botón rojo
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            La <strong className="text-foreground">primera vez</strong> activa ubicación y WhatsApp.
            <span className="block mt-2">No avisará a tu familia.</span>
          </p>
          <p className="mt-3 text-sm font-medium text-red-600">
            Desde la segunda vez, el botón enviará la alerta real.
          </p>
          <button
            type="button"
            onClick={onIntroDismiss}
            className="mt-6 w-full py-4 rounded-2xl text-white text-lg font-bold shadow-lg active:scale-[0.98] transition"
            style={{ background: RED }}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  if (uiStage === "loading") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-priming-loading-title"
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
      >
        <div className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: RED }} aria-hidden="true" />
          <h2 id="sos-priming-loading-title" className="text-xl font-bold text-foreground">
            Activando ubicación…
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Esta vez no se enviará ningún mensaje a tu familia.
          </p>
        </div>
      </div>
    );
  }

  const successTone = gpsOk ? GREEN : "#f59e0b";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-priming-success-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <div className="relative bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
        <button
          type="button"
          onClick={onSuccessClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
          style={{ background: successTone }}
        >
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 id="sos-priming-success-title" className="text-xl font-bold text-foreground">
          {gpsOk ? "¡Listo para emergencias!" : "Casi listo"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {gpsOk ? (
            <>
              Ubicación y WhatsApp activados. La próxima vez el botón rojo avisará a tu familia.
            </>
          ) : (
            <>
              WhatsApp vinculado. Si puedes, activa la ubicación en Ajustes del teléfono para mejores
              alertas.
            </>
          )}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {gpsOk ? "GPS activo" : "GPS pendiente"}
        </div>
        <button
          type="button"
          onClick={onSuccessClose}
          className="mt-6 w-full py-3 rounded-2xl text-white font-bold"
          style={{ background: successTone }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
