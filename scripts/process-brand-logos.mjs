import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const brandsDir = path.join(process.cwd(), "public", "brands");
const outDir = path.join(process.cwd(), "public", "brands", "alpha");
const THRESHOLD = 238;

function backgroundAlpha(r, g, b) {
  const avg = (r + g + b) / 3;
  const min = Math.min(r, g, b);
  if (min >= THRESHOLD && avg >= 241) {
    const fade = Math.min(1, Math.max(0, (min - (THRESHOLD - 8)) / 14));
    return Math.round(255 * (1 - fade));
  }
  return 255;
}

async function knockout(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.from(data);

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    out[o + 3] = Math.min(out[o + 3], backgroundAlpha(out[o], out[o + 1], out[o + 2]));
  }

  const webp = await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer();

  const outPath = path.join(outDir, path.basename(filePath));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, webp);
}

const files = fs.readdirSync(brandsDir).filter((name) => name.startsWith("logo-") && name.endsWith(".webp"));

for (const name of files) {
  const filePath = path.join(brandsDir, name);
  try {
    const meta = await sharp(filePath).metadata();
    if (meta.hasAlpha) {
      fs.mkdirSync(outDir, { recursive: true });
      fs.copyFileSync(filePath, path.join(outDir, name));
      console.log("copied (already alpha):", name);
      continue;
    }
    await knockout(filePath);
    console.log("processed:", name);
  } catch (error) {
    console.warn("failed:", name, error.message);
  }
}
