// Genera PNGs en distintos tamaños desde public/icons/icon.svg
// Uso: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const SVG = path.join(ROOT, 'public', 'icons', 'icon.svg');
const OUT_DIR = path.join(ROOT, 'public', 'icons');
const PUBLIC_DIR = path.join(ROOT, 'public');

const SIZES = [
  { size: 48, name: 'icon-48.png' },
  { size: 72, name: 'icon-72.png' },
  { size: 96, name: 'icon-96.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 144, name: 'icon-144.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 256, name: 'icon-256.png' },
  { size: 384, name: 'icon-384.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 1024, name: 'icon-1024.png' },
];

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  const svg = await readFile(SVG);
  console.log('Generando iconos PNG desde', SVG);

  for (const { size, name } of SIZES) {
    const out = path.join(OUT_DIR, name);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log('  ✓', name);
  }

  // También copia los principales al root /public para fácil referencia
  await sharp(svg).resize(192, 192).png().toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
  await sharp(svg).resize(180, 180).png().toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  await sharp(svg).resize(32, 32).png().toFile(path.join(PUBLIC_DIR, 'favicon.png'));

  // Splash screen (para iOS / Capacitor)
  const splash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732">
    <rect width="2732" height="2732" fill="#7c3aed"/>
  </svg>`);
  await sharp(splash)
    .composite([{ input: await sharp(svg).resize(640, 640).png().toBuffer(), gravity: 'center' }])
    .png()
    .toFile(path.join(OUT_DIR, 'splash-2732x2732.png'));
  console.log('  ✓ splash-2732x2732.png');

  console.log('\n✅ Iconos generados en public/icons/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
