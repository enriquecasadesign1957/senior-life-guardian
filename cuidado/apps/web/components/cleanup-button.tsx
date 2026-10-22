"use client";

import { useState } from "react";

export function CleanupButton({ siteId }: { siteId: string | null }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    if (!siteId) {
      setMessage("Conecta el sitio con el código del plugin para preparar la limpieza.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/cleanup/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos preparar el lote.");
        return;
      }
      setMessage(
        body.needsPayment
          ? "El lote quedó preparado. El cobro se conecta en el siguiente paso."
          : "El lote quedó preparado.",
      );
    } catch {
      setMessage("No pudimos preparar el lote.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="rounded-md bg-pine px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        Preparar limpieza
      </button>
      {message ? <p className="text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
