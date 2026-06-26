export const WHATSAPP_ACTIVATED_STORAGE_KEY = "ss_whatsapp_activated";

export const WHATSAPP_ACTIVATED_EVENT = "ss_whatsapp_activated";

export function isWhatsAppActivatedLocally(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(WHATSAPP_ACTIVATED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markWhatsAppActivatedLocally(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WHATSAPP_ACTIVATED_STORAGE_KEY, "1");
    window.dispatchEvent(new Event(WHATSAPP_ACTIVATED_EVENT));
  } catch {
    /* ignore */
  }
}
