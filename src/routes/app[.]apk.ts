import { createFileRoute } from "@tanstack/react-router";

/**
 * URL HTTPS corta para descargar Senior Safe:
 *   https://alarmaseniorsafe.cl/app.apk
 *
 * Entrega el APK como archivo adjunto, con soporte para HEAD y rangos,
 * para que Android y los navegadores lo analicen como paquete instalable.
 */

const APK_OBJECT_URL = () => {
  const base =
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "https://mjdjfjxehnfroqyfzkyk.supabase.co";
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/apk/SeniorSafe.apk`;
};

const DOWNLOAD_HEADERS = (upstream: Headers): HeadersInit => {
  const h: Record<string, string> = {
    "Content-Type": "application/vnd.android.package-archive",
    "Content-Disposition": 'attachment; filename="SeniorSafe.apk"',
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  const len = upstream.get("content-length");
  if (len) h["Content-Length"] = len;
  const etag = upstream.get("etag");
  if (etag) h["ETag"] = etag;
  const lastMod = upstream.get("last-modified");
  if (lastMod) h["Last-Modified"] = lastMod;
  const contentRange = upstream.get("content-range");
  if (contentRange) h["Content-Range"] = contentRange;
  return h;
};

export const Route = createFileRoute("/app.apk")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const range = request.headers.get("range");
        const upstream = await fetch(APK_OBJECT_URL(), {
          method: "GET",
          headers: range ? { Range: range } : undefined,
        });
        if (!upstream.ok && upstream.status !== 206) {
          return new Response(
            "APK no disponible. Intenta nuevamente en unos minutos.",
            { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }
        return new Response(upstream.body, {
          status: upstream.status,
          headers: DOWNLOAD_HEADERS(upstream.headers),
        });
      },
      HEAD: async () => {
        const upstream = await fetch(APK_OBJECT_URL(), { method: "HEAD" });
        if (!upstream.ok) {
          return new Response(null, { status: 502 });
        }
        return new Response(null, {
          status: 200,
          headers: DOWNLOAD_HEADERS(upstream.headers),
        });
      },
    },
  },
});