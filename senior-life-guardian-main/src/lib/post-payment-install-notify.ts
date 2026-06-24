import { PRODUCTION_SITE_URL } from "@/lib/app-url";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildBillingEmailHtml } from "@/lib/transactional-email-html";
import { SENIOR_SAFE_SUPPORT_EMAIL } from "@/lib/senior-safe-ai";
import { WHATSAPP_ACTIVATION_KEYWORD } from "@/lib/whatsapp-commercial-activation";
import { sendTwilioWhatsAppWithSmsFallback, SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164 } from "@/lib/twilio";
import { normalizeTwilioPhone } from "@/lib/twilio-inbound";
import { sendBillingEmailViaZoho, SENIOR_SAFE_ADMIN_EMAIL } from "@/lib/zoho-smtp";

export type PostPaymentInstallNotifyResult = {
  sent: boolean;
  emailSent: boolean;
  whatsappSent: boolean;
  smsSent: boolean;
  email?: string;
  telefonoMasked?: string;
  skippedReason?: string;
};

function firstName(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] || nombre.trim() || "Cliente";
}

export function buildPostPaymentInstallUrl(signupId: string): string {
  const u = new URL("/instalar-app", PRODUCTION_SITE_URL);
  u.searchParams.set("entrenamiento", "1");
  u.searchParams.set("pago", "ok");
  u.searchParams.set("ss", signupId);
  return u.toString();
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const tail = digits.slice(-4);
  if (digits.startsWith("569") && digits.length >= 11) {
    return `+56 9 ****${tail}`;
  }
  return `****${tail}`;
}

function whatsAppDisplayNumber(): string {
  const digits = SENIOR_SAFE_WHATSAPP_COMMERCIAL_E164.replace(/\D/g, "");
  return digits.startsWith("569")
    ? `+56 9 ${digits.slice(3, 7)} ${digits.slice(7)}`
    : `+${digits}`;
}

function buildInstallEmailBodies(input: {
  nombre: string;
  email: string;
  installUrl: string;
}): { subject: string; textBody: string; htmlBody: string } {
  const name = firstName(input.nombre);
  const wa = whatsAppDisplayNumber();
  const subject = "Senior Safe — instala la app en tu celular";
  const textBody =
    `Hola ${name},\n\n` +
    `Tu suscripción Senior Safe ya está activa.\n\n` +
    `Abre este enlace en el celular de quien usará la app (Android o iPhone):\n${input.installUrl}\n\n` +
    `Pasos:\n` +
    `1) Descarga o instala Senior Safe desde el enlace.\n` +
    `2) Inicia sesión con este correo: ${input.email}\n` +
    `3) Crea tu PIN y agrega familiares guardianes.\n` +
    `4) Escribe ${WHATSAPP_ACTIVATION_KEYWORD} por WhatsApp al ${wa}.\n\n` +
    `Si un familiar pagó por ti, puede reenviarte este correo.\n\n` +
    `Ayuda: ${SENIOR_SAFE_SUPPORT_EMAIL}\n` +
    `Equipo Senior Safe`;

  const htmlBody = buildBillingEmailHtml({
    preheader: "Abre el enlace en tu celular para instalar Senior Safe.",
    greeting: `Hola ${name},`,
    title: "Instala Senior Safe en tu celular",
    lines: [
      "Tu suscripción ya está activa. Abre el botón de abajo en el teléfono del adulto mayor (no en computador).",
      "Luego inicia sesión con el correo registrado, crea tu PIN de 4 dígitos y agrega familiares guardianes.",
      `Por último, escribe ${WHATSAPP_ACTIVATION_KEYWORD} por WhatsApp al ${wa} para vincular alertas.`,
      "Si un familiar realizó el pago, puede reenviarte este correo para que instales cuando tengas tu celular.",
    ],
    ctaLabel: "Instalar Senior Safe",
    ctaUrl: input.installUrl,
    accountEmail: input.email,
    footerNote: "El botón de emergencia funciona desde la app instalada.",
  });

  return { subject, textBody, htmlBody };
}

