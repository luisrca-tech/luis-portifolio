/*
  Generate the site's default social-share card: public/og/og-default.png.

  One static 1200x630 image used as the Open Graph / Twitter image for the home
  and projects-index pages (EN + PT) and as the fallback for any page without its
  own card. Per-project pages keep their bespoke images in public/og/.

  The neon "L" logo (trimmed from public/portifolio-logo.png) sits on the left
  over a dark backdrop with a soft green glow; the identity block sits on the
  right. Drawn from scratch with sharp + an SVG, mirroring make-project-og.mjs.

  Run with: node scripts/make-site-og.mjs  (outputs one 1200x630 PNG)
*/
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { cleanLogo } from "./clean-logo.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ogDir = path.join(root, "public/og");

const W = 1200;
const H = 630;

// Neon palette sampled from the logo.
const bg = "#0a0b0d";
const ink = "#f4f6f5";
const neon = "#22e06a";
const neonDim = "#1aa552";
const muted = "#8a8f96";
const line = "#23262b";

// librsvg falls back to DejaVu Sans when Inter isn't installed; the intent is
// documented and the fallback renders cleanly (same convention as the other
// OG scripts).
const inter = "Inter, 'DejaVu Sans', ui-sans-serif, system-ui, sans-serif";

// The neon "L" on real transparency (see clean-logo.mjs), sized to a fixed
// height and centred in the left third of the card.
const logoH = 430;
const trimmed = await cleanLogo();
const { data: logo, info } = await sharp(trimmed)
  .resize({ height: logoH })
  .png()
  .toBuffer({ resolveWithObject: true });
const logoX = Math.round(260 - info.width / 2); // centre the glyph near x≈260
const logoY = Math.round((H - logoH) / 2);

const textX = 470;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="22%" cy="50%" r="42%">
      <stop offset="0%" stop-color="${neon}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${neon}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- thin neon frame -->
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="18"
        fill="none" stroke="${line}"/>
  <rect x="16" y="16" width="6" height="${H - 32}" rx="3" fill="${neon}"/>

  <!-- eyebrow -->
  <text x="${textX}" y="206" font-family="${inter}" font-size="20" font-weight="700"
        letter-spacing="4" fill="${neon}">PORTFOLIO</text>

  <!-- name -->
  <text x="${textX - 2}" y="276" font-family="${inter}" font-size="62" font-weight="800"
        fill="${ink}">Luis Felipe</text>
  <text x="${textX - 2}" y="344" font-family="${inter}" font-size="62" font-weight="800"
        fill="${ink}">Da Rocha</text>

  <!-- role -->
  <text x="${textX}" y="404" font-family="${inter}" font-size="30" font-weight="600"
        fill="${neon}">Full Stack Developer / AI Engineer</text>

  <!-- divider -->
  <line x1="${textX}" y1="440" x2="${W - 70}" y2="440" stroke="${line}"/>

  <!-- focus areas -->
  <text x="${textX}" y="486" font-family="${inter}" font-size="22" font-weight="500"
        fill="${muted}">RAG · Multi-LLM Orchestration · AI Agents · SaaS Architecture</text>

  <!-- footer: status + domain -->
  <circle cx="${textX + 7}" cy="554" r="7" fill="${neon}"/>
  <text x="${textX + 24}" y="561" font-family="${inter}" font-size="20" font-weight="600"
        fill="${ink}">open to roles &amp; projects</text>
  <text x="${W - 70}" y="561" font-family="${inter}" font-size="20" font-weight="600"
        fill="${neonDim}" text-anchor="end">luisrca-tech.vercel.app</text>
</svg>`;

const png = await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: logoX, top: logoY }])
  .flatten({ background: bg })
  .png()
  .toBuffer();

const out = path.join(ogDir, "og-default.png");
await writeFile(out, png);
console.log(`Wrote ${out} (${png.length} bytes, ${W}x${H})`);
