import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { handleBillingWebhook } from "./billing-webhook";
import {
  handleTransbankFinish,
  handleTransbankStart,
  renewDueInscriptions,
} from "./billing-transbank";
import { hmacSha256Hex } from "./webhook-signature";
import {
  driveCascade,
  handleAmdCallback,
  handleIvrCallback,
  handleIvrPrompt,
  handleStatusCallback,
} from "./oncall-cascade";
import { handleInternalNotify } from "./admin-notify";

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GROQ_API_KEY: string;
  GROQ_MODEL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  STRIPE_WEBHOOK_SECRET?: string;
  LEMON_SQUEEZY_SIGNING_SECRET?: string;
  BILLING_CREDITS_PRO?: string;
  BILLING_INTERNAL_SECRET?: string;
  API_KEY_PEPPER?: string;
  WEB_ORIGIN?: string;
  TRANSBANK_ENVIRONMENT?: string;
  TRANSBANK_ONECLICK_MALL_CC?: string;
  TRANSBANK_ONECLICK_STORE_CC?: string;
  TRANSBANK_ONECLICK_API_KEY?: string;
  TRANSBANK_API_KEY?: string;
  TRANSBANK_PLAN_CLP?: string;
  ENABLE_AMD?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ADMIN_NOTIFY_EMAIL?: string;
}

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const FALLBACK_VOICE_TEXT =
  "Alerta WakeUp Dev. Tienes una alerta crítica de infraestructura. Revisa tu servidor ahora.";
const GROQ_TIMEOUT_MS = 2500;

const PROMPT_SISTEMA =
  "Actúas como un operador de alarmas críticas para infraestructura de software. Resume el error en dos frases cortas en español, claras para escuchar por teléfono. Primera frase: qué se cayó o falló. Segunda: que el ingeniero de guardia debe revisar el sistema ahora. Sin markdown, sin comillas, sin listas.";

const LOCAL_WEB_ORIGINS = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

/** Dashboard en producción. env.WEB_ORIGIN se suma a esta lista. */
const PRODUCTION_WEB_ORIGINS = [
  "https://wakeupdev.com",
  "https://www.wakeupdev.com",
] as const;

function allowedOrigins(env: Env): Set<string> {
  const origins = new Set<string>([
    ...LOCAL_WEB_ORIGINS,
    ...PRODUCTION_WEB_ORIGINS,
  ]);
  const fromEnv = env.WEB_ORIGIN?.trim().replace(/\/$/, "");
  if (fromEnv) origins.add(fromEnv);
  return origins;
}

