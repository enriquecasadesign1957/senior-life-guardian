// Geolocalización: Capacitor nativo (APK) + fallback web (PWA/navegador).

import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type Coords = { lat: number; lng: number; accuracy?: number };
export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unsupported" | "unknown";

function mapError(err: GeolocationPositionError): GeoErrorCode {
  switch (err.code) {
    case 1:
      return "denied";
    case 2:
      return "unavailable";
    case 3:
      return "timeout";
    default:
      return "unknown";
  }
}

async function getCoordsViaCapacitor(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {
  if (!Capacitor.isNativePlatform()) {
    return { coords: null, error: null };
  }

  try {
    let perm = await Geolocation.checkPermissions();
    if (perm.location !== "granted") {
      perm = await Geolocation.requestPermissions();
    }
    if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
      return { coords: null, error: "denied" };
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: opts?.highAccuracy ?? true,
      timeout: opts?.timeoutMs ?? 15000,
      maximumAge: opts?.maximumAgeMs ?? 60_000,
    });

    return {
      coords: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      },
      error: null,
    };
  } catch (e) {
    const msg = String((e as Error)?.message ?? e).toLowerCase();
    if (msg.includes("denied") || msg.includes("permission")) {
      return { coords: null, error: "denied" };
    }
    if (msg.includes("timeout")) return { coords: null, error: "timeout" };
    if (msg.includes("unavailable")) return { coords: null, error: "unavailable" };
    console.warn("Capacitor GPS error:", e);
    return { coords: null, error: "unknown" };
  }
}

function getCoordsViaWeb(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ coords: null, error: "unsupported" });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        }),
      (err) => resolve({ coords: null, error: mapError(err) }),
      {
        enableHighAccuracy: opts?.highAccuracy ?? true,
        timeout: opts?.timeoutMs ?? 12_000,
        maximumAge: opts?.maximumAgeMs ?? 60_000,
      },
    );
  });
}

export async function getCurrentCoords(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<Coords | null> {
  const native = await getCoordsViaCapacitor(opts);
  if (native.coords) return native.coords;

  const web = await getCoordsViaWeb(opts);
  return web.coords;
}

export async function ensureGeoPermission(): Promise<boolean> {
  const { coords, error } = await getCurrentCoordsWithError({ timeoutMs: 12_000, maximumAgeMs: 60_000 });
  if (coords) return true;
  return error !== "denied";
}

export async function getCurrentCoordsWithError(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {
  const native = await getCoordsViaCapacitor(opts);
  if (native.coords || native.error === "denied") return native;

  return getCoordsViaWeb(opts);
}
