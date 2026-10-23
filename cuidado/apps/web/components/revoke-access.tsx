"use client";

import { useState } from "react";

export function RevokeAccess({ siteId }: { siteId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function revoke() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/sites/${siteId}/revoke`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos revocar el acceso.");
        return;
      }
      setDone(true);
      setMessage("Cuidado ya no usará este sitio. La vigilancia queda apagada.");
    } catch {
      setMessage("No pudimos revocar el acceso.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="text-sm text-stone-600">{message}</p>;
  }

  return (
    <div className="rounded-2xl border border-stone-200 px-5 py-4">
      <h2 className="text-base">Desconectar este sitio</h2>
      <p className="mt-1 text-sm text-stone-600">Con un clic dejas de compartir el sitio con Cuidado. El plan de $19 se puede retomar después.</p>
      {confirming ? (
        <button
          type="button"
          onClick={revoke}
          disabled={pending}
          className="mt-3 rounded-full border border-stone-400 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Revocando…" : "Sí, revocar acceso"}
        </button>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="mt-3 text-sm font-medium text-ink underline decoration-stone-300 underline-offset-4">
          Revocar acceso
        </button>
      )}
      {message ? <p className="mt-2 text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
