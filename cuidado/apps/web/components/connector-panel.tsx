"use client";

import { useState, type FormEvent } from "react";
import { UploadGuide } from "@/components/upload-guide";

const TOKEN = /^[a-f0-9]{32}$/;

export function ConnectorPanel() {
  const [url, setUrl] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const uploadHref = uploadLink(url);
  const tokenReady = TOKEN.test(pairCode);
  const tokenDirty = pairCode.length > 0;

  async function pair(event: FormEvent) {
    event.preventDefault();
    if (!tokenReady) return;
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
      <ol className="mt-5 space-y-6">
        <li>
          <Step n="1" title="Descarga el conector" />
          <a
            href="/cuidado-conector.zip"
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-4 text-base font-medium text-white"
          >
            Descargar Cuidado Conector
          </a>
        </li>
        <li>
          <Step n="2" title="Súbelo en WordPress" />
          <p className="mt-2 text-sm text-stone-600">Plugins, Añadir plugin, Subir plugin. Luego actívalo.</p>
          <UploadGuide />
          {uploadHref ? (
            <a className="mt-2 inline-block text-sm underline decoration-stone-400 underline-offset-2" href={uploadHref}>
              Abrir esa pantalla en tu sitio
            </a>
          ) : (
            <p className="mt-2 text-sm text-stone-500">Pega la dirección abajo y te abrimos esa pantalla.</p>
          )}
        </li>
        <li>
          <Step n="3" title="Pega el código de 10 minutos" />
          <form onSubmit={pair} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium" htmlFor="connector-url">
                Dirección del sitio
              </label>
              <input
                id="connector-url"
                name="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://tusitio.com"
                autoComplete="url"
                className="mt-1 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base"
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
                onChange={(event) => setPairCode(event.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="32 letras y números"
                autoComplete="one-time-code"
                aria-invalid={tokenDirty && !tokenReady}
                className={`mt-1 w-full rounded-2xl border px-4 py-3 font-mono text-sm ${
                  tokenReady ? "border-pine bg-[#e7f3ec]" : "border-stone-300 bg-white"
                }`}
                pattern="[a-f0-9]{32}"
                required
              />
              {tokenReady ? <p className="mt-2 text-sm text-pine">Código con la forma correcta.</p> : null}
            </div>
            <button
              type="submit"
              disabled={pending || !tokenReady}
              className="rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Conectando…" : "Conectar sitio"}
            </button>
          </form>
        </li>
      </ol>
      {message ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function Step({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper font-display text-lg">{n}</span>
      <h3 className="text-base">{title}</h3>
    </div>
  );
}

function uploadLink(value: string): string | null {
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.origin}/wp-admin/plugin-install.php?tab=upload`;
  } catch {
    return null;
  }
}
