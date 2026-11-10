/**
 * Muestra el alias real dentro del keystore (Java/Gradle).
 * Uso: node scripts/show-keystore-alias.mjs [ruta.jks]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const keystore = process.argv[2] || path.join(ROOT, "senior-safe-release.jks");
const credsFile = path.join(ROOT, "play-keystore-credentials.local.txt");

function readPassword() {
  if (process.env.ANDROID_KEYSTORE_PASSWORD?.trim()) {
    return process.env.ANDROID_KEYSTORE_PASSWORD.trim();
  }
  if (!fs.existsSync(credsFile)) {
    throw new Error("Define ANDROID_KEYSTORE_PASSWORD o crea play-keystore-credentials.local.txt");
  }
  const text = fs.readFileSync(credsFile, "utf8");
  const pass = text.match(/^ANDROID_KEYSTORE_PASSWORD=(.+)$/m)?.[1]?.trim();
  if (!pass) throw new Error("No se encontró ANDROID_KEYSTORE_PASSWORD en credenciales locales");
  return pass;
}

function parseAliases(output) {
  const aliases = [];
  for (const match of output.matchAll(/^Alias name: (.+)$/gm)) {
    aliases.push(match[1].trim());
  }
  for (const line of output.split("\n")) {
    const entry = line.match(/^([^,]+?), .+, (PrivateKeyEntry|SecretKeyEntry|TrustedCertEntry)/);
    if (entry) aliases.push(entry[1].trim());
  }
  return [...new Set(aliases)];
}

const password = readPassword();
if (!fs.existsSync(keystore)) {
  console.error(`❌ No existe ${keystore}`);
  process.exit(1);
}

const out = execFileSync(
  "keytool",
  ["-list", "-storetype", "PKCS12", "-v", "-keystore", keystore, "-storepass", password],
  { encoding: "utf8" },
);

const aliases = parseAliases(out);
console.log(`Keystore: ${keystore}`);
console.log(`Alias(es) para Gradle / ANDROID_KEY_ALIAS:`);
for (const alias of aliases) {
  console.log(`  → ${alias}`);
}
if (aliases.length === 0) {
  console.log("(no se pudo parsear; salida keytool:)");
  console.log(out);
  process.exit(1);
}
