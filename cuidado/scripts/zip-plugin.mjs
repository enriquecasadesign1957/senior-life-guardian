import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destination = resolve(root, "apps/web/public/cuidado-conector.zip");
const staging = join(tmpdir(), "cuidado-conector-zip");
const pluginDir = join(staging, "cuidado-conector");

rmSync(staging, { recursive: true, force: true });
mkdirSync(pluginDir, { recursive: true });
cpSync(resolve(root, "packages/wp-plugin"), pluginDir, { recursive: true });
mkdirSync(dirname(destination), { recursive: true });
execFileSync("zip", ["-r", "-q", destination, "cuidado-conector", "-x", "*.DS_Store"], {
  cwd: staging,
});
rmSync(staging, { recursive: true, force: true });
