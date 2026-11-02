import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-BC9oXVxV.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { y as CASCADE_ACK_HINT } from "./emergency-cascade-continuation-BhQV3eMZ.mjs";
import { a as DEMO_KPIS, D as DEMO_ALERTS, b as DEMO_ALERTS_BY_COMUNA, c as DEMO_SENIORS } from "./demo-data-CXO5wtMy.mjs";
import { g as Sparkles, V as Bot, W as Send } from "../_libs/lucide-react.mjs";
function responseTimeInsightAnswer() {
  const { tiempo_respuesta_promedio_min, tasa_ack_pct } = DEMO_KPIS;
  return `El **tiempo promedio de respuesta** (confirmación familiar) es **${tiempo_respuesta_promedio_min} minutos**, con una tasa de acuse del **${tasa_ack_pct}%**.

**Qué mide:** cuánto tarda un familiar en confirmar recepción (SMS, WhatsApp o enlace \`/a/…\`) desde que se activa la alerta. **No mide** llegada de ambulancia ni tiempo de entrega del primer mensaje.

**Por qué no es «falla del sistema»:** la cascada SOS notifica en **menos de 30 s** (SMS → WhatsApp → llamada). Los ${tiempo_respuesta_promedio_min} min son **tiempo humano**: leer el aviso, abrir el mapa, decidir si es urgente real y acusar recibo — a menudo con el teléfono en silencio, en trabajo o con varios guardianes en cadena.

**Por qué conviven ${tasa_ack_pct}% de acuse y ${tiempo_respuesta_promedio_min} min:** casi todas las alertas **sí** reciben confirmación; el promedio refleja **qué tan rápido** lo hace la familia, no si lo hace. Unos casos de 8–10 min suben la media aunque la mayoría responda en 1–3 min.

**Mejora práctica:** más guardianes con WhatsApp activo, capacitar en acuse rápido (${CASCADE_ACK_HINT}) y revisar el ${100 - tasa_ack_pct}% sin acuse.`;
}
const FAQ = [
  {
    match: /usuarios? protegidos|cuántos usuarios|beneficiarios/i,
    answer: `Actualmente hay **${DEMO_KPIS.usuarios_protegidos.toLocaleString("es-CL")} usuarios protegidos** en el programa institucional demo, con **${DEMO_KPIS.familiares_vinculados.toLocaleString("es-CL")} familiares** vinculados.`
  },
  {
    match: /alertas? (del )?mes|alertas este mes/i,
    answer: `Este mes se registraron **${DEMO_KPIS.alertas_mes} alertas**, de las cuales **${DEMO_KPIS.casos_criticos_mes}** fueron clasificadas como críticas (SOS o caída).`
  },
  {
    match: /tiempo.*respuesta|promedio.*minut|por qu[eé].*(alto|lento|demora)|tasa.*acuse|acuse.*recibo/i,
    answer: responseTimeInsightAnswer()
  },
  {
    match: /casos cr[ií]ticos|cr[ií]ticas/i,
    answer: `Hay **${DEMO_KPIS.casos_criticos_mes} casos críticos** este mes. El 94% recibió confirmación en menos de 10 minutos.`
  },
  {
    match: /comunas?|municipalidad|m[aá]s eventos/i,
    answer: `Comunas con más eventos: **${DEMO_ALERTS_BY_COMUNA.slice(0, 3).map((c) => `${c.comuna} (${c.alertas})`).join("**, **")}**.`
  },
  {
    match: /c[oó]mo funciona|flujo|sos|cascada/i,
    answer: "El flujo SOS sigue la cascada **SMS (0 s) → WhatsApp (15 s) → llamada (60 s)** si no hay confirmación. Los familiares pueden acusar recibo por SMS, WhatsApp o enlace web `/a/…`."
  },
  {
    match: /geocerca|gps|ubicaci[oó]n/i,
    answer: "En producción, Senior Safe registra GPS en cada alerta y heartbeat en `device_status`. En demo institucional se simulan geocercas y historial GPS para presentaciones municipales."
  },
  {
    match: /mar[ií]a|pedro|carmen|senior/i,
    answer: `Usuarios demo activos: **${DEMO_SENIORS.map((s) => `${s.nombre} (${s.comuna})`).join("**, **")}**. Todos con plan Único y suscripción activa.`
  }
];
function answerDemoInsight(question) {
  const q = question.trim();
  if (!q) return "Escribe una pregunta sobre usuarios, alertas, tiempos de respuesta o comunas.";
  for (const item of FAQ) {
    if (item.match.test(q)) return item.answer;
  }
  const recent = DEMO_ALERTS[0];
  return `No encontré una respuesta exacta. Datos recientes: última alerta **${recent.event_type}** de **${recent.senior_nombre}** en **${recent.comuna}** (${recent.status}). Pregunta por: usuarios protegidos, alertas del mes, tiempo de respuesta, casos críticos o comunas.`;
}
const SUGGESTIONS = [
  "¿Cuántos usuarios protegidos hay?",
  "Alertas del mes",
  "¿Por qué el tiempo de respuesta es tan alto?",
  "Comunas con más eventos"
];
function DemoInsightsChat({ compact }) {
  const [messages, setMessages] = reactExports.useState([
    {
      role: "assistant",
      text: "Soy **Senior Safe Insights**. Pregúntame sobre usuarios protegidos, alertas, tiempos de respuesta o comunas."
    }
  ]);
  const [input, setInput] = reactExports.useState("");
  const ask = (q) => {
    const text = q.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: answerDemoInsight(text) }]);
    setInput("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: compact ? "flex flex-col h-full min-h-[280px] rounded-2xl border border-border bg-card" : "flex flex-col h-[420px] rounded-3xl border border-border bg-card shadow-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-b border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm", children: "Senior Safe Insights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground ml-auto", children: "Demo IA" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 text-sm", children: messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: m.role === "user" ? "ml-8 rounded-2xl bg-primary/10 px-3 py-2 text-foreground" : "mr-4 rounded-2xl bg-muted px-3 py-2 text-foreground",
            children: [
              m.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "w-3.5 h-3.5 inline mr-1 opacity-60" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dangerouslySetInnerHTML: { __html: formatBold(m.text) } })
            ]
          },
          i
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-border space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: SUGGESTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => ask(s),
              className: "text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground",
              children: s
            },
            s
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "form",
            {
              className: "flex gap-2",
              onSubmit: (e) => {
                e.preventDefault();
                ask(input);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Pregunta institucional…", className: "text-sm" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", "aria-label": "Enviar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }) })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function formatBold(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
}
export {
  DemoInsightsChat as D
};
