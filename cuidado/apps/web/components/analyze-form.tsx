"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { reuseNotice } from "@/lib/reuse-notice";

type AnalyzeFormProps = {
  inputId: string;
  buttonLabel: string;
  variant?: "paper" | "inverse";
};

export function AnalyzeForm({ inputId, buttonLabel, variant = "paper" }: AnalyzeFormProps) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [held, setHeld] = useState<{ scanId: string; againAt: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inverse = variant === "inverse";

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (held && !node.open) node.showModal();
    if (!held && node.open) node.close();
  }, [held]);

  async function diagnose(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos medir la página.");
        return;
      }
      if (body?.reused === true && typeof body.scanId === "string" && typeof body.againAt === "string") {
        setHeld({ scanId: body.scanId, againAt: body.againAt });
        return;
      }
      window.location.href = `/informe/${body.scanId}`;
    } catch {
      setMessage("No pudimos medir la página.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={diagnose} className="space-y-3">
      <label className={`block text-sm font-medium ${inverse ? "text-white" : "text-ink"}`} htmlFor={inputId}>
        Dirección de tu WordPress
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          name="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://tusitio.com"
          autoComplete="url"
          inputMode="url"
          className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-base text-ink"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-60 ${
            inverse ? "bg-white text-pine" : "bg-pine text-white"
          }`}
        >
          {pending ? "Midiendo…" : buttonLabel}
        </button>
      </div>
      {message ? (
        <p className={`text-sm ${inverse ? "text-amber-100" : "text-red-800"}`} role="alert">
          {message}
        </p>
      ) : null}
      <dialog
        ref={dialogRef}
        aria-labelledby={`${inputId}-held-title`}
        className="w-[min(100%,28rem)] rounded-3xl border border-stone-200 bg-white p-6 text-ink backdrop:bg-ink/40"
        onClose={() => setHeld(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setHeld(null);
        }}
      >
        {held ? <HeldCopy againAt={held.againAt} scanId={held.scanId} titleId={`${inputId}-held-title`} onClose={() => setHeld(null)} /> : null}
      </dialog>
    </form>
  );
}

function HeldCopy({
  againAt,
  scanId,
  titleId,
  onClose,
}: {
  againAt: string;
  scanId: string;
  titleId: string;
  onClose: () => void;
}) {
  const parsed = new Date(againAt);
  const notice = Number.isNaN(parsed.getTime())
    ? {
        title: "Este dominio ya tiene un informe",
        body: "Hay un informe cada 24 horas por dominio. Hasta que pase ese plazo te mostramos el que ya está.",
      }
    : reuseNotice(parsed, new Date());

  return (
    <div className="space-y-4">
      <h2 id={titleId} className="text-2xl tracking-tight">
        {notice.title}
      </h2>
      <p className="text-sm leading-6 text-stone-700">{notice.body}</p>
      <div className="flex flex-wrap gap-3">
        <a href={`/informe/${scanId}`} className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white">
          Ver ese informe
        </a>
        <button type="button" onClick={onClose} className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
          Cerrar
        </button>
      </div>
    </div>
  );
}
