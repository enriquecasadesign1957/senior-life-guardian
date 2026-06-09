import { formatPlanPrice, PLAN, renewalCheckoutUrl } from "@/lib/plans";
import { buildBillingEmailHtml } from "@/lib/transactional-email-html";
import { SENIOR_SAFE_SUPPORT_EMAIL } from "@/lib/senior-safe-ai";

export type RenewalEmailKind = "reminder_7d" | "reminder_1d" | "suspended";

type RenewalEmailInput = {
  nombre: string;
  email: string;
  periodo: "mensual" | "anual";
  renewalDateLabel: string;
  renewalDateShort: string;
  checkoutUrl: string;
};

function periodoLabel(periodo: "mensual" | "anual"): string {
  return periodo === "anual" ? "anual" : "mensual";
}

function amountLabel(periodo: "mensual" | "anual"): string {
  const amount = periodo === "anual" ? PLAN.yearly : PLAN.monthly;
  return `$${formatPlanPrice(amount)} CLP`;
}

function buildBodies(kind: RenewalEmailKind, input: RenewalEmailInput): { subject: string; text: string; html: string } {
  const firstName = input.nombre.split(" ")[0] || input.nombre;
  const planLine = `Plan ${periodoLabel(input.periodo)} (${amountLabel(input.periodo)})`;
  const checkout = input.checkoutUrl;
  const greeting = `Hola ${firstName},`;
  const footerPaid = "Si ya pagaste tu renovación, ignora este aviso.";

  const htmlBase = (opts: Parameters<typeof buildBillingEmailHtml>[0]) =>
    buildBillingEmailHtml({ ...opts, accountEmail: input.email });

  if (kind === "reminder_7d") {
    const subject = `[Senior Safe] Recordatorio de renovación — vence el ${input.renewalDateShort}`;
    const text =
      `${greeting}\n\n` +
      `Te recordamos que tu suscripción ${planLine} vence el ${input.renewalDateLabel}.\n\n` +
      `Para mantener activas las alertas de emergencia de tu familia, puedes renovar con Webpay Plus:\n${checkout}\n\n` +
      `${footerPaid}\n\n` +
      `Cuenta: ${input.email}\n` +
      `Ayuda: ${SENIOR_SAFE_SUPPORT_EMAIL}\n\n` +
      `Equipo Senior Safe\nalarmaseniorsafe.cl`;
    const html = htmlBase({
      preheader: `Tu plan Senior Safe vence el ${input.renewalDateShort}. Renueva con Webpay cuando te acomode.`,
      greeting,
      title: "Recordatorio de renovación de tu plan",
      lines: [
        `Tu suscripción ${planLine} vence el ${input.renewalDateLabel}.`,
        "Mantén activas las alertas por SMS, WhatsApp y llamada para tu red de cuidado.",
        footerPaid,
      ],
      ctaLabel: "Renovar con Webpay Plus",
      ctaUrl: checkout,
      footerNote: `Vencimiento: ${input.renewalDateLabel}`,
    });
    return { subject, text, html };
  }

  if (kind === "reminder_1d") {
    const subject = `[Senior Safe] Tu plan vence mañana (${input.renewalDateShort})`;
    const text =
      `${greeting}\n\n` +
      `Mañana, ${input.renewalDateLabel}, vence tu suscripción ${planLine}.\n\n` +
      `Renueva cuando puedas para evitar una pausa del servicio:\n${checkout}\n\n` +
      `Si no renuevas, el servicio puede suspenderse 3 días después del vencimiento.\n\n` +
      `${footerPaid}\n\n` +
      `Cuenta: ${input.email}\n` +
      `Ayuda: ${SENIOR_SAFE_SUPPORT_EMAIL}\n\n` +
      `Equipo Senior Safe`;
    const html = htmlBase({
      preheader: `Vence mañana (${input.renewalDateShort}). Renueva tu plan Senior Safe con el mismo correo registrado.`,
      greeting,
      title: "Tu plan vence mañana",
      lines: [
        `Tu suscripción ${planLine} vence el ${input.renewalDateLabel}.`,
        "Si no renuevas, el servicio puede suspenderse 3 días después de esa fecha.",
        footerPaid,
      ],
      ctaLabel: "Renovar plan ahora",
      ctaUrl: checkout,
    });
    return { subject, text, html };
  }

  const subject = `[Senior Safe] Cuenta pausada — reactivar servicio`;
  const text =
    `${greeting}\n\n` +
    `Tu suscripción ${planLine} venció el ${input.renewalDateLabel} y el servicio quedó pausado tras 3 días sin renovación.\n\n` +
    `Las alertas de emergencia no se enviarán hasta que completes un nuevo pago:\n${checkout}\n\n` +
    `Usa el mismo correo registrado (${input.email}) al pagar.\n\n` +
    `Ayuda: ${SENIOR_SAFE_SUPPORT_EMAIL}\n\n` +
    `Equipo Senior Safe`;
  const html = htmlBase({
    preheader: "Tu cuenta Senior Safe está pausada. Reactiva el servicio con Webpay Plus.",
    greeting,
    title: "Servicio pausado por falta de renovación",
    lines: [
      `Tu plan venció el ${input.renewalDateLabel} y el servicio quedó pausado.`,
      "Las alertas de emergencia no se enviarán hasta que renueves tu suscripción.",
      `Al pagar, usa el correo ${input.email} para reactivar tu cuenta.`,
    ],
    ctaLabel: "Reactivar con Webpay Plus",
    ctaUrl: checkout,
  });
  return { subject, text, html };
}

export function buildRenewalEmail(
  kind: RenewalEmailKind,
  data: {
    nombre: string;
    email: string;
    periodo: string;
    renewalDate: string;
  },
): { subject: string; textBody: string; htmlBody: string } {
  const periodo = data.periodo === "anual" ? "anual" : "mensual";
  const renewalDateLabel = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(data.renewalDate));

  const renewalDateShort = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(data.renewalDate));

  const { subject, text, html } = buildBodies(kind, {
    nombre: data.nombre,
    email: data.email,
    periodo,
    renewalDateLabel,
    renewalDateShort,
    checkoutUrl: renewalCheckoutUrl(periodo),
  });

  return { subject, textBody: text, htmlBody: html };
}
