/**
 * Cerebro de IA para respuestas WhatsApp (OpenAI o Groq vía REST).
 * Solo responde con el contexto oficial de Senior Safe.
 */

import { SENIOR_SAFE_INSTALL_GUIDE_URL } from "@/lib/app-url";
import { SENIOR_SAFE_CHECKOUT_URL } from "@/lib/whatsapp-commercial-activation";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeTwilioPhone } from "@/lib/twilio-inbound";
import {
  CANCELLATION_POLICY_SUMMARY,
  CANCELLATION_TERMS_WHATSAPP_REPLY,
  SENIOR_SAFE_TERMS_CANCELLATION_URL,
} from "@/lib/subscription-cancellation-policy";

export const SENIOR_SAFE_SUPPORT_EMAIL = "hola@alarmaseniorsafe.cl";
export const SENIOR_SAFE_COMMERCIAL_EMAIL = SENIOR_SAFE_SUPPORT_EMAIL;
export const TRIGGER_TECHNICAL_EMAIL_REDIRECT = "TRIGGER_TECHNICAL_EMAIL_REDIRECT";

export const SENIOR_SAFE_OFFICIAL_CONTEXT = `
RESUMEN
Senior Safe no es un dispositivo físico adicional: es un ecosistema de protección inteligente basado en una aplicación para smartphone. Usa IA, los sensores del teléfono y comunicación redundante para alertar a la familia de inmediato ante caídas o emergencias. Conecta directamente al usuario con hasta 3 guardianes familiares priorizados. No hay call-center ni intermediarios humanos en las alertas.

Contratación: ${SENIOR_SAFE_CHECKOUT_URL} — pago seguro con Transbank Oneclick (crédito o débito).
Tras pagar en checkout: la pantalla de confirmación muestra ACTIVAR para enviar por WhatsApp comercial (+56 9 7140 4580). Solo entonces se vincula la cuenta.
No hay días de prueba gratis; sí hay simulacro de entrenamiento tras contratar.

GUÍA DE INSTALACIÓN Y USO (paso a paso, fácil de entender):
${SENIOR_SAFE_INSTALL_GUIDE_URL}
Úsala cuando pregunten cómo descargar, instalar, configurar o usar la app a diario.

FAQ — FUNCIONAMIENTO

P: ¿Qué es exactamente Senior Safe?
R: Un ecosistema de protección inteligente en el smartphone (no collar ni aparato extra). IA + sensores del teléfono + alertas multicanal a la familia ante caídas o emergencias.

P: ¿Cómo funciona la alerta en cascada?
R: Cuatro canales en tiempo real: (A) WhatsApp + IA que procesa confirmaciones de lectura; (B) SMS de respaldo simultáneo; (C) GPS en vivo con enlace Google Maps; (D) llamadas de voz automáticas y secuenciales a guardianes si nadie confirma en los primeros segundos.

P: ¿A quién notifica?
R: Directamente al núcleo familiar, sin centrales externas. Hasta 3 guardianes (hijos, nietos, vecinos, cuidadores) con orden de prioridad. SMS al instante, WhatsApp a los 15 s, llamada automática a los 60 s si nadie confirma.

P: Vivo solo / no tengo familiares, ¿me sirve?
R: Sí. Puede elegir hasta 3 personas de confianza con celular: vecinos, amigos, cuidador, etc. Ellos reciben WhatsApp, SMS, ubicación y llamada. Senior Safe avisa a esas personas para que acudan; no reemplaza llamar al 131 (urgencia médica) o 133 (Carabineros) en una emergencia activa.

P: ¿Puedo agregar Carabineros, policía, 133, bomberos o SAMU como guardián?
R: NO. Senior Safe NO conecta con Carabineros, policía, bomberos, SAMU ni centrales de emergencia. Los guardianes deben ser personas reales con celular (familia, vecinos, amigos, cuidadores). Para emergencia activa ahora: llamar al 131 (salud) o 133 (Carabineros) directamente desde el teléfono. Nunca diga que el sistema notifica a las autoridades.

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

POLÍTICA DE CANCELACIÓN Y REEMBOLSOS (detalle legal en Términos y Condiciones):
${CANCELLATION_POLICY_SUMMARY}
Enlace apartado legal: ${SENIOR_SAFE_TERMS_CANCELLATION_URL}
Para solicitar baja: ${SENIOR_SAFE_SUPPORT_EMAIL}.

P: ¿Hay reembolso si cancelo? / ¿Me devuelven plata si cancelo el anual?
R: Indica amablemente que debe leer el apartado «Cancelación y reembolsos» en Términos y Condiciones: ${SENIOR_SAFE_TERMS_CANCELLATION_URL}. No cites el detalle completo en WhatsApp salvo que insista; prioriza ese enlace.

P: ¿Qué pasa si cancelo el plan mensual o anual?
R: Misma respuesta: derivar a ${SENIOR_SAFE_TERMS_CANCELLATION_URL} (Términos y Condiciones, sección Cancelación y reembolsos).

P: ¿Medios de pago?
R: 100% en línea con Transbank Oneclick: tarjetas de crédito o débito.

FAQ — SOPORTE

P: ¿Tienen atención por dudas?
R: Sí. El Plan Único incluye soporte prioritario 24/7 para configuración de guardianes y la app. WhatsApp comercial o correo ${SENIOR_SAFE_SUPPORT_EMAIL}.

P: ¿Cómo descargo o instalo la app?
R: Guía paso a paso en ${SENIOR_SAFE_INSTALL_GUIDE_URL} — contratar, abrir enlace en el celular, instalar en pantalla de inicio (Android/iPhone), configurar PIN y guardianes, escribir ACTIVAR por WhatsApp.

P: ¿Cómo se usa la app día a día?
R: Ver sección "Uso diario" en ${SENIOR_SAFE_INSTALL_GUIDE_URL}: botón SOS rojo para emergencias; sensor de caídas con sirena 30 s para cancelar si está bien.

Para gestión de cuenta, facturación o fallas técnicas de un caso concreto: derivar a ${SENIOR_SAFE_SUPPORT_EMAIL}. Para reembolsos y cancelación: ${SENIOR_SAFE_TERMS_CANCELLATION_URL}.
`.trim();

