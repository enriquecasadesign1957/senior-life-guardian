import { useCallback, useEffect, useRef, useState } from "react";

const GRAVITY_MS2 = 9.80665;
const IMPACT_THRESHOLD_G = 3.8;
const QUIET_TARGET_G = 1;
const QUIET_VARIATION_G = 0.2;
const IMMOBILITY_DURATION_MS = 3_000;
const IMPACT_WINDOW_MS = 8_000;
const COUNTDOWN_SECONDS = 30;
const SIREN_START_AT_SECONDS = 15;
const VIBRATE_PATTERN: number | number[] = [500, 250];
const VIBRATE_CYCLE_MS = 750;

export type FallGps = { lat: number; lng: number; accuracy?: number };

export type FallDetectionStatus =
  | "inactive"
  | "permission_required"
  | "monitoring"
  | "awaiting_immobility"
  | "countdown"
  | "dispatching";

export type UseFallDetectionOptions = {
  signupId: string | null;
  enabled?: boolean;
  getGps?: () => Promise<FallGps | null>;
  dispatchEmergency: (gps: FallGps | null) => Promise<void>;
};

export type UseFallDetectionReturn = {
  status: FallDetectionStatus;
  countdownSeconds: number;
  isCountdownActive: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  cancelarAlerta: () => void;
};

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function magnitudeG(ax: number, ay: number, az: number): number {
  return Math.sqrt(ax * ax + ay * ay + az * az) / GRAVITY_MS2;
}

function isQuietState(g: number): boolean {
  return Math.abs(g - QUIET_TARGET_G) <= QUIET_VARIATION_G;
}

function createSirenController() {
  let ctx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;
  let gain: GainNode | null = null;
  let flipTimer: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (typeof window === "undefined") return;
      try {
        ctx = new AudioContext();
        osc = ctx.createOscillator();
        gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = 880;
        gain.gain.value = 0.22;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        let high = true;
        flipTimer = setInterval(() => {
          if (!osc || !ctx) return;
          osc.frequency.setValueAtTime(high ? 920 : 640, ctx.currentTime);
          high = !high;
        }, 420);
      } catch (e) {
        console.warn("[useFallDetection] siren unavailable", e);
      }
    },
    stop() {
      if (flipTimer) clearInterval(flipTimer);
      flipTimer = null;
      try {
        osc?.stop();
        osc?.disconnect();
        gain?.disconnect();
        void ctx?.close();
      } catch {
        /* noop */
      }
      osc = null;
      gain = null;
      ctx = null;
    },
  };
}

