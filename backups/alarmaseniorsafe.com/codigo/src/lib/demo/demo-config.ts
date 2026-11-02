/**
 * Modo Demo Institucional — activar con DEMO_MODE=true / VITE_DEMO_MODE=true
 * No altera producción cuando está desactivado.
 */
export function isDemoMode(): boolean {
  // No usar `typeof import.meta !== "undefined"`: el minificador lo deja siempre true en el cliente.
  if (import.meta.env.VITE_DEMO_MODE === "true") return true;
  if (typeof process !== "undefined" && process.env.DEMO_MODE === "true") return true;
  return false;
}

export function isPresentationMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("seniorsafe_demo_presentation") === "1";
}

export function setPresentationMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) sessionStorage.setItem("seniorsafe_demo_presentation", "1");
  else sessionStorage.removeItem("seniorsafe_demo_presentation");
}
