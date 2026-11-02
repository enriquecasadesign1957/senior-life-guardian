"use client";

import { useCallback, useEffect, useState } from "react";

type Invite = {
  id: string;
  code: string;
  seats: number;
  maxUses: number;
  usedCount: number;
  note: string | null;
  createdAt: string;
  available: boolean;
  redeemedByEmail: string | null;
};

export function AdminCodesPanel({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [secret, setSecret] = useState("");
  const [note, setNote] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    const response = await fetch("/api/admin/invites");
    const body = (await response.json()) as { invites?: Invite[]; error?: { message?: string } };
    if (!response.ok) {
      setAuthed(false);
      setMessage(body?.error?.message ?? "Entra otra vez al panel.");
      return;
    }
    setAuthed(true);
    setInvites(body.invites ?? []);
  }, []);

  useEffect(() => {
    if (!initiallyAuthed) return;
    void loadInvites();
  }, [initiallyAuthed, loadInvites]);

  async function login() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        setMessage(body?.error?.message ?? "La clave no sirve.");
        return;
      }
      setSecret("");
      await loadInvites();
    } catch {
      setMessage("No pudimos abrir el panel.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAuthed(false);
      setInvites([]);
    } finally {
      setPending(false);
    }
  }

  async function createCode() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note: note.trim() || undefined, seats: 5 }),
      });
      const body = (await response.json()) as { invite?: Invite; error?: { message?: string } };
      if (!response.ok || !body.invite) {
        setMessage(body?.error?.message ?? "No pudimos generar el código.");
        return;
      }
      setNote("");
      setInvites((prev) => [body.invite!, ...prev]);
      setMessage(`Código listo: ${body.invite.code}`);
      await copyCode(body.invite);
    } catch {
      setMessage("No pudimos generar el código.");
    } finally {
      setPending(false);
    }
  }

  async function copyCode(invite: Invite) {
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopiedId(invite.id);
      window.setTimeout(() => setCopiedId((current) => (current === invite.id ? null : current)), 1600);
    } catch {
      setMessage(`Copia manualmente: ${invite.code}`);
    }
  }

  if (!authed) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <h1 className="font-display text-3xl tracking-tight text-ink">Panel de códigos</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          Solo para CuidadoWeb. Entra con la clave de admin y genera códigos de un solo uso para agencias.
        </p>
        <label className="mt-6 block text-sm text-stone-600" htmlFor="admin-secret">
          Clave de admin
        </label>
        <input
          id="admin-secret"
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
          placeholder="ADMIN_SECRET"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={login}
          disabled={pending || secret.trim().length < 8}
          className="mt-4 rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar al panel"}
        </button>
        {message ? (
          <p className="mt-4 text-sm text-stone-700" role="status">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Códigos de agencia</h1>
          <p className="mt-2 text-sm text-stone-600">
            Genera, copia y envía. Cada código activa 5 sitios y se gasta al usarse.
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 disabled:opacity-60"
        >
          Salir del panel
        </button>
      </div>

      <div className="rounded-3xl border-2 border-pine bg-white p-5 sm:p-6">
        <label className="block text-sm text-stone-600" htmlFor="agency-note">
          Nombre o nota de la agencia (opcional)
        </label>
        <input
          id="agency-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-300 bg-paper px-4 py-3 text-base outline-none ring-pine focus:ring-2"
          placeholder="Ej. Agencia María"
          maxLength={120}
        />
        <button
          type="button"
          onClick={createCode}
          disabled={pending}
          className="mt-4 w-full rounded-full bg-pine px-5 py-3 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Generando…" : "Generar código y copiar"}
        </button>
        {message ? (
          <p className="mt-3 text-sm text-stone-700" role="status">
            {message}
          </p>
        ) : null}
      </div>

      <ul className="space-y-3">
        {invites.length === 0 ? (
          <li className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-600">
            Todavía no hay códigos. Genera el primero arriba.
          </li>
        ) : (
          invites.map((invite) => (
            <li
              key={invite.id}
              className="rounded-3xl border border-stone-200 bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5"
            >
              <div className="min-w-0">
                <p className="font-mono text-lg font-medium tracking-wide text-ink">{invite.code}</p>
                <p className="mt-1 text-sm text-stone-600">
                  {invite.note ? `${invite.note} · ` : null}
                  {invite.seats} sitios · {invite.available ? "Libre" : "Usado"}
                  {invite.redeemedByEmail ? ` · ${invite.redeemedByEmail}` : null}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(invite.createdAt).toLocaleString("es-CL", { timeZone: "America/Santiago" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyCode(invite)}
                className="mt-3 w-full rounded-full border border-stone-300 px-4 py-2 text-sm font-medium sm:mt-0 sm:w-auto"
              >
                {copiedId === invite.id ? "Copiado" : "Copiar"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
