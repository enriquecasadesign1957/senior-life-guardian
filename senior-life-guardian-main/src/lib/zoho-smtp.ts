/**
 * Envío de correo vía SMTP de Zoho Mail (sin dependencias externas).
 */
import tls from "node:tls";

export const ZOHO_SUPPORT_AUDIT_BCC = "enriquecasadesign@gmail.com";

export type SendSupportEmailInput = {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  /** Message-ID del correo entrante (para threading). */
  inReplyTo?: string | null;
  references?: string | null;
};

export type ZohoSmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  bcc: string;
};

export function getZohoSmtpConfig(): ZohoSmtpConfig | null {
  const user = process.env.ZOHO_SMTP_USER?.trim();
  const password = process.env.ZOHO_SMTP_PASSWORD?.trim();
  if (!user || !password) return null;

  const fromName = process.env.ZOHO_SMTP_FROM_NAME?.trim() || "Senior Safe — Soporte";
  const fromEmail = process.env.ZOHO_SMTP_FROM?.trim() || user;

  return {
    host: process.env.ZOHO_SMTP_HOST?.trim() || "smtp.zoho.com",
    port: Number(process.env.ZOHO_SMTP_PORT || "465"),
    secure: (process.env.ZOHO_SMTP_SECURE ?? "true") !== "false",
    user,
    password,
    from: `"${fromName.replace(/"/g, "")}" <${fromEmail}>`,
    bcc: process.env.ZOHO_SMTP_BCC?.trim() || ZOHO_SUPPORT_AUDIT_BCC,
  };
}

function b64(s: string): string {
  return Buffer.from(s, "utf8").toString("base64");
}

function escapeHeaderValue(v: string): string {
  return v.replace(/[\r\n]/g, " ").trim();
}

function buildMimeMessage(input: SendSupportEmailInput, cfg: ZohoSmtpConfig): string {
  const boundary = `ss_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const date = new Date().toUTCString();
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@alarmaseniorsafe.cl>`;

  const headers = [
    `From: ${cfg.from}`,
    `To: ${escapeHeaderValue(input.to)}`,
    `Bcc: ${cfg.bcc}`,
    `Subject: =?UTF-8?B?${b64(input.subject)}?=`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Mailer: Senior Safe Support Bot`,
  ];

  if (input.inReplyTo) {
    headers.push(`In-Reply-To: ${escapeHeaderValue(input.inReplyTo)}`);
  }
  if (input.references) {
    headers.push(`References: ${escapeHeaderValue(input.references)}`);
  }

  const parts = [
    headers.join("\r\n"),
    "",
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    "",
    b64(input.textBody),
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    "",
    b64(input.htmlBody),
    `--${boundary}--`,
    "",
  ].join("\r\n");

  return parts;
}

class SmtpSession {
  private buffer = "";

  constructor(
    private socket: tls.TLSSocket,
    private timeoutMs = 25_000,
  ) {
    this.socket.setEncoding("utf8");
    this.socket.setTimeout(this.timeoutMs);
  }

  private onData(chunk: string) {
    this.buffer += chunk;
  }

  private async readResponse(expectedCodes: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("SMTP timeout")), this.timeoutMs);
      const tryParse = () => {
        const lines = this.buffer.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) return;
        const last = lines[lines.length - 1];
        const code = parseInt(last.slice(0, 3), 10);
        if (Number.isNaN(code)) return;
        const isComplete = last.length >= 4 && last[3] === " ";
        if (!isComplete) return;
        clearTimeout(timer);
        this.socket.off("data", onChunk);
        const full = this.buffer;
        this.buffer = "";
        if (!expectedCodes.includes(code)) {
          reject(new Error(`SMTP ${code}: ${full.trim()}`));
          return;
        }
        resolve(full);
      };
      const onChunk = (d: string) => {
        this.onData(d);
        tryParse();
      };
      this.socket.on("data", onChunk);
      tryParse();
    });
  }

  private async send(cmd: string, expected: number[]) {
    this.socket.write(`${cmd}\r\n`);
    return this.readResponse(expected);
  }

  async run(cfg: ZohoSmtpConfig, mime: string, to: string) {
    await this.readResponse([220]);
    await this.send(`EHLO alarmaseniorsafe.cl`, [250]);
    await this.send("AUTH LOGIN", [334]);
    await this.send(b64(cfg.user), [334]);
    await this.send(b64(cfg.password), [235]);
    const fromEmail = cfg.user;
    await this.send(`MAIL FROM:<${fromEmail}>`, [250]);
    await this.send(`RCPT TO:<${to}>`, [250, 251]);
    await this.send(`RCPT TO:<${cfg.bcc}>`, [250, 251]);
    await this.send("DATA", [354]);
    this.socket.write(`${mime.replace(/\r\n\./g, "\r\n..")}\r\n.\r\n`);
    await this.readResponse([250]);
    await this.send("QUIT", [221]);
  }

  close() {
    try {
      this.socket.end();
    } catch {
      /* ignore */
    }
  }
}

export async function sendSupportEmailViaZoho(input: SendSupportEmailInput): Promise<void> {
  const cfg = getZohoSmtpConfig();
  if (!cfg) {
    throw new Error("Zoho SMTP no configurado (ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD)");
  }

  const mime = buildMimeMessage(input, cfg);

  await new Promise<void>((resolve, reject) => {
    const socket = cfg.secure
      ? tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host })
      : null;

    if (!socket) {
      reject(new Error("Solo se soporta SMTP SSL (puerto 465) en esta configuración"));
      return;
    }

    socket.once("error", reject);
    socket.once("secureConnect", async () => {
      const session = new SmtpSession(socket);
      try {
        await session.run(cfg, mime, input.to);
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        session.close();
      }
    });
  });
}

/** Plantilla HTML institucional para respuestas de soporte. */
export function wrapSupportHtmlReply(bodyText: string, customerName?: string): string {
  const greeting = customerName ? `Estimado/a ${escapeHtml(customerName)},` : "Estimado/a cliente,";
  const paragraphs = bodyText
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.55;color:#1e293b;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#0f766e,#134e4a);padding:22px 28px;">
        <div style="color:#fff;font-size:20px;font-weight:700;">Senior Safe</div>
        <div style="color:#ccfbf1;font-size:13px;margin-top:4px;">Teleasistencia para adultos mayores</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <p style="margin:0 0 16px;font-size:15px;color:#334155;">${greeting}</p>
        ${paragraphs}
        <p style="margin:20px 0 0;font-size:14px;color:#64748b;">Atentamente,<br/><strong style="color:#0f766e;">Equipo de Soporte — Senior Safe</strong><br/>
        <a href="mailto:soporte@alarmaseniorsafe.cl" style="color:#0f766e;">soporte@alarmaseniorsafe.cl</a> ·
        <a href="https://alarmaseniorsafe.cl" style="color:#0f766e;">alarmaseniorsafe.cl</a></p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;">
        Respuesta automática generada para orientarte sobre nuestro servicio. Si tu consulta requiere gestión de cuenta, reembolso o datos personales, indícalo en tu respuesta y te contactaremos.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
