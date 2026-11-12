"use client";

import { useState } from "react";
import { rememberPagoReturn } from "@/components/payment-return";
import { currentPayMarket, PayMarketToggle } from "@/components/pay-market-toggle";
import { followCheckout, type CheckoutStartBody } from "@/lib/checkout-client";
import { cleanupProjection, type CleanupPreview } from "@/lib/panel";

type SimulateBody = {
  needsPayment?: boolean;
  measured?: boolean;
  revisions?: number | null;
  expiredTransients?: number | null;
  spamComments?: number | null;
  bytes?: number | null;
  overLimit?: boolean;
};

type ApplyBody = {
  applied?: boolean;
  batchId?: string;
  undoUntil?: string;
  counts?: { revisions?: number; expiredTransients?: number; spamComments?: number };
  error?: { message?: string };
};

export function CleanupPanel({
  siteId,
  onApplied,
}: {
  siteId: string | null;
  onApplied?: (input: { batchId: string; undoUntil: string }) => void;
}) {
  const [preview, setPreview] = useState<CleanupPreview | null>(null);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ batchId: string; undoUntil: string; summary: string } | null>(null);

  async function prepare() {
    if (!siteId) {
      setMessage("Conecta el sitio con el código del plugin para preparar la limpieza.");
      return;
    }
    setPending(true);
    setMessage("");
    setDone(null);
    try {
      const response = await fetch("/api/cleanup/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const body = (await response.json()) as SimulateBody & { error?: { message?: string } };
      if (!response.ok) {
        setPreview(null);
        setMessage(body?.error?.message ?? "No pudimos preparar el lote.");
        return;
      }
      if (body.measured === false) {
        setPreview(null);
        setMessage("Vuelve a medir el sitio conectado para calcular qué se puede quitar.");
        return;
      }
      setNeedsPayment(body.needsPayment === true);
      setPreview(
        cleanupProjection({
          revisions: body.revisions ?? null,
          expiredTransients: body.expiredTransients ?? null,
          spamComments: body.spamComments ?? null,
          bytes: body.bytes ?? null,
          overLimit: body.overLimit === true,
        }),
      );
    } catch {
      setMessage("No pudimos preparar el lote.");
    } finally {
      setPending(false);
    }
  }

  async function pay() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/checkout/rescue", {
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
      if (siteId && followCheckout(body)) {
        rememberPagoReturn(siteId);
        return;
      }
      setMessage(body?.error?.message ?? "El cobro de $29 no se abrió. No se ha cobrado nada.");
    } catch {
      setMessage("El cobro de $29 todavía no está conectado. No se ha cobrado nada.");
    } finally {
      setPending(false);
    }
  }

  async function apply() {
    if (!siteId) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/cleanup/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const body = (await response.json()) as ApplyBody;
      if (!response.ok || !body.applied || !body.batchId || !body.undoUntil) {
        setMessage(body?.error?.message ?? "No pudimos aplicar la limpieza.");
        return;
      }
      const counts = body.counts;
      const summary = [
        counts?.revisions ? `${counts.revisions} copias` : null,
        counts?.expiredTransients ? `${counts.expiredTransients} temporales` : null,
        counts?.spamComments ? `${counts.spamComments} spam` : null,
      ]
        .filter(Boolean)
        .join(", ");
      setDone({
        batchId: body.batchId,
        undoUntil: body.undoUntil,
        summary: summary || "el lote medido",
      });
      onApplied?.({ batchId: body.batchId, undoUntil: body.undoUntil });
      setPreview(null);
    } catch {
      setMessage("No pudimos aplicar la limpieza.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div id="limpieza" className="rounded-2xl border border-stone-200 bg-white p-6">
      {done ? (
        <div className="space-y-3">
          <h2 className="font-display text-3xl tracking-tight text-pine">Limpieza aplicada</h2>
          <p className="text-lg leading-relaxed text-stone-700">
            Sacamos {done.summary} de la base. Puedes deshacer durante 7 días desde el aviso de arriba.
          </p>
        </div>
      ) : preview ? (
        <div className="space-y-5">
          <h2 className="font-display text-3xl tracking-tight text-ink">Esto es lo que vamos a limpiar</h2>
          <p className="text-xl leading-relaxed text-pine">{preview.headline}</p>
          {preview.steps.length > 0 ? (
            <div className="rounded-2xl border-2 border-[#d36b76] bg-[#fde8e8] p-5">
              <p className="text-sm font-medium uppercase tracking-wide text-[#9f3a45]">
                Limpieza más importante — detalle del lote
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#9f3a45]">
                {preview.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {preview.wins.length > 0 ? (
            <div className="rounded-2xl border-2 border-[#d36b76] bg-[#fde8e8] p-5">
              <p className="font-display text-2xl text-[#9f3a45]">Mejoras más importantes al sacar esa basura</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#9f3a45]">
                {preview.wins.map((win) => (
                  <li key={win}>{win}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-sm text-stone-600">{preview.detail}</p>
          {preview.blocked ? null : needsPayment ? (
            <div className="space-y-4">
              <PayMarketToggle />
              <button
                type="button"
                onClick={pay}
                disabled={pending}
                className="rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
              >
                Optimizar base de datos ahora
              </button>
              <p className="mt-2 text-xs text-stone-500">Se puede deshacer durante 7 días.</p>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={apply}
                disabled={pending}
                className="rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
              >
                {pending ? "Limpiando la base…" : "Limpiar la base ahora"}
              </button>
              <p className="mt-2 text-xs text-stone-500">
                Se puede deshacer durante 7 días. No tocamos el tema, functions.php ni pedidos de WooCommerce.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-display text-3xl tracking-tight text-ink">Acepta el lote de limpieza</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Te mostramos cada tipo de basura medido —copias viejas, temporales vencidos, spam— y el alivio concreto que
            deja en la base. Todavía no se borra nada hasta que confirmes.
          </p>
          <button
            type="button"
            onClick={prepare}
            disabled={pending}
            className="mt-4 rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
          >
            {pending ? "Revisando el lote…" : "Ver qué se va a quitar"}
          </button>
          <p className="mt-2 text-xs text-stone-500">Se puede deshacer durante 7 días cuando la limpieza se aplique.</p>
        </div>
      )}
      {message ? (
        <p className="mt-4 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
