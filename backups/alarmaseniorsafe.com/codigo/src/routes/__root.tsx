import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { installApiBaseFetch } from "@/lib/api-base";
import { productionHomeUrl } from "@/lib/app-url";
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, shouldLoadGa4, trackGa4Pageview } from "@/lib/ga4";
import {
  SEO_BRAND,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SEO_LANGUAGE,
  SEO_OG_IMAGE,
  SEO_OG_IMAGE_HEIGHT,
  SEO_OG_IMAGE_WIDTH,
  SEO_SITE_NAME,
  canonicalLink,
  globalJsonLdScripts,
  hreflangLink,
} from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";

/** Microsoft Clarity — mapas de calor y sesiones (producción). */
const CLARITY_PROJECT_ID = "xepub34xxl";
const CLARITY_HEAD_SNIPPET = `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

const GA4_INIT_SNIPPET = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_MEASUREMENT_ID}',{send_page_view:false,anonymize_ip:true});gtag('config','${GOOGLE_ADS_ID}');`;

// Parchea fetch para APK (Capacitor / file://). En preview de Lovable y
// localhost NO se activa para evitar CORS. Se ejecuta dentro de useEffect
// (ver RootComponent) para no interferir con la evaluación del módulo durante SSR.
function setupApiBase() {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  const isDevOrPreview =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app");

  if (isDevOrPreview && (window as any).__API_BASE__ && document.body) {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = "about:blank";
      document.body.appendChild(iframe);
      const nativeFetch = (iframe.contentWindow as any)?.fetch;
      if (nativeFetch) {
        window.fetch = nativeFetch.bind(window);
      }
      document.body.removeChild(iframe);
    } catch {
      // silencioso: no romper el render si el iframe no se puede crear
    }
  }

  if (!isDevOrPreview) {
    installApiBaseFetch();
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <a
            href={productionHomeUrl()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          No pudimos cargar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error. Puedes reintentar o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href={productionHomeUrl()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    const leaf = matches[matches.length - 1];
    const pathname = leaf?.pathname ?? "/";

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { title: SEO_DEFAULT_TITLE },
        { name: "description", content: SEO_DEFAULT_DESCRIPTION },
        { name: "author", content: SEO_BRAND },
        // Discover: permite previsualizaciones de imágenes grandes (≥1200px)
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { name: "geo.region", content: "CL" },
        { name: "language", content: SEO_LANGUAGE },
        { property: "og:site_name", content: SEO_SITE_NAME },
        { property: "og:locale", content: "es_CL" },
        { property: "og:title", content: SEO_DEFAULT_TITLE },
        { property: "og:description", content: SEO_DEFAULT_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalLink(pathname).href },
        { property: "og:image", content: SEO_OG_IMAGE },
        { property: "og:image:width", content: SEO_OG_IMAGE_WIDTH },
        { property: "og:image:height", content: SEO_OG_IMAGE_HEIGHT },
        { property: "og:image:alt", content: `${SEO_SITE_NAME} — botón SOS y alertas familiares` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: SEO_DEFAULT_TITLE },
        { name: "twitter:description", content: SEO_DEFAULT_DESCRIPTION },
        { name: "twitter:image", content: SEO_OG_IMAGE },
        { name: "theme-color", content: "#dc2626" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: SEO_SITE_NAME },
        { name: "application-name", content: SEO_SITE_NAME },
        { name: "format-detection", content: "telephone=yes" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/manifest.json?v=2026-06-22" },
        { rel: "apple-touch-icon", href: "/senior-safe-512.webp" },
        { rel: "icon", type: "image/webp", href: "/senior-safe-512.webp" },
        canonicalLink(pathname),
        hreflangLink(pathname),
      ],
      scripts: globalJsonLdScripts(pathname),
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <head>
        <HeadContent />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: CLARITY_HEAD_SNIPPET }}
        />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`} />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: GA4_INIT_SNIPPET }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });

  // Si la app corre dentro de Capacitor (APK/iOS), redirigir SIEMPRE a /native.
  // En navegador web normal no hace nada (Capacitor no está definido).
  useEffect(() => {
    if (typeof window === "undefined") return;

    setupApiBase();

    // Captura global y temprana del prompt nativo de instalación PWA
    // (Chrome/Edge mini-infobar). Llamar preventDefault suprime el banner
    // automático en cualquier ruta — el evento queda guardado en window y
    // solo se usa cuando el usuario toca explícitamente "Instalar" dentro
    // del InstallAppModal (post-onboarding). Esto evita que el landing en
    // móvil interrumpa el flujo con un prompt de instalación.
    const PROMPT_KEY = "__seniorSafeInstallPrompt";
    const BOUND_KEY = "__seniorSafeInstallPromptBound";
    if (!(window as any)[BOUND_KEY]) {
      (window as any)[BOUND_KEY] = true;
      window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        (window as any)[PROMPT_KEY] = event;
      });
    }

    const isCapacitor = Boolean((window as any).Capacitor?.isNativePlatform?.());
    if (!isCapacitor) return;
    const path = window.location.pathname;
    if (path === "/" || path === "" || path === "/index.html") {
      router.navigate({ to: "/native" });
    }
  }, [router]);

  // GA4: pageviews en carga inicial y navegación SPA (solo producción).
  useEffect(() => {
    if (!shouldLoadGa4()) return;
    const path = `${location.pathname}${location.searchStr || ""}`;
    trackGa4Pageview(path);
  }, [location.pathname, location.searchStr]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
