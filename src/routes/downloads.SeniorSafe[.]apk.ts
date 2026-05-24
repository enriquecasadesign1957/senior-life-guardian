import { createFileRoute } from "@tanstack/react-router";

/**
 * URL estable y branded para descargar la APK Android de Senior Safe:
 *   https://alarmaseniorsafe.cl/downloads/SeniorSafe.apk
 *
 * Redirige (302) al objeto público en Lovable Cloud Storage (bucket `apk`).
 * Así la URL del botón "Descargar App" nunca cambia, aunque cambie el
 * backend de almacenamiento, y GitHub Actions solo necesita reemplazar
 * el archivo `SeniorSafe.apk` en el bucket en cada build.
 */
export const Route = createFileRoute("/downloads/SeniorSafe.apk")({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl =
          process.env.SUPABASE_URL ??
          process.env.VITE_SUPABASE_URL ??
          "https://mjdjfjxehnfroqyfzkyk.supabase.co";
        const target = `${supabaseUrl}/storage/v1/object/public/apk/SeniorSafe.apk`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: target,
            "Cache-Control": "no-store",
          },
        });
      },
      HEAD: async () => {
        return new Response(null, { status: 200 });
      },
    },
  },
});
