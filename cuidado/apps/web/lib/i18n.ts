import esJson from "@/locales/es.json";
import enJson from "@/locales/en.json";

export type Locale = "es" | "en";

export const LOCALE_STORAGE_KEY = "cuidado-locale";

export type MsgKey = keyof typeof esJson;

const en: Record<MsgKey, string> = enJson;

export const dictionaries = { es: esJson, en } as const;

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/** Default Spanish — CuidadoWeb is primarily for Spanish-speaking owners. */
export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en") return "en";
  return "es";
}
