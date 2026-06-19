/**
 * Senior Safe Insights — respuestas basadas en datos demo (sin LLM externo en demo).
 */

import {
  DEMO_ALERTS,
  DEMO_ALERTS_BY_COMUNA,
  DEMO_KPIS,
  DEMO_SENIORS,
} from "@/lib/demo/demo-data";

export type InsightMessage = { role: "user" | "assistant"; text: string };

function responseTimeInsightAnswer(): string {
  const { tiempo_respuesta_promedio_min, tasa_ack_pct } = DEMO_KPIS;
  return (
    `El **tiempo promedio de respuesta** (confirmación familiar) es **${tiempo_respuesta_promedio_min} minutos**, con una tasa de acuse del **${tasa_ack_pct}%**.\n\n` +
    `**Qué mide:** cuánto tarda un familiar en confirmar recepción (SMS, WhatsApp o enlace \`/a/…\`) desde que se activa la alerta. **No mide** llegada de ambulancia ni tiempo de entrega del primer mensaje.\n\n` +
    `**Por qué no es «falla del sistema»:** la cascada SOS notifica en **menos de 30 s** (SMS → WhatsApp → llamada). Los ${tiempo_respuesta_promedio_min} min son **tiempo humano**: leer el aviso, abrir el mapa, decidir si es urgente real y acusar recibo — a menudo con el teléfono en silencio, en trabajo o con varios guardianes en cadena.\n\n` +
    `**Por qué conviven ${tasa_ack_pct}% de acuse y ${tiempo_respuesta_promedio_min} min:** casi todas las alertas **sí** reciben confirmación; el promedio refleja **qué tan rápido** lo hace la familia, no si lo hace. Unos casos de 8–10 min suben la media aunque la mayoría responda en 1–3 min.\n\n` +
    `**Mejora práctica:** más guardianes con WhatsApp activo, capacitar en acuse rápido (evita la llamada a los 30 s) y revisar el ${100 - tasa_ack_pct}% sin acuse.`
  );
}

const FAQ: { match: RegExp; answer: string }[] = [
  {
    match: /usuarios? protegidos|cuántos usuarios|beneficiarios/i,
    answer: `Actualmente hay **${DEMO_KPIS.usuarios_protegidos.toLocaleString("es-CL")} usuarios protegidos** en el programa institucional demo, con **${DEMO_KPIS.familiares_vinculados.toLocaleString("es-CL")} familiares** vinculados.`,
  },
  {
    match: /alertas? (del )?mes|alertas este mes/i,
    answer: `Este mes se registraron **${DEMO_KPIS.alertas_mes} alertas**, de las cuales **${DEMO_KPIS.casos_criticos_mes}** fueron clasificadas como críticas (SOS o caída).`,
  },
  {
    match: /tiempo.*respuesta|promedio.*minut|por qu[eé].*(alto|lento|demora)|tasa.*acuse|acuse.*recibo/i,
    answer: responseTimeInsightAnswer(),
  },
  {
    match: /casos cr[ií]ticos|cr[ií]ticas/i,
    answer: `Hay **${DEMO_KPIS.casos_criticos_mes} casos críticos** este mes. El 94% recibió confirmación en menos de 10 minutos.`,
  },
  {
    match: /comunas?|municipalidad|m[aá]s eventos/i,
    answer: `Comunas con más eventos: **${DEMO_ALERTS_BY_COMUNA.slice(0, 3)
      .map((c) => `${c.comuna} (${c.alertas})`)
      .join("**, **")}**.`,
  },
  {
    match: /c[oó]mo funciona|flujo|sos|cascada/i,
    answer:
      "El flujo SOS sigue la cascada **SMS (0 s) → WhatsApp (15 s) → llamada (30 s)** si no hay confirmación. Los familiares pueden acusar recibo por SMS, WhatsApp o enlace web `/a/…`.",
  },
  {
    match: /geocerca|gps|ubicaci[oó]n/i,
    answer:
      "En producción, Senior Safe registra GPS en cada alerta y heartbeat en `device_status`. En demo institucional se simulan geocercas y historial GPS para presentaciones municipales.",
  },
  {
    match: /mar[ií]a|pedro|carmen|senior/i,
    answer: `Usuarios demo activos: **${DEMO_SENIORS.map((s) => `${s.nombre} (${s.comuna})`).join("**, **")}**. Todos con plan Único y suscripción activa.`,
  },
];

export function answerDemoInsight(question: string): string {
  const q = question.trim();
  if (!q) return "Escribe una pregunta sobre usuarios, alertas, tiempos de respuesta o comunas.";

  for (const item of FAQ) {
    if (item.match.test(q)) return item.answer;
  }

  const recent = DEMO_ALERTS[0];
  return `No encontré una respuesta exacta. Datos recientes: última alerta **${recent.event_type}** de **${recent.senior_nombre}** en **${recent.comuna}** (${recent.status}). Pregunta por: usuarios protegidos, alertas del mes, tiempo de respuesta, casos críticos o comunas.`;
}
