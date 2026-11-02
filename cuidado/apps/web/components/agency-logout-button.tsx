"use client";

import { useState } from "react";

export function AgencyLogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/agency/account/logout", { method: "POST" });
      window.location.assign("/agencia/entrar");
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 disabled:opacity-60"
    >
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
