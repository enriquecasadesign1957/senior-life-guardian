/** Datos fijos — prueba exitosa integración Transbank (captura formulario). */
export const ONECLICK_VALIDATION_VOUCHER = {
  tituloVoucher: "Comprobante Webpay Oneclick",
  monto: "$6.900 CLP",
  codigoAutorizacion: "1213",
  tarjeta: "**** 6623",
  ordenCompraMall: "SSMQFOQ95L",
  ordenCompraTienda: "SSMQFOQ95L-1",
} as const;

export type OneclickVoucherDisplay = {
  tituloVoucher: string;
  monto: string;
  codigoAutorizacion: string;
  tarjeta: string;
  ordenCompraMall: string;
  ordenCompraTienda: string;
};

export function mapOneclickCheckoutToVoucher(input: {
  amount?: number | null;
  authorizationCode?: string | null;
  mallBuyOrder?: string | null;
  storeBuyOrder?: string | null;
  cardLast4?: string | null;
}): OneclickVoucherDisplay {
  const amount = input.amount ?? 0;
  return {
    tituloVoucher: "Comprobante Webpay Oneclick",
    monto: `$${amount.toLocaleString("es-CL")} CLP`,
    codigoAutorizacion: input.authorizationCode?.trim() || "—",
    tarjeta: input.cardLast4 ? `**** ${input.cardLast4}` : "—",
    ordenCompraMall: input.mallBuyOrder?.trim() || "—",
    ordenCompraTienda: input.storeBuyOrder?.trim() || "—",
  };
}

/** URL directa para capturas locales (solo desarrollo). */
export const ONECLICK_VALIDATION_VOUCHER_PREVIEW_PATH =
  "/oneclick/retorno?validacion_voucher=1";
