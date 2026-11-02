"use client";

import { useState } from "react";

export function UndoBanner({
  siteId,
  batchId,
  undoUntil,
}: {
  siteId: string | null;
  batchId: string | null;
  undoUntil: string | null;
}) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  if (!undoUntil || !siteId || !batchId) return null;
  const until = new Date(undoUntil);
  if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) return null;
  const when = until.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

  async function undo() {
    setPending(true);
    setNote("");
    try {
      const response = await fetch("/api/cleanup/undo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, batchId }),
      });
      const body = (await response.json()) as { undone?: boolean; error?: { message?: string } };
      if (!response.ok || !body.undone) {
        setNote(body?.error?.message ?? "No pudimos deshacer la limpieza.");
        return;
      }
      setNote("Listo: volvimos al estado anterior. Recarga el informe para ver los números actualizados.");
      window.setTimeout(() => window.location.reload(), 1200);
    } catch {
      setNote("No pudimos deshacer la limpieza.");
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-stone-300 bg-white px-5 py-4">
      <p className="text-sm text-stone-600">Puedes volver atrás hasta el {when}.</p>
      <button
        type="button"
        disabled={pending}
        onClick={undo}
        className="mt-2 text-left text-base font-medium text-ink underline decoration-stone-300 underline-offset-4 disabled:opacity-60"
      >
        {pending ? "Revirtiendo…" : "¿Algo no se ve bien? Revertir todos los cambios y volver al estado anterior"}
      </button>
      {note ? <p className="mt-2 text-sm text-stone-600">{note}</p> : null}
    </aside>
  );
}
