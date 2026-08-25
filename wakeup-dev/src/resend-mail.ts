/** Remitente WakeUp Dev (dominio verificado en Resend). */
export const RESEND_FROM_DEFAULT = "WakeUp Dev <administrador@wakeupdev.com>";

export type ResendMailEnv = {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
};

export function resendFromAddress(env: ResendMailEnv): string {
  return env.RESEND_FROM?.trim() || RESEND_FROM_DEFAULT;
}

export async function sendResendTextEmail(
  env: ResendMailEnv,
  input: { to: string[]; subject: string; text: string }
): Promise<{ ok: boolean; status: number; body: string }> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, status: 0, body: "missing_resend_key" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromAddress(env),
        to: input.to,
        subject: input.subject,
        text: input.text,
      }),
    });
    const body = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, body: body.slice(0, 500) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, body: message };
  }
}