export type WhatsAppInboundRoute = "EMERGENCY_ACK" | "COMMERCIAL_QUERY";

/** Audiencia comercial WhatsApp: hijo/a preocupado vs adulto mayor. */
export type WhatsAppCommercialAudience = "child" | "senior";

const WHATSAPP_CHILD_SYSTEM_PROMPT = `Eres un Asesor de Seguridad Experto, Empático y Altamente Profesional de Alarmas Senior Safe (Chile). Atiendes por WhatsApp a hijos/as (30-55 años) que buscan proteger a sus padres o adultos mayores.

OBJETIVO: Brindar tranquilidad mental. Que sientan que hay una solución concreta, confiable y fácil de activar — no presión de venta.

TONO:
- Respetuoso, comprensivo, cercano pero corporativo.
- Español chileno neutro-profesional: "Hola,", "Perfecto,", "Con gusto te explico".
- Entiendes modismos como "abuelito", "caídas", "cobertura", "viven solos".
- Evita exceso de jerga juvenil ("cachai", "bacán"). Sin ser frío ni robótico.
- Máximo 1 emoji suave por mensaje (🛡️ o 💙). Sin markdown.

FORMATO DE RESPUESTA (OBLIGATORIO):
- Nunca bloques gigantes: máximo 3 párrafos cortos por mensaje.
- Usa viñetas (•) para beneficios técnicos.
- Ideal <900 caracteres total.

ENFOQUE DE VALOR (prioriza en este orden):
1) Alerta inmediata al celular del hijo/familia (WhatsApp, SMS, ubicación).
2) Botón de pánico de un solo toque en el celular del adulto mayor.
3) Facilidad de uso — diseño simple, sin aparatos extra ni collares.
4) Si nadie confirma, escalamiento con llamada automática (~60 s).
5) Plan Único: $6.900/mes o $69.000/año · sin permanencia · pago seguro Transbank Oneclick.

CIERRE OBLIGATORIO: Termina SIEMPRE con una pregunta abierta que avance la conversación. Ejemplos:
- "¿Viven solos tus padres o pasan gran parte del día sin compañía?"
- "¿Tu papá o tu mamá ya usa smartphone con WhatsApp?"
- "¿Te gustaría que te explique cómo se activa en menos de 10 minutos?"

REGLAS ESTRICTAS:
- Solo información del CONTEXTO OFICIAL adjunto. No inventes funciones, precios ni plazos.
- Contratación: ${SENIOR_SAFE_CHECKOUT_URL}
- Tras contratar y pagar: el cliente envía ACTIVAR por WhatsApp (solo funciona con pago confirmado). Guía: ${SENIOR_SAFE_INSTALL_GUIDE_URL}
- No hay días de prueba gratis; sí hay simulacro de entrenamiento tras contratar.
- Emergencia médica ACTIVA ahora: indicar llamar al 131; este chat no despacha alertas.
- Reembolso/cancelación: derivar a Términos (sección Cancelación y reembolsos): ${SENIOR_SAFE_TERMS_CANCELLATION_URL}
- Casos técnicos (cuenta, factura, falla): responder EXACTAMENTE: ${TRIGGER_TECHNICAL_EMAIL_REDIRECT}

PAGO Y ACTIVACIÓN (CRÍTICO — NUNCA VIOLAR):
- Este chat NO procesa pagos ni puede verificar si alguien pagó.
- NUNCA digas que el plan está activado, pagado o confirmado.
- Si quiere contratar (dice sí, ya, dale, me interesa el plan): envía SOLO ${SENIOR_SAFE_CHECKOUT_URL} e indica que debe pagar ahí primero.
- NO pidas ACTIVAR antes del pago. ACTIVAR solo aplica después de pagar en checkout.
- Si pregunta por ACTIVAR sin haber pagado: redirige a checkout, no confirmes activación.

GUARDIANES Y AUTORIDADES (CRÍTICO — NUNCA VIOLAR):
- Los guardianes son personas reales con celular (familia, vecinos, amigos, cuidadores). Máximo 3.
- NUNCA digas que se puede agregar Carabineros, policía, 133, 131, bomberos, SAMU ni ninguna central/autoridad como guardián.
- NUNCA digas que el sistema notifica, llama o despacha a Carabineros o autoridades.
- Si vive solo sin familia: sí le sirve con vecinos/amigos/cuidador; aclara que no reemplaza llamar al 131 o 133 en emergencia activa.

CONTINUIDAD (CRÍTICO):
- Recibirás el historial reciente del chat. NO reinicies con saludos genéricos ni repitas el pitch inicial.
- Si el usuario responde "sí", "ok", "dale" o similar, responde DIRECTAMENTE lo que ofreciste en tu mensaje anterior.
- No repitas las mismas viñetas si ya las mencionaste.

CONTEXTO OFICIAL:
${SENIOR_SAFE_OFFICIAL_CONTEXT}`;

