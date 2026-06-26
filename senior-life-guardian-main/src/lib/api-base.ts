/**
 * En la APK (Capacitor), el WebView puede cargar el bundle local (file://, capacitor://,
 * http://localhost) en lugar de https://alarmaseniorsafe.cl. En ese caso, las llamadas
 * a server functions de TanStack Start (que usan rutas relativas tipo "/_serverFn/..."),
 * a "/api/..." o a cualquier endpoint relativo fallan porque el WebView intenta
 * resolverlos contra el propio dispositivo.
 *
 * Esta utilidad parchea `window.fetch` para reescribir URLs relativas hacia
 * el backend real cuando la app corre como APK nativa.
 * IMPORTANTE: Siempre reinstala el parche para sobrescribir cualquier versión
 * anterior que pudiera quedar activa tras HMR o recarga parcial.
 */

export const API_BASE_URL = "https://alarmaseniorsafe.cl";

const ORIGINAL_FETCH_KEY = "__api_base_original_fetch__";

export function installApiBaseFetch() {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;

  // Detectar si el parche ya está instalado y restaurar el fetch original
  // para poder reinstalarlo limpio (evita acumulación de parches tras HMR).
  const savedOriginal = (window as any)[ORIGINAL_FETCH_KEY];
  if (savedOriginal && typeof savedOriginal === "function") {
    window.fetch = savedOriginal;
    console.log("[api-base] restored original fetch");
  }

  // NUNCA reescribir en desarrollo, preview de Lovable, o localhost
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app")
  ) {
    console.log("[api-base] skipped — dev/preview host:", host);
    return;
  }

  // Siempre reescribir fetch en Capacitor aunque el WebView cargue alarmaseniorsafe.cl remoto.
  const cap = (window as any).Capacitor;
  const proto = window.location.protocol;
  const isNative =
    cap?.isNativePlatform?.() ||
    proto === "capacitor:" ||
    proto === "file:" ||
    new URLSearchParams(window.location.search).get("source") === "apk";

  if (!isNative) {
    console.log("[api-base] skipped — not native:", host, proto);
    return;
  }

  console.log("[api-base] installing for native host:", host);

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
      console.warn("[api-base] rewrite failed", e);
      return originalFetch(input as any, init);
    }
  }) as typeof window.fetch;

  (window as any).__API_BASE__ = API_BASE_URL;
  console.info("[api-base] rewritten to", API_BASE_URL);
}
