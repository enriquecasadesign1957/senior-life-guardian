/**
 * Copia variables de .env a .dev.vars para Wrangler / vite dev (Cloudflare Workers local).
 * .dev.vars está en .gitignore — no commitear secretos.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const devVarsPath = path.join(root, ".dev.vars");

if (!fs.existsSync(envPath)) {
  console.error("No existe .env en la raíz del proyecto.");
  process.exit(1);
}

const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
const out = [];

for (const line of lines) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const m = line.match(/^([A-Z0-9_]+)="(.*)"\s*$/);
  if (m) {
    out.push(`${m[1]}=${m[2]}`);
    continue;
  }
  const m2 = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m2) out.push(`${m2[1]}=${m2[2]}`);
}

fs.writeFileSync(devVarsPath, `${out.join("\n")}\n`, "utf8");
console.log(`OK: ${out.length} variables → .dev.vars`);
