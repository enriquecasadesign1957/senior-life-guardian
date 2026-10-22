"use client";

import { useState, type FormEvent } from "react";

export function HomeForm() {
  const [url, setUrl] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const uploadHref = uploadLink(url);

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
    <div className="space-y-8">
      <form onSubmit={diagnose} className="space-y-3">
        <label className="block text-sm font-medium" htmlFor="url">
          Dirección de tu página
        </label>
        <input
          id="url"
          name="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://tusitio.com"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-base"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          Ver diagnóstico
        </button>
      </form>

      <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-base font-semibold">Instalar el conector</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">
          <li>
            <a className="underline" href="/cuidado-conector.zip">
              Descarga el ZIP
            </a>
            .
          </li>
          <li>
            En WordPress abre Plugins, Añadir plugin, Subir plugin.
            {uploadHref ? (
              <>
                {" "}
                <a className="underline" href={uploadHref}>
                  Abrir esa pantalla
                </a>
                .
              </>
            ) : null}
          </li>
          <li>Actívalo y en Ajustes, Cuidado Conector, genera un código. Dura 10 minutos.</li>
        </ol>
        <form onSubmit={pair} className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="code">
            Código del plugin
          </label>
          <input
            id="code"
            name="pairCode"
            value={pairCode}
            onChange={(event) => setPairCode(event.target.value.trim())}
            placeholder="32 letras y números"
            className="w-full rounded-md border border-stone-300 px-3 py-3 font-mono text-sm"
            pattern="[a-f0-9]{32}"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-stone-400 px-4 py-3 text-sm font-medium disabled:opacity-60"
          >
            Conectar sitio
          </button>
        </form>
      </section>
      {message ? <p className="text-sm text-red-800">{message}</p> : null}
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
