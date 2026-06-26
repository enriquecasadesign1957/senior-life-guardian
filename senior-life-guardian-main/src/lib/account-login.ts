import type { AppConfigResult } from "@/lib/account-lookup";

type LoadConfigFn = (args: {
  data: { email?: string; signupId?: string; accessToken?: string };
}) => Promise<AppConfigResult>;

/** Login por email: server function con respaldo vía API JSON pública. */
export async function loginAccountByEmail(
  loadConfig: LoadConfigFn,
  email: string,
): Promise<AppConfigResult> {
  const normalized = email.trim().toLowerCase();

  try {
    const lookedUp = await loadConfig({ data: { email: normalized } });
    if (lookedUp.configured && lookedUp.user?.id && !lookedUp.accessToken) {
      return loadConfig({ data: { signupId: lookedUp.user.id } });
    }
    return lookedUp;
  } catch (serverFnError) {
    console.warn("[loginAccountByEmail] serverFn failed, trying API fallback", serverFnError);
  }

  try {
    const res = await fetch("/api/public/lookup-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized }),
    });
    const json = (await res.json()) as AppConfigResult & { message?: string };
    if (!res.ok) {
      return {
        configured: false,
        user: null,
        contacts: [],
        pinConfigured: false,
        error: json.error ?? "api_failed",
      };
    }
    if (json.configured && json.user?.id) {
      return loadConfig({ data: { signupId: json.user.id } });
    }
    return json;
  } catch (apiError) {
    console.error("[loginAccountByEmail] API fallback failed", apiError);
    return {
      configured: false,
      user: null,
      contacts: [],
      pinConfigured: false,
      error: "network_error",
    };
  }
}

export function loginErrorMessage(error?: string): string {
  switch (error) {
    case "lookup_failed":
    case "server_error":
      return "Error al consultar tu cuenta. Inténtalo en unos minutos.";
    case "network_error":
    case "api_failed":
      return "No pudimos cargar tu cuenta. Revisa tu conexión e inténtalo de nuevo.";
    default:
      return "No encontramos tu cuenta. Regístrate en alarmaseniorsafe.cl";
  }
}
