import type { NitroApp } from "nitropack";

/** Asegura req.waitUntil en Cloudflare (Nitro a veces no lo expone en el Request). */
export default function cloudflareWaitUntilPlugin(nitroApp: NitroApp) {
  nitroApp.hooks.hook("request", (event) => {
    const req = event.node?.req as
      | (Request & {
          waitUntil?: (promise: Promise<unknown>) => void;
          runtime?: { cloudflare?: { context?: { waitUntil?: (p: Promise<unknown>) => void } } };
        })
      | undefined;
    if (!req) return;
    if (typeof req.waitUntil === "function") return;
    const ctx = req.runtime?.cloudflare?.context;
    if (ctx && typeof ctx.waitUntil === "function") {
      req.waitUntil = ctx.waitUntil.bind(ctx);
    }
  });
}
