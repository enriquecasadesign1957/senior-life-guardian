"use client";

import { useState, type FormEvent } from "react";

export function ConnectorPanel() {
  const [url, setUrl] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const uploadHref = uploadLink(url);

  async function pair(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/pair", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ baseUrl: url, pairCode }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos conectar el sitio.");
        return;
      }
      const diagnosed = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const scan = await diagnosed.json();
      if (!diagnosed.ok) {
        setMessage("El sitio quedó conectado. El informe no pudo medirse ahora.");
        return;
      }
      window.location.href = `/informe/${scan.scanId}?siteId=${body.siteId}`;
    } catch {
      setMessage("No pudimos conectar el sitio.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8 border-t border-stone-200 pt-6">
      <h2 className="font-display text-lg text-ink">Para limpiar o vigilar, conecta el sitio</h2>
      <p className="mt-1 text-sm text-stone-600">El diagnóstico gratis no necesita plugin. La limpieza sí.</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-700">
        <li>
          <a className="underline decoration-stone-400 underline-offset-2" href="/cuidado-conector.zip">
            Descarga el ZIP de Cuidado Conector
          </a>
          .
        </li>
        <li>
          En WordPress abre Plugins, Añadir plugin, Subir plugin.
          {uploadHref ? (
            <>
              {" "}
              <a className="underline decoration-stone-400 underline-offset-2" href={uploadHref}>
                Abrir esa pantalla
              </a>
              .
            </>
          ) : null}
        </li>
        <li>Actívalo y en Ajustes, Cuidado Conector, genera un código. Dura 10 minutos.</li>
      </ol>
      <form onSubmit={pair} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium" htmlFor="connector-url">
            La misma dirección
          </label>
          <input
            id="connector-url"
            name="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://tusitio.com"
            autoComplete="url"
            className="mt-1 w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="pair-code">
            Código del plugin
          </label>
          <input
            id="pair-code"
            name="pairCode"
            value={pairCode}
            onChange={(event) => setPairCode(event.target.value.trim())}
            placeholder="32 letras y números"
            autoComplete="one-time-code"
            className="mt-1 w-full rounded-full border border-stone-300 px-5 py-3 font-mono text-sm"
            pattern="[a-f0-9]{32}"
            required
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-stone-400 px-5 py-3 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Conectando…" : "Conectar sitio"}
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function uploadLink(value: string): string | null {
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withScheme);
    return `${url.origin}/wp-admin/plugin-install.php?tab=upload`;
  } catch {
    return null;
  }
}
