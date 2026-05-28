import { Geolocation } from '@capacitor/geolocation';

export type Coords = { lat: number; lng: number; accuracy?: number };
export type GeoErrorCode = "denied" | "unavailable" | "timeout" | "unsupported" | "unknown";

export async function getCurrentCoords(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<Coords | null> {
  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted') {
      await Geolocation.requestPermissions();
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: opts?.highAccuracy ?? true,
      timeout: opts?.timeoutMs ?? 10000,
      maximumAge: opts?.maximumAgeMs ?? 0,
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (error) {
    console.error('Error en GPS nativo:', error);
    return null;
  }
}


// Compat: usados por src/routes/native.tsx
export async function ensureGeoPermission(): Promise<boolean> {
  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location === 'granted') return true;
    const req = await Geolocation.requestPermissions();
    return req.location === 'granted';
  } catch {
    return false;
  }
}

export async function getCurrentCoordsWithError(opts?: {
  highAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}): Promise<{ coords: Coords | null; error: GeoErrorCode | null }> {

  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted') return { coords: null, error: 'denied' };
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: opts?.highAccuracy ?? true,
      timeout: opts?.timeoutMs ?? 10000,
      maximumAge: opts?.maximumAgeMs ?? 0,
    });

    return {
      coords: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
      error: null,
    };
  } catch (error: any) {
    console.error('Error en GPS nativo:', error);
    const msg = String(error?.message ?? error ?? '').toLowerCase();
    if (msg.includes('denied') || msg.includes('permission')) return { coords: null, error: 'denied' };
    if (msg.includes('timeout')) return { coords: null, error: 'timeout' };
    return { coords: null, error: 'unavailable' };
  }
}
