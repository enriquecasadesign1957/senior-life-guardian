/**
 * Inscripción Oneclick para caso "Cancelar / Abandonar inscripción".
 * node scripts/oneclick-validation-start-abandon-inscription.mjs
 */
import fs from "node:fs";

const MALL_CC = "597055555541";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const RETURN_URL = "http://localhost:8082/oneclick/inscripcion-abandonada";

const username = `valabandon${Date.now().toString(36)}`.slice(0, 40);
const email = "validacion-abandon@alarmaseniorsafe.cl";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const res = await fetch(
  "https://webpay3gint.transbank.cl/rswebpaytransaction/api/oneclick/v1.2/inscriptions",
  {
    method: "POST",
    headers: {
      "Tbk-Api-Key-Id": MALL_CC,
      "Tbk-Api-Key-Secret": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, response_url: RETURN_URL }),
  },
);

const body = await res.json();
if (!body.token) {
  console.error(body);
  process.exit(1);
}

const data = { token: body.token, username, url: body.url_webpay, email };
fs.writeFileSync("public/oneclick-abandon-inscription.json", JSON.stringify(data, null, 2));

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Abandonar inscripción</title></head>
<body style="font-family:sans-serif;padding:2rem;max-width:640px">
<h1>Inscripción Oneclick — abandonar</h1>
<p>En Webpay presiona <strong>«Abandonar y volver al comercio»</strong> (no completes el pago).</p>
<form id="f" method="POST" action="${body.url_webpay}">
<input type="hidden" name="TBK_TOKEN" value="${body.token}"/></form>
<script>document.getElementById("f").submit();</script>
</body></html>`;
fs.writeFileSync("public/oneclick-abandon-inscription.html", html);

console.log("\n===== CANCELAR INSCRIPCIÓN (abandonar) =====");
console.log("\n→ TOKEN para formulario Transbank (al CREAR la inscripción):");
console.log(body.token);
console.log("\n→ Abre Webpay:");
console.log("http://localhost:8082/oneclick-abandon-inscription.html");
console.log("\n→ En Webpay: «Abandonar y volver al comercio»");
console.log("→ Retorno: http://localhost:8082/oneclick/inscripcion-abandonada");
