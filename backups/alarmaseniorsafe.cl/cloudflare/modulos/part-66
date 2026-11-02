import process from "node:process";
function appBaseUrl() {
  return (process.env.PUBLIC_APP_URL || void 0 || void 0 || "https://alarmaseniorsafe.cl").replace(/\/$/, "");
}
function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
function locationShareUrl(lat, lng, label) {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6)
  });
  if (label?.trim()) params.set("nombre", label.trim());
  return `${appBaseUrl()}/ubicacion?${params.toString()}`;
}
function mapboxAccessToken() {
  return null;
}
function isMapboxConfigured() {
  return mapboxAccessToken() != null;
}
function parseCoordinate(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
function isValidCoordinatePair(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}
export {
  isMapboxConfigured as a,
  googleMapsUrl as g,
  isValidCoordinatePair as i,
  locationShareUrl as l,
  parseCoordinate as p
};
