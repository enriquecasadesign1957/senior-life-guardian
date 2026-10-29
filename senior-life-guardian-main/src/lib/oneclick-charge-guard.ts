import {
  getOneclickMallConfig,
  refundOneclickMallTransaction,
  type AuthorizeMallResult,
} from "@/lib/transbank-oneclick-mall";
import { gatewayChargeMatches } from "@/lib/payment-guards";

export type OneclickChargeDecision = {
  accept: boolean;
  reversed: boolean;
  status: string;
  refundRaw: Record<string, unknown> | null;
};

/**
 * Acepta el cobro solo si Transbank autorizó el mismo monto y las mismas órdenes.
 * Si autorizó otra cosa, anula ese cargo y no activa la suscripción.
 */
export async function acceptOrReverseOneclickCharge(input: {
  auth: AuthorizeMallResult;
  expectedAmount: number;
  mallBuyOrder: string;
  storeBuyOrder: string;
}): Promise<OneclickChargeDecision> {
  const primary = input.auth.details[0];
  const rejectedStatus = primary?.status || "REJECTED";

  if (!input.auth.ok) {
    return { accept: false, reversed: false, status: rejectedStatus, refundRaw: null };
  }

  const match = gatewayChargeMatches({
    expectedAmount: input.expectedAmount,
    returnedAmount: primary?.amount,
    orders: [
      { expected: input.storeBuyOrder, returned: primary?.buyOrder },
      { expected: input.mallBuyOrder, returned: input.auth.buyOrder },
    ],
  });

  if (match.ok) {
    return {
      accept: true,
      reversed: false,
      status: primary?.status || "AUTHORIZED",
      refundRaw: null,
    };
  }

  const refundAmount =
    typeof primary?.amount === "number" && Number.isInteger(primary.amount) && primary.amount > 0
      ? primary.amount
      : input.expectedAmount;

  let reversed = false;
  let refundRaw: Record<string, unknown> | null = null;
  try {
    const cfg = getOneclickMallConfig();
    const refund = await refundOneclickMallTransaction({
      mallBuyOrder: input.mallBuyOrder,
      storeCommerceCode: cfg.storeCommerceCode,
      storeBuyOrder: input.storeBuyOrder,
      amount: refundAmount,
    });
    reversed = refund.ok;
    refundRaw = refund.raw;
    if (!refund.ok) {
      console.error("[oneclick] anulación por monto distinto falló", {
        mallBuyOrder: input.mallBuyOrder,
        storeBuyOrder: input.storeBuyOrder,
        refundAmount,
        reason: match.reason,
      });
    }
  } catch (error) {
    console.error("[oneclick] anulación por monto distinto", {
      mallBuyOrder: input.mallBuyOrder,
      storeBuyOrder: input.storeBuyOrder,
      error,
    });
    refundRaw = {
      error: error instanceof Error ? error.message : "No se pudo anular el cobro",
    };
  }

  return { accept: false, reversed, status: "AMOUNT_MISMATCH", refundRaw };
}
