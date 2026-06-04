export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PROMPT_KEY = "__seniorSafeInstallPrompt";
const PROMPT_BOUND_KEY = "__seniorSafeInstallPromptBound";

export function getCapturedInstallPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return ((window as Window & Record<string, unknown>)[PROMPT_KEY] as BeforeInstallPromptEvent) ?? null;
}

export function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") {
    (window as Window & Record<string, unknown>)[PROMPT_KEY] = null;
  }
}

export function ensureInstallPromptCapture() {
  if (typeof window === "undefined" || (window as Window & Record<string, unknown>)[PROMPT_BOUND_KEY]) {
    return;
  }
  (window as Window & Record<string, unknown>)[PROMPT_BOUND_KEY] = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    (window as Window & Record<string, unknown>)[PROMPT_KEY] = event;
  });
}

export type InstallPromptResult = "accepted" | "dismissed" | "unavailable" | "ios_guide";

/** Dispara el prompt nativo de instalación PWA cuando el navegador lo permite. */
export async function triggerPwaInstallPrompt(): Promise<InstallPromptResult> {
  ensureInstallPromptCapture();
  const deferred = getCapturedInstallPrompt();
  if (!deferred) return "unavailable";
  try {
    await deferred.prompt();
    const choice = await deferred.userChoice;
    clearCapturedInstallPrompt();
    return choice.outcome;
  } catch {
    return "unavailable";
  }
}
