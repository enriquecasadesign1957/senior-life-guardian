/**
 * Oneclick Mall: token de inscripción débito/prepago (solo API Transbank).
 * node scripts/oneclick-validation-start-inscription.mjs [debit|prepago]
 */
const MALL_CC = "597055555541";
const API_KEY =
  "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
const API_HOST = "https://webpay3gint.transbank.cl";
const RETURN_URL = "http://localhost:8082/oneclick/retorno";

const CARD_HINTS = {
  debit: {
    label: "Redcompra (débito) aprobada",
    number: "4051 8842 3993 7763",
  },
  prepago: {
    label: "Prepago Visa aprobada",
    number: "4051 8860 0005 6590",
    cvv: "123",
  },
};

const cardType = (process.argv[2] ?? "debit").toLowerCase() === "prepago" ? "prepago" : "debit";
const card = CARD_HINTS[cardType];
const username = `val${cardType}${Date.now().toString(36)}`.slice(0, 40);
const email = `validacion-${cardType}@alarmaseniorsafe.cl`;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const res = await fetch(`${API_HOST}/rswebpaytransaction/api/oneclick/v1.2/inscriptions`, {
  method: "POST",
  headers: {
    "Tbk-Api-Key-Id": MALL_CC,
    "Tbk-Api-Key-Secret": API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ username, email, response_url: RETURN_URL }),
});

const body = await res.json();
if (!res.ok || !body.token) {
  console.error("Error:", body);
  process.exit(1);
}

console.log("\n===== INSCRIPCIÓN DÉBITO/PREPAGO =====");
console.log("Tipo:", card.label);
console.log("\n→ TOKEN (formulario Transbank):");
console.log(body.token);
console.log("\n→ Abre esta URL y paga con la tarjeta de prueba:");
console.log(body.url_webpay);
console.log("\nTarjeta:", card.number);
if (card.cvv) console.log("CVV:", card.cvv);
console.log("RUT/clave Webpay: 11.111.111-1 / 123");
