/**
 * Cerebro de IA para respuestas WhatsApp (OpenAI o Groq vía REST).
 * Solo responde con el contexto oficial de Senior Safe.
 */

export const SENIOR_SAFE_SUPPORT_EMAIL = "hola@alarmaseniorsafe.cl";
export const SENIOR_SAFE_COMMERCIAL_EMAIL = SENIOR_SAFE_SUPPORT_EMAIL;
export const TRIGGER_TECHNICAL_EMAIL_REDIRECT = "TRIGGER_TECHNICAL_EMAIL_REDIRECT";

export const SENIOR_SAFE_OFFICIAL_CONTEXT = `
RESUMEN
Senior Safe no es un dispositivo físico adicional: es un ecosistema de protección inteligente basado en una aplicación para smartphone. Usa IA, los sensores del teléfono y comunicación redundante para alertar a la familia de inmediato ante caídas o emergencias. Conecta directamente al usuario con hasta 10 guardianes familiares priorizados. No hay call-center ni intermediarios humanos en las alertas.

Contratación: https://alarmaseniorsafe.cl — pago seguro con Webpay Plus (crédito, débito o prepago).
Tras pagar: instalar la PWA en el teléfono y practicar el flujo en simulación segura. No hay días de prueba gratis.
Activación WhatsApp tras contratar: responder ACTIVAR en el chat comercial de Senior Safe.

FAQ — FUNCIONAMIENTO

P: ¿Qué es exactamente Senior Safe?
R: Un ecosistema de protección inteligente en el smartphone (no collar ni aparato extra). IA + sensores del teléfono + alertas multicanal a la familia ante caídas o emergencias.

P: ¿Cómo funciona la alerta en cascada?
R: Cuatro canales en tiempo real: (A) WhatsApp + IA que procesa confirmaciones de lectura; (B) SMS de respaldo simultáneo; (C) GPS en vivo con enlace Google Maps; (D) llamadas de voz automáticas y secuenciales a guardianes si nadie confirma en los primeros segundos.

P: ¿A quién notifica?
R: Directamente al núcleo familiar, sin centrales externas. Hasta 10 guardianes (hijos, nietos, vecinos, cuidadores) con orden de prioridad inteligente.

P: ¿Cuánto tarda la alerta?
R: Menos de 3 segundos desde el impacto detectado o el botón SOS hasta la primera notificación a la red familiar.

FAQ — CAÍDAS Y EMERGENCIAS

P: ¿Cómo funciona la detección automática de caídas?
R: (1) Monitoreo G: acelerómetro detecta impactos abruptos (>3.8G). (2) Validación de inmovilidad: 3 segundos de quietud para evitar falsos positivos. (3) Alerta progresiva: vibra y sirena 30 s; el usuario puede cancelar; si no responde, se despacha la ayuda.

P: ¿Qué pasa si no puede presionar el botón?
R: Si hay caída crítica seguida de inmovilidad, la alerta se envía de forma autónoma, incluso si queda inconsciente o en shock.

P: ¿El GPS funciona fuera de casa?
R: Sí. Coordenadas satelitales en vivo dentro del hogar, caminando, compras o terreno abierto.

FAQ — USO DIARIO

P: ¿Es difícil para un adulto mayor?
R: No. Diseño "Senior-First": botones grandes, textos claros, acciones visibles, operable en segundos sin complicaciones.

P: ¿Qué requisitos tiene el teléfono?
R: Solo un smartphone compatible. Al contratar recibe instrucciones paso a paso. No requiere aparatos ni collares adicionales.

FAQ — PLANES Y PAGOS

P: ¿Cuánto cuesta?
R: Plan Único: $6.900/mes o $69.000/año (ahorras 2 meses). Protección completa incluida.

P: ¿Hay permanencia o contrato de amarre?
R: No. Cancelación simple, sin permanencia, multas ni explicaciones.

P: ¿Medios de pago?
R: 100% en línea con Webpay Plus: tarjetas de crédito, débito o prepago.

FAQ — SOPORTE

P: ¿Tienen atención por dudas?
R: Sí. El Plan Único incluye soporte prioritario 24/7 para configuración de guardianes y la app. WhatsApp comercial o correo ${SENIOR_SAFE_SUPPORT_EMAIL}.

Para gestión de cuenta, reembolsos, facturación o fallas técnicas específicas de un caso: derivar a ${SENIOR_SAFE_SUPPORT_EMAIL} con detalle del caso.
`.trim();

export type WhatsAppInboundRoute = "EMERGENCY_ACK" | "COMMERCIAL_QUERY";

