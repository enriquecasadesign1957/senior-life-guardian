#!/usr/bin/env node
/** @deprecated Use wakeup-dev/scripts/generate-post.mjs */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "scripts",
  "generate-post.mjs",
);
const child = spawn(process.execPath, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
