/**
 * Cerebro de IA para respuestas WhatsApp (OpenAI o Groq vía REST).
 * Solo responde con el contexto oficial de Senior Safe.
 */

export const SENIOR_SAFE_SUPPORT_EMAIL = "soporte@alarmaseniorsafe.cl";

export const SENIOR_SAFE_OFFICIAL_CONTEXT = `
Senior Safe es una aplicación de teleasistencia para adultos mayores que funciona con un solo botón en el celular y notifica en menos de 3 segundos a 3 guardianes por llamada, WhatsApp y SMS con GPS satelital.

Precio: Plan Único de $6.900 pesos chilenos al mes o $69.000 al año (ahorrando 2 meses), pagado vía Webpay Plus.

Tras pagar, la web obliga a escanear un QR para instalar la PWA en el teléfono y hacer un simulacro de entrenamiento a costo $0 de Twilio.

No hay días de prueba gratis.

Sitio: https://alarmaseniorsafe.cl
`.trim();

const WHATSAPP_SYSTEM_PROMPT = `Eres el asistente de WhatsApp de Senior Safe (Alarma Senior Safe), teleasistencia para adultos mayores en Chile.

REGLAS ESTRICTAS:
1) Solo puedes responder usando ÚNICAMENTE la información del CONTEXTO OFICIAL abajo. No inventes funciones, precios, plazos ni políticas.
2) Si la pregunta no puede responderse con ese contexto (cuentas, reembolsos, fallas técnicas, cambio de plan, datos personales, etc.), responde en español, tono amable y breve, indicando que escriban a ${SENIOR_SAFE_SUPPORT_EMAIL} para asistencia manual. No des otros correos ni teléfonos.
3) Máximo 2 párrafos cortos. Sin markdown. Emojis máximo 2. Ideal para WhatsApp (< 900 caracteres).
4) Si preguntan cómo activar WhatsApp, indica que respondan ACTIVAR en este chat tras contratar.
5) Si es emergencia real, indica llamar a emergencias (131) y usar el botón de pánico en la app; no digas que este chat envía alertas.

CONTEXTO OFICIAL:
${SENIOR_SAFE_OFFICIAL_CONTEXT}`;

const EMAIL_SYSTEM_PROMPT = `Eres el asistente de correo institucional de Senior Safe (Alarma Senior Safe), teleasistencia para adultos mayores en Chile.

REGLAS ESTRICTAS:
1) Solo puedes responder usando ÚNICAMENTE la información del CONTEXTO OFICIAL abajo. No inventes funciones, precios, plazos ni políticas.
2) Si la pregunta no puede responderse con ese contexto (cuentas, reembolsos, fallas técnicas, cambio de plan, datos personales, facturación, etc.), responde en español formal y amable indicando que para gestión manual pueden responder a este mismo correo (${SENIOR_SAFE_SUPPORT_EMAIL}) con el detalle de su caso. No inventes plazos de respuesta.
3) Tono institucional, cordial, en segunda persona (usted). Sin emojis. Sin markdown. 2 a 4 párrafos breves separados por línea en blanco.
4) Si preguntan cómo activar WhatsApp tras contratar, indique que envíen ACTIVAR al WhatsApp vinculado en la app.
5) Si mencionan emergencia médica activa, indique llamar al 131 y usar el botón de pánico en la app instalada; este correo no despacha alertas en tiempo real.

CONTEXTO OFICIAL:
${SENIOR_SAFE_OFFICIAL_CONTEXT}`;

type AiProvider = "groq" | "openai";

function resolveProvider(): { provider: AiProvider; apiKey: string; model: string } | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      provider: "groq",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  return null;
}

function trimForWhatsApp(text: string, max = 950): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

/** Respuesta estática si no hay API key configurada. */
function fallbackReply(userMessage: string): string {
  const q = userMessage.toLowerCase();
  const base = "Senior Safe 🛡️\n";

  if (/precio|cuanto cuesta|valor|plan|pago|webpay|\$|6900|69\.?000/.test(q)) {
    return (
      base +
      "Plan Único: $6.900/mes o $69.000/año (ahorras 2 meses), pago con Webpay Plus en alarmaseniorsafe.cl. Sin prueba gratis."
    );
  }
  if (/prueba|trial|gratis|demo/.test(q)) {
    return base + "No ofrecemos días de prueba gratis. Tras pagar puedes hacer un simulacro de entrenamiento sin costo Twilio.";
  }
  if (/como funciona|que es|servicio|app/.test(q)) {
    return (
      base +
      "Un botón en el celular avisa en menos de 3 s a 3 guardianes por llamada, WhatsApp y SMS con GPS. Contrata en alarmaseniorsafe.cl."
    );
  }
  if (/instal|qr|pwa|app/.test(q)) {
    return (
      base +
      "Tras pagar debes escanear el QR para instalar la app en el teléfono y completar el simulacro de entrenamiento."
    );
  }
  if (/activar|whatsapp/.test(q)) {
    return base + "Si ya contrataste, responde ACTIVAR en este chat para vincular tus alertas por WhatsApp.";
  }

  return (
    base +
    `Gracias por escribirnos. Para ayuda personalizada escribe a ${SENIOR_SAFE_SUPPORT_EMAIL}.`
  );
}

