"use client";

import { useState, type FormEvent } from "react";

type AnalyzeFormProps = {
  inputId: string;
  buttonLabel: string;
  variant?: "paper" | "inverse";
};

export function AnalyzeForm({ inputId, buttonLabel, variant = "paper" }: AnalyzeFormProps) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const inverse = variant === "inverse";

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
    </form>
  );
}
