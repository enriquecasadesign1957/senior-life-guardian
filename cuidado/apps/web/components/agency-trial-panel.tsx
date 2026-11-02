"use client";

import { useEffect, useState } from "react";

type TrialStatus = {
  active?: boolean;
  seats?: number;
  used?: number;
  remaining?: number;
  error?: { message?: string };
};

export function AgencyTrialPanel() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/agency/trial");
        const body = (await response.json()) as TrialStatus;
        if (!cancelled && response.ok) setStatus(body);
      } catch {
        // ignore: panel still allows activation
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function activate() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/agency/trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json()) as TrialStatus & { activated?: boolean };
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos activar la prueba de agencia.");
        return;
      }
      setStatus(body);
      setMessage(`Listo: tienes ${body.remaining ?? 0} de ${body.seats ?? 5} sitios gratis.`);
    } catch {
      setMessage("No pudimos activar la prueba de agencia.");
    } finally {
      setPending(false);
    }
  }

  if (status?.active) {
    return (
      <div className="rounded-3xl border-2 border-pine bg-white p-6 sm:p-8">
        <p className="text-sm font-medium text-pine">Prueba de agencia activa</p>
        <h3 className="mt-2 text-2xl">5 sitios gratis para probar</h3>
        <p className="mt-3 text-stone-700">
          Usados: {status.used ?? 0} · Disponibles: {status.remaining ?? 0} de {status.seats ?? 5}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Conecta cada WordPress con el conector. Si el sitio aún no tiene plan, se le asigna un cupo gratis con
          vigilancia y limpieza.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-pine bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-pine">Nuevo</p>
      <h3 className="mt-2 text-2xl">Prueba gratis para agencias</h3>
      <p className="mt-3 text-stone-700">
        Activa 5 sitios con vigilancia y limpieza, sin cobro, para probar CuidadoWeb con tus clientes.
      </p>
      <label className="mt-6 block text-sm text-stone-600" htmlFor="agency-trial-code">
        Código de agencia
      </label>
      <input
        id="agency-trial-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
        placeholder="Tu código"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={activate}
        disabled={pending || code.trim().length < 4}
        className="mt-4 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Activando…" : "Activar 5 sitios gratis"}
      </button>
      {message ? (
        <p className="mt-3 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : (
        <p className="mt-3 text-xs text-stone-500">
          Si no tienes código, escríbenos a hola@cuidadoweb.com con el asunto “Prueba agencia”.
        </p>
      )}
    </div>
  );
}
