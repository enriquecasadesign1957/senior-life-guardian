/**
 * En la APK (Capacitor), el WebView puede cargar el bundle local (file://, capacitor://,
 * http://localhost) en lugar de https://alarmaseniorsafe.cl. En ese caso, las llamadas
 * a server functions de TanStack Start (que usan rutas relativas tipo "/_serverFn/..."),
 * a "/api/..." o a cualquier endpoint relativo fallan porque el WebView intenta
 * resolverlos contra el propio dispositivo.
 *
 * Esta utilidad parchea `window.fetch` UNA sola vez para reescribir cualquier URL
 * relativa hacia el origen real del backend (https://alarmaseniorsafe.cl) cuando
 * detecta que estamos corriendo dentro de Capacitor / no en el dominio web.
 */

export const API_BASE_URL = "https://alarmaseniorsafe.cl";

const WEB_HOSTS = new Set([
  "alarmaseniorsafe.cl",
  "www.alarmaseniorsafe.cl",
]);

function isNativeRuntime(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  const proto = window.location.protocol;

  // Si es Capacitor nativo o protocolo nativo, SIEMPRE reescribir
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  if (proto === "capacitor:" || proto === "file:") return true;

  // NUNCA reescribir en desarrollo local ni preview de Lovable
  if (host === "localhost" || host === "127.0.0.1" || host.includes("lovableproject.com")) {
    return false;
  }

  // Si no estamos en el dominio oficial de producción, asumimos shell estático en APK
  if (!WEB_HOSTS.has(host)) return true;

  return false;
}

let installed = false;

export function installApiBaseFetch() {
  if (installed) return;
  if (typeof window === "undefined") return;
  if (!isNativeRuntime()) return;

  const originalFetch = window.fetch.bind(window);

  const rewrite = (url: string): string => {
    if (!url) return url;
    // ya es absoluta
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(data|blob|capacitor|file):/i.test(url)) return url;
    // Solo reescribimos rutas que apunten al backend de la app
    if (url.startsWith("/")) {
      return API_BASE_URL + url;
    }
    return url;
  };

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (typeof input === "string") {
        return originalFetch(rewrite(input), init);
      }
      if (input instanceof URL) {
        return originalFetch(input.toString(), init);
      }
      // Request object
      const req = input as Request;
      const rewritten = rewrite(req.url);
      if (rewritten === req.url) {
        return originalFetch(input, init);
      }
      const newReq = new Request(rewritten, req);
      return originalFetch(newReq, init);
    } catch (e) {
      console.warn("[api-base] fetch rewrite failed", e);
      return originalFetch(input as any, init);
    }
  }) as typeof window.fetch;

  installed = true;
  // Marca útil para debugging
  (window as any).__API_BASE__ = API_BASE_URL;
  console.info("[api-base] fetch reescrito hacia", API_BASE_URL);
}
