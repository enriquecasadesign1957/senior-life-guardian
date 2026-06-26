import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAppConfiguration } from "@/lib/family.functions";
import { upsertHeartbeat } from "@/lib/heartbeat.functions";
import { readBatteryLevelForHeartbeat, readInternetConnected, watchBatteryLevel } from "@/lib/device-telemetry";
import { isNativeApp } from "@/lib/device";
import {
  clearSeniorAccessToken,
  persistSeniorAccessToken,
  readSeniorAccessToken,
} from "@/lib/senior-access-auth";

type Coords = { lat: number; lng: number; accuracy?: number } | null;

type Options = {
  signupId: string | null;
  gpsEnabled: boolean;
  lastCoords: Coords;
  appVersion: string;
  enabled?: boolean;
};

const HEARTBEAT_INTERVAL_MS = 30_000;

function isTokenError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /Token inválido|Sesión expirada|autenticación/i.test(msg);
}

/** Reporta estado del dispositivo al Portal Familia (cada 30 s con la app visible). */
export function useDeviceHeartbeat({
  signupId,
  gpsEnabled,
  lastCoords,
  appVersion,
  enabled = true,
}: Options) {
  const heartbeat = useServerFn(upsertHeartbeat);
  const loadConfig = useServerFn(getAppConfiguration);
  const heartbeatRef = useRef(heartbeat);
  const loadConfigRef = useRef(loadConfig);
  const coordsRef = useRef(lastCoords);
  const gpsRef = useRef(gpsEnabled);
  const appVersionRef = useRef(appVersion);

  heartbeatRef.current = heartbeat;
  loadConfigRef.current = loadConfig;
  coordsRef.current = lastCoords;
  gpsRef.current = gpsEnabled;
  appVersionRef.current = appVersion;

  useEffect(() => {
    if (!signupId || !enabled) return;
    let alive = true;

    const resolveAccessToken = async (force = false): Promise<string | null> => {
      if (!force) {
        const cached = readSeniorAccessToken(signupId);
        if (cached) return cached;
      } else {
        clearSeniorAccessToken();
      }
      try {
        const res = await loadConfigRef.current({ data: { signupId } });
        if (res.accessToken) {
          persistSeniorAccessToken(res.accessToken, signupId);
          return res.accessToken;
        }
      } catch (e) {
        console.warn("[device-heartbeat] loadConfig", e);
      }
      return null;
    };

    const ping = async (retried = false) => {
      if (!alive) return;
      const skipWhenHidden = !isNativeApp();
      if (skipWhenHidden && typeof document !== "undefined" && document.hidden) return;

      try {
        const battery_level = await readBatteryLevelForHeartbeat();
        const accessToken = await resolveAccessToken();
        if (!accessToken) return;
        await heartbeatRef.current({
          data: {
            signupId,
            accessToken,
            ...(battery_level != null ? { battery_level } : {}),
            gps_enabled: gpsRef.current,
            internet_connected: readInternetConnected(),
            app_version: appVersionRef.current,
            last_lat: coordsRef.current?.lat ?? null,
            last_lng: coordsRef.current?.lng ?? null,
          },
        });
      } catch (err) {
        console.warn("[device-heartbeat] ping failed:", err);
        if (!retried && isTokenError(err)) {
          const fresh = await resolveAccessToken(true);
          if (fresh) return ping(true);
        }
      }
    };

    void ping();
    const interval = setInterval(() => void ping(), HEARTBEAT_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden || isNativeApp()) void ping();
    };
    const onFocus = () => void ping();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onFocus);
    window.addEventListener("online", () => void ping());
    const unwatchBattery = watchBatteryLevel(() => void ping());

    return () => {
      alive = false;
      clearInterval(interval);
      unwatchBattery();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onFocus);
      window.removeEventListener("online", () => void ping());
    };
  }, [signupId, enabled]);
}