function corsHeadersFor(
  request: Request,
  env: Env
): Record<string, string> | null {
  const origin = request.headers.get("Origin");
  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    Vary: "Origin",
  };

  if (!origin) {
    return base;
  }

  if (!allowedOrigins(env).has(origin)) {
    return null;
  }

  return {
    ...base,
    "Access-Control-Allow-Origin": origin,
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function apiKeyLookupHashes(
  rawKey: string,
  pepper: string | undefined
): Promise<string[]> {
  const hashes = [await sha256Hex(rawKey)];
  const trimmed = pepper?.trim();
  if (trimmed) {
    hashes.unshift(await hmacSha256Hex(trimmed, rawKey));
  }
  return [...new Set(hashes)];
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeSpokenText(text: string): string {
  return text
    .replace(/[*_`#~\[\](){}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

function toE164(raw: string): string | null {
  const only = raw.trim().replace(/\D/g, "");
  if (only.length < 8 || only.length > 15) return null;
  const e164 = `+${only}`;
  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

const MAX_VOICE_REPEATS = 3;

function twimlResponse(markup: string): Response {
  return new Response(markup, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function sayEs(text: string): string {
  return `<Say voice="woman" language="es-MX">${text}</Say>`;
}

function sayEn(text: string): string {
  return `<Say voice="woman" language="en-US">${text}</Say>`;
}

function hangupTwiml(): string {
  return `<Response><Hangup/></Response>`;
}

async function signVoiceRepeat(
  secret: string,
  texto: string,
  repeatsLeft: number
): Promise<string> {
  return hmacSha256Hex(secret, `${texto}\n${repeatsLeft}`);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function buildVoiceTwiml(
  textoVoz: string,
  opts: { callbackOrigin: string; signSecret: string; repeatsLeft: number }
): Promise<string> {
  const spoken = escapeXml(textoVoz);
  const repeatsLeft = Math.max(0, Math.min(MAX_VOICE_REPEATS, opts.repeatsLeft));
  const intro =
    `<Pause length="2"/>` +
    sayEs("Atención. Mensaje de") +
    sayEn("Wake Up Dev.") +
    `<Pause length="1"/>` +
    sayEs(spoken);

  if (repeatsLeft <= 0) {
    return `<Response>${intro}</Response>`;
  }

  const sig = await signVoiceRepeat(opts.signSecret, textoVoz, repeatsLeft);
  const action = new URL("/v1/voice/repeat", opts.callbackOrigin);
  action.searchParams.set("m", textoVoz);
  action.searchParams.set("r", String(repeatsLeft));
  action.searchParams.set("s", sig);

  return (
    `<Response>` +
    intro +
    `<Gather numDigits="1" timeout="6" action="${escapeXml(action.toString())}">` +
    sayEs("Para repetir el mensaje, presione 1.") +
    `</Gather>` +
    `</Response>`
  );
}

async function handleVoiceRepeat(
  request: Request,
  env: Env
): Promise<Response> {
  const signSecret = env.TWILIO_AUTH_TOKEN?.trim();
  if (!signSecret) {
    return twimlResponse(hangupTwiml());
  }

  const url = new URL(request.url);
  const textoVoz = url.searchParams.get("m")?.trim() ?? "";
  const repeatsLeft = Number.parseInt(url.searchParams.get("r") ?? "0", 10);
  const sig = url.searchParams.get("s")?.trim() ?? "";
  if (!textoVoz || !sig || !Number.isInteger(repeatsLeft) || repeatsLeft <= 0) {
    return twimlResponse(hangupTwiml());
  }

  const expected = await signVoiceRepeat(signSecret, textoVoz, repeatsLeft);
  if (!timingSafeEqual(sig.toLowerCase(), expected.toLowerCase())) {
    return twimlResponse(hangupTwiml());
  }

  let digits = "";
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("form")) {
      const form = await request.formData();
      digits = String(form.get("Digits") ?? "").trim();
    }
  }
  if (!digits) {
    digits = url.searchParams.get("Digits")?.trim() ?? "";
  }

  if (digits !== "1") {
    return twimlResponse(hangupTwiml());
  }

  const callbackOrigin = `${url.protocol}//${url.host}`;
  const markup = await buildVoiceTwiml(textoVoz, {
    callbackOrigin,
    signSecret,
    repeatsLeft: repeatsLeft - 1,
  });
  return twimlResponse(markup);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function voiceConfigReady(env: Env): boolean {
  return Boolean(
    env.TWILIO_ACCOUNT_SID?.trim() &&
      env.TWILIO_AUTH_TOKEN?.trim() &&
      env.TWILIO_PHONE_NUMBER?.trim()
  );
}

async function sintetizarConGroq(
  env: Env,
  textoOriginal: string
): Promise<{ texto: string; groq_degraded: boolean }> {
  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
          messages: [
            { role: "system", content: PROMPT_SISTEMA },
            {
              role: "user",
              content: `Traduce esto a lenguaje hablado de emergencia: ${textoOriginal}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 160,
        }),
        signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
      }
    );

    if (!groqResponse.ok) {
      return { texto: FALLBACK_VOICE_TEXT, groq_degraded: true };
    }

    const groqJson = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = groqJson.choices?.[0]?.message?.content?.trim();
    const texto = content
      ? sanitizeSpokenText(content) || FALLBACK_VOICE_TEXT
      : FALLBACK_VOICE_TEXT;
    return { texto, groq_degraded: !content };
  } catch {
    return { texto: FALLBACK_VOICE_TEXT, groq_degraded: true };
  }
}

type UsuarioAlerta = {
  telefono_verificado: string | null;
  creditos_disponibles: number;
};

async function despacharTwilio(
  env: Env,
  telefonoVerificado: string,
  textoVoz: string,
  callbackOrigin: string
): Promise<{
  ok: true;
  sid?: string;
} | {
  ok: false;
  reason?: string;
  code?: number;
  message?: string;
}> {
  const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = toE164(env.TWILIO_PHONE_NUMBER ?? "");
  const toNumber = toE164(telefonoVerificado);

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.error("twilio_config_invalid", {
      has_sid: Boolean(accountSid),
      has_token: Boolean(authToken),
      has_from: Boolean(fromNumber),
      has_to: Boolean(toNumber),
    });
    return { ok: false, reason: "invalid_voice_config" };
  }

  const twimlMarkup = await buildVoiceTwiml(textoVoz, {
    callbackOrigin,
    signSecret: authToken,
    repeatsLeft: MAX_VOICE_REPEATS,
  });
  const twilioFormData = new URLSearchParams();
  twilioFormData.append("To", toNumber);
  twilioFormData.append("From", fromNumber);
  twilioFormData.append("Twiml", twimlMarkup);

  try {
    const twilioAuth = btoa(`${accountSid}:${authToken}`);
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: twilioFormData.toString(),
      }
    );

    let twilioJson: {
      status?: string;
      sid?: string;
      code?: number;
      message?: string;
    } = {};
    try {
      twilioJson = (await twilioResponse.json()) as typeof twilioJson;
    } catch {
      twilioJson = {};
    }

    if (!twilioResponse.ok || twilioJson.status === "failed") {
      console.error("twilio_dispatch_failed", {
        http: twilioResponse.status,
        code: twilioJson.code,
      });
      return {
        ok: false,
        reason: "twilio_rejected",
        code: twilioJson.code,
        message: twilioJson.message,
      };
    }

    const sid = twilioJson.sid;
    if (sid) {
      await wait(2500);
      const statusRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${sid}.json`,
        { headers: { Authorization: `Basic ${twilioAuth}` } }
      );
      if (statusRes.ok) {
        const live = (await statusRes.json()) as {
          status?: string;
          error_code?: number | string;
          error_message?: string;
        };
        if (live.status === "failed" || live.status === "canceled") {
          console.error("twilio_call_dropped", {
            status: live.status,
            code: live.error_code,
          });
          return {
            ok: false,
            reason: "twilio_rejected",
            code:
              typeof live.error_code === "number"
                ? live.error_code
                : Number(live.error_code) || undefined,
            message: live.error_message || "La llamada se creó pero no llegó a sonar.",
          };
        }
      }
    }

    return { ok: true, sid };
  } catch (err) {
    console.error("twilio_dispatch_throw", {
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, reason: "twilio_network" };
  }
}

function createServiceClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "wakeup-dev" }, 200, {});
    }

    if (url.pathname === "/v1/billing/webhook") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleBillingWebhook(request, env, createServiceClient(env));
    }

    if (url.pathname === "/v1/billing/transbank/start") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleTransbankStart(request, env);
    }

    if (url.pathname === "/v1/billing/transbank/finish") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleTransbankFinish(request, env);
    }

    if (url.pathname === "/v1/internal/notify") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleInternalNotify(request, env, createServiceClient(env));
    }

    if (url.pathname === "/v1/voice/repeat") {
      if (request.method !== "POST" && request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleVoiceRepeat(request, env);
    }

    if (url.pathname === "/v1/twilio/ivr-prompt") {
      if (request.method !== "POST" && request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleIvrPrompt(request, env, createServiceClient(env));
    }

    if (url.pathname === "/v1/twilio/ivr-callback") {
      if (request.method !== "POST" && request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      return handleIvrCallback(request, env, createServiceClient(env));
    }

    if (url.pathname === "/v1/twilio/status-callback") {
      if (request.method !== "POST" && request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      const supabase = createServiceClient(env);
      return handleStatusCallback(
        request,
        env,
        supabase,
        url.origin,
        async (usuarioId) => {
          const { data } = await supabase
            .from("usuarios")
            .select("telefono_verificado")
            .eq("id", usuarioId)
            .maybeSingle();
          return (data?.telefono_verificado as string | null) ?? null;
        }
      );
    }

    if (url.pathname === "/v1/twilio/amd-callback") {
      if (request.method !== "POST" && request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed" }, 405, {});
      }
      const supabase = createServiceClient(env);
      return handleAmdCallback(
        request,
        env,
        supabase,
        url.origin,
        async (usuarioId) => {
          const { data } = await supabase
            .from("usuarios")
            .select("telefono_verificado")
            .eq("id", usuarioId)
            .maybeSingle();
          return (data?.telefono_verificado as string | null) ?? null;
        }
      );
    }

    const corsHeaders = corsHeadersFor(request, env);

    if (request.method === "OPTIONS") {
      if (!corsHeaders) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (!corsHeaders) {
      return jsonResponse({ error: "Origin not allowed" }, 403, {});
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (url.pathname !== "/v1/alert") {
      return jsonResponse({ error: "Endpoint not found" }, 404, corsHeaders);
    }

    try {
      const apiKey = request.headers.get("x-api-key")?.trim();
      if (!apiKey) {
        return jsonResponse(
          { error: "Missing x-api-key header" },
          401,
          corsHeaders
        );
      }

      if (!env.SUPABASE_URL?.trim() || !env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
        console.error("alert_unhandled", { message: "missing_supabase_env" });
        return jsonResponse(
          { error: "Database not configured" },
          503,
          corsHeaders
        );
      }

      if (!voiceConfigReady(env)) {
        console.error("alert_unhandled", { message: "missing_twilio_env" });
        return jsonResponse(
          { error: "Voice provider not configured" },
          503,
          corsHeaders
        );
      }

      const supabase = createServiceClient(env);
      const keyHashes = await apiKeyLookupHashes(apiKey, env.API_KEY_PEPPER);

      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("usuario_id, activa")
        .in("key_hash", keyHashes)
        .eq("activa", true)
        .maybeSingle();

      if (keyError || !keyData || !keyData.activa) {
        return jsonResponse(
          { error: "Invalid or inactive API key" },
          401,
          corsHeaders
        );
      }

      const usuarioId = keyData.usuario_id as string;

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("telefono_verificado, creditos_disponibles")
        .eq("id", usuarioId)
        .single();

      const usuario = usuarioData as UsuarioAlerta | null;

      if (usuarioError || !usuario) {
        return jsonResponse(
          { error: "User profile not found" },
          404,
          corsHeaders
        );
      }

      const telefonoVerificado: string = (
        usuario.telefono_verificado ?? ""
      ).trim();
      const telefonoE164 = toE164(telefonoVerificado);

      const { count: rosterCount } = await supabase
        .from("oncall_miembros")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", usuarioId)
        .eq("activo", true);

      if (!telefonoE164 && (rosterCount ?? 0) < 1) {
        return jsonResponse(
          {
            error:
              "No verified emergency phone number configured. Use E.164, e.g. +56912345678.",
          },
          400,
          corsHeaders
        );
      }

      if (usuario.creditos_disponibles <= 0) {
        return jsonResponse(
          { error: "Insufficient credits. Refill required." },
          402,
          corsHeaders
        );
      }

      const textoOriginal = (await request.text()).slice(0, 4000);

      let nuevosCreditos: unknown = usuario.creditos_disponibles;
      try {
        const { data, error: rpcError } = await supabase.rpc(
          "consumir_credito",
          { p_usuario_id: usuarioId }
        );
        if (rpcError) {
          throw rpcError;
        }
        nuevosCreditos = data;
      } catch (err) {
        console.error("alert_credit_failed", {
          usuario_id: usuarioId,
          error: err instanceof Error ? err.message : String(err),
        });
        return jsonResponse(
          { error: "Insufficient credits. Refill required." },
          402,
          corsHeaders
        );
      }

      const { data: alertaRow, error: alertaError } = await supabase
        .from("oncall_alertas")
        .insert({
          usuario_id: usuarioId,
          estado: "TRIGGERED",
          orden_actual: 1,
          intento: 1,
          texto_original: textoOriginal.slice(0, 1500),
          texto_voz: FALLBACK_VOICE_TEXT,
        })
        .select("id")
        .maybeSingle();

      if (alertaError || !alertaRow?.id) {
        console.error("oncall_alerta_insert_failed", {
          message: alertaError?.message,
        });
        return jsonResponse(
          {
            error:
              "Falta aplicar la migración oncall_alertas en Supabase.",
          },
          503,
          corsHeaders
        );
      }

      const alertaId = alertaRow.id as string;
      const fallbackPhone = telefonoE164;
      ctx.waitUntil(
        (async () => {
          const { texto: textoGroq } = await sintetizarConGroq(
            env,
            textoOriginal
          );
          await supabase
            .from("oncall_alertas")
            .update({ texto_voz: textoGroq })
            .eq("id", alertaId);
          await driveCascade(
            env,
            supabase,
            url.origin,
            alertaId,
            fallbackPhone
          );
        })().catch((err) => {
          console.error("oncall_cascade_unhandled", {
            alerta_id: alertaId,
            message: err instanceof Error ? err.message : String(err),
          });
        })
      );

      return jsonResponse(
        {
          accepted: true,
          success: true,
          estado: "TRIGGERED",
          alerta_id: alertaId,
          estado_llamada: "aceptada",
          creditos_restantes:
            typeof nuevosCreditos === "number"
              ? nuevosCreditos
              : Number(nuevosCreditos),
          aviso:
            "Cascada iniciada. Presione 1 para confirmar. Si no hay acuse, se llama al siguiente.",
        },
        202,
        corsHeaders
      );
    } catch (err) {
      console.error("alert_unhandled", {
        message: err instanceof Error ? err.message : String(err),
      });
      return jsonResponse(
        { error: "Internal system fault" },
        500,
        corsHeaders
      );
    }
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(
      renewDueInscriptions(env)
        .then((result) => {
          console.info("transbank_renew_done", result);
        })
        .catch((err) => {
          console.error("transbank_renew_unhandled", {
            message: err instanceof Error ? err.message : String(err),
          });
        })
    );
  },
};
