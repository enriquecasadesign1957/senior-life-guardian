"use client";

import { useState } from "react";
import { rememberPagoReturn } from "@/components/payment-return";
import { currentPayMarket, PayMarketToggle } from "@/components/pay-market-toggle";
import { followCheckout, type CheckoutStartBody } from "@/lib/checkout-client";

export function PlanPanel({ siteId }: { siteId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteId,
          market: currentPayMarket(),
          returnPath: /^\/informe\/[0-9a-f-]{36}$/i.test(window.location.pathname)
            ? window.location.pathname
            : undefined,
        }),
      });
      const body = (await response.json()) as CheckoutStartBody;
      if (followCheckout(body)) {
        rememberPagoReturn(siteId);
        return;
      }
      setMessage(body?.error?.message ?? "El cobro de $19 no se abrió. No se ha cobrado nada.");
    } catch {
      setMessage("El cobro de $19 todavía no está conectado. No se ha cobrado nada.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-2xl">Plan Cuidado</h2>
      <p className="mt-2 text-stone-700">
        Vigilancia y una limpieza automática al mes. Cancela cuando quieras.
      </p>
      <div className="mt-4">
        <PayMarketToggle />
      </div>
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="mt-4 rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
      >
        {pending ? "Abriendo el cobro…" : "Activar Plan Cuidado"}
      </button>
      {message ? (
        <p className="mt-4 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
