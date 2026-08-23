import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `wk_${raw}`;
}

export function formatDate(iso: string, locale: "es" | "en" = "es"): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