async function callChatApi(
  cfg: { provider: AiProvider; apiKey: string; model: string },
  userMessage: string,
  systemPrompt: string,
  maxTokens: number,
): Promise<string> {
  const url =
    cfg.provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.25,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage.slice(0, 4000) },
      ],
    }),
  });

  const raw = await res.text();
  let data: { choices?: { message?: { content?: string } }[]; error?: { message?: string } } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error(`IA respuesta inválida (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.error?.message || `IA error ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("IA sin contenido");
  return trimForWhatsApp(content);
}

/**
 * Genera respuesta para pregunta de texto libre (WhatsApp).
 */
export async function generateSeniorSafeWhatsAppReply(userMessage: string): Promise<string> {
  const trimmed = (userMessage || "").trim();
  if (!trimmed) {
    return `Senior Safe 🛡️\n¿En qué te ayudamos? Pregunta por el servicio o escribe a ${SENIOR_SAFE_SUPPORT_EMAIL}.`;
  }

  const cfg = resolveProvider();
  if (!cfg) {
    return fallbackReply(trimmed);
  }

  try {
    const reply = await callChatApi(cfg, trimmed, WHATSAPP_SYSTEM_PROMPT, 320);
    if (!reply.toLowerCase().includes(SENIOR_SAFE_SUPPORT_EMAIL) && looksOutOfScope(trimmed)) {
      return (
        `Senior Safe 🛡️\n${reply}\n\nSi necesitas más ayuda, escribe a ${SENIOR_SAFE_SUPPORT_EMAIL}.`
      ).slice(0, 980);
    }
    return `Senior Safe 🛡️\n${reply}`.slice(0, 980);
  } catch (e) {
    console.error("[senior-safe-ai]", e);
    return fallbackReply(trimmed);
  }
}

function trimForEmail(text: string, max = 3500): string {
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

function fallbackEmailReply(userMessage: string): string {
  const plain = fallbackReply(userMessage).replace(/^Senior Safe 🛡️\n?/, "").trim();
  return plain
    .replace(/ACTIVAR en este chat/gi, "ACTIVAR por WhatsApp desde la app")
    .replace(/escribe a/gi, "escriba a");
}

/**
 * Genera respuesta institucional para correo de soporte (texto plano, párrafos).
 */
export async function generateSeniorSafeEmailReply(
  userMessage: string,
  subject?: string,
): Promise<string> {
  const trimmed = (userMessage || "").trim();
  const subjectHint = subject?.trim() ? `\n\nAsunto del correo: ${subject.trim()}` : "";

  if (!trimmed) {
    return (
      "Gracias por contactar a Senior Safe.\n\n" +
      "Indíquenos su consulta sobre el servicio (contratación, instalación de la app o funcionamiento) " +
      `y con gusto le orientaremos. También puede visitar https://alarmaseniorsafe.cl`
    );
  }

  const cfg = resolveProvider();
  const prompt = `${trimmed}${subjectHint}`;

  if (!cfg) {
    return fallbackEmailReply(trimmed);
  }

  try {
    const reply = await callChatApi(cfg, prompt, EMAIL_SYSTEM_PROMPT, 520);
    let text = trimForEmail(reply.replace(/Senior Safe 🛡️/g, "").trim());
    if (!text) return fallbackEmailReply(trimmed);
    if (looksOutOfScope(trimmed) && !text.toLowerCase().includes(SENIOR_SAFE_SUPPORT_EMAIL)) {
      text += `\n\nPara gestión personalizada de su caso, responda a este correo (${SENIOR_SAFE_SUPPORT_EMAIL}) con los detalles y su número de teléfono registrado.`;
    }
    return text;
  } catch (e) {
    console.error("[senior-safe-ai] email", e);
    return fallbackEmailReply(trimmed);
  }
}

/** Heurística: temas que casi seguro requieren soporte humano. */
function looksOutOfScope(text: string): boolean {
  return /reembolso|cancelar suscri|mi cuenta|no funciona|error|factura|boleta|cambiar numero|eliminar|datos personales|hablar con|soporte|humano|agente/i.test(
    text,
  );
}
