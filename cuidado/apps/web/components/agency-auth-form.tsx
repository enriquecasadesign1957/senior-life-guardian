"use client";

import { useState } from "react";

type Mode = "login" | "register";

export function AgencyAuthForm({ initialMode = "register" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setMessage("");
    try {
      const path = mode === "login" ? "/api/agency/account/login" : "/api/agency/account/register";
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setMessage(body?.error?.message ?? "No pudimos completar el acceso.");
        return;
      }
      window.location.assign("/mis-sitios");
    } catch {
      setMessage("No pudimos completar el acceso.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
      <div className="flex gap-3 text-sm">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={mode === "register" ? "font-medium text-pine" : "text-stone-500"}
        >
          Crear cuenta
        </button>
        <span className="text-stone-300">·</span>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? "font-medium text-pine" : "text-stone-500"}
        >
          Entrar
        </button>
      </div>
      <h1 className="mt-4 font-display text-3xl tracking-tight text-ink">
        {mode === "login" ? "Entra a tu agencia" : "Crea la cuenta de tu agencia"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        {mode === "login"
          ? "Con el mismo correo y contraseña ves todos tus sitios conectados."
          : "Guarda esta sesión con un correo. Así no pierdes los sitios si cambias de computador."}
      </p>
      <label className="mt-6 block text-sm text-stone-600" htmlFor="agency-email">
        Correo de la agencia
      </label>
      <input
        id="agency-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
        placeholder="tu@agencia.com"
      />
      <label className="mt-4 block text-sm text-stone-600" htmlFor="agency-password">
        Contraseña (mínimo 8 caracteres)
      </label>
      <input
        id="agency-password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || email.trim().length < 5 || password.length < 8}
        className="mt-6 rounded-full bg-pine px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta y ver mis sitios"}
      </button>
      {message ? (
        <p className="mt-4 text-sm text-stone-700" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
