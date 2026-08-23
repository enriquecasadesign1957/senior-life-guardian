import { type SupabaseClient } from "@supabase/supabase-js";
import { hmacSha256Hex } from "./webhook-signature";

export type CascadeEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  ENABLE_AMD?: string;
};

type AlertaRow = {
  id: string;
  usuario_id: string;
  estado: string;
  orden_actual: number;
  intento: number;
  texto_original: string;
  texto_voz: string;
  call_sid: string | null;
  telefono_destino: string | null;
  historial_id: string | null;
  actualizada_en: string;
};

const ACK_WAIT_MS = 45_000;
const RING_TIMEOUT_SEC = 30;
const GATHER_TIMEOUT_SEC = 15;
const MAX_HOPS = 8;
const DRIVE_BUDGET_MS = 8 * 60 * 1000;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toE164(raw: string): string | null {
  const only = raw.trim().replace(/\D/g, "");
  if (only.length < 8 || only.length > 15) return null;
  const e164 = `+${only}`;
  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function amdEnabled(env: CascadeEnv): boolean {
  return env.ENABLE_AMD?.trim().toLowerCase() === "true";
}

function twimlResponse(markup: string): Response {
  return new Response(markup, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function hangupTwiml(): string {
  return `<Response><Hangup/></Response>`;
}

function sayConchita(text: string): string {
  return `<Say voice="Polly.Conchita" language="es-ES">${escapeXml(text)}</Say>`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export async function signIvr(secret: string, alertaId: string): Promise<string> {
  return hmacSha256Hex(secret, `ivr:${alertaId}`);
}

async function verifyIvr(
  secret: string,
  alertaId: string,
  sig: string
): Promise<boolean> {
  const expected = await signIvr(secret, alertaId);
  return timingSafeEqual(sig.toLowerCase(), expected.toLowerCase());
}

function callbackOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function ivrUrls(origin: string, alertaId: string, sig: string) {
  const prompt = new URL("/v1/twilio/ivr-prompt", origin);
  prompt.searchParams.set("a", alertaId);
  prompt.searchParams.set("s", sig);
  const gather = new URL("/v1/twilio/ivr-callback", origin);
  gather.searchParams.set("a", alertaId);
  gather.searchParams.set("s", sig);
  const status = new URL("/v1/twilio/status-callback", origin);
  status.searchParams.set("a", alertaId);
  status.searchParams.set("s", sig);
  const amd = new URL("/v1/twilio/amd-callback", origin);
  amd.searchParams.set("a", alertaId);
  amd.searchParams.set("s", sig);
  return { prompt, gather, status, amd };
}

async function loadAlerta(
  supabase: SupabaseClient,
  id: string
): Promise<AlertaRow | null> {
  const { data, error } = await supabase
    .from("oncall_alertas")
    .select(
      "id, usuario_id, estado, orden_actual, intento, texto_original, texto_voz, call_sid, telefono_destino, historial_id, actualizada_en"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AlertaRow;
}

function isTerminal(estado: string): boolean {
  return (
    estado === "ACKNOWLEDGED" ||
    estado === "EXHAUSTED" ||
    estado === "FAILED"
  );
}

async function resolveTargets(
  supabase: SupabaseClient,
  usuarioId: string,
  fallbackPhone: string | null
): Promise<string[]> {
  const { data: shiftRows, error: shiftErr } = await supabase.rpc(
    "oncall_telefonos_ahora",
    { p_usuario_id: usuarioId }
  );
  const fromShift: string[] = [];
  if (!shiftErr && Array.isArray(shiftRows)) {
    for (const row of shiftRows as { telefono?: string }[]) {
      const phone = toE164(row.telefono ?? "");
      if (phone && !fromShift.includes(phone)) fromShift.push(phone);
    }
  }
  if (fromShift.length > 0) return fromShift.slice(0, MAX_HOPS);

  const { data: members } = await supabase
    .from("oncall_miembros")
    .select("telefono, orden_escalamiento")
    .eq("usuario_id", usuarioId)
    .eq("activo", true)
    .order("orden_escalamiento", { ascending: true });
  const fromRoster: string[] = [];
  if (Array.isArray(members)) {
    for (const row of members as { telefono?: string }[]) {
      const phone = toE164(row.telefono ?? "");
      if (phone && !fromRoster.includes(phone)) fromRoster.push(phone);
    }
  }
  if (fromRoster.length > 0) return fromRoster.slice(0, MAX_HOPS);

  const fallback = fallbackPhone ? toE164(fallbackPhone) : null;
  return fallback ? [fallback] : [];
}

async function twilioAuthHeader(env: CascadeEnv): Promise<string> {
  return `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID.trim()}:${env.TWILIO_AUTH_TOKEN.trim()}`)}`;
}

async function cancelCall(env: CascadeEnv, sid: string | null): Promise<void> {
  if (!sid) return;
  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID.trim()}/Calls/${sid}.json`,
      {
        method: "POST",
        headers: {
          Authorization: await twilioAuthHeader(env),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Status: "canceled" }).toString(),
      }
    );
  } catch (err) {
    console.error("twilio_cancel_failed", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

async function createTwilioCall(
  env: CascadeEnv,
  origin: string,
  alertaId: string,
  toNumber: string
): Promise<{ ok: true; sid?: string } | { ok: false; code?: number; message?: string }> {
  const fromNumber = toE164(env.TWILIO_PHONE_NUMBER ?? "");
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  if (!accountSid || !authToken || !fromNumber) {
    return { ok: false, message: "invalid_voice_config" };
  }
  const sig = await signIvr(authToken, alertaId);
  const urls = ivrUrls(origin, alertaId, sig);
  const body = new URLSearchParams();
  body.append("To", toNumber);
  body.append("From", fromNumber);
  body.append("Url", urls.prompt.toString());
  body.append("Method", "POST");
  body.append("Timeout", String(RING_TIMEOUT_SEC));
  body.append("StatusCallback", urls.status.toString());
  body.append("StatusCallbackMethod", "POST");
  body.append("StatusCallbackEvent", "answered");
  body.append("StatusCallbackEvent", "completed");
  if (amdEnabled(env)) {
    body.append("MachineDetection", "Enable");
    body.append("MachineDetectionTimeout", "5");
    body.append("AsyncAmd", "true");
    body.append("AsyncAmdStatusCallback", urls.amd.toString());
    body.append("AsyncAmdStatusCallbackMethod", "POST");
  }

  try {
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: await twilioAuthHeader(env),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );
    const twilioJson = (await twilioResponse.json().catch(() => ({}))) as {
      status?: string;
      sid?: string;
      code?: number;
      message?: string;
    };
    if (!twilioResponse.ok || twilioJson.status === "failed") {
      console.error("twilio_dispatch_failed", {
        http: twilioResponse.status,
        code: twilioJson.code,
      });
      return {
        ok: false,
        code: twilioJson.code,
        message: twilioJson.message,
      };
    }
    return { ok: true, sid: twilioJson.sid };
  } catch (err) {
    console.error("twilio_dispatch_throw", {
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, message: "twilio_network" };
  }
}

async function markFailed(supabase: SupabaseClient, id: string): Promise<void> {
  await supabase
    .from("oncall_alertas")
    .update({ estado: "FAILED", actualizada_en: new Date().toISOString() })
    .eq("id", id)
    .in("estado", ["TRIGGERED", "CALLING", "NO_ANSWER"]);
}

async function markExhausted(supabase: SupabaseClient, id: string): Promise<void> {
  await supabase
    .from("oncall_alertas")
    .update({ estado: "EXHAUSTED", actualizada_en: new Date().toISOString() })
    .eq("id", id)
    .in("estado", ["TRIGGERED", "CALLING", "NO_ANSWER"]);
}

async function maybeWriteHistorial(
  supabase: SupabaseClient,
  alerta: AlertaRow,
  estado: "exitosa" | "fallida" | "sin_respuesta"
): Promise<void> {
  if (alerta.historial_id) return;
  const { data } = await supabase
    .from("historial_alertas")
    .insert({
      usuario_id: alerta.usuario_id,
      estado,
      texto_original: alerta.texto_original.slice(0, 1500),
      texto_groq: alerta.texto_voz,
      costo_creditos: 1,
    })
    .select("id")
    .maybeSingle();
  if (data?.id) {
    await supabase
      .from("oncall_alertas")
      .update({ historial_id: data.id })
      .eq("id", alerta.id)
      .is("historial_id", null);
  }
}

async function placeCurrentHop(
  env: CascadeEnv,
  supabase: SupabaseClient,
  origin: string,
  alertaId: string,
  fallbackPhone: string | null
): Promise<"watching" | "done"> {
  const alerta = await loadAlerta(supabase, alertaId);
  if (!alerta || isTerminal(alerta.estado)) return "done";
  if (alerta.estado === "CALLING") return "watching";

  const targets = await resolveTargets(supabase, alerta.usuario_id, fallbackPhone);
  const index = alerta.intento - 1;
  if (index < 0 || index >= targets.length || alerta.intento > MAX_HOPS) {
    await markExhausted(supabase, alertaId);
    const latest = await loadAlerta(supabase, alertaId);
    if (latest) await maybeWriteHistorial(supabase, latest, "sin_respuesta");
    return "done";
  }

  const toNumber = targets[index];
  const nowIso = new Date().toISOString();
  await supabase
    .from("oncall_alertas")
    .update({
      estado: "CALLING",
      orden_actual: alerta.intento,
      telefono_destino: toNumber,
      actualizada_en: nowIso,
    })
    .eq("id", alertaId)
    .in("estado", ["TRIGGERED", "NO_ANSWER"]);

  const twilio = await createTwilioCall(env, origin, alertaId, toNumber);
  if (!twilio.ok) {
    const claimed = await supabase.rpc("oncall_claim_timeout", {
      p_id: alertaId,
      p_intento: alerta.intento,
    });
    if (claimed.data === true) {
      return placeCurrentHop(env, supabase, origin, alertaId, fallbackPhone);
    }
    await markFailed(supabase, alertaId);
    const latest = await loadAlerta(supabase, alertaId);
    if (latest) await maybeWriteHistorial(supabase, latest, "fallida");
    return "done";
  }

  await supabase
    .from("oncall_alertas")
    .update({ call_sid: twilio.sid ?? null, actualizada_en: nowIso })
    .eq("id", alertaId);

  const withSid = await loadAlerta(supabase, alertaId);
  if (withSid) await maybeWriteHistorial(supabase, withSid, "exitosa");
  return "watching";
}

export async function driveCascade(
  env: CascadeEnv,
  supabase: SupabaseClient,
  origin: string,
  alertaId: string,
  fallbackPhone: string | null
): Promise<void> {
  const started = Date.now();
  await placeCurrentHop(env, supabase, origin, alertaId, fallbackPhone);

  while (Date.now() - started < DRIVE_BUDGET_MS) {
    const row = await loadAlerta(supabase, alertaId);
    if (!row || isTerminal(row.estado)) return;

    await wait(5_000);
    const again = await loadAlerta(supabase, alertaId);
    if (!again || isTerminal(again.estado)) return;
    if (again.estado !== "CALLING") {
      await placeCurrentHop(env, supabase, origin, alertaId, fallbackPhone);
      continue;
    }

    const age = Date.now() - new Date(again.actualizada_en).getTime();
    if (age < ACK_WAIT_MS) continue;

    const { data: claimed } = await supabase.rpc("oncall_claim_timeout", {
      p_id: alertaId,
      p_intento: again.intento,
    });
    if (claimed === true) {
      await cancelCall(env, again.call_sid);
      await placeCurrentHop(env, supabase, origin, alertaId, fallbackPhone);
    }
  }
}

async function readTwilioForm(request: Request): Promise<URLSearchParams> {
  if (request.method !== "POST") {
    return new URL(request.url).searchParams;
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("form")) {
    const form = await request.formData();
    const params = new URLSearchParams();
    form.forEach((value, key) => {
      if (typeof value === "string") params.append(key, value);
    });
    return params;
  }
  return new URL(request.url).searchParams;
}

async function alertaFromSignedRequest(
  request: Request,
  env: CascadeEnv,
  supabase: SupabaseClient
): Promise<AlertaRow | null> {
  const url = new URL(request.url);
  const id = url.searchParams.get("a")?.trim() ?? "";
  const sig = url.searchParams.get("s")?.trim() ?? "";
  const secret = env.TWILIO_AUTH_TOKEN?.trim();
  if (!id || !sig || !secret) return null;
  if (!(await verifyIvr(secret, id, sig))) return null;
  return loadAlerta(supabase, id);
}

export async function handleIvrPrompt(
  request: Request,
  env: CascadeEnv,
  supabase: SupabaseClient
): Promise<Response> {
  const alerta = await alertaFromSignedRequest(request, env, supabase);
  if (!alerta) return twimlResponse(hangupTwiml());
  if (alerta.estado === "ACKNOWLEDGED") return twimlResponse(hangupTwiml());

  const secret = env.TWILIO_AUTH_TOKEN.trim();
  const sig = await signIvr(secret, alerta.id);
  const action = ivrUrls(callbackOrigin(request), alerta.id, sig).gather;
  const spoken = alerta.texto_voz.trim() || "Tienes una alerta crítica. Revisa el sistema ahora.";
  const markup =
    `<Response>` +
    `<Pause length="2"/>` +
    sayConchita("Atención. Mensaje de Wake Up Dev.") +
    `<Pause length="1"/>` +
    sayConchita(spoken) +
    `<Gather numDigits="1" timeout="${GATHER_TIMEOUT_SEC}" action="${escapeXml(action.toString())}" method="POST">` +
    sayConchita("Presione 1 para confirmar que recibió esta alerta.") +
    `</Gather>` +
    `<Hangup/>` +
    `</Response>`;
  return twimlResponse(markup);
}

export async function handleIvrCallback(
  request: Request,
  env: CascadeEnv,
  supabase: SupabaseClient
): Promise<Response> {
  const alerta = await alertaFromSignedRequest(request, env, supabase);
  if (!alerta) return twimlResponse(hangupTwiml());
  const form = await readTwilioForm(request);
  const digits = (form.get("Digits") ?? "").trim();
  if (digits === "1") {
    await supabase.rpc("oncall_marcar_ack", { p_id: alerta.id });
  }
  return twimlResponse(hangupTwiml());
}

export async function handleStatusCallback(
  request: Request,
  env: CascadeEnv,
  supabase: SupabaseClient,
  origin: string,
  fallbackByUsuario: (usuarioId: string) => Promise<string | null>
): Promise<Response> {
  const alerta = await alertaFromSignedRequest(request, env, supabase);
  if (!alerta) return new Response("ok", { status: 200 });
  if (isTerminal(alerta.estado)) return new Response("ok", { status: 200 });

  const form = await readTwilioForm(request);
  const callStatus = (form.get("CallStatus") ?? "").toLowerCase();
  const callSid = (form.get("CallSid") ?? "").trim();
  if (callStatus === "answered" && alerta.estado === "CALLING") {
    await supabase
      .from("oncall_alertas")
      .update({ actualizada_en: new Date().toISOString() })
      .eq("id", alerta.id)
      .eq("estado", "CALLING");
    return new Response("ok", { status: 200 });
  }
  const escalateStatuses = new Set([
    "completed",
    "busy",
    "failed",
    "no-answer",
    "canceled",
  ]);
  if (!escalateStatuses.has(callStatus)) {
    return new Response("ok", { status: 200 });
  }

  const latest = await loadAlerta(supabase, alerta.id);
  if (!latest || isTerminal(latest.estado) || latest.estado !== "CALLING") {
    return new Response("ok", { status: 200 });
  }
  if (latest.call_sid && callSid && latest.call_sid !== callSid) {
    return new Response("ok", { status: 200 });
  }
  const { data: claimed } = await supabase.rpc("oncall_claim_timeout", {
    p_id: latest.id,
    p_intento: latest.intento,
  });
  if (claimed === true) {
    const fallback = await fallbackByUsuario(latest.usuario_id);
    await placeCurrentHop(env, supabase, origin, latest.id, fallback);
  }
  return new Response("ok", { status: 200 });
}

export async function handleAmdCallback(
  request: Request,
  env: CascadeEnv,
  supabase: SupabaseClient,
  origin: string,
  fallbackByUsuario: (usuarioId: string) => Promise<string | null>
): Promise<Response> {
  if (!amdEnabled(env)) return new Response("ok", { status: 200 });
  const alerta = await alertaFromSignedRequest(request, env, supabase);
  if (!alerta || isTerminal(alerta.estado)) {
    return new Response("ok", { status: 200 });
  }
  const form = await readTwilioForm(request);
  const answeredBy = (form.get("AnsweredBy") ?? "").toLowerCase();
  if (answeredBy !== "machine_start" && answeredBy !== "fax") {
    return new Response("ok", { status: 200 });
  }
  const { data: claimed } = await supabase.rpc("oncall_claim_timeout", {
    p_id: alerta.id,
    p_intento: alerta.intento,
  });
  if (claimed === true) {
    await cancelCall(env, alerta.call_sid);
    const fallback = await fallbackByUsuario(alerta.usuario_id);
    await placeCurrentHop(env, supabase, origin, alerta.id, fallback);
  }
  return new Response("ok", { status: 200 });
}
