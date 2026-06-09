import type { FamilyContact, FamilyContactInput } from "@/lib/contacts-storage";

const FAMILY_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

type ListFamilyFn = (args: { data: { signupId: string } }) => Promise<{ contacts: FamilyContact[] }>;
type AddFamilyFn = (args: {
  data: { signupId: string; contact: FamilyContactInput };
}) => Promise<{ contact: FamilyContact }>;
type UpdateFamilyFn = (args: {
  data: { signupId: string; id: string; contact: FamilyContactInput };
}) => Promise<{ contact: FamilyContact }>;
type DeleteFamilyFn = (args: {
  data: { signupId: string; id: string };
}) => Promise<{ ok: boolean }>;

type FamilyApiResponse<T> = T & { ok?: boolean; error?: string };

async function familyApi<T>(body: Record<string, unknown>): Promise<FamilyApiResponse<T> | null> {
  try {
    const res = await withTimeout(
      fetch("/api/public/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      FAMILY_TIMEOUT_MS,
    );
    const json = (await res.json()) as FamilyApiResponse<T>;
    if (res.ok && json.ok !== false) return json;
    if (json.error) return { ...json, error: json.error };
    console.warn("[familyApi] error:", json.error);
    return null;
  } catch (e) {
    console.warn("[familyApi] failed", e);
    return null;
  }
}

export async function listFamilyWithFallback(
  listFn: ListFamilyFn,
  signupId: string,
): Promise<{ contacts: FamilyContact[]; error?: string }> {
  const api = await familyApi<{ ok: true; contacts: FamilyContact[] }>({
    action: "list",
    signupId,
  });
  if (api?.contacts) return { contacts: api.contacts };

  try {
    const res = await withTimeout(listFn({ data: { signupId } }), FAMILY_TIMEOUT_MS);
    return { contacts: res.contacts ?? [] };
  } catch (e) {
    console.error("[listFamilyWithFallback] serverFn failed", e);
    return { contacts: [], error: "network_error" };
  }
}

export async function addFamilyWithFallback(
  addFn: AddFamilyFn,
  signupId: string,
  contact: FamilyContactInput,
): Promise<{ contact?: FamilyContact; error?: string }> {
  const api = await familyApi<{ ok: true; contact: FamilyContact }>({
    action: "add",
    signupId,
    contact,
  });
  if (api?.contact) return { contact: api.contact };
  if (api?.error) return { error: api.error };

  try {
    const res = await withTimeout(addFn({ data: { signupId, contact } }), FAMILY_TIMEOUT_MS);
    return { contact: res.contact };
  } catch (e: unknown) {
    console.error("[addFamilyWithFallback] serverFn failed", e);
    const message = e instanceof Error ? e.message : undefined;
    return { error: message ?? "network_error" };
  }
}

export async function updateFamilyWithFallback(
  updateFn: UpdateFamilyFn,
  signupId: string,
  id: string,
  contact: FamilyContactInput,
): Promise<{ contact?: FamilyContact; error?: string }> {
  const api = await familyApi<{ ok: true; contact: FamilyContact }>({
    action: "update",
    signupId,
    id,
    contact,
  });
  if (api?.contact) return { contact: api.contact };
  if (api?.error) return { error: api.error };

  try {
    const res = await withTimeout(updateFn({ data: { signupId, id, contact } }), FAMILY_TIMEOUT_MS);
    return { contact: res.contact };
  } catch (e: unknown) {
    console.error("[updateFamilyWithFallback] serverFn failed", e);
    const message = e instanceof Error ? e.message : undefined;
    return { error: message ?? "network_error" };
  }
}

export async function deleteFamilyWithFallback(
  deleteFn: DeleteFamilyFn,
  signupId: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const api = await familyApi<{ ok: true }>({ action: "delete", signupId, id });
  if (api?.ok) return { ok: true };
  if (api?.error) return { ok: false, error: api.error };

  try {
    await withTimeout(deleteFn({ data: { signupId, id } }), FAMILY_TIMEOUT_MS);
    return { ok: true };
  } catch (e) {
    console.error("[deleteFamilyWithFallback] serverFn failed", e);
    return { ok: false, error: "network_error" };
  }
}

export function familyErrorMessage(error?: string): string {
  if (error === "Máximo 5 familiares." || error === "Ya existe un familiar con ese teléfono.") {
    return error;
  }
  switch (error) {
    case "network_error":
    case "save_failed":
      return "No pudimos guardar el familiar. Revisa tu conexión e inténtalo de nuevo.";
    default:
      return error ?? "No pudimos guardar el familiar. Inténtalo de nuevo.";
  }
}
