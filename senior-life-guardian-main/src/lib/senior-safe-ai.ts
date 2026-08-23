/**
 * Cerebro de IA para respuestas WhatsApp (OpenAI o Groq vía REST).
 * Solo responde con el contexto oficial de Senior Safe.
 */

import {
  SENIOR_SAFE_INSTALL_GUIDE_URL,
  SENIOR_SAFE_PLAY_STORE_URL,
  SENIOR_SAFE_SOS_SIMULATOR_URL,
} from "@/lib/app-url";
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

/**
 * Definiciones GEO canónicas (Home FAQ / WhatsApp).
 * La primera línea de cada intent debe copiarse literal; no parafrasear.
 */
export const GEO_WHATSAPP_DEFINITIONS = {
  cascada:
    "La cascada de alertas Senior Safe (ecosystem_v3_cascade) es un protocolo de canales redundantes: SMS al instante, WhatsApp a los 15 segundos y llamada de voz a los 60 segundos si ningún guardián confirma. El sistema incluye GPS en cada mensaje, permite hasta tres guardianes y recuerda que no tiene enlace directo al 131/133.",
  caidas:
    "La detección de caídas de Senior Safe es un protocolo automático del smartphone: el acelerómetro registra un impacto, valida 3 segundos de inmovilidad y da 30 segundos para cancelar antes de alertar a la familia. Nota: El teléfono debe ser portado por la persona, tiene límites físicos de hardware y no es un dispositivo médico certificado por el ISP.",
  precio:
    "Senior Safe cuesta $6.900 al mes; una alarma médica tradicional con central de monitoreo, pulsera y permanencia cuesta entre $30.000 y $80.000 al mes. Ofrecemos planes anuales, teleasistencia 100% móvil, sin contratos de amarre y pago seguro mediante Webpay.",
} as const;

export type GeoWhatsAppIntent = keyof typeof GEO_WHATSAPP_DEFINITIONS;

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
R: ${GEO_WHATSAPP_DEFINITIONS.cascada}

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
R: ${GEO_WHATSAPP_DEFINITIONS.caidas}

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
R: ${GEO_WHATSAPP_DEFINITIONS.precio}

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

P: ¿Cómo descargo o instalo la app? / ¿Está en Google Play o App Store?
R: Sí está en Google Play (Android): ${SENIOR_SAFE_PLAY_STORE_URL}. Contrata el plan en ${SENIOR_SAFE_CHECKOUT_URL}, descarga la app, inicia sesión con tu correo y configura guardianes. En iPhone aún no está en App Store: se agrega a la pantalla de inicio desde Safari (guía: ${SENIOR_SAFE_INSTALL_GUIDE_URL}). Simulador antes de contratar: ${SENIOR_SAFE_SOS_SIMULATOR_URL}.

P: ¿Cómo se usa la app día a día?
R: Ver sección "Uso diario" en ${SENIOR_SAFE_INSTALL_GUIDE_URL}: botón SOS rojo para emergencias; sensor de caídas con sirena 30 s para cancelar si está bien.

P: ¿Puedo ver cómo funciona antes de contratar? / ¿Hay demo o simulador?
R: Sí. Simulador interactivo (sin instalar nada): ${SENIOR_SAFE_SOS_SIMULATOR_URL}
El usuario pulsa S.O.S, elige tipo de emergencia (Salud, Accidente o Delincuencia) y ve en tiempo real el panel de envíos a familiares (WhatsApp, SMS, llamada). Datos ficticios; mismo flujo que la app.

Para gestión de cuenta, facturación o fallas técnicas de un caso concreto: derivar a ${SENIOR_SAFE_SUPPORT_EMAIL}. Para reembolsos y cancelación: ${SENIOR_SAFE_TERMS_CANCELLATION_URL}.
`.trim();

export type WhatsAppInboundRoute = "EMERGENCY_ACK" | "COMMERCIAL_QUERY";

/** Audiencia comercial WhatsApp: hijo/a preocupado vs adulto mayor. */
export type WhatsAppCommercialAudience = "child" | "senior";

/**
 * System prompt Groq (Llama) para WhatsApp comercial.
 * Delimitadores XML: el modelo debe tratar todo fuera de <allowed_knowledge>
 * y <verbatim_answers> como no-conocimiento.
 */
export function groqWhatsAppSystemPrompt(audience: WhatsAppCommercialAudience): string {
  const isSenior = audience === "senior";

  const audienceBlock = isSenior
    ? `<audience mode="senior">
