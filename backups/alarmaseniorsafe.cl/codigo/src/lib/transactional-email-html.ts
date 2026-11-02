import { SENIOR_SAFE_SUPPORT_EMAIL } from "@/lib/senior-safe-ai";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type BillingEmailLayout = {
  preheader: string;
  greeting: string;
  title: string;
  lines: string[];
  ctaLabel: string;
  ctaUrl: string;
  accountEmail: string;
  footerNote?: string;
};

/** HTML transaccional de facturación (sin copy de “bot” ni respuesta automática). */
export function buildBillingEmailHtml(layout: BillingEmailLayout): string {
  const body = layout.lines
    .map(
      (line) =>
        `<p style="margin:0 0 14px;line-height:1.6;color:#334155;font-size:15px;">${escapeHtml(line)}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(layout.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(layout.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <tr>
      <td style="background:#0f4c5c;padding:22px 28px;">
        <div style="color:#fff;font-size:20px;font-weight:700;">Senior Safe</div>
        <div style="color:#a7f3d0;font-size:13px;margin-top:4px;">Alarma Senior Safe · alarmaseniorsafe.cl</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <p style="margin:0 0 12px;font-size:15px;color:#334155;">${escapeHtml(layout.greeting)}</p>
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#0f172a;">${escapeHtml(layout.title)}</h1>
        ${body}
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 8px;">
          <tr>
            <td style="background:#0f4c5c;border-radius:8px;">
              <a href="${escapeHtml(layout.ctaUrl)}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(layout.ctaLabel)}</a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.5;">
          Enlace directo: <a href="${escapeHtml(layout.ctaUrl)}" style="color:#0f766e;">${escapeHtml(layout.ctaUrl)}</a>
        </p>
        <p style="margin:20px 0 0;font-size:13px;color:#64748b;">
          Cuenta registrada: <strong style="color:#334155;">${escapeHtml(layout.accountEmail)}</strong>
        </p>
        ${layout.footerNote ? `<p style="margin:12px 0 0;font-size:13px;color:#64748b;">${escapeHtml(layout.footerNote)}</p>` : ""}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;line-height:1.5;">
        Este es un aviso de facturación de tu suscripción Senior Safe. Si ya realizaste el pago, puedes ignorar este mensaje.<br/>
        Consultas: <a href="mailto:${SENIOR_SAFE_SUPPORT_EMAIL}" style="color:#0f766e;">${SENIOR_SAFE_SUPPORT_EMAIL}</a> · Chile
      </td>
    </tr>
  </table>
</body>
</html>`;
}
