/**
 * Normaliza payloads entrantes de Zoho Mail (webhook / filtro / Zoho Flow).
 * @see https://www.zoho.com/mail/help/dev-platform/webhook.html
 */

export type InboundEmail = {
  fromAddress: string;
  fromName: string | null;
  toAddress: string;
  subject: string;
  bodyText: string;
  messageId: string | null;
  inReplyTo: string | null;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractEmailAddress(raw: string): string {
  const angle = raw.match(/<([^>]+@[^>]+)>/);
  if (angle?.[1]) return angle[1].trim().toLowerCase();
  const plain = raw.match(/[\w.+-]+@[\w.-]+\.\w+/);
  return (plain?.[0] ?? raw).trim().toLowerCase();
}

function extractDisplayName(raw: string): string | null {
  const m = raw.match(/^"?([^"<]+)"?\s*</);
  if (m?.[1]) return m[1].trim();
  if (!raw.includes("@")) return raw.trim() || null;
  return null;
}

/** Quita hilos citados para enviar solo la pregunta nueva a la IA. */
export function extractLatestCustomerQuestion(text: string): string {
  const lines = text.split(/\r?\n/);
  const cutPatterns = [
    /^On .+ wrote:$/i,
    /^El .+ escribió:$/i,
    /^De:/i,
    /^From:/i,
    /^-----Original Message-----/i,
    /^_{5,}/,
    /^>{1,}\s/,
  ];
  const kept: string[] = [];
  for (const line of lines) {
    if (cutPatterns.some((p) => p.test(line.trim()))) break;
    kept.push(line);
  }
  const trimmed = kept.join("\n").trim();
  return trimmed.length >= 8 ? trimmed : text.trim();
}

export function parseInboundEmailPayload(raw: unknown): InboundEmail | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const fromRaw = pickString(obj, [
    "fromAddress",
    "from_address",
    "FROM",
    "sender",
    "from",
    "From",
  ]);
  const toRaw = pickString(obj, ["toAddress", "to_address", "TO", "to", "To"]);
  const subject = pickString(obj, ["subject", "SUBJECT", "Subject"]) || "(sin asunto)";

  const summary = pickString(obj, ["summary", "body", "text", "plainText", "plain_text"]);
  const html = pickString(obj, ["html", "CONTENT", "content", "htmlBody", "html_body"]);
  const sm = pickString(obj, ["SM"]);

  let bodyText = summary || (html ? stripHtml(html) : "") || (sm ? stripHtml(sm) : "");
  bodyText = extractLatestCustomerQuestion(bodyText);

  const fromAddress = extractEmailAddress(fromRaw);
  if (!fromAddress || !fromAddress.includes("@")) return null;

  const messageId = pickString(obj, ["messageId", "message_id", "MSGID", "header_message_id"]) || null;
  const inReplyTo = pickString(obj, ["inReplyTo", "in_reply_to"]) || null;

  return {
    fromAddress,
    fromName: extractDisplayName(fromRaw),
    toAddress: extractEmailAddress(toRaw) || toRaw,
    subject,
    bodyText,
    messageId,
    inReplyTo: inReplyTo || null,
  };
}

export async function parseZohoWebhookRequest(request: Request): Promise<InboundEmail | null> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const json = await request.json();
    if (Array.isArray(json)) {
      return parseInboundEmailPayload(json[0]) ?? null;
    }
    const direct = parseInboundEmailPayload(json);
    if (direct) return direct;
    const nested = (json as Record<string, unknown>).data ?? (json as Record<string, unknown>).email;
    return parseInboundEmailPayload(nested) ?? null;
  }

  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const map: Record<string, unknown> = {};
    fd.forEach((v, k) => {
      map[k] = typeof v === "string" ? v : v.name;
    });
    return parseInboundEmailPayload(map);
  }

  const text = await request.text();
  if (!text.trim()) return null;
  try {
    return parseInboundEmailPayload(JSON.parse(text));
  } catch {
    return parseInboundEmailPayload({
      fromAddress: text.match(/From:\s*(.+)/i)?.[1],
      subject: text.match(/Subject:\s*(.+)/i)?.[1],
      summary: text,
    });
  }
}

const LOOP_SENDERS = [
  "mailer-daemon",
  "postmaster",
  "noreply",
  "no-reply",
  "donotreply",
];

const OUR_ADDRESSES = [
  "soporte@alarmaseniorsafe.cl",
  "hola@alarmaseniorsafe.cl",
  "enriquecasadesign@gmail.com",
];

export function shouldSkipAutoReply(mail: InboundEmail): string | null {
  const from = mail.fromAddress.toLowerCase();
  if (OUR_ADDRESSES.some((a) => from === a || from.endsWith(`<${a}>`))) {
    return "own_address";
  }
  if (LOOP_SENDERS.some((p) => from.includes(p))) {
    return "system_sender";
  }
  if (/^(re:|fw:|fwd:)\s*/i.test(mail.subject) && mail.bodyText.length < 20) {
    return "empty_reply";
  }
  if (!mail.bodyText || mail.bodyText.length < 3) {
    return "no_body";
  }
  const autoSubmitted = /auto-submitted|auto-replied|autoreply/i.test(mail.bodyText.slice(0, 200));
  if (autoSubmitted) return "auto_message";
  return null;
}
