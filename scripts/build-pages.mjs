import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = 'raw-pages';
const OUT = 'public/pages';
const WIDTHS = [640, 1080, 1600, 2400];

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir('data', { recursive: true });

const files = (await fs.readdir(SRC))
  .filter(f => /\.(png|jpe?g)$/i.test(f))
  .sort();

const manifest = [];

for (const [i, file] of files.entries()) {
  const id = String(i + 1).padStart(2, '0');
  const src = path.join(SRC, file);
  const meta = await sharp(src).metadata();
  const swap = (meta.orientation ?? 1) >= 5; // EXIF rotation swaps dimensions
  const [width, height] = swap ? [meta.height, meta.width] : [meta.width, meta.height];
  const widths = WIDTHS.filter(w => w <= width);

  for (const w of widths) {
    const img = sharp(src).rotate().resize({ width: w });
    await img.clone().avif({ quality: 50 }).toFile(`${OUT}/p${id}-${w}.avif`);
    await img.clone().webp({ quality: 78 }).toFile(`${OUT}/p${id}-${w}.webp`);
  }

  const blur = await sharp(src).rotate().resize(16).webp({ quality: 40 }).toBuffer();

  manifest.push({
    id,
    width,
    height,
    widths,
    alt: `Page ${i + 1}`,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
  });

  console.log(`page ${id} (${width}x${height}) <- ${file}`);
}

// Image used for link previews (WhatsApp, LinkedIn, etc.)
await sharp(path.join(SRC, files[0]))
  .rotate()
  .resize(1200, 630, { fit: 'cover' })
  .jpeg({ quality: 82 })
  .toFile('public/og.jpg');

await fs.writeFile('data/pages.json', JSON.stringify(manifest, null, 2));
console.log(`\nDone: ${files.length} pages`);