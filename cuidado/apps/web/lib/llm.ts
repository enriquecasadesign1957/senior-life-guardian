import { explainResultSchema } from "@cuidado/contract";
import type { DraftFinding } from "./explain";

export async function polishSummary(drafts: DraftFinding[]): Promise<unknown> {
  const openai = process.env.OPENAI_API_KEY;
  const anthropic = process.env.ANTHROPIC_API_KEY;
  if (!openai && !anthropic) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    if (openai) {
      return await askOpenAI(openai, drafts, controller.signal);
    }
    return await askAnthropic(anthropic as string, drafts, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function askOpenAI(key: string, drafts: DraftFinding[], signal: AbortSignal): Promise<unknown> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal,
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Redactas un párrafo en castellano, de máximo 400 caracteres, para el dueño de un sitio. No menciones funciones, archivos PHP ni jerga. Devuelve JSON con summary e issues. En issues solo puedes repetir code y actionId tal como vienen. Si no hay arreglo, actionId es null.",
        },
        { role: "user", content: JSON.stringify({ drafts }) },
      ],
    }),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) return null;
  return explainResultSchema.safeParse(JSON.parse(content)).data ?? null;
}

async function askAnthropic(key: string, drafts: DraftFinding[], signal: AbortSignal): Promise<unknown> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 400,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Devuelve solo JSON { "summary": string, "issues": [{ "code": string, "severity": "low"|"medium"|"high", "plainTitle": string, "whatItMeans": string, "ifIgnored": string, "actionId": string|null, "source": "model" }] }. El summary va en castellano, máximo 400 caracteres, sin jerga. No cambies los actionId de entrada. Datos: ${JSON.stringify(drafts)}`,
        },
      ],
    }),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { content?: Array<{ text?: string }> };
  const text = body.content?.[0]?.text;
  if (!text) return null;
  return explainResultSchema.safeParse(JSON.parse(text)).data ?? null;
}
