// Converts assets/original/* into small, phone-sized WebP files in public/assets/img/:
//   NAME-480.webp   480px wide  (1x phones, slow connections / Data Saver)
//   NAME.webp       800px wide  (2x phones; also the plain `src` fallback)
//   NAME-blur.webp  tiny, pre-blurred placeholder / side-fill (no CSS blur needed)
// plus the 1200×630 og-image.jpg link preview.
// Run with: npm run images
import sharp from 'sharp';
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets/original';
const OUT = 'public/assets/img';
// The landscape hands photo is shown full-height (cover), so it needs more width; it's tiny anyway.
const WIDE = { hands: { width: 1280, quality: 60 } };

const webp = (q) => ({ quality: q, effort: 6, smartSubsample: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
let total = 0;
let phoneTotal = 0;
const size = async (f) => (await stat(f)).size;

for (const file of files) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  const outMain = path.join(OUT, `${name}.webp`);
  const outSmall = path.join(OUT, `${name}-480.webp`);
  const outBlur = path.join(OUT, `${name}-blur.webp`);

  if (WIDE[name]) {
    await sharp(input).resize({ width: WIDE[name].width, withoutEnlargement: true }).webp(webp(WIDE[name].quality)).toFile(outMain);
    await unlink(outSmall).catch(() => {});
  } else {
    await sharp(input).resize({ width: 800, withoutEnlargement: true }).webp(webp(72)).toFile(outMain);
    await sharp(input).resize({ width: 480, withoutEnlargement: true }).webp(webp(68)).toFile(outSmall);
  }
  await sharp(input).resize({ width: 64 }).blur(2.5).webp({ quality: 45 }).toFile(outBlur);

  const main = await size(outMain);
  const small = WIDE[name] ? main : await size(outSmall);
  const blur = await size(outBlur);
  total += main + blur;
  phoneTotal += small + blur;
  console.log(
    `${name.padEnd(26)} ${String(meta.width).padStart(4)}×${meta.height}  → 800w ${(main / 1024).toFixed(0).padStart(3)} KB` +
    (WIDE[name] ? '' : ` | 480w ${(small / 1024).toFixed(0).padStart(3)} KB`)
  );
}

// Open Graph preview: blurred wedding art as backdrop, portrait art on the left, title on the right.
const wedding = path.join(SRC, 'wedding.jpeg');
const backdrop = await sharp(wedding).resize(1200, 630, { fit: 'cover' }).blur(28).modulate({ brightness: 0.55 }).toBuffer();
const portrait = await sharp(wedding).resize({ height: 630 }).toBuffer();
const text = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <style>
    .a{font-family:Georgia,'Times New Roman',serif;fill:#f6e7c1}
  </style>
  <text x="820" y="230" text-anchor="middle" class="a" font-size="30" letter-spacing="8">WEDDING INVITATION</text>
  <line x1="660" y1="260" x2="980" y2="260" stroke="#d4a64a" stroke-width="2"/>
  <text x="820" y="345" text-anchor="middle" class="a" font-size="76" font-style="italic">Kartik &amp; Neha</text>
  <line x1="660" y1="385" x2="980" y2="385" stroke="#d4a64a" stroke-width="2"/>
  <text x="820" y="440" text-anchor="middle" class="a" font-size="32" letter-spacing="4">2 · DECEMBER · 2026</text>
</svg>`);
await sharp(backdrop)
  .composite([{ input: portrait, left: 70, top: 0 }, { input: text, left: 0, top: 0 }])
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(path.join(OUT, 'og-image.jpg'));

console.log(`\nAll backgrounds, 800w (2x phones): ${(total / 1024).toFixed(0)} KB`);
console.log(`All backgrounds, 480w (1x / slow):  ${(phoneTotal / 1024).toFixed(0)} KB`);
console.log(`Link preview og-image.jpg:          ${((await size(path.join(OUT, 'og-image.jpg'))) / 1024).toFixed(0)} KB (only fetched by WhatsApp)`);