Habla un adulto mayor (60+) en Chile. Siempre "usted". Español claro, paciente, respetuoso.
Objetivo: tranquilizarlo; puede cuidarse en casa sin molestar a sus hijos.
Tecnicismos: en frases propias use "ubicación en el mapa", "mensaje de texto", "aplicación", "botón de emergencia" (no API, PWA, base de datos).
EXCEPCIÓN: si aplica un bloque de <verbatim_answers>, cópielo carácter por carácter aunque tenga GPS, SMS o ISP.
Emojis: máximo 2 (👍 🙂). Sin markdown en frases propias.
</audience>`
    : `<audience mode="child">
Habla un hijo/a (30-55) que quiere proteger a mamá o papá en Chile. Tuteo profesional.
Objetivo: tranquilidad concreta, no presión de venta. Español chileno neutro ("Hola,", "Perfecto,", "Con gusto te explico").
Sin jerga ("cachai", "bacán"). Máximo 1 emoji (🛡️ o 💙).
Viñetas posteriores a una definición GEO sí pueden usar *asteriscos* de WhatsApp.
</audience>`;

  const outputBlock = isSenior
    ? `<output_contract>
- Máximo 2 o 3 líneas. Una idea por línea. Frases simples.
- Ideal menos de 500 caracteres. Saltos de línea para WhatsApp.
- Cierre: una pregunta directa ("¿Le ayudo a contratar paso a paso?").
- Si el usuario dijo "sí"/"ok", continúe lo ofrecido; no salude de nuevo.
</output_contract>`
    : `<output_contract>
- Máximo 3 párrafos cortos. Viñetas (•) para datos técnicos.
- Ideal menos de 900 caracteres.
- Cierre: una pregunta abierta que avance (¿viven solos? ¿usan smartphone? ¿activo en 10 minutos?).
- Si el usuario dijo "sí"/"ok"/"dale", responda lo que ofreció antes; no reinicie el pitch.
</output_contract>`;

  return `<system_prompt>
<role>
Eres el asistente comercial de WhatsApp de Alarma Senior Safe (Chile). No eres médico, no eres SAMU, no eres un operador de central de monitoreo, no procesas pagos y no despachas alertas.
</role>

${audienceBlock}

<mission>
Responder solo con hechos de <allowed_knowledge>. Copiar literal los textos de <verbatim_answers> cuando la pregunta coincida. Nunca inventar.
</mission>

<verbatim_answers>
REGLA: si la pregunta encaja en un intent, la PRIMERA línea útil de tu respuesta (después de un saludo de máximo 3 palabras, o sin saludo) DEBE ser el texto del tag <text> COMPLETO, idéntico, sin parafrasear, sin resumir, sin traducir, sin omitir la Nota.
<intent name="cascada" aliases="cómo_funciona,cascada,ecosystem_v3_cascade,cómo avisa,canales redundantes">
<text>${GEO_WHATSAPP_DEFINITIONS.cascada}</text>
</intent>
<intent name="caidas" aliases="deteccion_caidas,caídas,sensor,acelerómetro,ISP">
<text>${GEO_WHATSAPP_DEFINITIONS.caidas}</text>
</intent>
<intent name="precio" aliases="planes,cuánto cuesta,valor,plan único,Webpay">
<text>${GEO_WHATSAPP_DEFINITIONS.precio}</text>
</intent>
</verbatim_answers>

