const WHATSAPP_ACTIVATED_STORAGE_KEY = "ss_whatsapp_activated";
const WHATSAPP_ACTIVATED_EVENT = "ss_whatsapp_activated";
function isWhatsAppActivatedLocally() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(WHATSAPP_ACTIVATED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function markWhatsAppActivatedLocally() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WHATSAPP_ACTIVATED_STORAGE_KEY, "1");
    window.dispatchEvent(new Event(WHATSAPP_ACTIVATED_EVENT));
  } catch {
  }
}
export {
  WHATSAPP_ACTIVATED_EVENT as W,
  WHATSAPP_ACTIVATED_STORAGE_KEY as a,
  isWhatsAppActivatedLocally as i,
  markWhatsAppActivatedLocally as m
};