const WHATSAPP_ROUTER_SYSTEM_PROMPT = `Eres un enrutador binario estricto para mensajes entrantes de WhatsApp de Senior Safe (Chile).

Clasifica el mensaje del usuario en EXACTAMENTE una etiqueta:

EMERGENCY_ACK — El remitente es un guardián o familiar respondiendo a una alerta de emergencia activa: confirma recepción, indica que va en camino, que ya está con la persona, falsa alarma, que todo está bien, o atiende la situación. Ejemplos: "Yo voy", "Estoy con él", "Falsa alarma todo bien", "Ya llegué", "Voy para allá", "Todo controlado".

COMMERCIAL_QUERY — Pregunta comercial, duda sobre el servicio, precios, instalación, sensores, planes, contratación, o mensaje sin contexto de emergencia activa. Ejemplos: "¿Cuánto cuesta?", "¿Cómo funciona el sensor de caídas?", "Hola quiero información".

Responde ÚNICAMENTE con la etiqueta literal EMERGENCY_ACK o COMMERCIAL_QUERY, sin comillas ni texto adicional.`;

const WHATSAPP_SYSTEM_PROMPT = `Eres el asistente comercial de WhatsApp de Senior Safe, ecosistema inteligente de protección familiar en Chile.

TONO (muy importante):
- Cálido, amigable y humano. Hablas como alguien de confianza que entiende la preocupación por un adulto mayor querido.
- Usa "tú", frases cercanas y empáticas. Ejemplos de apertura: "¡Qué bueno que nos escribes!", "Con gusto te cuento", "Entiendo tu preocupación".
- Transmite tranquilidad y claridad, sin sonar robótico ni demasiado formal.
- Puedes usar 1 emoji suave al inicio o al cierre (🛡️, 😊, 💙) además del que ya lleva la marca.

REGLAS ESTRICTAS:
1) Solo responde con el CONTEXTO OFICIAL y el FAQ. No inventes funciones, precios ni políticas.
2) Si la pregunta coincide con una entrada del FAQ, usa esa respuesta con tono cálido y breve para WhatsApp.
3) Enfatiza con naturalidad: Plan Único $6.900/mes, alertas directo a la familia, sin call-center en las emergencias.
4) Máximo 2 párrafos cortos. Sin markdown. Ideal para WhatsApp (< 900 caracteres).
5) Si preguntan activación WhatsApp tras contratar, indica responder ACTIVAR en este chat.
6) Si mencionan emergencia médica activa, con calma indica llamar al 131 y usar la app instalada; este chat no despacha alertas en tiempo real.
7) Para soporte general, invita amablemente a escribir por WhatsApp o a ${SENIOR_SAFE_COMMERCIAL_EMAIL}.
8) Si la pregunta es técnica (cuenta, reembolsos, fallas, facturación, datos personales, configuración avanzada de un caso concreto) y NO puedes responderla con el CONTEXTO OFICIAL, responde ÚNICAMENTE y EXACTAMENTE esta cadena sin ningún otro carácter: ${TRIGGER_TECHNICAL_EMAIL_REDIRECT}

CONTEXTO OFICIAL:
${SENIOR_SAFE_OFFICIAL_CONTEXT}`;

