import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { installApiBaseFetch } from "@/lib/api-base";
import { productionHomeUrl } from "@/lib/app-url";
import { Toaster } from "@/components/ui/sonner";

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
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href={productionHomeUrl()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href={productionHomeUrl()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alarma Senior Safe" },
      { name: "description", content: "Senior Life provides immediate safety alerts for seniors to their families via WhatsApp, SMS, and calls." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Alarma Senior Safe" },
      { property: "og:description", content: "Senior Life provides immediate safety alerts for seniors to their families via WhatsApp, SMS, and calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Alarma Senior Safe" },
      { name: "twitter:description", content: "Senior Life provides immediate safety alerts for seniors to their families via WhatsApp, SMS, and calls." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/WEgAKtYLuSfQACezmGynaHiHwV53/social-images/social-1778871881128-Logo_alarma.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/WEgAKtYLuSfQACezmGynaHiHwV53/social-images/social-1778871881128-Logo_alarma.webp" },
      { name: "theme-color", content: "#0d4f5c" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Senior Safe" },
      { name: "application-name", content: "Senior Safe" },
      { name: "format-detection", content: "telephone=yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json?v=2026-05-29" },
      
      { rel: "apple-touch-icon", href: "/senior-life-guardian-512.webp" },
      { rel: "icon", type: "image/webp", href: "/senior-life-guardian-512.webp" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
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


  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
