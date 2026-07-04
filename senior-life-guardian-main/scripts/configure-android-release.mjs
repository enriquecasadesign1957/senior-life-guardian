/**
 * Configura firma release + versionCode/versionName en android/app/build.gradle
 * y escribe keystore.properties desde secrets de CI (GitHub Actions).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ANDROID_DIR = path.join(ROOT, "android");
const BUILD_GRADLE = path.join(ANDROID_DIR, "app", "build.gradle");
const KEYSTORE_PATH = path.join(ANDROID_DIR, "release.keystore");
const KEYSTORE_PROPS = path.join(ANDROID_DIR, "keystore.properties");

const versionCode = String(process.env.ANDROID_VERSION_CODE || "1").trim();
const versionName = String(process.env.ANDROID_VERSION_NAME || "1.0.0").trim();
const keystoreB64 = process.env.ANDROID_KEYSTORE_BASE64?.trim();
const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD?.trim();
const keyAlias = process.env.ANDROID_KEY_ALIAS?.trim();
const keyPassword = process.env.ANDROID_KEY_PASSWORD?.trim() || storePassword;

function requireFile(filePath, hint) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ No existe ${path.relative(ROOT, filePath)}${hint ? ` — ${hint}` : ""}`);
    process.exit(1);
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
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
`;

  if (!gradle.includes("signingConfigs")) {
    gradle = gradle.replace(/(\n\s*buildTypes\s*\{)/, `${signingBlock}$1`);
  }

  if (!gradle.includes("signingConfig signingConfigs.release")) {
    gradle = gradle.replace(
      /(\n\s*release\s*\{\s*\n)/,
      "$1            signingConfig signingConfigs.release\n",
    );
  }

  return gradle;
}

function main() {
  if (!keystoreB64 || !storePassword || !keyAlias) {
    console.error(
      "❌ Faltan secrets: ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS",
    );
    process.exit(1);
  }

  requireFile(BUILD_GRADLE, "ejecuta cap add android / cap sync android antes");

  fs.writeFileSync(KEYSTORE_PATH, Buffer.from(keystoreB64, "base64"));
  fs.writeFileSync(
    KEYSTORE_PROPS,
    [
      `storePassword=${storePassword}`,
      `keyPassword=${keyPassword}`,
      `keyAlias=${keyAlias}`,
      "storeFile=release.keystore",
      "",
    ].join("\n"),
  );

  const patched = patchBuildGradle(fs.readFileSync(BUILD_GRADLE, "utf8"));
  fs.writeFileSync(BUILD_GRADLE, patched);

  console.log(`✓ Android release ${versionName} (${versionCode})`);
  console.log(`✓ Keystore → ${path.relative(ROOT, KEYSTORE_PATH)}`);
  console.log(`✓ Firma release configurada en build.gradle`);
}

main();
