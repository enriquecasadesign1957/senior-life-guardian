/**
 * Gráfico de funciones Google Play: 1024×500 PNG
 * Uso: node scripts/generate-play-feature-graphic.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOGO = path.join(ROOT, "src", "assets", "logo-senior-safe.png");
const OUT_DIR = path.join(ROOT, "play-store");
const OUT_PNG = path.join(OUT_DIR, "feature-graphic-1024x500.png");
const OUT_JPG = path.join(OUT_DIR, "feature-graphic-1024x500.jpg");

const W = 1024;
const H = 500;

const backgroundSvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="55%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#shine)"/>
  <circle cx="920" cy="90" r="130" fill="#ffffff" fill-opacity="0.07"/>
  <circle cx="980" cy="430" r="200" fill="#ffffff" fill-opacity="0.05"/>
  <circle cx="760" cy="460" r="90" fill="#ffffff" fill-opacity="0.04"/>

  <text x="400" y="118" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#ffffff">Senior Safe</text>
  <text x="400" y="168" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="#ffffff" fill-opacity="0.96">Tu familia, siempre conectada</text>

  <rect x="400" y="200" width="560" height="3" fill="#ffffff" fill-opacity="0.35" rx="1.5"/>

  <text x="400" y="252" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="#ffffff">Botón SOS de emergencia</text>
  <text x="400" y="292" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="22" fill="#ffffff" fill-opacity="0.92">WhatsApp · SMS · GPS · Llamada automática</text>
  <text x="400" y="332" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="22" fill="#ffffff" fill-opacity="0.92">Hasta 3 guardianes · Diseño fácil para adultos mayores</text>

  <text x="400" y="410" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="#ffffff" fill-opacity="0.85">alarmaseniorsafe.cl</text>
</svg>
`;

async function main() {
  if (!fs.existsSync(LOGO)) {
    console.error(`❌ Falta logo: ${path.relative(ROOT, LOGO)}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const logoSize = 340;
  const logoTop = Math.round((H - logoSize) / 2);
  const logoLeft = 36;

  const logoBuffer = await sharp(LOGO)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const base = sharp(Buffer.from(backgroundSvg)).png();

  await base
    .composite([{ input: logoBuffer, left: logoLeft, top: logoTop }])
    .png({ compressionLevel: 9 })
    .toFile(OUT_PNG);

  await sharp(OUT_PNG).jpeg({ quality: 92 }).toFile(OUT_JPG);

  const meta = await sharp(OUT_PNG).metadata();
  console.log(`✓ ${path.relative(ROOT, OUT_PNG)} (${meta.width}×${meta.height})`);
  console.log(`✓ ${path.relative(ROOT, OUT_JPG)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
