import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const wranglerPath = path.join(root, "dist/server/wrangler.json");

const build = spawnSync(
  "npm",
  ["run", "cf:build"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, VITE_MARKET: "international", NODE_OPTIONS: "--use-system-ca" },
  },
);
if (build.status !== 0) process.exit(build.status ?? 1);

const config = {
  compatibility_date: "2025-09-24",
  name: "alarmaseniorsafe-com",
  compatibility_flags: ["nodejs_compat"],
  workers_dev: true,
  observability: { enabled: true },
  routes: [
    { pattern: "alarmaseniorsafe.com/*", zone_name: "alarmaseniorsafe.com" },
    { pattern: "www.alarmaseniorsafe.com/*", zone_name: "alarmaseniorsafe.com" },
  ],
  vars: {
    PUBLIC_APP_URL: "https://alarmaseniorsafe.com",
    TWILIO_WHATSAPP_COMMERCIAL_FROM: "56971404580",
  },
  main: "index.mjs",
  assets: {
    binding: "ASSETS",
    directory: "../client",
  },
  no_bundle: true,
  rules: [{ type: "ESModule", globs: ["**/*.mjs", "**/*.js"] }],
};

fs.writeFileSync(wranglerPath, `${JSON.stringify(config, null, 2)}\n`);

const deploy = spawnSync(
  "npx",
  ["wrangler", "deploy", "--cwd", "dist/server", "--no-bundle"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_OPTIONS: "--use-system-ca" },
  },
);
process.exit(deploy.status ?? 1);
