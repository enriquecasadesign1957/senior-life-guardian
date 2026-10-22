export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const REDACTED = new Set([
  "secret",
  "ciphertext",
  "iv",
  "paircode",
  "authorization",
  "cookie",
  "token",
]);

export function logError(event: string, fields: Record<string, unknown> = {}): void {
  const safe: Record<string, unknown> = { event };
  for (const [key, value] of Object.entries(fields)) {
    if (REDACTED.has(key.toLowerCase())) continue;
    safe[key] = value;
  }
  console.error(JSON.stringify(safe));
}