const WHATSAPP_SENIOR_SYSTEM_PROMPT = `Eres un Asesor de Asistencia y Seguridad de Alarmas Senior Safe (Chile). Le habla un adulto mayor (60+ años) que quiere mantener su independencia y sentirse seguro en casa.

OBJETIVO: Tranquilizarlo. Que entienda que puede cuidarse solo, sin molestar a sus hijos, con algo simple en su celular.

TONO:
- Ultra amigable, paciente, sumamente respetuoso. Siempre "Usted".
- Español claro de Chile. Sin tecnicismos (no diga GPS, SMS, API, PWA, base de datos).
- Use en su lugar: "ubicación en el mapa", "mensaje de texto", "aplicación en su celular", "botón de emergencia".
- Emojis sutiles y amigables: 👍 🙂 (máximo 2 por mensaje). Sin markdown.

FORMATO DE RESPUESTA (OBLIGATORIO):
- Muy corto: máximo 2 o 3 líneas por mensaje.
- Una idea por línea. Frases simples (máximo 12 palabras).
- Ideal <500 caracteres total.
- Use saltos de línea para que se lea fácil en WhatsApp.

ENFOQUE DE VALOR (priorice):
1) Usted sigue independiente en su casa 👍
2) No será una carga para sus hijos — el sistema avisa a su familia por usted
3) Un solo botón en su celular → ayuda inmediata a quienes usted elija
4) También avisa por WhatsApp y envía dónde está
5) Si nadie responde, llamamos por teléfono automáticamente
6) $6.900 al mes · sin contrato · cancela cuando quiera

CIERRE OBLIGATORIO: Pregunta directa y sencilla. Ejemplos:
- "¿Le gustaría que le explique cómo funciona el botón de emergencia o prefiere saber el valor del plan?"
- "¿Usted ya usa WhatsApp en su celular?"
- "¿Le ayudo a contratar paso a paso?"

REGLAS ESTRICTAS:
- Solo información del CONTEXTO OFICIAL adjunto. No invente nada.
- Contratación: ${SENIOR_SAFE_CHECKOUT_URL} — "Le ayudamos en cada paso."
- Si ya pagó en checkout: escriba ACTIVAR por WhatsApp (el sistema lo verifica). Guía: ${SENIOR_SAFE_INSTALL_GUIDE_URL}
- Emergencia ACTIVA ahora: llame al 131. Este chat no envía alertas.
- Reembolso/cancelación: indique revisar Términos: ${SENIOR_SAFE_TERMS_CANCELLATION_URL}
- Problemas de cuenta o factura: responda EXACTAMENTE: ${TRIGGER_TECHNICAL_EMAIL_REDIRECT}

PAGO Y ACTIVACIÓN (CRÍTICO — NUNCA VIOLAR):
- Este chat NO cobra ni puede saber si usted ya pagó.
- NUNCA diga que su plan está activado o pagado.
- Si quiere contratar (dice sí, ya, dale): envíe SOLO ${SENIOR_SAFE_CHECKOUT_URL} y explique que debe pagar ahí primero.
- NO pida ACTIVAR antes del pago. Después de pagar, la página de confirmación muestra ACTIVAR para enviar.
- Si escribe ACTIVAR sin haber pagado: indique que complete el pago en checkout primero.

GUARDIANES Y AUTORIDADES (CRÍTICO — NUNCA VIOLAR):
- Los guardianes son personas reales con celular (vecinos, amigos, cuidador). Máximo 3.
- NUNCA diga que puede agregar Carabineros, policía, 133, 131, bomberos ni SAMU como guardián.
- NUNCA diga que el sistema avisa a Carabineros o autoridades.
- Si vive solo: sí le sirve con vecinos o amigos de confianza; para emergencia activa llame al 131 o 133.

CONTINUIDAD (CRÍTICO):
- Recibirá el historial reciente del chat. NO reinicie con saludos genéricos ni repita la presentación.
- Si el usuario responde "sí", "ok" o similar, explique DIRECTAMENTE lo que ofreció en su mensaje anterior.
- Mantenga siempre "usted". No vuelva a presentar Senior Safe desde cero.

CONTEXTO OFICIAL:
${SENIOR_SAFE_OFFICIAL_CONTEXT}`;

