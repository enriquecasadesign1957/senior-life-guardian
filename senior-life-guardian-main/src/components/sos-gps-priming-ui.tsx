import { Activity, Bell, CheckCircle2, Loader2, MapPin, X } from "lucide-react";

const RED = "#dc2626";
const GREEN = "#16a34a";

export type SosGpsPrimingUiStage = "intro" | "loading" | "success" | null;

type Props = {
  uiStage: SosGpsPrimingUiStage;
  gpsOk: boolean;
  fallOk?: boolean;
  fallSupported?: boolean;
  onIntroDismiss: () => void;
  onSuccessClose: () => void;
};

export function SosGpsPrimingUi({
  uiStage,
  gpsOk,
  fallOk = false,
  fallSupported = false,
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
            La <strong className="text-foreground">primera vez</strong> activa ubicación
            {fallSupported ? ", sensor de caídas" : ""} y WhatsApp.
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
            Activando ubicación{fallSupported ? " y sensores" : ""}…
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Esta vez no se enviará ningún mensaje a tu familia.
          </p>
        </div>
      </div>
    );
  }

  const successTone = gpsOk && (!fallSupported || fallOk) ? GREEN : "#f59e0b";

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
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
          style={{ background: successTone }}
        >
          {gpsOk ? (
            <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          ) : (
            <MapPin className="w-10 h-10" aria-hidden="true" />
          )}
        </div>
        <h2 id="sos-priming-success-title" className="text-2xl font-bold text-foreground">
          {gpsOk ? "¡Listo!" : "Prueba completada"}
        </h2>
        <ul className="mt-4 text-left text-sm space-y-2 max-w-[16rem] mx-auto">
          <li className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: gpsOk ? GREEN : "#f59e0b" }} />
            <span>{gpsOk ? "Ubicación activa" : "Ubicación pendiente (revisa Ajustes)"}</span>
          </li>
          {fallSupported && (
            <li className="flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" style={{ color: fallOk ? GREEN : "#f59e0b" }} />
              <span>{fallOk ? "Sensor de caídas activo" : "Caídas pendiente (toca «Caídas» en la app)"}</span>
            </li>
          )}
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            <span>WhatsApp vinculado</span>
          </li>
        </ul>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Si vuelves a presionar el botón rojo, avisaremos a tu familia con tu mapa.
        </p>
        <button
          type="button"
          onClick={onSuccessClose}
          className="mt-6 w-full py-4 rounded-2xl text-white text-lg font-bold shadow-lg active:scale-[0.98] transition"
          style={{ background: GREEN }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
