export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PROMPT_KEY = "__seniorSafeInstallPrompt";
const PROMPT_BOUND_KEY = "__seniorSafeInstallPromptBound";

type InstallPromptWindow = Window & {
  [PROMPT_KEY]?: BeforeInstallPromptEvent | null;
  [PROMPT_BOUND_KEY]?: boolean;
};

function installPromptWindow(): InstallPromptWindow {
  return window as unknown as InstallPromptWindow;
}

export function getCapturedInstallPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return installPromptWindow()[PROMPT_KEY] ?? null;
}

export function clearCapturedInstallPrompt() {
  if (typeof window !== "undefined") {
    installPromptWindow()[PROMPT_KEY] = null;
  }
}

export function ensureInstallPromptCapture() {
  const w = typeof window !== "undefined" ? installPromptWindow() : null;
  if (!w || w[PROMPT_BOUND_KEY]) {
    return;
  }
  w[PROMPT_BOUND_KEY] = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptWindow()[PROMPT_KEY] = event as BeforeInstallPromptEvent;
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
