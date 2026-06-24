import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CONTRACT_SIGNUPS_TABLE } from "@/lib/signups-db";
import { sendBillingEmailViaZoho, wrapSupportHtmlReply } from "@/lib/zoho-smtp";

const CODE_TTL_MIN = 15;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_S = 60;

export type PinResetRequestResult =
  | { ok: true; emailHint: string; ttl_minutes: number }
  | { ok: false; error: string };

export type PinResetVerifyResult =
  | { ok: true; verified: true }
  | { ok: false; error: string };

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomCode6(): string {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(a[0] % 1_000_000).padStart(6, "0");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.length <= 2 ? local[0] ?? "*" : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("42P01")
  );
}

async function lookupSignupEmail(signupId: string): Promise<{ email: string; nombre: string } | null> {
  const { data, error } = await supabaseAdmin
    .from(CONTRACT_SIGNUPS_TABLE)
    .select("email, nombre")
    .eq("id", signupId)
    .maybeSingle();

  if (error || !data?.email) return null;
  const email = String(data.email).trim().toLowerCase();
  if (!email.includes("@")) return null;
  return { email, nombre: String(data.nombre ?? "").trim() || "Cliente" };
}

async function sendResetEmail(to: string, nombre: string, code: string): Promise<void> {
  const subject = "Senior Safe — código para recuperar tu PIN";
  const textBody =
    `Hola ${nombre},\n\n` +
    `Recibimos una solicitud para crear un PIN nuevo en Senior Safe.\n\n` +
    `Tu código es: ${code}\n\n` +
    `Expira en ${CODE_TTL_MIN} minutos. Si no solicitaste esto, ignora este correo.\n\n` +
    `Equipo Senior Safe`;

  const htmlBody = wrapSupportHtmlReply(
    `Recibimos una solicitud para crear un PIN nuevo en Senior Safe.\n\n` +
      `Tu código de verificación es:\n\n` +
      `${code}\n\n` +
      `Expira en ${CODE_TTL_MIN} minutos. Si no solicitaste esto, ignora este correo.`,
    nombre,
  );

  await sendBillingEmailViaZoho({ to, subject, textBody, htmlBody });
}

/** Envía código de recuperación al correo registrado de la cuenta. */
export async function requestPinResetCode(signupId: string): Promise<PinResetRequestResult> {
  const account = await lookupSignupEmail(signupId);
  if (!account) {
    return { ok: false, error: "no_email" };
  }

  const { data: recent, error: recentErr } = await supabaseAdmin
    .from("pin_reset_codes")
    .select("created_at")
    .eq("contract_signup_id", signupId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentErr) {
    if (isMissingTableError(recentErr.message ?? "")) {
      return { ok: false, error: "table_missing" };
    }
    console.error("[pin-reset] recent lookup:", recentErr.message);
    return { ok: false, error: "server_error" };
  }

  if (recent) {
    const ageSec = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
    if (ageSec < RESEND_COOLDOWN_S) {
      return { ok: false, error: `cooldown:${Math.ceil(RESEND_COOLDOWN_S - ageSec)}` };
    }
  }

  const code = randomCode6();
  const codeHash = await sha256(code);
  const expires = new Date(Date.now() + CODE_TTL_MIN * 60 * 1000).toISOString();

  const { error: insertErr } = await supabaseAdmin.from("pin_reset_codes").insert({
    contract_signup_id: signupId,
    email: account.email,
    code_hash: codeHash,
    expires_at: expires,
  });

  if (insertErr) {
    if (isMissingTableError(insertErr.message ?? "")) {
      return { ok: false, error: "table_missing" };
    }
    console.error("[pin-reset] insert:", insertErr.message);
    return { ok: false, error: "server_error" };
  }

  try {
    await sendResetEmail(account.email, account.nombre, code);
  } catch (e) {
    console.error("[pin-reset] email:", e);
    return { ok: false, error: "email_failed" };
  }

  return { ok: true, emailHint: maskEmail(account.email), ttl_minutes: CODE_TTL_MIN };
}

/** Verifica el código enviado por correo. */
export async function verifyPinResetCode(signupId: string, code: string): Promise<PinResetVerifyResult> {
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "invalid_code" };
  }

  const { data: row, error } = await supabaseAdmin
    .from("pin_reset_codes")
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("contract_signup_id", signupId)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message ?? "")) {
      return { ok: false, error: "table_missing" };
    }
    console.error("[pin-reset] verify lookup:", error.message);
    return { ok: false, error: "server_error" };
  }

  if (!row) return { ok: false, error: "no_code" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "too_many_attempts" };

  const hash = await sha256(code);
  if (hash !== row.code_hash) {
    await supabaseAdmin
      .from("pin_reset_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { ok: false, error: "wrong_code" };
  }

  await supabaseAdmin
    .from("pin_reset_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  return { ok: true, verified: true };
}

export function pinResetErrorMessage(error?: string): string {
  if (error?.startsWith("cooldown:")) {
    const sec = error.split(":")[1];
    return `Espera ${sec} segundos antes de pedir otro código.`;
  }
  switch (error) {
    case "no_email":
      return "Tu cuenta no tiene correo registrado. Escríbenos a hola@alarmaseniorsafe.cl";
    case "email_failed":
      return "No pudimos enviar el correo. Inténtalo más tarde o contacta soporte.";
    case "table_missing":
      return "Recuperación por correo aún no está activa en el servidor. Contacta a soporte.";
    case "no_code":
      return "Solicita un código nuevo con «Olvidé mi PIN».";
    case "expired":
      return "El código expiró. Solicita uno nuevo.";
    case "too_many_attempts":
      return "Demasiados intentos. Solicita un código nuevo.";
    case "wrong_code":
      return "Código incorrecto.";
    case "invalid_code":
      return "Ingresa los 6 dígitos del correo.";
    case "network_error":
      return "Revisa tu conexión e inténtalo de nuevo.";
    default:
      return "No pudimos completar la recuperación. Inténtalo de nuevo.";
  }
}