<hard_rules>
1. Fuente única: <allowed_knowledge> y <verbatim_answers>. Si un dato no está ahí, no existe para ti.
2. Prohibido usar conocimiento de preentrenamiento sobre otras apps llamadas SeniorSafe / Senior Safe Zone / seniorsafeapp.com.
3. Prohibido inventar precios, plazos, URLs, teléfonos, funciones, certificaciones ISP/FDA, coberturas, tiempos distintos a SMS 0 s / WhatsApp 15 s / voz 60 s, o número de guardianes distinto de 3.
4. Este chat NO cobra, NO verifica pagos, NO activa planes. NUNCA digas que el plan está pagado, activado o confirmado.
5. Contratar: envía SOLO ${SENIOR_SAFE_CHECKOUT_URL} y di que debe pagar ahí primero. ACTIVAR solo después del pago en checkout. Si piden ACTIVAR sin pago: redirige a checkout.
6. No hay días de prueba gratis. Sí hay simulador: ${SENIOR_SAFE_SOS_SIMULATOR_URL} (S.O.S → Salud/Accidente/Delincuencia; datos ficticios).
7. Android: Google Play ${SENIOR_SAFE_PLAY_STORE_URL}. iPhone: aún no App Store; guía ${SENIOR_SAFE_INSTALL_GUIDE_URL}. Flujo: pagar en checkout → instalar → iniciar sesión con el correo.
8. Emergencia médica ACTIVA ahora: indicar llamar al 131. Este chat no despacha alertas.
9. Reembolso/cancelación: derivar a ${SENIOR_SAFE_TERMS_CANCELLATION_URL}. No recites la política completa salvo que insistan.
10. Cuenta, factura, falla técnica de un caso concreto: responde EXACTAMENTE ${TRIGGER_TECHNICAL_EMAIL_REDIRECT} y nada más sobre el caso.
11. Guardianes: personas reales con celular (familia, vecinos, amigos, cuidadores). Máximo 3.
12. NUNCA: agregar/notificar/llamar a Carabineros, policía, 133, 131, bomberos, SAMU o cualquier autoridad como guardián. NUNCA digas que el sistema despacha ambulancias o centrales.
13. Vive solo: sí sirve con vecinos/amigos/cuidador; en emergencia activa debe llamar al 131 o 133.
14. Continúa el hilo. No repitas el pitch ni las mismas viñetas.
</hard_rules>

<never>
- Diagnósticos médicos, indicación clínica o presentarte como dispositivo médico ISP.
- Afirmar enlace directo al 131/SAMU/133.
- GPS de rastreo continuo 24/7 (solo punto GPS en la alerta).
- Call center humano de monitoreo 24/7 (el soporte 24/7 es comercial; la emergencia la atienden los guardianes).
- Prometer que detecta el 100% de las caídas.
- Pedir datos de tarjeta, RUT, clave Webpay o códigos OTP.
</never>

${outputBlock}

<unknown_policy>
Si la pregunta no se puede responder con <allowed_knowledge>: dilo en una frase ("No tengo ese dato aquí") y ofrece ${SENIOR_SAFE_COMMERCIAL_EMAIL}. No completes con supuestos.
</unknown_policy>

