import assert from "node:assert/strict";
import test from "node:test";
import { cleanupProjection, junkBarPercent, junkState, scoreTone } from "./panel.ts";
import { classifyProbe, nextProbeStreak, watchDaysRemaining } from "./watch.ts";

test("el semáforo usa un tono suave cuando el celular va lento", () => {
  assert.equal(scoreTone(42).label, "Se siente lenta en el celular");
  assert.equal(scoreTone(70).label, "Puede sentirse lenta");
  assert.equal(scoreTone(95).label, "Va bien en el celular");
  assert.equal(scoreTone(null).label, "Sin puntaje esta vez");
});

test("1.240 copias se ven saturadas y el tamaño solo sale si lo medimos", () => {
  assert.equal(junkState(1240), "full");
  assert.equal(junkBarPercent(1240), 100);
  assert.equal(junkState(0), "clean");
  assert.equal(junkState(null), "unknown");
  const preview = cleanupProjection({
    revisions: 1240,
    expiredTransients: 0,
    spamComments: 12,
    bytes: 45 * 1024 * 1024,
    overLimit: false,
  });
  assert.match(preview.headline, /1\.240 copias viejas/);
  assert.match(preview.headline, /12 comentarios de spam viejos/);
  assert.match(preview.headline, /45 MB/);
  assert.match(preview.detail, /7 días/);
  assert.match(preview.detail, /no vuelve/);
  assert.doesNotMatch(preview.headline, /borrador/i);
  const unknownSize = cleanupProjection({
    revisions: 10,
    expiredTransients: null,
    spamComments: null,
    bytes: null,
    overLimit: false,
  });
  assert.doesNotMatch(unknownSize.headline, /MB/);
});

test("un 404 no llama y el rescate cuenta los días que quedan", () => {
  assert.equal(classifyProbe(404), "warning");
  assert.equal(nextProbeStreak(3, "warning"), 0);
  assert.equal(classifyProbe(503), "outage");
  assert.equal(nextProbeStreak(1, "outage"), 2);
  const until = new Date("2026-01-31T00:00:00.000Z");
  assert.equal(watchDaysRemaining(until, new Date("2026-01-30T00:00:00.000Z")), 1);
  assert.equal(watchDaysRemaining(until, until), 0);
});