function whatsAppSystemPromptForAudience(audience: WhatsAppCommercialAudience): string {
  return audience === "senior" ? WHATSAPP_SENIOR_SYSTEM_PROMPT : WHATSAPP_CHILD_SYSTEM_PROMPT;
}

function normalizeForAudienceMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const AUTHORITIES_GUARDIAN_SIGNAL =
  /\b(carabineros?|polic[ií]a|133|134|132|bomberos?|pdi|samu|131|ambulancia|fuerzas? de orden|central de monitoreo|n[uú]mero de emergencia|autoridades)\b/;

const GUARDIAN_INTENT_SIGNAL =
  /\b(agregar|poner|incluir|guardian|guardi[aá]n|contacto|puedo|sirve|funciona|notificar|avisar|llama|llamar)\b/;

function isAuthoritiesAsGuardianQuestion(text: string): boolean {
  const q = normalizeForAudienceMatch(text);
  return AUTHORITIES_GUARDIAN_SIGNAL.test(q) && GUARDIAN_INTENT_SIGNAL.test(q);
}

function replyContainsAuthorityHallucination(text: string): boolean {
  const q = normalizeForAudienceMatch(text);
  if (!AUTHORITIES_GUARDIAN_SIGNAL.test(q)) return false;
  if (/\b(no puede|no es posible|no llama|no conecta|no despacha|no notifica|no agregar|no sirve para agregar)\b/.test(q)) {
    return false;
  }
  return /\b(s[ií] puede|puede agregar|notificar a las autoridades|notificar a carabineros|despach|conecta con|llama a carabineros|autoridades para que)\b/.test(
    q,
  );
}

