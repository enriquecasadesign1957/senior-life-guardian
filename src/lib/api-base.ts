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

const ORIGINAL_FETCH_KEY = "__api_base_original_fetch__";

export function installApiBaseFetch() {
  if (typeof window === "undefined") return;

  // Si un parche anterior (de otro build/HMR) dejó window.fetch modificado,
  // lo restauramos al fetch nativo antes de evaluar si volvemos a instalar.
  const savedOriginal = (window as any)[ORIGINAL_FETCH_KEY];
  if (savedOriginal && typeof savedOriginal === "function") {
    window.fetch = savedOriginal;
    console.log("[api-base] Restored original fetch from previous patch");
  }

  const host = window.location.hostname;
  console.log("[api-base] installApiBaseFetch() host:", host);

  // NUNCA reescribir en desarrollo local ni preview de Lovable
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app")
  ) {
    console.log("[api-base] SKIPPING — dev/preview host:", host);
    return;
  }

  // Solo reescribir si estamos en un entorno nativo real
  const cap = (window as any).Capacitor;
  const proto = window.location.protocol;
  const isNative = cap?.isNativePlatform?.() || proto === "capacitor:" || proto === "file:";

  if (!isNative) {
    console.log("[api-base] SKIPPING — not native:", host, proto);
    return;
  }

  console.log("[api-base] INSTALLING rewrite for native host:", host);

  const originalFetch = window.fetch.bind(window);
  (window as any)[ORIGINAL_FETCH_KEY] = originalFetch;

  const rewrite = (url: string): string => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(data|blob|capacitor|file):/i.test(url)) return url;
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

  (window as any).__API_BASE__ = API_BASE_URL;
  console.info("[api-base] fetch reescrito hacia", API_BASE_URL);
}
