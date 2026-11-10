"use client";

import { useState } from "react";

export function AgencySeatClaim({
  siteId,
  remaining,
}: {
  siteId: string;
  remaining: number;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (remaining <= 0 || done) return null;

  async function claim() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/agency/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const body = (await response.json()) as { granted?: boolean; error?: { message?: string } };
      if (!response.ok || !body.granted) {
        setMessage(body?.error?.message ?? "No pudimos usar el cupo de agencia.");
        return;
      }
      setDone(true);
      window.setTimeout(() => window.location.reload(), 800);
    } catch {
      setMessage("No pudimos usar el cupo de agencia.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-pine bg-[#e7f3ec] p-6">
      <h2 className="font-display text-2xl tracking-tight text-pine">Cupo gratis de agencia</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        Te quedan {remaining} de 5 sitios de prueba. Usa uno aquí para activar vigilancia y limpieza sin cobro.
      </p>
      <button
        type="button"
        onClick={claim}
        disabled={pending}
        className="mt-4 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Asignando cupo…" : "Usar 1 sitio gratis"}
      </button>
      {message ? (
        <p className="mt-3 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