function buildInstallSmsBody(input: { nombre: string; email: string; installUrl: string }): string {
  const name = firstName(input.nombre);
  const wa = whatsAppDisplayNumber();
  return (
    `Senior Safe: pago confirmado, ${name}. ` +
    `Instala la app: ${input.installUrl} ` +
    `Entra con ${input.email}. ` +
    `Luego escribe ${WHATSAPP_ACTIVATION_KEYWORD} al ${wa}. ` +
    `Ayuda: ${SENIOR_SAFE_SUPPORT_EMAIL}`
  );
}

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("install_instructions_sent_at") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42703")
  );
}

/**
 * Tras pago exitoso: envía enlace de instalación al correo y WhatsApp/SMS registrados.
 * Idempotente vía install_instructions_sent_at.
 */
export async function sendPostPaymentInstallNotifications(
  signupId: string,
  opts?: { force?: boolean },
): Promise<PostPaymentInstallNotifyResult> {
  const empty: PostPaymentInstallNotifyResult = {
    sent: false,
    emailSent: false,
    whatsappSent: false,
    smsSent: false,
  };

  type SignupRow = {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    payment_status: string;
    install_instructions_sent_at?: string | null;
  };

  let row: SignupRow | null = null;

  const { data: fullRow, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("id, nombre, email, telefono, install_instructions_sent_at, payment_status")
    .eq("id", signupId)
    .maybeSingle();

  if (error && isMissingColumnError(error.message ?? "")) {
    const { data: basicRow, error: basicErr } = await supabaseAdmin
      .from(CONTRACT_SIGNUPS_TABLE)
      .select("id, nombre, email, telefono, payment_status")
      .eq("id", signupId)
      .maybeSingle();
    if (basicErr) {
      console.error("[install-notify] load:", basicErr.message);
      return { ...empty, skippedReason: "load_error" };
    }
    row = basicRow ? { ...basicRow, install_instructions_sent_at: null } : null;
  } else if (error) {
    console.error("[install-notify] load:", error.message);
    return { ...empty, skippedReason: "load_error" };
  } else {
    row = fullRow;
  }

  if (!row?.email) {
    return { ...empty, skippedReason: "not_found" };
  }

  if (row.install_instructions_sent_at && !opts?.force) {
    return {
      ...empty,
      skippedReason: "already_sent",
      email: row.email.trim().toLowerCase(),
      telefonoMasked: row.telefono ? maskPhone(row.telefono) : undefined,
    };
  }

  if (row.payment_status !== "paid" && row.payment_status !== "comp" && !opts?.force) {
    return { ...empty, skippedReason: "not_paid" };
  }

  const email = row.email.trim().toLowerCase();
  const nombre = String(row.nombre ?? "").trim() || "Cliente";
  const installUrl = buildPostPaymentInstallUrl(signupId);
  const phoneE164 = normalizeTwilioPhone(row.telefono ?? "");

  let emailSent = false;
  let whatsappSent = false;
  let smsSent = false;

  try {
    const { subject, textBody, htmlBody } = buildInstallEmailBodies({ nombre, email, installUrl });
    await sendBillingEmailViaZoho({
      to: email,
      subject,
      textBody,
      htmlBody,
      bcc: SENIOR_SAFE_ADMIN_EMAIL,
    });
    emailSent = true;
  } catch (e) {
    console.error("[install-notify] email:", e);
  }

  if (phoneE164.length >= 10) {
    try {
      const body = buildInstallSmsBody({ nombre, email, installUrl });
      const channel = await sendTwilioWhatsAppWithSmsFallback(phoneE164, body);
      whatsappSent = channel.whatsappOk;
      smsSent = channel.smsOk;
    } catch (e) {
      console.error("[install-notify] whatsapp/sms:", e);
    }
  }

  if (emailSent || whatsappSent || smsSent) {
    try {
      await supabaseAdmin
        .from(CONTRACT_SIGNUPS_TABLE)
        .update({ install_instructions_sent_at: new Date().toISOString() })
        .eq("id", signupId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!isMissingColumnError(msg)) {
        console.warn("[install-notify] mark sent:", msg);
      }
    }
  }

  const sent = emailSent || whatsappSent || smsSent;
  return {
    sent,
    emailSent,
    whatsappSent,
    smsSent,
    email,
    telefonoMasked: row.telefono ? maskPhone(row.telefono) : undefined,
    skippedReason: sent ? undefined : "delivery_failed",
  };
}
