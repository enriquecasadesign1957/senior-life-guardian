import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");

async function removeBlackBackground(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(data);
  const pixels = info.width * info.height;
  const channels = info.channels;

  for (let i = 0; i < pixels; i++) {
    const o = i * channels;
    const r = out[o];
    const g = out[o + 1];
    const b = out[o + 2];
    const alphaIndex = o + (channels === 4 ? 3 : channels - 1);
    if (r < 24 && g < 24 && b < 24) {
      out[alphaIndex] = 0;
    } else if (channels === 3) {
      // ensureAlpha should have made it 4 channels
    } else {
      out[alphaIndex] = 255;
    }
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(outputPath);
}

async function main() {
  const symbolSrc = path.join(pub, "logo-wakeupdev-symbol.png");
  const symbolTransparent = path.join(
    pub,
    "logo-wakeupdev-symbol-transparent.png"
  );

  await removeBlackBackground(symbolSrc, symbolTransparent);

  const symbolSquare = await sharp(symbolTransparent)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(symbolSquare)
    .resize(32, 32)
    .png()
    .toFile(path.join(pub, "favicon-32x32.png"));
  await sharp(symbolSquare)
    .resize(16, 16)
    .png()
    .toFile(path.join(pub, "favicon-16x16.png"));
  await sharp(symbolSquare)
    .resize(180, 180)
    .png()
    .toFile(path.join(pub, "apple-touch-icon.png"));
  await sharp(symbolSquare)
    .resize(192, 192)
    .png()
    .toFile(path.join(pub, "icon-192.png"));
  await sharp(symbolSquare)
    .resize(32, 32)
    .png()
    .toFile(path.join(pub, "favicon.ico"));

  const fullLogo = await sharp(path.join(pub, "logo-wakeupdev.png"))
    .resize(520, null, { fit: "inside" })
    .png()
    .toBuffer();

  const flowSvg = `<svg width="900" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="900" height="80" rx="12" fill="#18181b" stroke="#27272a"/>
      <text x="36" y="50" fill="#f97316" font-family="system-ui,sans-serif" font-size="22" font-weight="600">Critical alert</text>
      <text x="210" y="50" fill="#52525b" font-size="22">→</text>
      <text x="250" y="50" fill="#fafafa" font-family="system-ui,sans-serif" font-size="22" font-weight="600">Phone call</text>
      <text x="410" y="50" fill="#52525b" font-size="22">→</text>
      <text x="450" y="50" fill="#f97316" font-family="system-ui,sans-serif" font-size="22" font-weight="600">Press 1 to ACK</text>
      <text x="670" y="50" fill="#52525b" font-size="22">→</text>
      <text x="710" y="50" fill="#fafafa" font-family="system-ui,sans-serif" font-size="22" font-weight="600">Escalation</text>
    </svg>`;

  const flowBar = await sharp(Buffer.from(flowSvg)).png().toBuffer();

  const subtitleSvg = `<svg width="900" height="40" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="28" fill="#a1a1aa" font-family="system-ui,sans-serif" font-size="26" font-weight="500">Voice-first on-call alerting</text>
    </svg>`;
  const subtitle = await sharp(Buffer.from(subtitleSvg)).png().toBuffer();

  const symbolOg = await sharp(symbolTransparent)
    .resize(120, 120, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 9, g: 9, b: 11, alpha: 1 },
    },
  })
    .composite([
      { input: symbolOg, top: 72, left: 80 },
      { input: fullLogo, top: 60, left: 220 },
      { input: subtitle, top: 175, left: 80 },
      { input: flowBar, top: 420, left: 80 },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(pub, "og-wakeup-dev.jpg"));

  console.log("Brand assets processed:");
  for (const f of [
    "logo-wakeupdev-symbol-transparent.png",
    "favicon-32x32.png",
    "favicon-16x16.png",
    "apple-touch-icon.png",
    "icon-192.png",
    "favicon.ico",
    "og-wakeup-dev.jpg",
  ]) {
    const p = path.join(pub, f);
    console.log(
      `  ${f}: ${fs.existsSync(p) ? fs.statSync(p).size + " bytes" : "MISSING"}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
