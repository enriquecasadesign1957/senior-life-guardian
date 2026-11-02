"use client";

import { useState } from "react";
import { rememberPagoReturn } from "@/components/payment-return";
import { cleanupProjection, type CleanupPreview } from "@/lib/panel";
import { isAllowedCheckoutUrl } from "@/lib/rescue";

type SimulateBody = {
  needsPayment?: boolean;
  measured?: boolean;
  revisions?: number | null;
  expiredTransients?: number | null;
  spamComments?: number | null;
  bytes?: number | null;
  overLimit?: boolean;
};

export function CleanupPanel({ siteId }: { siteId: string | null }) {
  const [preview, setPreview] = useState<CleanupPreview | null>(null);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function prepare() {
    if (!siteId) {
      setMessage("Conecta el sitio con el código del plugin para preparar la limpieza.");
      return;
    }
    setPending(true);
    setMessage("");
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
          returnPath: /^\/informe\/[0-9a-f-]{36}$/i.test(window.location.pathname) ? window.location.pathname : undefined,
        }),
      });
      const body = (await response.json()) as { url?: string; error?: { message?: string } };
      if (typeof body.url === "string" && isAllowedCheckoutUrl(body.url) && siteId) {
        rememberPagoReturn(siteId);
        window.location.assign(body.url);
        return;
      }
      setMessage(body?.error?.message ?? "El cobro de $29 no se abrió. No se ha cobrado nada.");
    } catch {
      setMessage("El cobro de $29 todavía no está conectado. No se ha cobrado nada.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div id="limpieza" className="rounded-2xl border border-stone-200 bg-white p-6">
      {preview ? (
        <div className="space-y-5">
          <h2 className="font-display text-3xl tracking-tight text-ink">Esto es lo que vamos a limpiar</h2>
          <p className="text-xl leading-relaxed text-pine">{preview.headline}</p>
          {preview.steps.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-stone-500">Hasta el detalle más chico del lote</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
                {preview.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {preview.wins.length > 0 ? (
            <div className="rounded-2xl bg-[#e7f3ec] p-5">
              <p className="font-display text-2xl text-pine">Lo que ganas al sacar esa basura</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-pine">
                {preview.wins.map((win) => (
                  <li key={win}>{win}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-sm text-stone-600">{preview.detail}</p>
          {preview.blocked ? null : needsPayment ? (
            <div>
              <button
                type="button"
                onClick={pay}
                disabled={pending}
                className="rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
              >
                Optimizar base de datos ahora
              </button>
              <p className="mt-2 text-xs text-stone-500">Se puede deshacer durante 7 días. El pago único es de $29.</p>
            </div>
          ) : (
            <p className="rounded-2xl border border-pine/20 bg-[#e7f3ec] px-4 py-3 text-sm text-pine">
              El lote quedó aceptado en pantalla. La limpieza todavía no se ejecuta sola: cuando corra, verás este mismo
              detalle aplicado fila por fila.
            </p>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-display text-3xl tracking-tight text-ink">Acepta el lote de limpieza</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Te mostramos cada tipo de basura medido —copias viejas, temporales vencidos, spam— y el alivio concreto que
            deja en la base. Todavía no se borra nada.
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
