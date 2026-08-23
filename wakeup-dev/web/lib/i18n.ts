import esJson from "@/locales/es.json";
import enJson from "@/locales/en.json";

export type Locale = "es" | "en";

export const LOCALE_STORAGE_KEY = "wakeup-locale";

export type MsgKey = keyof typeof esJson;

const en: Record<MsgKey, string> = enJson;

export const dictionaries = { es: esJson, en } as const;

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "es") return "es";
  return "en";
}

export function dayLabel(locale: Locale, diaSemana: number): string {
  const keys: MsgKey[] = [
    "daySun",
    "dayMon",
    "dayTue",
    "dayWed",
    "dayThu",
    "dayFri",
    "daySat",
  ];
  const key = keys[diaSemana] ?? "daySun";
  return dictionaries[locale][key];
}
