import { SENIOR_SAFE_ADMIN_EMAIL, sendBillingEmailViaZoho } from "@/lib/zoho-smtp";

function chileNow(): string {
  return new Date().toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendAdminNotice(subject: string, lines: string[]): Promise<void> {
  const textBody = lines.join("\n");
  const htmlBody =
    `<div style="font-family:sans-serif;line-height:1.5">` +
    lines.map((line) => `<p style="margin:0 0 8px">${escapeHtml(line)}</p>`).join("") +
    `</div>`;
  try {
    await sendBillingEmailViaZoho({
      to: SENIOR_SAFE_ADMIN_EMAIL,
      subject,
      textBody,
      htmlBody,
    });
  } catch (err) {
    console.error("[admin-notice]", err);
  }
}

export async function notifyNewAccount(input: {
  nombre: string;
  email: string;
  telefono: string;
  plan: string;
  periodo: string;
  discountCode?: string | null;
  contractor: "familia" | "adulto";
  guardianPhone?: string | null;
}): Promise<void> {
  const who = input.contractor === "adulto" ? "El adulto mayor" : "Un familiar";
  await sendAdminNotice(`Nueva cuenta Senior Safe — ${input.nombre}`, [
    `Nueva cuenta creada el ${chileNow()} (hora de Chile).`,
    `Nombre: ${input.nombre}`,
    `Correo: ${input.email}`,
    `Teléfono: ${input.telefono}`,
    `Plan: ${input.plan} · ${input.periodo}`,
    `Quién contrata: ${who}`,
    `Teléfono de quien recibe la ayuda: ${input.guardianPhone?.trim() || input.telefono}`,
    `Convenio: ${input.discountCode?.trim() || "ninguno"}`,
    `El pago todavía puede estar pendiente. Este aviso es de la creación de la cuenta.`,
  ]);
}

export async function notifyWhatsAppInquiry(input: {
  phone: string;
  message: string;
}): Promise<void> {
  const text = input.message.replace(/\s+/g, " ").trim().slice(0, 900);
  if (!text) return;
  await sendAdminNotice(`Consulta WhatsApp Senior Safe — ${input.phone}`, [
    `Consulta por WhatsApp el ${chileNow()} (hora de Chile).`,
    `Número: ${input.phone}`,
    `Mensaje: ${text}`,
  ]);
}