function authoritiesGuardianFallbackReply(audience: WhatsAppCommercialAudience): string {
  const base = "Senior Safe 🛡️\n";
  if (audience === "senior") {
    return (
      base +
      "No, Senior Safe no llama a Carabineros ni a la policía.\n" +
      "Avisa a hasta 3 personas de confianza que usted elija (vecino, amigo, cuidador) por WhatsApp, SMS y llamada.\n" +
      "Si hay emergencia ahora, llame al 131 (salud) o 133 (Carabineros) desde su teléfono.\n" +
      "¿Le gustaría saber cómo agregar un vecino o amigo como contacto?"
    );
  }
  return (
    base +
    "No, Senior Safe no conecta con Carabineros ni despacha autoridades.\n" +
    "• Los guardianes son personas reales con celular (vecinos, amigos, cuidadores)\n" +
    "• Máximo 3 contactos que reciben WhatsApp, SMS, ubicación y llamada\n" +
    "En emergencia activa: 131 (salud) o 133 (Carabineros) directo desde el teléfono.\n" +
    "¿Te ayudo a entender cómo configurar vecinos o amigos como guardianes?"
  );
}

const SENIOR_AUDIENCE_SIGNAL =
  /\b(para mi|para m[ií]|yo vivo solo|yo vivo sola|vivo solo|vivo sola|tengo 6[0-9]|tengo 7[0-9]|tengo 8[0-9]|soy adulto mayor|soy jubilad|en mi celular|para mi casa|no quiero molestar a mis hijos|mi independencia|instalar en mi telefono|utm_audience=senior|ref_senior|audience=senior)\b/;

const CHILD_AUDIENCE_SIGNAL =
  /\b(mi mam[aá]|mi papa|mi pap[aá]|mis padres|mi abuelit|mi viejit|mi madre|mi padre|proteger a mi|para mi mam[aá]|para mi pap[aá]|viven solos mis|me preocupa|utm_audience=child|utm_content=hijos|ref_hijos|audience=child)\b/;

/** Detecta si el chat es hijo/a preocupado o adulto mayor (heurística + historial). */
export function detectWhatsAppCommercialAudience(combinedText: string): WhatsAppCommercialAudience {
  const q = normalizeForAudienceMatch(combinedText);
  const seniorHits = q.match(SENIOR_AUDIENCE_SIGNAL)?.length ?? 0;
  const childHits = q.match(CHILD_AUDIENCE_SIGNAL)?.length ?? 0;
  if (seniorHits > childHits) return "senior";
  if (childHits > seniorHits) return "child";
  if (/\b(ustedes pueden ayudarme|necesito para mi|quiero contratar para mi)\b/.test(q)) {
    return "senior";
  }
  return "child";
}

