"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cuidado_pago_return";

export function rememberPagoReturn(siteId: string): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (!/^\/informe\/[0-9a-f-]{36}$/i.test(path)) return;
  const params = new URLSearchParams(window.location.search);
  params.set("siteId", siteId);
  sessionStorage.setItem(STORAGE_KEY, `${path}?${params.toString()}`);
}

export function PaymentReturn({ purpose }: { purpose: "rescue" | "cuidado" }) {
  const [message, setMessage] = useState("Activando la vigilancia…");

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const preferred = sessionStorage.getItem(STORAGE_KEY);

    async function tick() {
      tries += 1;
      try {
        const query = new URLSearchParams({ purpose });
        if (preferred) query.set("returnPath", preferred);
        const response = await fetch(`/api/pago/destino?${query.toString()}`);
        const body = (await response.json()) as { ready?: boolean; href?: string };
        if (cancelled) return;
        if (response.ok && body.ready && typeof body.href === "string") {
          sessionStorage.removeItem(STORAGE_KEY);
          window.location.replace(body.href);
          return;
        }
      } catch {
        // keep waiting for the webhook
      }
      if (cancelled) return;
      if (tries >= 20) {
        setMessage(
          "El pago llegó. Si no ves la vigilancia en el informe, vuelve a analizar tu WordPress en un momento.",
        );
        return;
      }
      window.setTimeout(tick, 1500);
    }

    void tick();
    return () => {
      cancelled = true;
    };
  }, [purpose]);

  return (
    <section className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-4xl tracking-tight">Pago recibido</h1>
      <p className="mt-6 text-lg leading-relaxed text-stone-700">{message}</p>
      <p className="mt-4 text-sm text-stone-500">Te llevamos al informe en cuanto la vigilancia quede activa.</p>
    </section>
  );
}
