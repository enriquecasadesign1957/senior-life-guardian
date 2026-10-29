/**
 * Reglas puras del retorno Transbank.
 * Sirven para convenio y para el precio de lista.
 */

export function isOneclickInscriptionAbandoned(params: {
  tbkToken?: string | null;
  tbkOrdenCompra?: string | null;
  tbkIdSesion?: string | null;
}): boolean {
  if (!params.tbkToken?.trim()) return false;
  return Boolean(params.tbkOrdenCompra?.trim() || params.tbkIdSesion?.trim());
}

export type GatewayChargeMatch =
  | { ok: true }
  | { ok: false; reason: "amount" | "order" | "session" };

/** El cargo confirmado por Transbank tiene que ser el de la orden local. */
export function gatewayChargeMatches(input: {
  expectedAmount: number;
  returnedAmount: number | null | undefined;
  orders: Array<{ expected: string; returned: string | null | undefined }>;
  expectedSessionId?: string | null;
  returnedSessionId?: string | null;
}): GatewayChargeMatch {
  if (!Number.isInteger(input.expectedAmount) || input.expectedAmount <= 0) {
    return { ok: false, reason: "amount" };
  }
  if (input.returnedAmount !== input.expectedAmount) {
    return { ok: false, reason: "amount" };
  }
  for (const order of input.orders) {
    if (!order.expected || !order.returned || order.returned !== order.expected) {
      return { ok: false, reason: "order" };
    }
  }
  if (input.expectedSessionId) {
    if (!input.returnedSessionId || input.returnedSessionId !== input.expectedSessionId) {
      return { ok: false, reason: "session" };
    }
  }
  return { ok: true };
}
