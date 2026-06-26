/*
  Shared helper: turn the logo source into the neon "L" on REAL transparency.

  public/portifolio-logo.png ships fully opaque — its "transparent" background was
  flattened to a baked grey checkerboard. Icons and the OG card both need the glyph
  isolated on a genuine alpha channel, so we rebuild alpha by colour-keying: keep
  pixels that are green-dominant (the wireframe and its glow) or near-white-hot
  (the brightest line cores), drop the neutral-grey checkerboard to alpha 0. The
  result is trimmed to a tight bounding box.
*/
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, "public/portifolio-logo.png");

/** @returns {Promise<Buffer>} a trimmed RGBA PNG of the green "L" on transparency. */
export async function cleanLogo() {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.from(data); // copy; we only rewrite the alpha byte

  // Track the bounding box of strongly-green pixels so we can crop to the "L"
  // itself, excluding the faint decorative (near-white) sparkle that the
  // brightness rule would otherwise keep.
  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const greenDominance = g - Math.max(r, b);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Green wireframe + soft glow: ramp alpha with how green the pixel is.
    let alpha = greenDominance > 8 ? Math.min(255, (greenDominance - 8) * 12) : 0;
    // White-hot line cores read as near-neutral but very bright; keep them too.
    if (lum > 170) alpha = Math.max(alpha, Math.min(255, (lum - 150) * 4));

    out[i + 3] = alpha;

    if (greenDominance > 20) {
      const px = (i / channels) % width;
      const py = Math.floor(i / channels / width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }

  // A few px of padding keeps the glow halo from being clipped.
  const pad = 6;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const cropW = Math.min(width, maxX + pad) - left;
  const cropH = Math.min(height, maxY + pad) - top;

  return sharp(out, { raw: { width, height, channels } })
    .extract({ left, top, width: cropW, height: cropH })
    .png()
    .toBuffer();
}
