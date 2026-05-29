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

function shouldRewrite(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  const proto = window.location.protocol;

  // NUNCA reescribir en desarrollo, preview de Lovable, o dominios de desarrollo
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app")
  ) {
    console.log("[api-base] SKIPPING rewrite — dev/preview host:", host);
    return false;
  }

  // Solo reescribir si estamos en un entorno nativo real
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {
    console.log("[api-base] REWRITING — Capacitor native detected");
    return true;
  }
  if (proto === "capacitor:" || proto === "file:") {
    console.log("[api-base] REWRITING — native protocol:", proto);
    return true;
  }

  console.log("[api-base] SKIPPING rewrite — host:", host, "proto:", proto);
  return false;
}

export function installApiBaseFetch() {
  if (typeof window === "undefined") return;

  console.log("[api-base] installApiBaseFetch() called on:", window.location.hostname);

  if (!shouldRewrite()) {
    console.log("[api-base] installApiBaseFetch() aborted — not native");
    return;
  }

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

  // Marca útil para debugging
  (window as any).__API_BASE__ = API_BASE_URL;
  console.info("[api-base] fetch reescrito hacia", API_BASE_URL);
}