async function loadRecentCommercialInboundBodies(peerPhone: string, limit = 6): Promise<string[]> {
  const peer = normalizeTwilioPhone(peerPhone);
  if (!peer) return [];
  try {
    const { data } = await supabaseAdmin
      .from("whatsapp_inbox_messages")
      .select("body")
      .eq("inbox", "commercial")
      .eq("direction", "inbound")
      .eq("peer_phone", peer)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => String(r.body ?? "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

type CommercialChatTurn = { role: "user" | "assistant"; content: string };

const WHATSAPP_COMMERCIAL_HISTORY_LIMIT = 10;

function stripWhatsAppBrandPrefix(body: string): string {
  return body.replace(/^Senior Safe 🛡️\s*/i, "").trim();
}

function isShortContinuationMessage(text: string): boolean {
  const q = normalizeForAudienceMatch(text);
  return /^(si|s[ií]|ok|oka|dale|claro|por favor|pf|bueno|ya|sep|exacto|cuentame|me interesa|quiero saber|a ver|mas info|m[aá]s info|porfa|afirmativo)[\s!.?]*$/u.test(
    q,
  );
}

async function loadCommercialChatHistory(
  peerPhone: string,
  limit = WHATSAPP_COMMERCIAL_HISTORY_LIMIT,
): Promise<CommercialChatTurn[]> {
  const peer = normalizeTwilioPhone(peerPhone);
  if (!peer) return [];
  try {
    const { data } = await supabaseAdmin
      .from("whatsapp_inbox_messages")
      .select("direction, body, created_at")
      .eq("inbox", "commercial")
      .eq("peer_phone", peer)
      .order("created_at", { ascending: false })
      .limit(limit * 2);

    return (data ?? [])
      .slice()
      .reverse()
      .map((row) => ({
        role: row.direction === "inbound" ? ("user" as const) : ("assistant" as const),
        content: stripWhatsAppBrandPrefix(String(row.body ?? "")).slice(0, 2000),
      }))
      .filter((turn) => turn.content.length > 0)
      .slice(-limit);
  } catch {
    return [];
  }
}

function audienceFromAssistantTone(outboundText: string): WhatsAppCommercialAudience | null {
  const q = outboundText.toLowerCase();
  if (/\b(usted|le gustaría|le explico|su familia|le ayudo|para usted)\b/.test(q)) {
    return "senior";
  }
  if (/\b(tus padres|tu papá|tu mamá|te explico|tus seres queridos)\b/.test(q)) {
    return "child";
  }
  return null;
}

export async function resolveWhatsAppCommercialAudience(
  userMessage: string,
  peerPhone?: string,
): Promise<WhatsAppCommercialAudience> {
  const inboundParts = peerPhone ? await loadRecentCommercialInboundBodies(peerPhone, 8) : [];
  const threadText = [...inboundParts, userMessage.trim()].filter(Boolean).join("\n");
  const fromKeywords = detectWhatsAppCommercialAudience(threadText);

  if (!peerPhone) return fromKeywords;

  const history = await loadCommercialChatHistory(peerPhone);
  const fullThreadText = history.map((t) => t.content).join("\n");
  const fromFullThread = detectWhatsAppCommercialAudience(fullThreadText);

  if (isShortContinuationMessage(userMessage)) {
    const lastAssistant = [...history].reverse().find((t) => t.role === "assistant");
    if (lastAssistant) {
      const toneAudience = audienceFromAssistantTone(lastAssistant.content);
      if (toneAudience) return toneAudience;
    }
    return fromFullThread !== "child" ? fromFullThread : fromKeywords;
  }

  if (fromKeywords !== "child") return fromKeywords;
  if (fromFullThread !== "child") return fromFullThread;
  return "child";
}

const WHATSAPP_ROUTER_SYSTEM_PROMPT = `Eres un enrutador binario estricto para mensajes entrantes de WhatsApp de Senior Safe (Chile).

Clasifica el mensaje del usuario en EXACTAMENTE una etiqueta:

EMERGENCY_ACK — El remitente es un guardián o familiar respondiendo a una alerta de emergencia activa: confirma recepción, indica que va en camino, que ya está con la persona, falsa alarma, que todo está bien, o atiende la situación. Ejemplos: "Yo voy", "Estoy con él", "Falsa alarma todo bien", "Ya llegué", "Voy para allá", "Todo controlado".

COMMERCIAL_QUERY — Pregunta comercial, duda sobre el servicio, precios, instalación, sensores, planes, contratación, o mensaje sin contexto de emergencia activa. Ejemplos: "¿Cuánto cuesta?", "¿Cómo funciona el sensor de caídas?", "Hola quiero información".

IMPORTANTE: "Sí", "Ok", "Dale", "Claro" u otras respuestas cortas aisladas, sin mencionar alerta/emergencia/camino/voy, son SIEMPRE COMMERCIAL_QUERY (respuestas a una pregunta del asistente comercial).

Responde ÚNICAMENTE con la etiqueta literal EMERGENCY_ACK o COMMERCIAL_QUERY, sin comillas ni texto adicional.`;

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

function trimForWhatsApp(text: string, max = 950, preserveLines = false): string {
  const t = preserveLines
    ? text.replace(/\n{3,}/g, "\n\n").trim()
    : text.replace(/[^\S\n]+/g, " ").replace(/\n+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

/** Respuesta estática si no hay API key configurada. */
function fallbackReply(userMessage: string, audience: WhatsAppCommercialAudience = "child"): string {
  const q = userMessage.toLowerCase();
  const base = "Senior Safe 🛡️\n";

  if (/precio|cuanto cuesta|valor|plan|pago|oneclick|webpay|\$|6900|69\.?000/.test(q)) {
    if (audience === "senior") {
      return (
        base +
        "El plan cuesta $6.900 al mes, sin contrato 🙂\nPuede cancelar cuando quiera.\n¿Le gustaría que le explique el botón de emergencia o prefiere el link para contratar?"
      );
    }
    return (
      base +
      "Perfecto. El Plan Único cuesta $6.900 al mes o $69.000 al año (ahorras 2 meses). Pagas seguro con Oneclick en " +
      SENIOR_SAFE_CHECKOUT_URL +
      " 💙"
    );
  }
  if (/prueba|trial|gratis|demo/.test(q)) {
    return (
      base +
      "Por ahora no tenemos días de prueba gratis, pero tras contratar puedes hacer un simulacro de entrenamiento sin costo extra. ¿Te ayudo con algo más?"
    );
  }
  if (/como funciona|que es|servicio|app/.test(q)) {
    if (audience === "senior") {
      return (
        base +
        "Es una aplicación sencilla en su celular con un botón grande de emergencia.\nSi lo presiona, avisamos a su familia por WhatsApp 👍\n¿Le gustaría saber el valor del plan?"
      );
    }
    return (
      base +
      "Senior Safe es una app en el celular que avisa a tu familia en segundos por WhatsApp, SMS y ubicación. Si nadie confirma, llama sola (~60 s). Contrata en " +
      SENIOR_SAFE_CHECKOUT_URL +
      " 💙"
    );
  }
  if (/instal|descarg|qr|pwa|configur|como uso|usar la app|paso a paso/.test(q)) {
    return (
      base +
      `Te dejamos la guía completa paso a paso aquí: ${SENIOR_SAFE_INSTALL_GUIDE_URL} 😊 Si te atoras, escríbenos por aquí mismo.`
    );
  }
  if (/activar|whatsapp/.test(q)) {
    return (
      base +
      `Para vincular WhatsApp, primero contrata y paga en ${SENIOR_SAFE_CHECKOUT_URL}. Tras el pago verás ACTIVAR listo para enviar por WhatsApp 😊`
    );
  }
  if (/contratar|quiero el plan|me interesa|lo quiero|ya quiero/.test(q)) {
    return base + `Perfecto. Contrata y paga aquí: ${SENIOR_SAFE_CHECKOUT_URL} 💙`;
  }
  if (isAuthoritiesAsGuardianQuestion(userMessage)) {
    return authoritiesGuardianFallbackReply(audience);
  }
  if (/vivo solo|vivo sola|no tengo familia|sin familiares|no tengo parientes/.test(q)) {
    if (audience === "senior") {
      return (
        base +
        "Sí le sirve. Puede elegir hasta 3 personas de confianza con celular: vecinos, amigos o cuidador.\n" +
        "Ellos reciben WhatsApp, SMS, ubicación y llamada si usted necesita ayuda.\n" +
        "¿Le gustaría saber el valor del plan?"
      );
    }
    return (
      base +
      "Sí, funciona perfecto. Puede configurar vecinos, amigos o cuidadores como guardianes (hasta 3).\n" +
      "Reciben WhatsApp, SMS, ubicación y llamada automática.\n" +
      "¿Te gustaría saber cómo contratar?"
    );
  }
  if (/reembolso|cancelar|dar de baja|baja del plan|cancelaci|devuelven plata|devoluci/.test(q)) {
    return base + `Con gusto te oriento 😊 ${CANCELLATION_TERMS_WHATSAPP_REPLY}`;
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
  trimOpts?: { max?: number; preserveLines?: boolean },
  history: CommercialChatTurn[] = [],
): Promise<string> {
  const url =
    cfg.provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  for (const turn of history) {
    messages.push({ role: turn.role, content: turn.content });
  }

  const lastTurn = history[history.length - 1];
  const alreadyHasCurrentUser =
    lastTurn?.role === "user" && lastTurn.content.trim() === userMessage.trim();
  if (!alreadyHasCurrentUser) {
    messages.push({ role: "user", content: userMessage.slice(0, 4000) });
  }

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
      messages,
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
  return trimForWhatsApp(content, trimOpts?.max ?? 950, trimOpts?.preserveLines ?? false);
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
  if (isShortContinuationMessage(trimmed)) return "COMMERCIAL_QUERY";

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
 * Detecta audiencia (hijo/a vs adulto mayor) y elige system prompt Groq.
 */
export async function generateSeniorSafeWhatsAppReply(
  userMessage: string,
  peerPhone?: string,
): Promise<string> {
  const trimmed = (userMessage || "").trim();
  const audience = await resolveWhatsAppCommercialAudience(trimmed, peerPhone);

  if (!trimmed) {
    if (audience === "senior") {
      return (
        "Senior Safe 🛡️\nBuenos días, gracias por escribirnos 🙂\n" +
        "¿Le gustaría que le explique cómo funciona el botón de emergencia o prefiere saber el valor del plan?"
      );
    }
    return `Senior Safe 🛡️\n¡Hola! ¿En qué te podemos ayudar hoy? Cuéntanos tu duda o escríbenos a ${SENIOR_SAFE_COMMERCIAL_EMAIL} 😊`;
  }

  const cfg = resolveProvider();
  if (!cfg) {
    const fallback = fallbackReply(trimmed, audience);
    if (fallback.includes(TRIGGER_TECHNICAL_EMAIL_REDIRECT)) {
      return formatWhatsAppCommercialReply(fallback, trimmed);
    }
    return fallback;
  }

  if (isAuthoritiesAsGuardianQuestion(trimmed)) {
    return authoritiesGuardianFallbackReply(audience);
  }

  const systemPrompt = whatsAppSystemPromptForAudience(audience);
  const maxTokens = audience === "senior" ? 220 : 320;
  const temperature = audience === "senior" ? 0.35 : 0.42;
  const trimMax = audience === "senior" ? 520 : 950;
  const history = peerPhone ? await loadCommercialChatHistory(peerPhone) : [];

  try {
    const reply = await callChatApi(
      cfg,
      trimmed,
      systemPrompt,
      maxTokens,
      temperature,
      {
        max: trimMax,
        preserveLines: audience === "senior",
      },
      history,
    );
    if (replyContainsAuthorityHallucination(reply)) {
      return authoritiesGuardianFallbackReply(audience);
    }
    return formatWhatsAppCommercialReply(reply, trimmed);
  } catch (e) {
    console.error("[senior-safe-ai]", e);
    const fallback = fallbackReply(trimmed, audience);
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
  const plain = fallbackReply(userMessage, detectWhatsAppCommercialAudience(userMessage))
    .replace(/^Senior Safe 🛡️\n?/, "")
    .trim();
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

/** Heurística: temas que casi seguro requieren soporte humano (excluye política de cancelación/reembolso). */
function looksOutOfScope(text: string): boolean {
  if (/reembolso|cancelar|dar de baja|baja del plan|cancelaci/.test(text)) return false;
  return /mi cuenta|no funciona|error|factura|boleta|cambiar numero|eliminar|datos personales|hablar con|soporte|humano|agente/i.test(
    text,
  );
}
