import { grantPaidRescue } from "@/lib/grant-rescue";
import { readPaidRescue } from "@/lib/rescue";
import { getStripe } from "@/lib/stripe";
import { PaymentReturn } from "@/components/payment-return";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function formatUntil(until: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(until);
}

async function confirmStripe(sessionId: string): Promise<{ title: string; body: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      title: "No podemos confirmar Stripe aquí",
      body: "Si Lemon o Stripe te cobró, la vigilancia se activa con el aviso de pago. La limpieza todavía no se ejecuta sola. Escríbenos a hola@cuidadoweb.com si no ves el plan activo.",
    };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return {
      title: "El pago no se completó",
      body: "Volviste antes de pagar. No se ha cobrado nada.",
    };
  }
  const paid = readPaidRescue(session);
  if (!paid) {
    return {
      title: "El cobro no es el Rescate",
      body: "No activamos la vigilancia porque el pago no es de $29. Escríbenos a hola@cuidadoweb.com.",
    };
  }
  const granted = await grantPaidRescue({ ...paid, paidAt: new Date() });
  if (granted.status === "rejected") {
    return {
      title: "El sitio ya no está conectado",
      body: "Se cobró, pero no activamos el Rescate porque el sitio no está conectado. Escríbenos a hola@cuidadoweb.com y no pagues otra vez.",
    };
  }
  if (granted.status === "duplicate") {
    const until = granted.watchUntil ? ` La vigilancia que ya tenías sigue hasta el ${formatUntil(granted.watchUntil)}.` : "";
    return {
      title: "Este sitio ya tenía un plan",
      body: `No abrimos otro periodo de 30 días.${until} Si te cobraron de nuevo, escríbenos a hola@cuidadoweb.com.`,
    };
  }
  return {
    title: "Pago recibido",
    body: `La vigilancia del Rescate queda activa hasta el ${formatUntil(granted.watchUntil)}. La limpieza de la base todavía no se ejecuta sola.`,
  };
}

export default async function RescuePaymentPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  if (sessionId?.startsWith("cs_")) {
    const result = await confirmStripe(sessionId);
    return (
      <section className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-4xl tracking-tight">{result.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-700">{result.body}</p>
        <a href="/" className="mt-8 inline-block text-sm font-medium text-pine underline decoration-pine/40 underline-offset-4">
          Volver al inicio
        </a>
      </section>
    );
  }
  return <PaymentReturn purpose="rescue" />;
}
