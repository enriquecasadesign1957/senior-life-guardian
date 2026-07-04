/**
 * Configura firma release + versionCode/versionName en android/app/build.gradle
 * y escribe keystore.properties desde secrets de CI (GitHub Actions).
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const ANDROID_DIR = path.join(ROOT, "android");
const BUILD_GRADLE = path.join(ANDROID_DIR, "app", "build.gradle");
const KEYSTORE_PATH = path.join(ANDROID_DIR, "release.keystore");
const KEYSTORE_PROPS = path.join(ANDROID_DIR, "keystore.properties");

const versionCode = String(process.env.ANDROID_VERSION_CODE || "1").trim();
const versionName = String(process.env.ANDROID_VERSION_NAME || "1.0.0").trim();
const keystoreB64 = process.env.ANDROID_KEYSTORE_BASE64?.trim();
const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD?.trim();
const requestedAlias = process.env.ANDROID_KEY_ALIAS?.trim();
const keyPassword = process.env.ANDROID_KEY_PASSWORD?.trim() || storePassword;

function requireFile(filePath, hint) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No existe ${path.relative(ROOT, filePath)}${hint ? ` — ${hint}` : ""}`);
    process.exit(1);
  }
}

/** Escapa valores para Java Properties (contraseñas con ! % ^ & etc.). */
function escapeProperty(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function detectPkcs12Alias(keystorePath, password) {
  try {
    const out = execFileSync(
      "keytool",
      ["-list", "-storetype", "PKCS12", "-keystore", keystorePath, "-storepass", password],
      { encoding: "utf8" },
    );
    const match = out.match(/^Alias name: (.+)$/m);
    return match?.[1]?.trim() || requestedAlias;
  } catch (err) {
    console.warn("⚠️ No se pudo auto-detectar alias PKCS12; uso ANDROID_KEY_ALIAS");
    return requestedAlias;
  }
}

function patchBuildGradle(source) {
  let gradle = source;

  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);

  const signingBlock = `
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            }
            def envStorePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            def envKeyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            def envKeyAlias = System.getenv("ANDROID_KEY_ALIAS")
            keyAlias keystoreProperties['keyAlias'] ?: envKeyAlias
            keyPassword envKeyPassword ?: keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword envStorePassword ?: keystoreProperties['storePassword']
            storeType "pkcs12"
        }
    }
`;

  if (!gradle.includes("signingConfigs")) {
    gradle = gradle.replace(/(\n\s*buildTypes\s*\{)/, `${signingBlock}$1`);
  }

  if (!gradle.includes("signingConfig signingConfigs.release")) {
    gradle = gradle.replace(
      /(buildTypes\s*\{\s*\n\s*release\s*\{\s*\n)/,
      "$1            signingConfig signingConfigs.release\n",
    );
  }

  return gradle;
}

function main() {
  if (!keystoreB64 || !storePassword || !requestedAlias) {
    console.error(
      "❌ Faltan secrets: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS",
    );
    process.exit(1);
  }

  requireFile(BUILD_GRADLE, "ejecuta cap add android / cap sync android antes");

  fs.writeFileSync(KEYSTORE_PATH, Buffer.from(keystoreB64, "base64"));

  const resolvedAlias = detectPkcs12Alias(KEYSTORE_PATH, storePassword) || requestedAlias;
  if (resolvedAlias !== requestedAlias) {
    console.log(`✓ Alias PKCS12 detectado: ${resolvedAlias} (secret: ${requestedAlias})`);
  }

  fs.writeFileSync(
    KEYSTORE_PROPS,
    [
      `storePassword=${escapeProperty(storePassword)}`,
      `keyPassword=${escapeProperty(keyPassword)}`,
      `keyAlias=${escapeProperty(resolvedAlias)}`,
      "storeFile=../release.keystore",
      "storeType=pkcs12",
      "",
    ].join("\n"),
  );

  const patched = patchBuildGradle(fs.readFileSync(BUILD_GRADLE, "utf8"));
  fs.writeFileSync(BUILD_GRADLE, patched);

  console.log(`✓ Android release ${versionName} (${versionCode})`);
  console.log(`✓ Keystore → ${path.relative(ROOT, KEYSTORE_PATH)} (PKCS12)`);
  console.log(`✓ Firma release configurada en build.gradle`);

  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `key_alias=${resolvedAlias}\n`);
  }
}

main();
