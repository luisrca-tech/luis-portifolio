/*
  Generate the favicon / app-icon set from the neon "L" logo.

  Source is public/portifolio-logo.png — a wide (800x436) transparent PNG with
  the wireframe "L" sitting left-of-centre. We trim the transparent margin to a
  tight bounding box, then centre it on a square transparent canvas with a little
  breathing room so it reads at small sizes. Background stays transparent by
  design (matches the dark UI; iOS composites it on black, which suits the neon).

  Outputs into public/:
    favicon.ico            multi-res (16/32/48) legacy + /favicon.ico fallback
    favicon-16.png         32/16 PNG icons referenced from <head>
    favicon-32.png
    apple-touch-icon.png   180x180 for iOS home screen
    icon-192.png           PWA manifest icons
    icon-512.png

  Run with: node scripts/make-icons.mjs
*/
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { cleanLogo } from "./clean-logo.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");

// The neon "L" on real transparency, tightly cropped — reused for every size.
const trimmed = await cleanLogo();

// Render the trimmed glyph onto a transparent square canvas. The glyph fills
// ~82% of the canvas so it never touches the edges.
async function squareIcon(size) {
  const inner = Math.round(size * 0.82);
  const glyph = await sharp(trimmed)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: glyph, gravity: "centre" }])
    .png()
    .toBuffer();
}

const pngTargets = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

for (const { name, size } of pngTargets) {
  const png = await squareIcon(size);
  const out = path.join(publicDir, name);
  await writeFile(out, png);
  console.log(`Wrote ${out} (${png.length} bytes)`);
}

// Multi-resolution favicon.ico from the 16/32/48 squares.
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map((s) => squareIcon(s)));
const ico = await pngToIco(icoPngs);
const icoOut = path.join(publicDir, "favicon.ico");
await writeFile(icoOut, ico);
console.log(`Wrote ${icoOut} (${ico.length} bytes)`);
