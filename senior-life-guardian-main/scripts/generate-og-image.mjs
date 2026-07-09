/**
 * Imagen Open Graph 1200×630 para alarmaseniorsafe.cl
 * Uso: npm run seo:og-image
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "play-store", "feature-graphic-1024x500.png");
const OUT = path.join(ROOT, "public", "og-senior-safe.jpg");

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`❌ Falta ${path.relative(ROOT, SRC)} — ejecuta npm run play:feature-graphic`);
    process.exit(1);
  }

  await sharp(SRC)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toFile(OUT);

  console.log(`✓ ${path.relative(ROOT, OUT)} (1200×630)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
