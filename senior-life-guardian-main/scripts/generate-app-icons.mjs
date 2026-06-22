/**
 * Genera iconos PWA, logo web y recursos Capacitor desde resources/icon-source.png
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "resources", "icon-source.png");
const PUBLIC = path.join(ROOT, "public");
const ASSETS = path.join(ROOT, "src", "assets");
const BROCHURE = path.join(ROOT, "public", "brochure");
const RESOURCES = path.join(ROOT, "resources");

const BRAND_RED = { r: 220, g: 38, b: 38, alpha: 1 };

async function square(size) {
  return sharp(SRC).resize(size, size, { fit: "cover", position: "center" });
}

async function writeWebp(size, filename) {
  const out = path.join(PUBLIC, filename);
  await (await square(size)).webp({ quality: 92 }).toFile(out);
  console.log(`✓ ${path.relative(ROOT, out)}`);
}

async function writePng(size, outPath) {
  await (await square(size)).png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`✓ ${path.relative(ROOT, outPath)}`);
}

async function writeSplash(outPath) {
  await sharp(SRC)
    .resize(2732, 2732, {
      fit: "contain",
      background: BRAND_RED,
      position: "center",
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${path.relative(ROOT, outPath)}`);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`❌ Falta ${path.relative(ROOT, SRC)}`);
    process.exit(1);
  }

  for (const dir of [PUBLIC, ASSETS, BROCHURE, RESOURCES]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await writeWebp(192, "senior-safe-192.webp");
  await writeWebp(512, "senior-safe-512.webp");
  await writePng(512, path.join(ASSETS, "logo-senior-safe.png"));
  await writePng(512, path.join(BROCHURE, "logo-senior-safe.png"));
  await writePng(1024, path.join(RESOURCES, "icon.png"));
  await writePng(1024, path.join(RESOURCES, "icon-foreground.png"));
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BRAND_RED,
    },
  })
    .png()
    .toFile(path.join(RESOURCES, "icon-background.png"));
  console.log(`✓ ${path.relative(ROOT, path.join(RESOURCES, "icon-background.png"))}`);

  await writeSplash(path.join(RESOURCES, "splash.png"));
  await writeSplash(path.join(RESOURCES, "splash-dark.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
