"use client";

import { useState } from "react";

export function UndoBanner({ undoUntil }: { undoUntil: string | null }) {
  const [note, setNote] = useState("");
  if (!undoUntil) return null;
  const until = new Date(undoUntil);
  if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) return null;
  const when = until.toLocaleDateString("es-CL", { day: "numeric", month: "long" });

  return (
    <aside className="rounded-2xl border border-stone-300 bg-white px-5 py-4">
      <p className="text-sm text-stone-600">Puedes volver atrás hasta el {when}.</p>
      <button
        type="button"
        onClick={() => setNote("Todavía no hay un lote aplicado que se pueda deshacer.")}
        className="mt-2 text-left text-base font-medium text-ink underline decoration-stone-300 underline-offset-4"
      >
        ¿Algo no se ve bien? Revertir todos los cambios y volver al estado anterior
      </button>
      {note ? <p className="mt-2 text-sm text-stone-600">{note}</p> : null}
    </aside>
  );
}
