import { getRequest } from "@tanstack/react-start/server";

/** Cloudflare Workers: extiende la vida del Worker tras responder (cascada WA/llamada). */
export type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type CloudflareRuntime = {
  context?: WorkerExecutionContext;
  env?: unknown;
  waitUntil?: (promise: Promise<unknown>) => void;
};

type RequestWithWaitUntil = Request & {
  waitUntil?: (promise: Promise<unknown>) => void;
  runtime?: { cloudflare?: CloudflareRuntime };
};

let workerCtx: WorkerExecutionContext | null = null;
/** Capturado al inicio del request (p. ej. sendEmergencyAlert) antes de awaits largos. */
let capturedWaitUntil: ((promise: Promise<unknown>) => void) | null = null;

export function bindWorkerExecutionContext(ctx: WorkerExecutionContext): void {
  workerCtx = ctx;
}

function resolveWaitUntil(): ((promise: Promise<unknown>) => void) | null {
  if (capturedWaitUntil) return capturedWaitUntil;

  try {
    const req = getRequest() as RequestWithWaitUntil;
    if (typeof req.waitUntil === "function") {
      return req.waitUntil.bind(req);
    }
    const cf = req.runtime?.cloudflare;
    const ctx = cf?.context;
    if (ctx && typeof ctx.waitUntil === "function") {
      return ctx.waitUntil.bind(ctx);
    }
    if (cf && typeof cf.waitUntil === "function") {
      return cf.waitUntil.bind(cf);
    }
  } catch {
    /* fuera de request */
  }

  if (workerCtx && typeof workerCtx.waitUntil === "function") {
    return workerCtx.waitUntil.bind(workerCtx);
  }

  return null;
}

/** Llamar al inicio de server functions que disparan trabajo en background. */
export function captureWaitUntilFromRequest(): void {
  capturedWaitUntil = resolveWaitUntil();
}

export function clearCapturedWaitUntil(): void {
  capturedWaitUntil = null;
}

/** Registra una tarea en waitUntil (Nitro/Cloudflare). */
export function runInBackground(task: Promise<unknown>): boolean {
  const waitUntil = resolveWaitUntil();
  if (waitUntil) {
    waitUntil(task);
    return true;
  }
  return false;
}
