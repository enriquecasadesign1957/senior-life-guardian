import { PRODUCTION_SITE_URL } from "@/lib/app-url";

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <style>
      body { font: 16px/1.5 system-ui, -apple-system, sans-serif; background: #f1f5f9; color: #0f172a; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.25rem; }
      .card { max-width: 26rem; width: 100%; background: #fff; border-radius: 1.5rem; padding: 2rem; text-align: center; box-shadow: 0 20px 40px rgba(15,23,42,.08); }
      h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
      p { color: #475569; margin: 0 0 1rem; }
      .ok { color: #16a34a; font-size: 3rem; line-height: 1; margin-bottom: .75rem; }
      .err { color: #dc2626; font-size: 3rem; line-height: 1; margin-bottom: .75rem; }
      .note { font-size: .9rem; background: #fef3c7; color: #92400e; border-radius: .75rem; padding: .75rem; margin-bottom: 1rem; }
      label { display: block; text-align: left; font-weight: 600; margin-bottom: .35rem; font-size: .9rem; }
      input { width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: .75rem; padding: .75rem; font: inherit; margin-bottom: .75rem; }
      button, a.btn { display: inline-block; width: 100%; box-sizing: border-box; border: 0; border-radius: .75rem; padding: .85rem 1rem; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
      .primary { background: #16a34a; color: #fff; }
      .secondary { background: #e2e8f0; color: #0f172a; margin-top: .5rem; }
    </style>
  </head>
  <body>
    <div class="card">${body}</div>
  </body>
</html>`;
}

export function renderAckSuccessHtml(opts: {
  token: string;
  already: boolean;
  nombre?: string;
}): string {
  const note = opts.already
    ? `<div class="note">Esta alerta ya había sido confirmada antes.</div>`
    : `<p>Gracias. Le avisaremos al senior que ya viste la alerta. <strong>No debería recibirse la llamada automática.</strong></p>`;

  const form = opts.nombre
    ? `<p><strong>Confirmado por:</strong> ${escapeHtml(opts.nombre)}</p>`
    : `<form method="post" action="">
        <label for="nombre">¿Cómo te llamas? (opcional)</label>
        <input id="nombre" name="nombre" maxlength="120" placeholder="Tu nombre" />
        <button class="primary" type="submit">Guardar mi nombre</button>
      </form>`;

  return layout(
    "Alerta confirmada — Senior Safe",
    `<div class="ok">✓</div>
     <h1>Alerta confirmada</h1>
     ${note}
     ${form}
     <a class="btn secondary" href="${PRODUCTION_SITE_URL}/familia">Ir al portal familia</a>`,
  );
}

export function renderAckErrorHtml(message: string): string {
  return layout(
    "No se pudo confirmar — Senior Safe",
    `<div class="err">✕</div>
     <h1>No se pudo confirmar</h1>
     <p>${escapeHtml(message)}</p>
     <a class="btn secondary" href="${PRODUCTION_SITE_URL}/familia">Ir al portal familia</a>`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