<allowed_knowledge>
${SENIOR_SAFE_OFFICIAL_CONTEXT}
</allowed_knowledge>
</system_prompt>`;
}

function whatsAppSystemPromptForAudience(audience: WhatsAppCommercialAudience): string {
  return groqWhatsAppSystemPrompt(audience);
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

const GEO_INTENT_PRECIO =
  /\b(precio|cuanto cuesta|cuanto vale|valor del plan|valor|planes|plan unico|plan|oneclick|webpay|6900|69\.?000|30\.?000|80\.?000|alarma medica tradicional)\b/;
const GEO_INTENT_CAIDAS =
  /\b(caida|caidas|deteccion de caidas|sensor de caidas|acelerometro|inmovilidad|dispositivo medico|isp)\b/;
const GEO_INTENT_CASCADA =
  /\b(cascada|ecosystem_v3|canales redundantes|alerta en cascada|como avisa|como alerta)\b/;
const GEO_INTENT_COMO_FUNCIONA =
  /\b(como funciona|que es senior safe|que es el servicio)\b/;

/** Intents GEO comerciales. No sustituye classifyWhatsAppInboundMessage (emergencia vs comercial). */
export function matchGeoWhatsAppIntent(text: string): GeoWhatsAppIntent | null {
  const q = normalizeForAudienceMatch(text);
  if (GEO_INTENT_PRECIO.test(q)) return "precio";
  if (GEO_INTENT_CAIDAS.test(q)) return "caidas";
  if (GEO_INTENT_CASCADA.test(q)) return "cascada";
  if (GEO_INTENT_COMO_FUNCIONA.test(q) && !wantsSosSimulator(text)) return "cascada";
  return null;
}

function formatGeoWhatsAppReply(
  intent: GeoWhatsAppIntent,
  audience: WhatsAppCommercialAudience,
): string {
  const definition = GEO_WHATSAPP_DEFINITIONS[intent];
  const base = `Senior Safe 🛡️\n${definition}`;

  if (audience === "senior") {
    if (intent === "precio") {
      return `${base}\n\n¿Le ayudo a contratar? ${SENIOR_SAFE_CHECKOUT_URL}`;
    }
    if (intent === "caidas") {
      return `${base}\n\n¿Quiere que le explique el botón de emergencia?`;
    }
    return `${base}\n\n¿Le gustaría saber también el valor del plan?`;
  }

  if (intent === "precio") {
    return (
      `${base}\n\n` +
      `• Plan anual *$69.000* (ahorras 2 meses)\n` +
      `• Contratar: ${SENIOR_SAFE_CHECKOUT_URL}\n` +
      "¿Te paso el checkout?"
    );
  }
  if (intent === "caidas") {
    return (
      `${base}\n\n` +
      "• El celular debe ir *con la persona*\n" +
      "¿Te explico la *cascada* de avisos o el plan?"
    );
  }
  return (
    `${base}\n\n` +
    "• *SMS* al instante → *WhatsApp* a los 15 s → *llamada* a los 60 s\n" +
    "¿Quieres el simulador o el link para contratar?"
  );
}

const SOS_SIMULATOR_SIGNAL =
  /\b(demo|simulador|simular|simulaci[oó]n|probar|prueba|muestrame|mu[eé]strame|mostrar|ver como|ver c[oó]mo|flujo sos|bot[oó]n sos|bot[oó]n de p[aá]nico|bot[oó]n de emergencia|en vivo|interactivo|antes de contratar|sin instalar|c[oó]mo se ve|c[oó]mo funciona el bot[oó]n)\b/;

function wantsSosSimulator(text: string): boolean {
  return SOS_SIMULATOR_SIGNAL.test(normalizeForAudienceMatch(text));
}

function replyIncludesSimulator(text: string): boolean {
  return /simulador-senior-safe|\/simulador\b/i.test(text);
}

const APP_DOWNLOAD_STORE_SIGNAL =
  /\b(google play|play store|app store|apple store|playstore|appstore|tienda de apps?|tienda de aplicaciones|tiendas tradicionales|disponible en (google|play|app store|la tienda)|est[aá] en (google play|play store|app store|play|google|la tienda)|hay en (google play|play store|play|la tienda)|publicad[oa] en play|descarg(ar|o|a|ue) (la )?app|como descarg|d[oó]nde descarg|como (la )?instal|como bajo|bajar (la )?app|instal[ae]r (la )?app|instalaci[oó]n de la app|link de descarga|enlace de descarga|descarga de la app)\b/;

const APP_DOWNLOAD_GENERAL_SIGNAL =
  /\b(como descarg|d[oó]nde descarg|descargar|descargo|instalar|instalo|instalaci[oó]n|bajar la app)\b/;

function wantsAppDownloadOrStoreInfo(text: string): boolean {
  const q = normalizeForAudienceMatch(text);
  return APP_DOWNLOAD_STORE_SIGNAL.test(q) || APP_DOWNLOAD_GENERAL_SIGNAL.test(q);
}

function appDownloadStoreFallbackReply(audience: WhatsAppCommercialAudience): string {
  const base = "Senior Safe 🛡️\n";
  if (audience === "senior") {
    return (
      base +
      "Hola! En Android ya puede descargar Senior Safe desde Google Play. 🙂\n\n" +
      `• Google Play: ${SENIOR_SAFE_PLAY_STORE_URL}\n` +
      `• Primero contrate el plan ($6.900/mes) aquí: ${SENIOR_SAFE_CHECKOUT_URL}\n` +
      "• Luego abra la app e inicie sesión con su correo.\n" +
      `• iPhone: aún no está en App Store; guía: ${SENIOR_SAFE_INSTALL_GUIDE_URL}\n` +
      `• Simulador antes de contratar: ${SENIOR_SAFE_SOS_SIMULATOR_URL}\n\n` +
      "¿Su celular es Android? ¿Le ayudo con el plan?"
    );
  }
  return (
    base +
    "Hola! Senior Safe ya está en Google Play (Android). 🛡️\n\n" +
    `• Descargar: ${SENIOR_SAFE_PLAY_STORE_URL}\n` +
    `• Contratar primero ($6.900/mes): ${SENIOR_SAFE_CHECKOUT_URL}\n` +
    "• Después: instalar e iniciar sesión con el correo de la cuenta.\n" +
    `• iPhone: aún no en App Store — guía: ${SENIOR_SAFE_INSTALL_GUIDE_URL}\n` +
    `• Simulador: ${SENIOR_SAFE_SOS_SIMULATOR_URL}\n\n` +
    "¿Tu papá o mamá usa Android? ¿Te paso los pasos?"
  );
}

function simulatorFallbackReply(audience: WhatsAppCommercialAudience): string {
  const base = "Senior Safe 🛡️\n";
  if (audience === "senior") {
    return (
      base +
      `Puede probar cómo funciona sin instalar nada:\n${SENIOR_SAFE_SOS_SIMULATOR_URL}\n` +
      "Toque el botón rojo, elija el tipo de ayuda y vea cómo avisa a su familia 🙂\n" +
      "¿Le gustaría también saber el valor del plan?"
    );
  }
  return (
    base +
    `¡Perfecto! Prueba el simulador interactivo aquí (sin instalar):\n${SENIOR_SAFE_SOS_SIMULATOR_URL}\n` +
    "• Pulsa S.O.S → elige Salud, Accidente o Delincuencia\n" +
    "• Mira el panel de envíos a familiares en tiempo real\n" +
    "¿Te gustaría que te explique cómo contratar después de probarlo? 💙"
  );
}

function appendSimulatorLinkIfNeeded(
  userMessage: string,
  reply: string,
  audience: WhatsAppCommercialAudience,
): string {
  if (!wantsSosSimulator(userMessage) || replyIncludesSimulator(reply)) return reply;
  const hint =
    audience === "senior"
      ? `\n\nPruebe el simulador sin instalar: ${SENIOR_SAFE_SOS_SIMULATOR_URL}`
      : `\n\nPrueba el simulador interactivo: ${SENIOR_SAFE_SOS_SIMULATOR_URL}`;
  return `${reply}${hint}`.slice(0, 980);
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
1b) Si el correo pregunta por cascada de alertas, detección de caídas o precio/planes, la primera frase debe ser EXACTAMENTE el R: correspondiente del FAQ GEO (cascada, caídas o precio). No parafrasees esas definiciones.
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
  const geoIntent = matchGeoWhatsAppIntent(userMessage);
  if (geoIntent) {
    return formatGeoWhatsAppReply(geoIntent, audience);
  }

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
  if (/prueba|trial|gratis|demo|simulador|simular/.test(q)) {
    return simulatorFallbackReply(audience);
  }
  if (/como funciona|que es|servicio|app|flujo sos|boton sos|bot[oó]n de p[aá]nico/.test(q)) {
    if (audience === "senior") {
      return (
        base +
        `Es una aplicación sencilla en su celular con un botón grande de emergencia.\n` +
        `Puede probarlo aquí sin instalar: ${SENIOR_SAFE_SOS_SIMULATOR_URL}\n` +
        "¿Le gustaría saber el valor del plan?"
      );
    }
    return (
      base +
      "Senior Safe avisa a tu familia en segundos por WhatsApp, SMS y ubicación.\n" +
      `Prueba el simulador interactivo: ${SENIOR_SAFE_SOS_SIMULATOR_URL}\n` +
      "Contrata cuando quieras en " +
      SENIOR_SAFE_CHECKOUT_URL +
      " 💙"
    );
  }
  if (wantsAppDownloadOrStoreInfo(userMessage)) {
    return appDownloadStoreFallbackReply(audience);
  }
  if (/qr|pwa|configur|como uso|usar la app|paso a paso/.test(q)) {
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
  if (wantsSosSimulator(userMessage)) {
    return simulatorFallbackReply(audience);
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

  const geoIntent = matchGeoWhatsAppIntent(trimmed);
  if (geoIntent) {
    return formatGeoWhatsAppReply(geoIntent, audience);
  }

  if (wantsSosSimulator(trimmed)) {
    return simulatorFallbackReply(audience);
  }

  if (wantsAppDownloadOrStoreInfo(trimmed)) {
    return appDownloadStoreFallbackReply(audience);
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
    return appendSimulatorLinkIfNeeded(trimmed, formatWhatsAppCommercialReply(reply, trimmed), audience);
  } catch (e) {
    console.error("[senior-safe-ai]", e);
    const fallback = fallbackReply(trimmed, audience);
    if (fallback.includes(TRIGGER_TECHNICAL_EMAIL_REDIRECT)) {
      return formatWhatsAppCommercialReply(fallback, trimmed);
    }
    return appendSimulatorLinkIfNeeded(trimmed, fallback, audience);
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
