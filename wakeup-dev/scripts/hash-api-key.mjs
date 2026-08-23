#!/usr/bin/env node
/**
 * Genera una API key en claro + su SHA-256 (para guardar en api_keys.key_hash).
 *
 * Uso:
 *   npm run hash-key
 *   npm run hash-key -- "wk_tu_clave_existente"
 */
import { createHash, randomBytes } from "node:crypto";

const raw =
  process.argv[2] ??
  `wk_${randomBytes(24).toString("base64url")}`;

const keyHash = createHash("sha256").update(raw, "utf8").digest("hex");

console.log(JSON.stringify({ raw_key: raw, key_hash: keyHash }, null, 2));
console.log(
  "\nGuarda solo key_hash en Supabase. Entrega raw_key al cliente una sola vez."
);
