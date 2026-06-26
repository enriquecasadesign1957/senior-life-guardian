import { readSeniorAccessToken } from "@/lib/senior-access-auth";

type SavePinFn = (args: {
  data: { signupId: string; accessToken: string; pinHash: string };
}) => Promise<{ ok: boolean }>;

type VerifyPinFn = (args: {
  data: { signupId: string; accessToken: string; pinHash: string };
}) => Promise<{ ok: boolean; configured: boolean }>;

const SAVE_TIMEOUT_MS = 12_000;

function pinAuthPayload(signupId: string): { signupId: string; accessToken: string } | null {
  const accessToken = readSeniorAccessToken(signupId);
  if (!accessToken) return null;
  return { signupId, accessToken };
}

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
  const auth = pinAuthPayload(signupId);
  if (!auth) return { ok: false, error: "auth_required" };

  try {
    const res = await withTimeout(
      fetch("/api/public/save-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, pinHash }),
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
      savePinFn({ data: { ...auth, pinHash } }),
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
  const auth = pinAuthPayload(signupId);
  if (!auth) return { ok: false, configured: false, error: "auth_required" };

  try {
    const res = await withTimeout(
      fetch("/api/public/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, pinHash }),
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
      verifyPinFn({ data: { ...auth, pinHash } }),
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

type PinResetRequestFn = (args: { data: { signupId: string } }) => Promise<{
  ok: boolean;
  emailHint?: string;
  ttl_minutes?: number;
  error?: string;
}>;

type PinResetVerifyFn = (args: {
  data: { signupId: string; code: string };
}) => Promise<{ ok: boolean; verified?: boolean; error?: string }>;

/** Solicita código de recuperación PIN por correo. */
export async function requestPinResetWithFallback(
  requestFn: PinResetRequestFn,
  signupId: string,
): Promise<{ ok: boolean; emailHint?: string; ttl_minutes?: number; error?: string }> {
  try {
    const res = await withTimeout(
      fetch("/api/public/pin-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId }),
      }),
      SAVE_TIMEOUT_MS,
    );
    const json = (await res.json()) as {
      ok?: boolean;
      emailHint?: string;
      ttl_minutes?: number;
      error?: string;
    };
    if (typeof json.ok === "boolean") {
      return {
        ok: json.ok,
        emailHint: json.emailHint,
        ttl_minutes: json.ttl_minutes,
        error: json.error,
      };
    }
  } catch (e) {
    console.warn("[requestPinResetWithFallback] API failed, trying serverFn", e);
  }

  try {
    return await withTimeout(requestFn({ data: { signupId } }), SAVE_TIMEOUT_MS);
  } catch (e) {
    console.error("[requestPinResetWithFallback] serverFn failed", e);
    return { ok: false, error: "network_error" };
  }
}

/** Verifica código de recuperación PIN. */
export async function verifyPinResetWithFallback(
  verifyFn: PinResetVerifyFn,
  signupId: string,
  code: string,
): Promise<{ ok: boolean; verified?: boolean; error?: string }> {
  try {
    const res = await withTimeout(
      fetch("/api/public/pin-reset-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, code }),
      }),
      SAVE_TIMEOUT_MS,
    );
    const json = (await res.json()) as { ok?: boolean; verified?: boolean; error?: string };
    if (typeof json.ok === "boolean") {
      return { ok: json.ok, verified: json.verified, error: json.error };
    }
  } catch (e) {
    console.warn("[verifyPinResetWithFallback] API failed, trying serverFn", e);
  }

  try {
    return await withTimeout(verifyFn({ data: { signupId, code } }), SAVE_TIMEOUT_MS);
  } catch (e) {
    console.error("[verifyPinResetWithFallback] serverFn failed", e);
    return { ok: false, error: "network_error" };
  }
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
