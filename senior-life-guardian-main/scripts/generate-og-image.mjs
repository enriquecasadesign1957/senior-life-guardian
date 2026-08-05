/**
 * Imagen Open Graph 1200×630 para alarmaseniorsafe.cl
 * Foto limpia (sin texto superpuesto) — requisito Google Discover.
 * Uso: npm run seo:og-image
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
/** Foto editorial sin banners/texto (preferida por Discover). */
const SRC = path.join(ROOT, "src", "assets", "anciana-living-discover.png");
const OUT = path.join(ROOT, "public", "og-senior-safe-v2.jpg");
const OUT_LEGACY = path.join(ROOT, "public", "og-senior-safe.jpg");

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`❌ Falta ${path.relative(ROOT, SRC)}`);
    process.exit(1);
  }

  await sharp(SRC)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUT);

  // Mantener legacy sincronizado (cachés antiguos / GSC)
  await sharp(SRC)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUT_LEGACY);

  const meta = await sharp(OUT).metadata();
  console.log(`✓ ${path.relative(ROOT, OUT)} (${meta.width}×${meta.height}, sin texto incrustado)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
