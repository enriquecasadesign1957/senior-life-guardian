import { Suspense } from "react";
import Link from "next/link";
import { Check, PhoneCall, Terminal } from "lucide-react";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { GraciasClaim } from "@/components/GraciasClaim";
import { LanguageProvider } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabaseServer";

export default async function GraciasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <LanguageProvider>
      <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />

        <nav className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
              <PhoneCall className="h-4 w-4 text-accent" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              WakeUp<span className="text-accent"> Dev</span>
            </span>
          </Link>
        </nav>

        <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Check className="h-3.5 w-3.5" />
            Pago confirmado
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            ¡Tu cuenta Pro ya está activa!
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Gracias por tu compra. Tus 50 créditos mensuales han sido asignados a
            tu cuenta corporativa. Ya puedes conectar tus monitores de
            infraestructura.
          </p>

          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Terminal className="h-4 w-4 text-accent" />
              Webhook
            </div>
            <pre className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300">
              {`POST https://api.wakeupdev.com/v1/alert
Header: x-api-key: TU_API_KEY`}
            </pre>
            <p className="mt-3 text-xs text-zinc-500">
              En UptimeRobot o Grafana usa una alerta HTTP. La API key se genera
              en el panel.
            </p>
          </div>

          {user ? null : (
            <Suspense fallback={null}>
              <GraciasClaim />
            </Suspense>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-zinc-950 transition hover:bg-accent-dim"
              >
                Ir al panel
              </Link>
            ) : (
              <GitHubLoginButton label="Iniciar Sesión con GitHub" />
            )}
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-800 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    </LanguageProvider>
  );
}
