import fs from "node:fs";

try {
  fs.rmSync(".wrangler", { recursive: true, force: true });
} catch {
  // ignore
}
