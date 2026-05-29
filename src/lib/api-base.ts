/**
 * En la APK (Capacitor), el WebView puede cargar el bundle local (file://, capacitor://,
 * http://localhost) en lugar de https://alarmaseniorsafe.cl. En ese caso, las llamadas
 * a server functions de TanStack Start (que usan rutas relativas tipo "/_serverFn/..."),
 * a "/api/..." o a cualquier endpoint relativo fallan porque el WebView intenta
 * resolverlos contra el propio dispositivo.
 *
 * Esta utilidad parchea `window.fetch` para reescribir URLs relativas hacia
 * el backend real cuando la app corre como APK nativa.
 */

export const API_BASE_URL = "https://alarmaseniorsafe.cl";

const PATCH_KEY = "__api_base_installed_v2__";

export function installApiBaseFetch() {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  console.log("[api-base] checking host:", host);

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

  // Solo reescribir si estamos en entorno nativo real
  const cap = (window as any).Capacitor;
  const proto = window.location.protocol;
  const isNative = cap?.isNativePlatform?.() || proto === "capacitor:" || proto === "file:";

  if (!isNative) {
    console.log("[api-base] skipped — not native:", host, proto);
    return;
  }

  // Evitar instalar múltiples veces
  if ((window as any)[PATCH_KEY]) {
    console.log("[api-base] already installed");
    return;
  }

  console.log("[api-base] installing rewrite for native host:", host);

  const originalFetch = window.fetch.bind(window);

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

  (window as any)[PATCH_KEY] = true;
  (window as any).__API_BASE__ = API_BASE_URL;
  console.info("[api-base] fetch rewritten to", API_BASE_URL);
}
