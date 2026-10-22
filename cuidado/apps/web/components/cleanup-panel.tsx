"use client";

import { useState } from "react";
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
        body: JSON.stringify({ siteId }),
      });
      const body = await response.json();
      setMessage(body?.error?.message ?? "El cobro de $29 todavía no está conectado. No se ha cobrado nada.");
    } catch {
      setMessage("El cobro de $29 todavía no está conectado. No se ha cobrado nada.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div id="limpieza" className="rounded-2xl border border-stone-200 bg-white p-6">
      {preview ? (
        <div className="space-y-4">
          <h2 className="text-2xl">Esto es lo que pasaría</h2>
          <p className="text-lg leading-relaxed">{preview.headline}</p>
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
            <p className="text-sm text-stone-600">El lote quedó descrito. La limpieza todavía no se ejecuta.</p>
          )}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={prepare}
            disabled={pending}
            className="rounded-full bg-pine px-6 py-4 text-base font-medium text-white disabled:opacity-60"
          >
            {pending ? "Revisando el lote…" : "Ver qué se va a quitar"}
          </button>
          <p className="mt-2 text-xs text-stone-500">Todavía no se borra nada. Se puede deshacer durante 7 días.</p>
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
