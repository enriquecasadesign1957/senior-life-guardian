/** URL base pública (WhatsApp, SMS, enlaces compartidos). */
export function appBaseUrl(): string {
  return (
    process.env.PUBLIC_APP_URL ||
    (import.meta.env.PUBLIC_APP_URL as string | undefined) ||
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ||
    "https://alarmaseniorsafe.cl"
  ).replace(/\/$/, "");
}

/** Navegación externa (Google Maps app / web). Respaldo para ir con GPS del teléfono. */
export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Enlace compartido en alertas: mapa Mapbox embebido en Senior Safe. */
export function locationShareUrl(lat: number, lng: number, label?: string): string {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
  });
  if (label?.trim()) params.set("nombre", label.trim());
  return `${appBaseUrl()}/ubicacion?${params.toString()}`;
}

export function mapboxAccessToken(): string | null {
  const token = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined)?.trim();
  return token || null;
}

export function isMapboxConfigured(): boolean {
  return mapboxAccessToken() != null;
}

export function parseCoordinate(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function isValidCoordinatePair(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}
