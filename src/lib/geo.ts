/**
 * Helper de geolocalización universal:
 *  - En APK/iOS (Capacitor nativo) usa @capacitor/geolocation,
 *    que pide permisos nativos de Android/iOS y usa el GPS real
 *    (no depende del bridge web `navigator.geolocation`, que puede
 *    estar bloqueado cuando la app carga un shell estático).
 *  - En navegador web cae a `navigator.geolocation`.
 */

export type Coords = { lat: number; lng: number; accuracy?: number };

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).Capacitor?.isNativePlatform?.());
}

async function getCapacitorGeo() {
  try {
    const mod = await import("@capacitor/geolocation");
    return mod.Geolocation;
  } catch {
    return null;
  }
}

export async function ensureGeoPermission(): Promise<boolean> {
  if (!isNative()) return true;
  const Geo = await getCapacitorGeo();
  if (!Geo) return false;
  try {
    const status = await Geo.checkPermissions();
    if (status.location === "granted" || status.coarseLocation === "granted") return true;
    const req = await Geo.requestPermissions({ permissions: ["location", "coarseLocation"] as any });
    return req.location === "granted" || req.coarseLocation === "granted";
  } catch {
    return false;
  }
}

export async function getCurrentCoords(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<Coords | null> {
  const highAccuracy = opts?.highAccuracy ?? true;
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const maximumAgeMs = opts?.maximumAgeMs ?? 30000;

  // Capacitor nativo
  if (isNative()) {
    const Geo = await getCapacitorGeo();
    if (Geo) {
      const ok = await ensureGeoPermission();
      if (!ok) return null;
      try {
        const pos = await Geo.getCurrentPosition({
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: maximumAgeMs,
        });
        return {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch {
        return null;
      }
    }
  }

  // Web fallback
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;
  return new Promise<Coords | null>((resolve) => {
    const to = setTimeout(() => resolve(null), timeoutMs + 1000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(to);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => { clearTimeout(to); resolve(null); },
      { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: maximumAgeMs },
    );
  });
}

export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unsupported" | "unknown";

export async function getCurrentCoordsWithError(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {
  const highAccuracy = opts?.highAccuracy ?? true;
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const maximumAgeMs = opts?.maximumAgeMs ?? 30000;

  if (isNative()) {
    const Geo = await getCapacitorGeo();
    if (!Geo) return { coords: null, error: "unsupported" };
    const ok = await ensureGeoPermission();
    if (!ok) return { coords: null, error: "denied" };
    try {
      const pos = await Geo.getCurrentPosition({
        enableHighAccuracy: highAccuracy,
        timeout: timeoutMs,
        maximumAge: maximumAgeMs,
      });
      return {
        coords: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        },
        error: null,
      };
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? "").toLowerCase();
      if (msg.includes("denied") || msg.includes("permission")) return { coords: null, error: "denied" };
      if (msg.includes("timeout")) return { coords: null, error: "timeout" };
      return { coords: null, error: "unavailable" };
    }
  }

  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return { coords: null, error: "unsupported" };
  }
  return new Promise((resolve) => {
    const to = setTimeout(() => resolve({ coords: null, error: "timeout" }), timeoutMs + 1000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(to);
        resolve({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          error: null,
        });
      },
      (err) => {
        clearTimeout(to);
        const code: GeoErrorCode =
          err.code === err.PERMISSION_DENIED ? "denied" :
          err.code === err.POSITION_UNAVAILABLE ? "unavailable" :
          err.code === err.TIMEOUT ? "timeout" : "unknown";
        resolve({ coords: null, error: code });
      },
      { enableHighAccuracy: highAccuracy, timeout: timeoutMs, maximumAge: maximumAgeMs },
    );
  });
}
