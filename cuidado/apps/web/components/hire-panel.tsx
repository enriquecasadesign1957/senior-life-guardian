"use client";

import { useState } from "react";
import { rememberPagoReturn } from "@/components/payment-return";
import { currentPayMarket, PayMarketToggle } from "@/components/pay-market-toggle";
import { followCheckout, type CheckoutStartBody } from "@/lib/checkout-client";
import { PLAN_CLP_DEFAULT, RESCATE_CLP_DEFAULT, formatClp } from "@/lib/market";

export function HirePanel({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [pending, setPending] = useState<"rescue" | "cuidado" | null>(null);
  const [message, setMessage] = useState("");

  async function pay(purpose: "rescue" | "cuidado") {
    const trimmed = url.trim();
    if (trimmed.length < 4) {
      setMessage("Escribe la dirección del sitio. Todavía no se ha cobrado nada.");
      return;
    }
    setPending(purpose);
    setMessage("");
    try {
      const response = await fetch(purpose === "rescue" ? "/api/checkout/rescue" : "/api/checkout/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          market: currentPayMarket(),
          returnPath: /^\/informe\/[0-9a-f-]{36}$/i.test(window.location.pathname)
            ? window.location.pathname
            : undefined,
        }),
      });
      const body = (await response.json()) as CheckoutStartBody;
      if (followCheckout(body)) {
        if (body.siteId) rememberPagoReturn(body.siteId);
        return;
      }
      setMessage(body?.error?.message ?? "El cobro no se abrió. No se ha cobrado nada.");
    } catch {
      setMessage("El cobro no se abrió. No se ha cobrado nada.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section id="contratar" className="scroll-mt-28 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Contratar</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-700">
        Escribe el sitio y paga ahora. El plan queda ligado a esa dirección. El conector se instala después, para
        aplicar la limpieza o la vigilancia.
      </p>
      <div className="mt-5">
        <PayMarketToggle />
      </div>
      <label className="mt-5 block text-sm font-medium text-ink" htmlFor="hire-url">
        Dirección del sitio
      </label>
      <input
        id="hire-url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://tusitio.cl"
        autoComplete="url"
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-4 text-lg text-ink outline-none"
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => pay("rescue")}
          disabled={pending !== null}
          className="rounded-2xl bg-[#9f3a45] px-6 py-5 text-left text-white shadow-sm disabled:opacity-60"
        >
          <span className="block text-lg font-semibold">
            {pending === "rescue" ? "Abriendo el cobro…" : "Contratar Rescate"}
          </span>
          <span className="mt-1 block text-sm font-medium text-white/90">
            {formatClp(RESCATE_CLP_DEFAULT)} · $29 USD
          </span>
          <span className="mt-1 block text-xs text-white/80">Pago único. Limpieza y 30 días de vigilancia.</span>
        </button>
        <button
          type="button"
          onClick={() => pay("cuidado")}
          disabled={pending !== null}
          className="rounded-2xl bg-ink px-6 py-5 text-left text-white shadow-sm disabled:opacity-60"
        >
          <span className="block text-lg font-semibold">
            {pending === "cuidado" ? "Abriendo el cobro…" : "Activar Plan"}
          </span>
          <span className="mt-1 block text-sm font-medium text-white/90">
            {formatClp(PLAN_CLP_DEFAULT)}/mes · $19 USD/mes
          </span>
          <span className="mt-1 block text-xs text-white/80">Vigilancia y una limpieza al mes.</span>
        </button>
      </div>
      {message ? (
        <p className="mt-4 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
