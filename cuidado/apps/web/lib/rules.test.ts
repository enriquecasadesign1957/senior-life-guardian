import assert from "node:assert/strict";
import test from "node:test";
import { buildDrafts, explainFindings, formatCount } from "./explain.ts";
import { readPsiPayload } from "./psi.ts";
import { normalizeSiteUrl } from "./urls.ts";
import { isWatchActive, rescueWatchUntil } from "./watch.ts";

test("el rescate se apaga a los 30 días exactos", () => {
  const paid = new Date("2026-01-01T00:00:00.000Z");
  const until = rescueWatchUntil(paid);
  assert.equal(until.toISOString(), "2026-01-31T00:00:00.000Z");
  assert.equal(isWatchActive({ plan: "rescue", watchUntil: until }, new Date("2026-01-30T23:59:59.000Z")), true);
  assert.equal(isWatchActive({ plan: "rescue", watchUntil: until }, until), false);
  assert.equal(isWatchActive({ plan: "none", watchUntil: null }, paid), false);
  assert.equal(isWatchActive({ plan: "cuidado", watchUntil: null }, paid), true);
});

test("la plantilla cuenta las copias en castellano y la IA no cambia la acción", async () => {
  assert.equal(formatCount(1240), "1.240");
  const drafts = buildDrafts({
    heavyImages: false,
    renderBlocking: false,
    lcpMs: null,
    inpMs: null,
    clsMilli: null,
    revisions: 1240,
    expiredTransients: null,
    spamComments: null,
    innodb: true,
    overLimit: false,
  });
  const explained = await explainFindings(drafts, async () => ({
    summary: "Resumen pulido.",
    issues: [
      {
        code: "post_revisions",
        severity: "high",
        plainTitle: "ignorar",
        whatItMeans: "ignorar",
        ifIgnored: "ignorar",
        actionId: "update_plugin",
        source: "model",
      },
    ],
  }));
  assert.equal(explained.summary, "Resumen pulido.");
  assert.equal(explained.issues[0]?.plainTitle, "Tienes 1.240 copias viejas de tus páginas");
  assert.equal(explained.issues[0]?.actionId, "purge_revisions");
});

test("si la IA falla se queda la plantilla", async () => {
  const drafts = buildDrafts({
    heavyImages: true,
    renderBlocking: false,
    lcpMs: null,
    inpMs: null,
    clsMilli: null,
    revisions: null,
    expiredTransients: null,
    spamComments: null,
    innodb: null,
    overLimit: false,
  });
  const explained = await explainFindings(drafts, async () => {
    throw new Error("down");
  });
  assert.match(explained.summary, /fotos muy pesadas/);
  assert.equal(explained.issues[0]?.actionId, null);
});

test("PageSpeed se reduce a las métricas móviles", () => {
  const metrics = readPsiPayload({
    lighthouseResult: {
      categories: { performance: { score: 0.42 } },
      audits: {
        "largest-contentful-paint": { numericValue: 3200 },
        "interaction-to-next-paint": { numericValue: 180 },
        "cumulative-layout-shift": { numericValue: 0.124 },
        "modern-image-formats": { score: 0.2 },
        "render-blocking-resources": { score: 1 },
      },
    },
  });
  assert.deepEqual(metrics, {
    performanceScore: 42,
    lcpMs: 3200,
    inpMs: 180,
    clsMilli: 124,
    heavyImages: true,
    renderBlocking: false,
  });
});

test("la dirección se normaliza", () => {
  assert.equal(normalizeSiteUrl("HTTPS://Ejemplo.com/ruta/"), "https://ejemplo.com/ruta");
});
