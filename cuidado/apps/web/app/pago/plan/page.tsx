export const dynamic = "force-dynamic";

export default function PlanPaymentPage() {
  return (
    <section className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-4xl tracking-tight">Pago recibido</h1>
      <p className="mt-6 text-lg leading-relaxed text-stone-700">
        Si acabas de pagar el Plan Cuidado en Lemon Squeezy, la vigilancia queda activa en unos segundos. La limpieza
        automática mensual también se programa desde la app. Si no pagaste, vuelve al informe y no se ha cobrado nada.
      </p>
      <a href="/" className="mt-8 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4">
        Volver al inicio
      </a>
    </section>
  );
}