const EMAIL_SYSTEM_PROMPT = `Eres el asistente de correo de Senior Safe (Alarma Senior Safe), protección familiar para adultos mayores en Chile.

TONO:
- Cálido, amigable y respetuoso. Puedes usar "usted" o "tú" según el tono del correo entrante, pero siempre cercano y humano.
- Empatía hacia familias que buscan cuidar a un ser querido. Sin frialdad institucional.

REGLAS ESTRICTAS:
1) Solo puedes responder usando ÚNICAMENTE la información del CONTEXTO OFICIAL y el FAQ. No inventes funciones, precios, plazos ni políticas.
2) Si la pregunta no puede responderse con ese contexto (cuentas, reembolsos, fallas técnicas, cambio de plan, datos personales, facturación, etc.), responde con amabilidad indicando que pueden responder a este mismo correo (${SENIOR_SAFE_SUPPORT_EMAIL}) con el detalle de su caso. No inventes plazos de respuesta.
3) Sin emojis. Sin markdown. 2 a 4 párrafos breves separados por línea en blanco.
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
      "¡Con gusto! El Plan Único cuesta $6.900 al mes o $69.000 al año (ahorras 2 meses). Pagas seguro con Webpay en alarmaseniorsafe.cl 😊"
    );
  }
  if (/prueba|trial|gratis|demo/.test(q)) {
    return (
      base +
      "Por ahora no tenemos días de prueba gratis, pero tras contratar puedes hacer un simulacro de entrenamiento sin costo extra. ¿Te ayudo con algo más?"
    );
  }
  if (/como funciona|que es|servicio|app/.test(q)) {
    return (
      base +
      "Senior Safe es una app en el celular que avisa a tu familia en menos de 3 segundos por llamada, WhatsApp y SMS, con GPS incluido. Puedes contratar en alarmaseniorsafe.cl 💙"
    );
  }
  if (/instal|qr|pwa|app/.test(q)) {
    return (
      base +
      "Después de pagar, escaneas el QR para instalar la app en el teléfono y haces un simulacro guiado. ¡Es más fácil de lo que parece!"
    );
  }
  if (/activar|whatsapp/.test(q)) {
    return base + "Si ya contrataste, responde ACTIVAR en este chat y te ayudamos a vincular tus alertas por WhatsApp 😊";
  }

  if (looksOutOfScope(q)) {
    return base + TRIGGER_TECHNICAL_EMAIL_REDIRECT;
  }

  return (
    base +
    `¡Gracias por escribirnos! Si necesitas ayuda, escríbenos a ${SENIOR_SAFE_COMMERCIAL_EMAIL} con gusto te orientamos.`
  );
}

function formatWhatsAppCommercialReply(rawReply: string, userMessage: string): string {
  if (rawReply.includes(TRIGGER_TECHNICAL_EMAIL_REDIRECT)) {
    return (
      `Senior Safe 🛡️\nPara ayudarte bien con este tema, escríbenos con el detalle a ${SENIOR_SAFE_COMMERCIAL_EMAIL} ` +
      "y con gusto te orientamos por correo 😊"
    );
  }

  const reply = rawReply.trim();
  if (!reply.toLowerCase().includes(SENIOR_SAFE_COMMERCIAL_EMAIL) && looksOutOfScope(userMessage)) {
    return (
      `Senior Safe 🛡️\n${reply}\n\nSi quieres, también puedes escribirnos a ${SENIOR_SAFE_COMMERCIAL_EMAIL} y te ayudamos con gusto.`
    ).slice(0, 980);
  }

  return `Senior Safe 🛡️\n${reply}`.slice(0, 980);
}

async function callChatApi(
  cfg: { provider: AiProvider; apiKey: string; model: string },
  userMessage: string,
  systemPrompt: string,
  maxTokens: number,
  temperature = 0.25,
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
      temperature,
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

function parseInboundRoute(raw: string): WhatsAppInboundRoute | null {
  const t = raw.trim().toUpperCase();
  if (t.includes("EMERGENCY_ACK")) return "EMERGENCY_ACK";
  if (t.includes("COMMERCIAL_QUERY")) return "COMMERCIAL_QUERY";
  return null;
}

function fallbackInboundRoute(userMessage: string): WhatsAppInboundRoute {
  const q = userMessage.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (
    /\b(yo voy|voy para|en camino|estoy con|ya llegue|falsa alarma|todo bien|todo controlado|ya recibi|recibido|confirmo|voy a ver|estoy yendo)\b/.test(
      q,
    )
  ) {
    return "EMERGENCY_ACK";
  }
  return "COMMERCIAL_QUERY";
}

/**
 * Clasifica mensaje entrante: ack de emergencia vs consulta comercial (Groq llama-3.3-70b-versatile).
 */
export async function classifyWhatsAppInboundMessage(
  userMessage: string,
): Promise<WhatsAppInboundRoute> {
  const trimmed = (userMessage || "").trim();
  if (!trimmed) return "COMMERCIAL_QUERY";

  const cfg = resolveProvider();
  if (!cfg) return fallbackInboundRoute(trimmed);

  try {
    const label = await callChatApi(cfg, trimmed, WHATSAPP_ROUTER_SYSTEM_PROMPT, 16);
    return parseInboundRoute(label) ?? fallbackInboundRoute(trimmed);
  } catch (e) {
    console.error("[senior-safe-ai] classify", e);
    return fallbackInboundRoute(trimmed);
  }
}

/**
 * Genera respuesta para pregunta de texto libre (WhatsApp).
 */
export async function generateSeniorSafeWhatsAppReply(userMessage: string): Promise<string> {
  const trimmed = (userMessage || "").trim();
  if (!trimmed) {
    return `Senior Safe 🛡️\n¡Hola! ¿En qué te podemos ayudar hoy? Cuéntanos tu duda o escríbenos a ${SENIOR_SAFE_COMMERCIAL_EMAIL} 😊`;
  }

  const cfg = resolveProvider();
  if (!cfg) {
    const fallback = fallbackReply(trimmed);
    if (fallback.includes(TRIGGER_TECHNICAL_EMAIL_REDIRECT)) {
      return formatWhatsAppCommercialReply(fallback, trimmed);
    }
    return fallback;
  }

  try {
    const reply = await callChatApi(cfg, trimmed, WHATSAPP_SYSTEM_PROMPT, 320, 0.42);
    return formatWhatsAppCommercialReply(reply, trimmed);
  } catch (e) {
    console.error("[senior-safe-ai]", e);
    const fallback = fallbackReply(trimmed);
    if (fallback.includes(TRIGGER_TECHNICAL_EMAIL_REDIRECT)) {
      return formatWhatsAppCommercialReply(fallback, trimmed);
    }
    return fallback;
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
    const reply = await callChatApi(cfg, prompt, EMAIL_SYSTEM_PROMPT, 520, 0.38);
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
