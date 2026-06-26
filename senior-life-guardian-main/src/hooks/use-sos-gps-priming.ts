import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentCoordsWithError } from "@/lib/geo";
import { isSosGpsPrimed, markSosGpsPrimed } from "@/lib/sos-gps-priming";
import type { SosGpsPrimingUiStage } from "@/components/sos-gps-priming-ui";
import { isMotionApiAvailable } from "@/hooks/useFallDetection";

type Options = {
  signupId: string | null;
  /** Mostrar flujo de primera pulsación (app instalada y panel principal visible). */
  enabled: boolean;
  onGpsPrimed?: (gpsOk: boolean) => void;
  /** Pide permiso de caídas dentro del gesto del botón rojo. */
  onFallSensorPrimed?: () => Promise<boolean> | boolean;
  /** Vincula WhatsApp en servidor (1.ª pulsación o cuenta ya preparada). */
  onWhatsAppAutoActivate?: () => Promise<void>;
};

/** Primera pulsación del botón rojo: GPS + sensor de caídas + WhatsApp (sin alerta real). */
export function useSosGpsPriming({
  signupId,
  enabled,
  onGpsPrimed,
  onFallSensorPrimed,
  onWhatsAppAutoActivate,
}: Options) {
  const fallSupported = useMemo(() => isMotionApiAvailable(), []);
  const [primed, setPrimed] = useState(() => isSosGpsPrimed(signupId));
  const [introDismissed, setIntroDismissed] = useState(false);
  const [uiStage, setUiStage] = useState<SosGpsPrimingUiStage>(null);
  const [lastGpsOk, setLastGpsOk] = useState(false);
  const [lastFallOk, setLastFallOk] = useState(false);
  const whatsAppActivateStartedRef = useRef(false);

  useEffect(() => {
    setPrimed(isSosGpsPrimed(signupId));
  }, [signupId]);

  useEffect(() => {
    if (!signupId || !primed || !onWhatsAppAutoActivate || whatsAppActivateStartedRef.current) {
      return;
    }
    whatsAppActivateStartedRef.current = true;
    void onWhatsAppAutoActivate();
  }, [signupId, primed, onWhatsAppAutoActivate]);

  useEffect(() => {
    if (!enabled || primed || introDismissed) {
      if (primed) setUiStage(null);
      return;
    }
    setUiStage("intro");
  }, [enabled, primed, introDismissed]);

  const dismissIntro = useCallback(() => {
    setIntroDismissed(true);
    setUiStage(null);
  }, []);

  const closeSuccess = useCallback(() => {
    setUiStage(null);
  }, []);

  /** Primera pulsación: GPS + caídas + WhatsApp. Devuelve true si consumió el toque. */
  const runPrimingPress = useCallback(async (): Promise<boolean> => {
    if (primed) return false;

    setIntroDismissed(true);
    setUiStage("loading");
    if ("vibrate" in navigator) navigator.vibrate?.(80);

    const gpsResult = await getCurrentCoordsWithError({
      highAccuracy: true,
      timeoutMs: 12_000,
      maximumAgeMs: 0,
    });

    const gpsOk = !!gpsResult.coords && !gpsResult.error;
    setLastGpsOk(gpsOk);
    onGpsPrimed?.(gpsOk);

    let fallOk = false;
    if (fallSupported && onFallSensorPrimed) {
      try {
        const result = await onFallSensorPrimed();
        fallOk = result === true;
      } catch {
        fallOk = false;
      }
    }
    setLastFallOk(fallOk);

    markSosGpsPrimed(signupId ?? undefined);
    setPrimed(true);
    await onWhatsAppAutoActivate?.();
    setUiStage("success");
    return true;
  }, [primed, signupId, fallSupported, onGpsPrimed, onFallSensorPrimed, onWhatsAppAutoActivate]);

  return {
    primed,
    uiStage,
    lastGpsOk,
    lastFallOk,
    fallSupported,
    dismissIntro,
    closeSuccess,
    runPrimingPress,
  };
}
