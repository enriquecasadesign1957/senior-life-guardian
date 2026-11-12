import { gatewayChargeMatches, isOneclickInscriptionAbandoned } from "../src/lib/payment-guards.ts";

const results = [];

function check(name, ok) {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}`);
}

check(
  "abandono oneclick con TBK_TOKEN y orden",
  isOneclickInscriptionAbandoned({
    tbkToken: "token-de-inscripcion",
    tbkOrdenCompra: "OC1",
    tbkIdSesion: "SES1",
  }) === true,
);

check(
  "abandono oneclick solo con sesión",
  isOneclickInscriptionAbandoned({
    tbkToken: "token-de-inscripcion",
    tbkIdSesion: "SES1",
  }) === true,
);

check(
  "retorno exitoso solo trae TBK_TOKEN",
  isOneclickInscriptionAbandoned({ tbkToken: "token-de-inscripcion" }) === false,
);

check(
  "sin token no es abandono",
  isOneclickInscriptionAbandoned({ tbkOrdenCompra: "OC1", tbkIdSesion: "SES1" }) === false,
);

check(
  "monto y orden coinciden",
  gatewayChargeMatches({
    expectedAmount: 5865,
    returnedAmount: 5865,
    orders: [{ expected: "ORDEN1", returned: "ORDEN1" }],
  }).ok === true,
);

check(
  "precio de lista también exige coincidencia",
  gatewayChargeMatches({
    expectedAmount: 6900,
    returnedAmount: 50,
    orders: [{ expected: "ORDEN1", returned: "ORDEN1" }],
  }).ok === false,
);

check(
  "orden distinta no se acepta",
  gatewayChargeMatches({
    expectedAmount: 5520,
    returnedAmount: 5520,
    orders: [{ expected: "TIENDA", returned: "OTRA" }],
  }).reason === "order",
);

check(
  "sesión distinta no se acepta",
  gatewayChargeMatches({
    expectedAmount: 69000,
    returnedAmount: 69000,
    orders: [{ expected: "ORDEN1", returned: "ORDEN1" }],
    expectedSessionId: "signup-1",
    returnedSessionId: "signup-2",
  }).reason === "session",
);

check(
  "sin sesión local no exige sesión de Transbank",
  gatewayChargeMatches({
    expectedAmount: 58650,
    returnedAmount: 58650,
    orders: [{ expected: "ORDEN1", returned: "ORDEN1" }],
    expectedSessionId: null,
    returnedSessionId: null,
  }).ok === true,
);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} ok`);
process.exit(failed.length ? 1 : 0);
