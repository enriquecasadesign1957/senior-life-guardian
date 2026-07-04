/**
 * Configura secrets de Play Store en GitHub y dispara el workflow AAB.
 * Uso: node scripts/setup-play-github-secrets.mjs [--dispatch]
 *
 * Token: env GITHUB_TOKEN o PAT con permiso repo + actions.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sodium from "libsodium-wrappers";

const REPO = "enriquecasadesign1957/senior-life-guardian";
const CREDS_FILE = path.resolve(import.meta.dirname, "..", "play-keystore-credentials.local.txt");
const dispatch = process.argv.includes("--dispatch");

function parseCredsFile(text) {
  const password = text.match(/^ANDROID_KEYSTORE_PASSWORD=(.+)$/m)?.[1]?.trim();
  const alias = text.match(/^ANDROID_KEY_ALIAS=(.+)$/m)?.[1]?.trim();
  const keyPassword = text.match(/^ANDROID_KEY_PASSWORD=(.+)$/m)?.[1]?.trim() || password;
  const base64Start = text.indexOf("GitHub Secret ANDROID_KEYSTORE_BASE64");
  let base64 = "";
  if (base64Start >= 0) {
    base64 = text
      .slice(base64Start)
      .split("\n")
      .slice(1)
      .join("")
      .replace(/\s/g, "");
  }
  if (!password || !alias || !base64) {
    throw new Error(`No se pudo leer ${path.basename(CREDS_FILE)}`);
  }
  return { password, alias, keyPassword, base64 };
}

function readEnvSupabase() {
  const envPath = path.resolve(import.meta.dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};
  const text = fs.readFileSync(envPath, "utf8");
  const pick = (key) => text.match(new RegExp(`^${key}="([^"]+)"`, "m"))?.[1]?.trim();
  return {
    VITE_SUPABASE_URL: pick("VITE_SUPABASE_URL"),
    VITE_SUPABASE_PUBLISHABLE_KEY: pick("VITE_SUPABASE_PUBLISHABLE_KEY"),
    VITE_SUPABASE_PROJECT_ID: pick("VITE_SUPABASE_PROJECT_ID"),
  };
}

function gitHubTokenFromCredentialManager() {
  if (process.env.GITHUB_TOKEN?.trim()) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN?.trim()) return process.env.GH_TOKEN.trim();
  try {
    const out = execFileSync("git", ["credential", "fill"], {
      input: "protocol=https\nhost=github.com\n\n",
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const password = out.match(/^password=(.+)$/m)?.[1]?.trim();
    return password || null;
  } catch {
    return null;
  }
}

async function ghFetch(token, url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} ${url}: ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

async function encryptSecret(publicKey, secretValue) {
  await sodium.ready;
  const keyBytes = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const messageBytes = sodium.from_string(secretValue);
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes);
  return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
}

async function setSecret(token, publicKey, keyId, name, value) {
  const encrypted = await encryptSecret(publicKey, value);
  await ghFetch(token, `https://api.github.com/repos/${REPO}/actions/secrets/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encrypted_value: encrypted, key_id: keyId }),
  });
  console.log(`✓ secret ${name}`);
}

async function dispatchWorkflow(token) {
  await ghFetch(token, `https://api.github.com/repos/${REPO}/actions/workflows/android-aab-play.yml/dispatches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        version_name: "1.0.0",
        version_code: "1",
      },
    }),
  });
  console.log("✓ workflow Build Android AAB (Google Play) disparado (v1.0.0 / code 1)");
}

async function main() {
  const token = gitHubTokenFromCredentialManager();
  if (!token) {
    console.error("❌ Falta GITHUB_TOKEN. Crea un PAT en github.com/settings/tokens con scope repo.");
    process.exit(1);
  }

  const creds = parseCredsFile(fs.readFileSync(CREDS_FILE, "utf8"));
  const supabase = readEnvSupabase();

  const { key_id, key } = await ghFetch(
    token,
    `https://api.github.com/repos/${REPO}/actions/secrets/public-key`,
  );

  await setSecret(token, key, key_id, "ANDROID_KEYSTORE_BASE64", creds.base64);
  await setSecret(token, key, key_id, "ANDROID_KEYSTORE_PASSWORD", creds.password);
  await setSecret(token, key, key_id, "ANDROID_KEY_ALIAS", creds.alias);
  if (creds.keyPassword !== creds.password) {
    await setSecret(token, key, key_id, "ANDROID_KEY_PASSWORD", creds.keyPassword);
  }

  for (const [name, value] of Object.entries(supabase)) {
    if (value) await setSecret(token, key, key_id, name, value);
  }

  if (dispatch) {
    await dispatchWorkflow(token);
    console.log(`\nVer progreso: https://github.com/${REPO}/actions/workflows/android-aab-play.yml`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