async function requestMotionPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const MotionCtor = DeviceMotionEvent as DeviceMotionEventWithPermission;
  if (typeof MotionCtor.requestPermission === "function") {
    try {
      const state = await MotionCtor.requestPermission();
      return state === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export function useFallDetection(opts: UseFallDetectionOptions): UseFallDetectionReturn {
  const { signupId, enabled = true, getGps, dispatchEmergency } = opts;

  const [status, setStatus] = useState<FallDetectionStatus>("inactive");
  const [countdownSeconds, setCountdownSeconds] = useState(COUNTDOWN_SECONDS);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const statusRef = useRef<FallDetectionStatus>("inactive");
  const immobilityStartRef = useRef<number | null>(null);
  const impactAtRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vibrateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sirenRef = useRef(createSirenController());
  const dispatchingRef = useRef(false);

  const setStatusSafe = useCallback((next: FallDetectionStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const stopVibration = useCallback(() => {
    if (vibrateTimerRef.current) {
      clearInterval(vibrateTimerRef.current);
      vibrateTimerRef.current = null;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  const stopSiren = useCallback(() => {
    sirenRef.current.stop();
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const cancelarAlerta = useCallback(() => {
    clearCountdownTimer();
    stopVibration();
    stopSiren();
    immobilityStartRef.current = null;
    impactAtRef.current = null;
    dispatchingRef.current = false;
    setCountdownSeconds(COUNTDOWN_SECONDS);
    if (permissionGranted && enabled && signupId) {
      setStatusSafe("monitoring");
    } else {
      setStatusSafe("inactive");
    }
  }, [
    clearCountdownTimer,
    enabled,
    permissionGranted,
    setStatusSafe,
    signupId,
    stopSiren,
    stopVibration,
  ]);

  const startVibrationLoop = useCallback(() => {
    stopVibration();
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    navigator.vibrate(VIBRATE_PATTERN);
    vibrateTimerRef.current = setInterval(() => {
      navigator.vibrate(VIBRATE_PATTERN);
    }, VIBRATE_CYCLE_MS);
  }, [stopVibration]);

  const startCountdown = useCallback(() => {
    if (statusRef.current === "countdown" || statusRef.current === "dispatching") return;
    setStatusSafe("countdown");
    setCountdownSeconds(COUNTDOWN_SECONDS);
    startVibrationLoop();

    clearCountdownTimer();
    let secondsLeft = COUNTDOWN_SECONDS;
    let sirenStarted = false;

    countdownTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdownSeconds(secondsLeft);

      if (secondsLeft === SIREN_START_AT_SECONDS && !sirenStarted) {
        sirenStarted = true;
        sirenRef.current.start();
      }

      if (secondsLeft <= 0) {
        clearCountdownTimer();
        stopVibration();
        stopSiren();

        if (dispatchingRef.current || !signupId) return;
        dispatchingRef.current = true;
        setStatusSafe("dispatching");

        void (async () => {
          try {
            const gps = getGps ? await getGps() : null;
            await dispatchEmergency(gps);
          } catch (e) {
            console.error("[useFallDetection] dispatchEmergency", e);
          } finally {
            dispatchingRef.current = false;
            immobilityStartRef.current = null;
            impactAtRef.current = null;
            setCountdownSeconds(COUNTDOWN_SECONDS);
            setStatusSafe(permissionGranted && enabled && signupId ? "monitoring" : "inactive");
          }
        })();
      }
    }, 1000);
  }, [
    clearCountdownTimer,
    dispatchEmergency,
    enabled,
    getGps,
    permissionGranted,
    setStatusSafe,
    signupId,
    startVibrationLoop,
    stopSiren,
    stopVibration,
  ]);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      const g = magnitudeG(acc.x, acc.y, acc.z);
      const phase = statusRef.current;
      if (phase !== "monitoring" && phase !== "awaiting_immobility") return;

      const now = Date.now();

      if (phase === "monitoring" && g > IMPACT_THRESHOLD_G) {
        impactAtRef.current = now;
        immobilityStartRef.current = null;
        setStatusSafe("awaiting_immobility");
        return;
      }

      if (phase === "awaiting_immobility") {
        const impactAt = impactAtRef.current;
        if (!impactAt || now - impactAt > IMPACT_WINDOW_MS) {
          impactAtRef.current = null;
          immobilityStartRef.current = null;
          setStatusSafe("monitoring");
          return;
        }

        if (isQuietState(g)) {
          if (immobilityStartRef.current == null) {
            immobilityStartRef.current = now;
          } else if (now - immobilityStartRef.current >= IMMOBILITY_DURATION_MS) {
            impactAtRef.current = null;
            immobilityStartRef.current = null;
            startCountdown();
          }
        } else {
          immobilityStartRef.current = null;
        }
      }
    },
    [setStatusSafe, startCountdown],
  );

  const requestPermission = useCallback(async () => {
    const ok = await requestMotionPermission();
    setPermissionGranted(ok);
    if (ok && enabled && signupId) {
      setStatusSafe("monitoring");
    } else if (!ok) {
      setStatusSafe("permission_required");
    }
    return ok;
  }, [enabled, setStatusSafe, signupId]);

  useEffect(() => {
    if (!enabled || !signupId || typeof window === "undefined") {
      cancelarAlerta();
      setStatusSafe("inactive");
      return;
    }

    let alive = true;
    void (async () => {
      const ok = await requestMotionPermission();
      if (!alive) return;
      setPermissionGranted(ok);
      if (!ok) {
        setStatusSafe("permission_required");
        return;
      }
      setStatusSafe("monitoring");
    })();

    return () => {
      alive = false;
    };
  }, [enabled, signupId, cancelarAlerta, setStatusSafe]);

  useEffect(() => {
    if (!permissionGranted || !enabled || !signupId) return;
    if (typeof window === "undefined") return;

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [permissionGranted, enabled, signupId, handleMotion]);

  useEffect(() => {
    return () => {
      clearCountdownTimer();
      stopVibration();
      stopSiren();
    };
  }, [clearCountdownTimer, stopSiren, stopVibration]);

  return {
    status,
    countdownSeconds,
    isCountdownActive: status === "countdown",
    permissionGranted,
    requestPermission,
    cancelarAlerta,
  };
}

type FallDetectionOverlayProps = {
  isActive: boolean;
  countdownSeconds: number;
  isDispatching: boolean;
  onCancel: () => void;
};

/** Pantalla de advertencia durante la cuenta regresiva de caída detectada. */
export function FallDetectionOverlay({
  isActive,
  countdownSeconds,
  isDispatching,
  onCancel,
}: FallDetectionOverlayProps) {
  if (!isActive && !isDispatching) return null;

  const showSiren = isActive && countdownSeconds <= SIREN_START_AT_SECONDS;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6 text-white"
      style={{
        background: "rgba(127, 29, 29, 0.92)",
        backdropFilter: "blur(6px)",
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="fall-alert-title"
    >
      <div className="max-w-sm w-full text-center">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center animate-pulse"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          <span className="text-5xl" aria-hidden="true">
            ⚠️
          </span>
        </div>
        <h2 id="fall-alert-title" className="text-3xl font-extrabold mb-2">
          {isDispatching ? "Enviando alerta de emergencia…" : "¿Posible caída detectada?"}
        </h2>
        <p className="text-white/90 text-lg mb-6">
          {isDispatching
            ? "Avisando a tu familia. No cierres la app."
            : showSiren
              ? "Sirena activa. Pulsa el botón si estás bien."
              : "Vibración de alerta. Pulsa el botón si estás bien."}
        </p>
        {!isDispatching && (
          <div className="text-6xl font-black tabular-nums mb-8" aria-live="polite">
            {countdownSeconds}s
          </div>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDispatching}
          className="w-full min-h-[4.5rem] rounded-3xl text-2xl font-extrabold shadow-2xl active:scale-[0.98] transition disabled:opacity-70"
          style={{ background: "#16a34a", color: "#fff" }}
        >
          Estoy bien
        </button>
      </div>
    </div>
  );
}
