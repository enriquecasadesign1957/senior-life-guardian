import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentCoordsWithError } from "@/lib/geo";
import { isSosGpsPrimed, markSosGpsPrimed } from "@/lib/sos-gps-priming";
import type { SosGpsPrimingUiStage } from "@/components/sos-gps-priming-ui";

type Options = {
  signupId: string | null;
  /** Mostrar flujo de primera pulsación (app instalada y panel principal visible). */
  enabled: boolean;
  onGpsPrimed?: (gpsOk: boolean) => void;
  /** Vincula WhatsApp en servidor (1.ª pulsación o cuenta ya preparada). */
  onWhatsAppAutoActivate?: () => Promise<void>;
  /** Persiste install_step=ready en servidor tras priming. */
  onSosPrimedComplete?: () => Promise<void>;
};

/** Primera pulsación del botón rojo: GPS + WhatsApp (sin alerta real). Caídas: día 2–3 aparte. */
export function useSosGpsPriming({
  signupId,
  enabled,
  onGpsPrimed,
  onWhatsAppAutoActivate,
  onSosPrimedComplete,
}: Options) {
  const [primed, setPrimed] = useState(() => isSosGpsPrimed(signupId));
  const [introDismissed, setIntroDismissed] = useState(false);
  const [uiStage, setUiStage] = useState<SosGpsPrimingUiStage>(null);
  const [lastGpsOk, setLastGpsOk] = useState(false);
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

  /** Primera pulsación: GPS + WhatsApp. Devuelve true si consumió el toque. */
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

    markSosGpsPrimed(signupId ?? undefined);
    setPrimed(true);
    await onWhatsAppAutoActivate?.();
    await onSosPrimedComplete?.();
    setUiStage("success");
    return true;
  }, [primed, signupId, onGpsPrimed, onWhatsAppAutoActivate, onSosPrimedComplete]);

  return {
    primed,
    uiStage,
    lastGpsOk,
    dismissIntro,
    closeSuccess,
    runPrimingPress,
  };
}
