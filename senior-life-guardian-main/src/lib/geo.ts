// Geolocalización 100% web (PWA). Usa navigator.geolocation estándar.
// Sin dependencias de Capacitor para que funcione en el navegador móvil.

export type Coords = { lat: number; lng: number; accuracy?: number };
export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unsupported" | "unknown";

function mapError(err: GeolocationPositionError): GeoErrorCode {
  switch (err.code) {
    case 1: return "denied";
    case 2: return "unavailable";
    case 3: return "timeout";
    default: return "unknown";
  }
}

export async function getCurrentCoords(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<Coords | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => {
        console.warn("GPS web error:", err.message);
        resolve(null);
      },
      {
        enableHighAccuracy: opts?.highAccuracy ?? true,
        timeout: opts?.timeoutMs ?? 8000,
        maximumAge: opts?.maximumAgeMs ?? 0,
      }
    );
  });
}

export async function ensureGeoPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;
  try {
    // @ts-ignore - permissions API puede no existir en algunos navegadores
    if (navigator.permissions?.query) {
      // @ts-ignore
      const status = await navigator.permissions.query({ name: "geolocation" });
      if (status.state === "granted") return true;
      if (status.state === "denied") return false;
    }
    // prompt: forzamos petición con una llamada corta
    const c = await getCurrentCoords({ timeoutMs: 8000 });
    return c !== null;
  } catch {
    return false;
  }
}

export async function getCurrentCoordsWithError(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { coords: null, error: "unsupported" };
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
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
        timeout: opts?.timeoutMs ?? 8000,
        maximumAge: opts?.maximumAgeMs ?? 0,
      }
    );
  });
}
