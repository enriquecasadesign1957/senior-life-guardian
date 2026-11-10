const MONTHLY_CHECKOUT =
  "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/64a145ef-6ffa-46c4-b959-6f0d62948ed9";
const ANNUAL_CHECKOUT =
  "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/c7ee027e-6a95-4131-9b46-17d73babbafe";

const PAGE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Planes — Alarma Senior Safe</title>
  <meta name="description" content="Alarma Senior Safe para el resto del mundo. Plan mensual 8,90 USD o plan anual 89 USD. Pago con Lemon Squeezy." />
  <link rel="icon" href="https://alarmaseniorsafe.cl/brochure/logo-senior-safe.png" />
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #1c1917;
      background: #fff7f7;
    }
    a { color: inherit; }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 1040px;
      margin: 0 auto;
      padding: 20px 24px;
    }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .brand img { width: 52px; height: 52px; border-radius: 12px; }
    .brand strong { display: block; font-size: 1.15rem; }
    .brand span { color: #7f1d1d; font-size: 0.92rem; }
    .chile {
      font-size: 0.92rem;
      color: #991b1b;
      text-decoration: none;
    }
    .hero {
      background: linear-gradient(145deg, #9f1239 0%, #dc2626 55%, #ef4444 100%);
      color: white;
      text-align: center;
      padding: 64px 24px 88px;
    }
    .hero h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 3.6rem); letter-spacing: -0.03em; }
    .hero p { margin: 16px auto 0; max-width: 640px; font-size: 1.15rem; line-height: 1.5; color: rgba(255,255,255,.92); }
    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      max-width: 860px;
      margin: -48px auto 0;
      padding: 0 24px 48px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 18px 50px rgba(127, 29, 29, .12);
      display: flex;
      flex-direction: column;
    }
    .card.featured { outline: 3px solid #dc2626; }
    .badge {
      align-self: flex-start;
      background: #dcfce7;
      color: #166534;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      border-radius: 999px;
      padding: 4px 10px;
      margin-bottom: 12px;
    }
    h2 { margin: 0; font-size: 1.35rem; }
    .price { margin: 18px 0 6px; font-size: 3rem; font-weight: 750; letter-spacing: -0.04em; }
    .price small { font-size: 1rem; font-weight: 600; color: #78716c; }
    .note { margin: 0 0 18px; color: #57534e; }
    ul { margin: 0 0 24px; padding: 0; list-style: none; }
    li { padding: 8px 0 8px 28px; position: relative; }
    li::before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: 700; }
    .pay {
      margin-top: auto;
      display: block;
      text-align: center;
      text-decoration: none;
      background: #dc2626;
      color: white;
      font-weight: 700;
      border-radius: 999px;
      padding: 14px 18px;
    }
    .pay:hover { background: #b91c1c; }
    .card.featured .pay { background: #9f1239; }
    footer {
      max-width: 860px;
      margin: 0 auto;
      padding: 8px 24px 48px;
      color: #57534e;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <header>
    <a class="brand" href="/">
      <img src="https://alarmaseniorsafe.cl/brochure/logo-senior-safe.png" alt="Senior Safe" />
      <div>
        <strong>Senior Safe</strong>
        <span>Tu familia, siempre conectada</span>
      </div>
    </a>
    <a class="chile" href="https://alarmaseniorsafe.cl/planes">Plan en Chile</a>
  </header>
  <section class="hero">
    <h1>Elige tu plan</h1>
    <p>Botón SOS, WhatsApp, SMS, GPS y llamada automática. El pago internacional se hace en dólares con Lemon Squeezy.</p>
  </section>
  <section class="plans">
    <article class="card">
      <h2>Mensual</h2>
      <div class="price">$8.90 <small>USD / mes</small></div>
      <p class="note">Sin permanencia. Se renueva cada mes.</p>
      <ul>
        <li>Botón SOS de emergencia</li>
        <li>WhatsApp, SMS, GPS y llamada automática</li>
        <li>Hasta 3 guardianes</li>
        <li>Diseño fácil para adultos mayores</li>
      </ul>
      <a class="pay" href="${MONTHLY_CHECKOUT}">Pagar mensual con Lemon Squeezy</a>
    </article>
    <article class="card featured">
      <div class="badge">Ahorras 2 meses</div>
      <h2>Anual</h2>
      <div class="price">$89 <small>USD / año</small></div>
      <p class="note">Equivale a $7.42 USD al mes.</p>
      <ul>
        <li>Todo lo del plan mensual</li>
        <li>Un solo pago al año</li>
        <li>Mismos 3 guardianes</li>
        <li>Cancela la renovación cuando quieras</li>
      </ul>
      <a class="pay" href="${ANNUAL_CHECKOUT}">Pagar anual con Lemon Squeezy</a>
    </article>
  </section>
  <footer>
    <p>El cobro lo procesa Lemon Squeezy en dólares, con tarjeta, Apple Pay o Google Pay. Esta página es para fuera de Chile.</p>
    <p>Si vives en Chile, el plan en pesos está en <a href="https://alarmaseniorsafe.cl/planes">alarmaseniorsafe.cl/planes</a>. Soporte: <a href="mailto:hola@alarmaseniorsafe.cl">hola@alarmaseniorsafe.cl</a>.</p>
  </footer>
</body>
</html>`;

export default {
  async fetch() {
    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
