import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FALL_SENSOR_DEFER_DAYS, type InstallStep } from "@/lib/install-step";
import { reportFallSensorPrompted } from "@/lib/install-step.functions";
import { requireSeniorAccessToken } from "@/lib/senior-access-auth";

type Options = {
  signupId: string | null;
  installStep: InstallStep | null;
  sosPrimedAt: string | null;
  fallSensorPromptedAt: string | null;
  fallMonitoring: boolean;
  enabled?: boolean;
};

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}

/** Ofrece sensor de caídas a partir del día 2–3 tras el 1.er S.O.S. */
export function useFallSensorDeferred({
  signupId,
  installStep,
  sosPrimedAt,
  fallSensorPromptedAt,
  fallMonitoring,
  enabled = true,
}: Options) {
  const reportPrompted = useServerFn(reportFallSensorPrompted);
  const [dismissed, setDismissed] = useState(false);

  const eligible =
    enabled &&
    installStep === "ready" &&
    Boolean(sosPrimedAt) &&
    !fallMonitoring &&
    !fallSensorPromptedAt &&
    !dismissed &&
    daysSince(sosPrimedAt) >= FALL_SENSOR_DEFER_DAYS;

  const dismiss = useCallback(async () => {
    setDismissed(true);
    if (!signupId) return;
    try {
      await reportPrompted({
        data: { signupId, accessToken: requireSeniorAccessToken(signupId) },
      });
    } catch (e) {
      console.warn("[fall-deferred] report prompted", e);
    }
  }, [signupId, reportPrompted]);

  useEffect(() => {
    setDismissed(false);
  }, [signupId]);

  return { showFallPrompt: eligible, dismissFallPrompt: dismiss };
}
