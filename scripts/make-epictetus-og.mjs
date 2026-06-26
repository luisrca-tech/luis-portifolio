/*
  One-off: generate an OG image for the Epictetus Blog project, whose live site
  exposes none. This mirrors the blog's OWN identity (captured from
  https://epictetus-blog-ten.vercel.app/), not the portfolio's terminal style:
  a clean white header bar — black "E" badge + "Epictetus" wordmark + uppercase
  section nav — sitting above the site's dark charcoal (gray-900) hero band.

  Run with: node scripts/make-epictetus-og.mjs
  Outputs public/og/epictetus-blog.png at 1200x630.
*/
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "public/og/epictetus-blog.png");

// Palette sampled from the live blog (Tailwind grays).
const white = "#ffffff";
const ink = "#0a0a0a";
const hero = "#111827"; // gray-900 — the site's hero band
const heroLine = "#1f2937"; // gray-800
const gray200 = "#e5e7eb";
const gray400 = "#9ca3af";
const gray500 = "#6b7280";

const sans =
  "Inter, ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif";

const HEADER_H = 150;

// Section nav, right-aligned in the header like the live site.
const sections = ["UI DESIGN", "INTERNET", "INSPIRATIONS"];
let navX = 1120;
const navEls = [...sections]
  .reverse()
  .map((label, i) => {
    const w = label.length * 11.5 + 14;
    navX -= w + (i === 0 ? 0 : 32);
    const x = navX + w; // right edge of this item
    navX -= 0;
    return `<text x="${x}" y="${HEADER_H / 2 + 6}" font-family="${sans}"
      font-size="18" font-weight="600" letter-spacing="1.5"
      fill="#374151" text-anchor="end">${label}</text>`;
  })
  .join("");

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630"
     xmlns="http://www.w3.org/2000/svg">
  <!-- white header bar -->
  <rect width="1200" height="630" fill="${white}" />

  <!-- logo: black square badge + wordmark -->
  <rect x="80" y="${HEADER_H / 2 - 24}" width="48" height="48" rx="6" fill="${ink}" />
  <text x="104" y="${HEADER_H / 2 + 9}" font-family="${sans}" font-size="28"
        font-weight="700" fill="${white}" text-anchor="middle">E</text>
  <text x="146" y="${HEADER_H / 2 + 9}" font-family="${sans}" font-size="30"
        font-weight="600" fill="${ink}">Epictetus</text>

  ${navEls}

  <line x1="0" y1="${HEADER_H}" x2="1200" y2="${HEADER_H}"
        stroke="${gray200}" stroke-width="1" />

  <!-- dark editorial hero band -->
  <rect x="0" y="${HEADER_H}" width="1200" height="${630 - HEADER_H}" fill="${hero}" />

  <!-- eyebrow -->
  <text x="80" y="258" font-family="${sans}" font-size="20" font-weight="600"
        letter-spacing="3" fill="${gray400}">JOURNAL · UI DESIGN · INTERNET · INSPIRATIONS</text>

  <!-- headline -->
  <text x="78" y="348" font-family="${sans}" font-size="52" font-weight="700"
        fill="${white}">Considered writing on design,</text>
  <text x="78" y="414" font-family="${sans}" font-size="52" font-weight="700"
        fill="${white}">the web, and ideas worth keeping.</text>

  <!-- excerpt -->
  <text x="80" y="486" font-family="${sans}" font-size="26" fill="${gray400}">
    A quiet corner of the web — fast, statically rendered, made for reading.
  </text>

  <!-- footer rule + url -->
  <line x1="80" y1="548" x2="1120" y2="548" stroke="${heroLine}" stroke-width="1" />
  <text x="80" y="588" font-family="${sans}" font-size="20" fill="${gray500}">
    epictetus-blog-ten.vercel.app
  </text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(out, png);
console.log(`Wrote ${out} (${png.length} bytes)`);
