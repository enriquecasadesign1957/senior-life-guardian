import { specialistAction, specialistDisclosure, specialistHref } from "@/lib/specialist-referral";

const paths: Array<{ title: string; body: string; href: string; action: string; note?: string }> = [
  {
    title: "Está lento",
    body: "El diagnóstico gratis mide cómo se siente en el celular y lo explica en español.",
    href: "#analizar",
    action: "Analizar mi sitio gratis",
  },
  {
    title: "La base está llena",
    body: "Copias viejas, transitorios vencidos y spam. Antes de quitar nada ves la lista. El pago único es de $29 y se puede deshacer durante 7 días.",
    href: "#precios",
    action: "Ver el Rescate",
  },
  {
    title: "Está caído",
    body: "Revisamos la página de inicio cada 15 minutos. Un 404 avisa por correo. Dos fallos seguidos, como un 503, preparan el aviso telefónico. Desde aquí no levantamos el sitio.",
    href: "#precios",
    action: "Ver la vigilancia",
  },
  {
    title: "¿Tu sitio ya está caído o suspendido?",
    body: "Si tu WordPress muestra una pantalla en blanco, sufrió un hackeo o tu hosting lo suspendió por virus, el conector no puede entrar. En estos casos te derivamos con especialistas en desinfección manual.",
    href: specialistHref,
    action: specialistAction,
    note: specialistDisclosure,
  },
];

export function WhatHappened() {
  return (
    <section id="que-paso" className="scroll-mt-28 border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="max-w-2xl text-3xl tracking-tight sm:text-4xl">¿Qué te pasó?</h2>
        <p className="mt-3 max-w-2xl text-stone-700">Cada problema sigue un camino distinto.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {paths.map((path) => (
            <article key={path.title} className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h3 className="text-2xl">{path.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-700">{path.body}</p>
              <a
                href={path.href}
                className="mt-6 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4"
              >
                {path.action}
              </a>
              {path.note ? <p className="mt-2 text-xs leading-5 text-stone-500">{path.note}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
