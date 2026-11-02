import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse } from "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";



import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getResponse() {
  return getH3Event().res;
}
let workerCtx = null;
let capturedWaitUntil = null;
function bindWorkerExecutionContext(ctx) {
  workerCtx = ctx;
}
function resolveWaitUntil() {
  if (capturedWaitUntil) return capturedWaitUntil;
  try {
    const req = getRequest();
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
  }
  if (workerCtx && typeof workerCtx.waitUntil === "function") {
    return workerCtx.waitUntil.bind(workerCtx);
  }
  return null;
}
function captureWaitUntilFromRequest() {
  capturedWaitUntil = resolveWaitUntil();
}
const SITE_ORIGIN = "https://alarmaseniorsafe.com";
const LEMON_CHECKOUT = {
  mensual: "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/64a145ef-6ffa-46c4-b959-6f0d62948ed9",
  anual: "https://alarma-senior-safe.lemonsqueezy.com/checkout/buy/c7ee027e-6a95-4131-9b46-17d73babbafe"
};
function lemonCheckoutUrl(periodo = "mensual") {
  return LEMON_CHECKOUT[periodo];
}
const paymentLabel = "Lemon Squeezy";
const PRODUCTION_SITE_URL = SITE_ORIGIN;
const SENIOR_SAFE_ANDROID_PACKAGE_ID = "cl.alarmaseniorsafe.app";
const SENIOR_SAFE_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${SENIOR_SAFE_ANDROID_PACKAGE_ID}`;
const SENIOR_SAFE_INSTALL_GUIDE_URL = `${PRODUCTION_SITE_URL}/guia`;
const SENIOR_SAFE_SOS_SIMULATOR_URL = `${PRODUCTION_SITE_URL}/simulador-senior-safe.html`;
function productionHomeUrl() {
  return PRODUCTION_SITE_URL;
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="${PRODUCTION_SITE_URL}">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./server-ChSeKMqy.mjs").then((n) => n.s).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
function brandedErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }
  const fields = payload;
  const expectedKeys = /* @__PURE__ */ new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }
  return fields.unhandled === true && fields.message === "HTTPError" && (fields.status === void 0 || fields.status === responseStatus);
}
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}
const server = {
  async fetch(request, env, ctx) {
    bindWorkerExecutionContext(ctx);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
  /** Cloudflare Cron: avisos de renovación, cobro recurrente Oneclick y suspensión por falta de pago. */
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(
      import("./subscription-renewal-CVyJ9Wsj.mjs").then(
        ({ runSubscriptionRenewalJob }) => runSubscriptionRenewalJob()
      )
    );
  }
};
export {
  PRODUCTION_SITE_URL as P,
  SENIOR_SAFE_PLAY_STORE_URL as S,
  SENIOR_SAFE_SOS_SIMULATOR_URL as a,
  paymentLabel as b,
  renderErrorPage as c,
  captureWaitUntilFromRequest as d,
  server as default,
  SENIOR_SAFE_INSTALL_GUIDE_URL as e,
  SITE_ORIGIN as f,
  getResponse as g,
  lemonCheckoutUrl as l,
  productionHomeUrl as p,
  requestHandler as r
};
