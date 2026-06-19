/**
 * Crea inscripción débito y guarda token + username en public/oneclick-debit-inscription.json
 */
import fs from "node:fs";

const MALL_CC = "597055555541";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const RETURN_URL = "http://localhost:8082/oneclick/debit-retorno";

const username = `valdebit${Date.now().toString(36)}`.slice(0, 40);
const email = "validacion-debit@alarmaseniorsafe.cl";

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
fs.writeFileSync("public/oneclick-debit-inscription.json", JSON.stringify(data, null, 2));

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/><title>Inscripción débito</title></head>
<body><p>Redirigiendo a Webpay…</p>
<form id="f" method="POST" action="${body.url_webpay}">
<input type="hidden" name="TBK_TOKEN" value="${body.token}"/></form>
<script>document.getElementById("f").submit();</script></body></html>`;
fs.writeFileSync("public/oneclick-debit-inscription.html", html);

console.log("Token inscripción:", body.token);
console.log("Username:", username);
console.log("Abre: http://localhost:8082/oneclick-debit-inscription.html");
console.log("Tarjeta Redcompra: 4051 8842 3993 7763");
