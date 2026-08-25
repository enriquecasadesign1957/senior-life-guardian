import type { SupabaseClient } from "@supabase/supabase-js";

export type NotifyEnv = {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ADMIN_NOTIFY_EMAIL?: string;
  BILLING_INTERNAL_SECRET?: string;
};

export type NotifyTipo = "prueba" | "contrato";

const ADMIN_EMAIL = "enriquecasadesign@gmail.com";

function dest(env: NotifyEnv): string {
  return env.ADMIN_NOTIFY_EMAIL?.trim() || ADMIN_EMAIL;
}

function fromAddr(env: NotifyEnv): string {
  return (
    env.RESEND_FROM?.trim() || "WakeUp Dev <onboarding@resend.dev>"
  );
}

export async function sendAdminNotify(
  env: NotifyEnv,
  input: { tipo: NotifyTipo; email: string; usuarioId?: string }
): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("admin_notify_skipped", { reason: "missing_resend_key" });
    return;
  }

  const who = input.email.trim() || "(sin email)";
  const subject =
    input.tipo === "contrato"
      ? `WakeUp: contrataron Pro Chile — ${who}`
      : `WakeUp: nueva prueba — ${who}`;
  const text =
    input.tipo === "contrato"
      ? `Alguien activó Pro Chile.\n\nEmail: ${who}\nUsuario: ${input.usuarioId ?? "—"}\n`
      : `Alguien entró a la prueba (login GitHub, 5 créditos).\n\nEmail: ${who}\nUsuario: ${input.usuarioId ?? "—"}\n`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddr(env),
        to: [dest(env)],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("admin_notify_resend_failed", {
        http: res.status,
        body: body.slice(0, 240),
      });
    }
  } catch (err) {
    console.error("admin_notify_throw", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function handleInternalNotify(
  request: Request,
  env: NotifyEnv,
  supabase: SupabaseClient
): Promise<Response> {
  const expected = env.BILLING_INTERNAL_SECRET?.trim() ?? "";
  const got = request.headers.get("x-wakeup-internal")?.trim() ?? "";
  if (!expected || !got || !timingSafeEqual(got, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tipo?: string; email?: string; usuario_id?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tipo = body.tipo === "contrato" ? "contrato" : body.tipo === "prueba" ? "prueba" : null;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const usuarioId =
    typeof body.usuario_id === "string" ? body.usuario_id.trim() : "";
  if (!tipo || !email.includes("@")) {
    return Response.json({ error: "tipo o email inválidos" }, { status: 400 });
  }

  if (usuarioId) {
    const { error } = await supabase.from("billing_events").insert({
      provider: "transbank",
      event_id: `notify:${tipo}:${usuarioId}`,
      event_type: `admin_notify_${tipo}`,
      usuario_id: usuarioId,
      creditos: 1,
    });
    if (error?.code === "23505") {
      return Response.json({ ok: true, duplicate: true }, { status: 200 });
    }
  }

  await sendAdminNotify(env, { tipo, email, usuarioId: usuarioId || undefined });
  return Response.json({ ok: true }, { status: 200 });
}

export async function notifyAdminOnce(
  env: NotifyEnv,
  supabase: SupabaseClient,
  input: { tipo: NotifyTipo; email: string; usuarioId: string }
): Promise<void> {
  const { error } = await supabase.from("billing_events").insert({
    provider: "transbank",
    event_id: `notify:${input.tipo}:${input.usuarioId}`,
    event_type: `admin_notify_${input.tipo}`,
    usuario_id: input.usuarioId,
    creditos: 1,
  });
  if (error?.code === "23505") return;
  await sendAdminNotify(env, {
    tipo: input.tipo,
    email: input.email,
    usuarioId: input.usuarioId,
  });
}
