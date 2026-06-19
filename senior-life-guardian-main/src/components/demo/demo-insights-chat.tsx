import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { answerDemoInsight, type InsightMessage } from "@/lib/demo/demo-insights";

const SUGGESTIONS = [
  "¿Cuántos usuarios protegidos hay?",
  "Alertas del mes",
  "¿Por qué el tiempo de respuesta es tan alto?",
  "Comunas con más eventos",
];

export function DemoInsightsChat({ compact }: { compact?: boolean }) {
  const [messages, setMessages] = useState<InsightMessage[]>([
    {
      role: "assistant",
      text: "Soy **Senior Safe Insights**. Pregúntame sobre usuarios protegidos, alertas, tiempos de respuesta o comunas.",
    },
  ]);
  const [input, setInput] = useState("");

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: answerDemoInsight(text) }]);
    setInput("");
  };

  return (
    <div
      className={
        compact
          ? "flex flex-col h-full min-h-[280px] rounded-2xl border border-border bg-card"
          : "flex flex-col h-[420px] rounded-3xl border border-border bg-card shadow-sm"
      }
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-bold text-sm">Senior Safe Insights</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">Demo IA</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-8 rounded-2xl bg-primary/10 px-3 py-2 text-foreground"
                : "mr-4 rounded-2xl bg-muted px-3 py-2 text-foreground"
            }
          >
            {m.role === "assistant" && <Bot className="w-3.5 h-3.5 inline mr-1 opacity-60" />}
            <span dangerouslySetInnerHTML={{ __html: formatBold(m.text) }} />
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="text-[10px] px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta institucional…" className="text-sm" />
          <Button type="submit" size="icon" aria-label="Enviar">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function formatBold(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}
