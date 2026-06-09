type SavePinFn = (args: {
  data: { signupId: string; pinHash: string };
}) => Promise<{ ok: boolean }>;

type VerifyPinFn = (args: {
  data: { signupId: string; pinHash: string };
}) => Promise<{ ok: boolean; configured: boolean }>;

const SAVE_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

/** Guarda PIN: API JSON primero (más fiable en Workers), luego server function. */
export async function saveUserPinWithFallback(
  savePinFn: SavePinFn,
  signupId: string,
  pinHash: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await withTimeout(
      fetch("/api/public/save-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, pinHash }),
      }),
      SAVE_TIMEOUT_MS,
    );
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (res.ok && json.ok) return { ok: true };
    if (!res.ok) {
      console.warn("[saveUserPinWithFallback] API error:", json.error);
    }
  } catch (e) {
    console.warn("[saveUserPinWithFallback] API failed, trying serverFn", e);
  }

  try {
    const res = await withTimeout(
      savePinFn({ data: { signupId, pinHash } }),
      SAVE_TIMEOUT_MS,
    );
    if (res?.ok) return { ok: true };
    return { ok: false, error: "api_failed" };
  } catch (e) {
    console.error("[saveUserPinWithFallback] serverFn failed", e);
    return { ok: false, error: "network_error" };
  }
}

/** Verifica PIN: API JSON primero, luego server function. */
export async function verifyPinWithFallback(
  verifyPinFn: VerifyPinFn,
  signupId: string,
  pinHash: string,
): Promise<{ ok: boolean; configured: boolean; error?: string }> {
  try {
    const res = await withTimeout(
      fetch("/api/public/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, pinHash }),
      }),
      SAVE_TIMEOUT_MS,
    );
    const json = (await res.json()) as { ok?: boolean; configured?: boolean; error?: string };
    if (res.ok && typeof json.configured === "boolean") {
      return {
        ok: Boolean(json.ok),
        configured: json.configured,
        error: json.error,
      };
    }
  } catch (e) {
    console.warn("[verifyPinWithFallback] API failed, trying serverFn", e);
  }

  try {
    const res = await withTimeout(
      verifyPinFn({ data: { signupId, pinHash } }),
      SAVE_TIMEOUT_MS,
    );
    return {
      ok: Boolean(res?.ok),
      configured: Boolean(res?.configured),
    };
  } catch (e) {
    console.error("[verifyPinWithFallback] serverFn failed", e);
    return { ok: false, configured: false, error: "network_error" };
  }
}

export function savePinErrorMessage(error?: string): string {
  switch (error) {
    case "network_error":
    case "api_failed":
      return "No pudimos guardar tu PIN. Revisa tu conexión e inténtalo de nuevo.";
    case "timeout":
      return "La conexión tardó demasiado. Inténtalo de nuevo.";
    default:
      return "No pudimos guardar tu PIN. Inténtalo de nuevo.";
  }
}
