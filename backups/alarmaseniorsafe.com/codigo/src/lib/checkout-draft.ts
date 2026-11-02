/** Draft de checkout slim → completar perfil tras el pago. */

export const CHECKOUT_DRAFT_KEY = "seniorsafe_checkout_draft";

export type CheckoutDraft = {
  email: string;
  phone: string;
  seniorName: string;
  signupId?: string;
  savedAt: string;
};

export function saveCheckoutDraft(draft: Omit<CheckoutDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  const payload: CheckoutDraft = {
    ...draft,
    email: draft.email.trim().toLowerCase(),
    phone: draft.phone.trim(),
    seniorName: draft.seniorName.trim(),
    savedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(payload));
    localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") return null;
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
      if (!parsed.email || !parsed.phone || !parsed.seniorName) continue;
      return {
        email: String(parsed.email),
        phone: String(parsed.phone),
        seniorName: String(parsed.seniorName),
        signupId: typeof parsed.signupId === "string" ? parsed.signupId : undefined,
        savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      };
    } catch {
      /* try next */
    }
  }
  return null;
}

export function clearCheckoutDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    localStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function hasCheckoutDraftForSignup(signupId: string | null | undefined): boolean {
  const draft = readCheckoutDraft();
  if (!draft) return false;
  if (!signupId) return true;
  return !draft.signupId || draft.signupId === signupId;
}
