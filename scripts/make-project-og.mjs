/*
  One-off: generate branded card images for the three projects that have no live
  site to fetch an OG from (anonymized company systems and a pre-launch product).

  Unlike fetch-og.mjs, nothing is pulled from the network and no real screenshots
  are used. Each card is drawn from scratch in the *product's own* brand — palette
  and an abstract motif sampled from its repo — while keeping the portfolio's
  anonymized titles ("Agency Operations Dashboard", "Render Delivery Platform").
  This mirrors make-epictetus-og.mjs, but one card per project.

  Run with: node scripts/make-project-og.mjs
  Outputs three 1200x630 PNGs into public/og/.
*/
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ogDir = path.join(root, "public/og");

const W = 1200;
const H = 630;

// Inter/Lato aren't installed in most environments; librsvg falls back to a
// clean sans (DejaVu). The intent is documented; the fallback renders well.
const inter = "Inter, 'DejaVu Sans', ui-sans-serif, system-ui, sans-serif";
const lato = "Lato, 'DejaVu Sans', ui-sans-serif, system-ui, sans-serif";

/* ---------------------------------------------------------------------------
   Card 1 — Agency Operations Dashboard  (OKM brand: warm gold on light)
   Motif: a ledger/table with a hard privacy divider — operational columns on
   the left, a locked "financials" column on the right.
--------------------------------------------------------------------------- */
function agencyOps() {
  const bg = "#f4f5f7";
  const surface = "#ffffff";
  const ink = "#212121";
  const charcoal = "#373a3b";
  const gold = "#ffe774";
  const goldStrong = "#e6cf68";
  const line = "#e3e5e9";
  const muted = "#8a8f96";

  // Ledger rows on the right side, with the last column locked.
  const rowsX = 660;
  const rowsTop = 250;
  const rowH = 46;
  const rows = Array.from({ length: 5 }, (_, i) => {
    const y = rowsTop + i * rowH;
    return `
      <rect x="${rowsX}" y="${y}" width="460" height="32" rx="4" fill="${surface}" stroke="${line}"/>
      <rect x="${rowsX + 14}" y="${y + 11}" width="120" height="10" rx="5" fill="#d6d9de"/>
      <rect x="${rowsX + 168}" y="${y + 11}" width="70" height="10" rx="5" fill="#d6d9de"/>
      <rect x="${rowsX + 300}" y="${y + 6}" width="146" height="20" rx="4" fill="${i % 2 ? "#fbf3c9" : "#f6efd0"}"/>`;
  }).join("");

  return `
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- white header bar -->
  <rect x="0" y="0" width="${W}" height="150" fill="${surface}"/>
  <line x1="0" y1="150" x2="${W}" y2="150" stroke="${line}"/>
  <rect x="80" y="51" width="48" height="48" rx="10" fill="${gold}"/>
  <rect x="80" y="51" width="48" height="48" rx="10" fill="none" stroke="${goldStrong}"/>
  <text x="104" y="84" font-family="${inter}" font-size="24" font-weight="800"
        fill="${ink}" text-anchor="middle">AO</text>
  <text x="148" y="84" font-family="${inter}" font-size="26" font-weight="700"
        fill="${ink}">Agency Operations Dashboard</text>
  <text x="1120" y="84" font-family="${inter}" font-size="16" font-weight="600"
        letter-spacing="2" fill="${muted}" text-anchor="end">INTERNAL · OPERATIONS</text>

  <!-- eyebrow -->
  <text x="80" y="248" font-family="${inter}" font-size="18" font-weight="700"
        letter-spacing="2.5" fill="${charcoal}">TIME TRACKING · PROJECT FINANCIALS · AUDIT TRAIL</text>

  <!-- headline -->
  <text x="78" y="328" font-family="${inter}" font-size="46" font-weight="800"
        fill="${ink}">Operations &amp; finance,</text>
  <text x="78" y="386" font-family="${inter}" font-size="46" font-weight="800"
        fill="${ink}">split by a hard</text>
  <text x="78" y="444" font-family="${inter}" font-size="46" font-weight="800"
        fill="${ink}">privacy boundary.</text>

  <!-- gold underline accent -->
  <rect x="80" y="470" width="150" height="8" rx="4" fill="${gold}"/>

  <!-- ledger motif -->
  ${rows}
  <!-- privacy divider + lock over the financial column -->
  <line x1="${rowsX + 288}" y1="240" x2="${rowsX + 288}" y2="${rowsTop + 5 * rowH + 8}"
        stroke="${goldStrong}" stroke-width="2" stroke-dasharray="4 5"/>
  <g transform="translate(${rowsX + 396}, 214)">
    <rect x="0" y="8" width="34" height="26" rx="4" fill="${ink}"/>
    <path d="M6 8 V4 a11 11 0 0 1 22 0 V8" fill="none" stroke="${ink}" stroke-width="4"/>
    <rect x="14" y="16" width="6" height="9" rx="3" fill="${gold}"/>
  </g>

  <!-- footer -->
  <line x1="80" y1="556" x2="1120" y2="556" stroke="${line}"/>
  <text x="80" y="594" font-family="${inter}" font-size="18" fill="${muted}">
    Hono · Drizzle · OpenAPI · role-scoped financial access</text>`;
}

/* ---------------------------------------------------------------------------
   Card 2 — Render Delivery Platform  (Perfect Renders brand: rust on charcoal)
   Motif: a render pipeline — view → stage → revision frames advancing to final.
--------------------------------------------------------------------------- */
function renderDelivery() {
  const charcoal = "#252525";
  const charcoalLine = "#3a3a3a";
  const white = "#ffffff";
  const rust = "#db4930";
  const rustDim = "#a8381f";
  const gray = "#fafafa";
  const grayMuted = "#9a9a9a";
  const frame = "#2f2f2f";

  // Four pipeline frames; progress fills increase to a "final" approved frame.
  const frames = [
    { label: "DRAFT", fill: 0.25 },
    { label: "REVISION 2", fill: 0.55 },
    { label: "REVISION 4", fill: 0.8 },
    { label: "FINAL", fill: 1, done: true },
  ];
  const fx = 80;
  const fy = 374;
  const fw = 240;
  const fh = 150;
  const gap = 17;
  const cards = frames
    .map((f, i) => {
      const x = fx + i * (fw + gap);
      const barW = (fw - 28) * f.fill;
      const accent = f.done ? "#46c08a" : rust;
      return `
      <rect x="${x}" y="${fy}" width="${fw}" height="${fh}" rx="8" fill="${frame}" stroke="${charcoalLine}"/>
      <rect x="${x + 14}" y="${fy + 16}" width="${fw - 28}" height="78" rx="5" fill="#262626"/>
      <path d="M${x + 14} ${fy + 78} l46 -34 l34 24 l40 -30 l${fw - 28 - 120} 40 Z" fill="${rustDim}" opacity="0.55"/>
      <circle cx="${x + 38}" cy="${fy + 40}" r="9" fill="${rust}" opacity="0.8"/>
      <text x="${x + 14}" y="${fy + 116}" font-family="${inter}" font-size="13"
            font-weight="700" letter-spacing="1.5" fill="${grayMuted}">${f.label}</text>
      <rect x="${x + 14}" y="${fy + 128}" width="${fw - 28}" height="6" rx="3" fill="#3a3a3a"/>
      <rect x="${x + 14}" y="${fy + 128}" width="${barW}" height="6" rx="3" fill="${accent}"/>`;
    })
    .join("");

  // Connector arrows between frames.
  const arrows = frames
    .slice(0, -1)
    .map((_, i) => {
      const x = fx + (i + 1) * (fw + gap) - gap / 2;
      const y = fy + fh / 2;
      return `<path d="M${x - 9} ${y - 6} l9 6 l-9 6" fill="none" stroke="${rust}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");

  return `
  <rect width="${W}" height="${H}" fill="${charcoal}"/>

  <!-- white header bar -->
  <rect x="0" y="0" width="${W}" height="150" fill="${white}"/>
  <line x1="0" y1="150" x2="${W}" y2="150" stroke="#ececec"/>
  <rect x="80" y="51" width="48" height="48" rx="10" fill="${rust}"/>
  <text x="104" y="85" font-family="${inter}" font-size="24" font-weight="800"
        fill="${white}" text-anchor="middle">RD</text>
  <text x="148" y="84" font-family="${inter}" font-size="26" font-weight="700"
        fill="#1a1a1a">Render Delivery Platform</text>
  <text x="1120" y="84" font-family="${inter}" font-size="16" font-weight="600"
        letter-spacing="2" fill="#9a9a9a" text-anchor="end">ARCH-VIZ · INTERNAL</text>

  <!-- eyebrow -->
  <text x="80" y="228" font-family="${inter}" font-size="18" font-weight="700"
        letter-spacing="2.5" fill="${rust}">VIEWS · STAGES · REVISIONS · PAYOUTS</text>

  <!-- headline -->
  <text x="78" y="292" font-family="${inter}" font-size="42" font-weight="800"
        fill="${gray}">From quote to final render —</text>
  <text x="78" y="340" font-family="${inter}" font-size="42" font-weight="800"
        fill="${gray}">a forward-only delivery pipeline.</text>

  <!-- pipeline motif -->
  ${cards}
  ${arrows}

  <!-- footer -->
  <line x1="80" y1="556" x2="1120" y2="556" stroke="${charcoalLine}"/>
  <text x="80" y="594" font-family="${inter}" font-size="18" fill="${grayMuted}">
    Next.js · Prisma · AWS S3 · Stripe · reconciled cost ledger</text>`;
}

/* ---------------------------------------------------------------------------
   Card 3 — Attios  (CRM brand: vibrant blue + accent palette on light)
   Motif: a multi-tenant pipeline — workspace subdomain over kanban-style chips.
--------------------------------------------------------------------------- */
function attios() {
  const bg = "#f5f5fa";
  const surface = "#ffffff";
  const ink = "#1C1D21";
  const blue = "#5E81F4";
  const line = "#ececfa";
  const muted = "#9698d6";
  const amber = "#F4BE5E";
  const emerald = "#7CE7AC";
  const coral = "#FF808B";
  const cyan = "#40E1FA";

  // Three pipeline columns with colored chips drawn from the accent palette.
  const cols = [
    { title: "LEADS", chips: [muted, blue, amber] },
    { title: "ORDERS", chips: [blue, emerald, blue] },
    { title: "INVOICES", chips: [emerald, coral] },
  ];
  const cx = 660;
  const cy = 232;
  const cw = 142;
  const ch = 270;
  const gap = 20;
  const columns = cols
    .map((c, i) => {
      const x = cx + i * (cw + gap);
      const chips = c.chips
        .map((color, j) => {
          const y = cy + 52 + j * 58;
          return `
          <rect x="${x + 12}" y="${y}" width="${cw - 24}" height="44" rx="8" fill="${surface}" stroke="${line}"/>
          <rect x="${x + 12}" y="${y}" width="5" height="44" rx="2.5" fill="${color}"/>
          <rect x="${x + 28}" y="${y + 12}" width="${cw - 60}" height="8" rx="4" fill="#e6e6f2"/>
          <rect x="${x + 28}" y="${y + 26}" width="${cw - 80}" height="7" rx="3.5" fill="#eeeef6"/>`;
        })
        .join("");
      return `
      <rect x="${x}" y="${cy}" width="${cw}" height="${ch}" rx="12" fill="#fbfbff" stroke="${line}"/>
      <text x="${x + 16}" y="${cy + 30}" font-family="${lato}" font-size="14"
            font-weight="700" letter-spacing="1.5" fill="${blue}">${c.title}</text>
      ${chips}`;
    })
    .join("");

  return `
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- white header bar -->
  <rect x="0" y="0" width="${W}" height="150" fill="${surface}"/>
  <line x1="0" y1="150" x2="${W}" y2="150" stroke="${line}"/>
  <rect x="80" y="51" width="48" height="48" rx="12" fill="${blue}"/>
  <text x="104" y="85" font-family="${lato}" font-size="28" font-weight="800"
        fill="${surface}" text-anchor="middle">A</text>
  <text x="148" y="84" font-family="${lato}" font-size="28" font-weight="800"
        fill="${ink}">Attios</text>
  <text x="246" y="84" font-family="${lato}" font-size="28" font-weight="400"
        fill="${muted}">CRM</text>
  <text x="1120" y="84" font-family="${lato}" font-size="16" font-weight="600"
        letter-spacing="2" fill="${muted}" text-anchor="end">MULTI-TENANT SaaS</text>

  <!-- eyebrow -->
  <text x="80" y="236" font-family="${lato}" font-size="18" font-weight="700"
        letter-spacing="2.5" fill="${blue}">PRODUCTS · LEADS · ORDERS · INVOICES</text>

  <!-- headline -->
  <text x="78" y="304" font-family="${lato}" font-size="46" font-weight="800"
        fill="${ink}">Every workspace,</text>
  <text x="78" y="360" font-family="${lato}" font-size="46" font-weight="800"
        fill="${ink}">its own isolated</text>
  <text x="78" y="416" font-family="${lato}" font-size="46" font-weight="800"
        fill="${ink}">sales operation.</text>

  <!-- subdomain chip -->
  <rect x="80" y="446" width="300" height="40" rx="20" fill="${surface}" stroke="${line}"/>
  <circle cx="104" cy="466" r="5" fill="${emerald}"/>
  <text x="120" y="472" font-family="${lato}" font-size="18" fill="#6b6d7a">acme.attios.app</text>

  <!-- pipeline motif -->
  ${columns}

  <!-- footer -->
  <line x1="80" y1="556" x2="1120" y2="556" stroke="${line}"/>
  <text x="80" y="594" font-family="${lato}" font-size="18" fill="${muted}">
    Next.js · tRPC · Drizzle · Clerk · workspace-scoped by construction</text>`;
}

/* ---------------------------------------------------------------------------
   Card 4 — AI Real-Estate Site Builder  (anonymized; no repo to sample)
   Generative-AI identity: deep indigo with violet + teal accents.
   Motif: the pipeline — property docs & voice notes → AI core → schema-valid
   template sections.
--------------------------------------------------------------------------- */
function aiSiteBuilder() {
  const bg = "#0e0f1a";
  const panel = "#191b2c";
  const panelLine = "#2a2d44";
  const white = "#ffffff";
  const ink = "#1a1b2e";
  const violet = "#6d5efc";
  const violetLight = "#a99bff";
  const teal = "#34e1c4";
  const muted = "#8a8da6";

  // Pipeline geometry: input cards → AI core → output wireframe.
  const bandTop = 392;
  const cardW = 210;
  const cardH = 52;
  const inputs = [
    { y: bandTop, label: "PDF · DOCX · XLSX", glyph: "doc" },
    { y: bandTop + 64, label: "VOICE NOTE", glyph: "wave" },
  ];
  const inputEls = inputs
    .map((c) => {
      const x = 80;
      const glyph =
        c.glyph === "doc"
          ? `<rect x="${x + 16}" y="${c.y + 14}" width="20" height="24" rx="3" fill="none" stroke="${violetLight}" stroke-width="2"/>
             <line x1="${x + 21}" y1="${c.y + 22}" x2="${x + 31}" y2="${c.y + 22}" stroke="${violetLight}" stroke-width="2"/>
             <line x1="${x + 21}" y1="${c.y + 28}" x2="${x + 31}" y2="${c.y + 28}" stroke="${violetLight}" stroke-width="2"/>`
          : `<g stroke="${teal}" stroke-width="2.5" stroke-linecap="round">
             <line x1="${x + 17}" y1="${c.y + 26}" x2="${x + 17}" y2="${c.y + 30}"/>
             <line x1="${x + 23}" y1="${c.y + 20}" x2="${x + 23}" y2="${c.y + 36}"/>
             <line x1="${x + 29}" y1="${c.y + 16}" x2="${x + 29}" y2="${c.y + 40}"/>
             <line x1="${x + 35}" y1="${c.y + 22}" x2="${x + 35}" y2="${c.y + 34}"/></g>`;
      return `
      <rect x="${x}" y="${c.y}" width="${cardW}" height="${cardH}" rx="8" fill="${panel}" stroke="${panelLine}"/>
      ${glyph}
      <text x="${x + 52}" y="${c.y + 32}" font-family="${inter}" font-size="15"
            font-weight="600" letter-spacing="1" fill="#c9cbe0">${c.label}</text>`;
    })
    .join("");

  // AI core node, vertically centered on the input stack.
  const coreX = 430;
  const coreCy = bandTop + (cardH + 64) / 2 + 6;
  const core = `
    <circle cx="${coreX}" cy="${coreCy}" r="58" fill="${violet}" opacity="0.18"/>
    <circle cx="${coreX}" cy="${coreCy}" r="42" fill="${violet}"/>
    <text x="${coreX}" y="${coreCy + 9}" font-family="${inter}" font-size="26"
          font-weight="800" fill="${white}" text-anchor="middle">AI</text>
    <path d="M${coreX + 40} ${coreCy - 44} l4 11 l11 4 l-11 4 l-4 11 l-4 -11 l-11 -4 l11 -4 Z" fill="${teal}"/>
    <text x="${coreX}" y="${coreCy + 78}" font-family="${inter}" font-size="14"
          fill="${muted}" text-anchor="middle">OpenAI · Whisper</text>`;

  // Output wireframe: a browser window of validated template sections.
  const ox = 600;
  const oy = bandTop - 6;
  const ow = 520;
  const oh = 150;
  const sections = ["HERO", "AMENITIES", "GALLERY", "NEIGHBORHOOD"];
  const chips = sections
    .map((s, i) => {
      const cw = (ow - 48 - 3 * 12) / 4;
      const x = ox + 24 + i * (cw + 12);
      return `
      <rect x="${x}" y="${oy + 96}" width="${cw}" height="34" rx="5" fill="#20233a" stroke="${panelLine}"/>
      <rect x="${x}" y="${oy + 96}" width="${cw}" height="3" rx="1.5" fill="${violetLight}"/>
      <text x="${x + cw / 2}" y="${oy + 117}" font-family="${inter}" font-size="11"
            font-weight="700" letter-spacing="0.5" fill="#a6a9c4" text-anchor="middle">${s}</text>`;
    })
    .join("");
  const output = `
    <rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" rx="10" fill="${panel}" stroke="${panelLine}"/>
    <line x1="${ox}" y1="${oy + 34}" x2="${ox + ow}" y2="${oy + 34}" stroke="${panelLine}"/>
    <circle cx="${ox + 22}" cy="${oy + 17}" r="4.5" fill="#3a3d5c"/>
    <circle cx="${ox + 40}" cy="${oy + 17}" r="4.5" fill="#3a3d5c"/>
    <circle cx="${ox + 58}" cy="${oy + 17}" r="4.5" fill="#3a3d5c"/>
    <rect x="${ox + ow - 150}" y="${oy + 9}" width="130" height="18" rx="9" fill="#20233a"/>
    <circle cx="${ox + ow - 134}" cy="${oy + 18}" r="4" fill="${teal}"/>
    <text x="${ox + ow - 122}" y="${oy + 22}" font-family="${inter}" font-size="12"
          fill="${teal}">schema-valid</text>
    <rect x="${ox + 24}" y="${oy + 50}" width="${ow - 48}" height="34" rx="5" fill="#20233a"/>
    <rect x="${ox + 24}" y="${oy + 50}" width="${ow - 48}" height="34" rx="5" fill="${violet}" opacity="0.16"/>
    ${chips}`;

  // Connector arrows between the three stages.
  const arrowY = coreCy;
  const arrows = `
    <path d="M298 ${arrowY} h66" stroke="${violet}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M358 ${arrowY - 6} l8 6 l-8 6" fill="none" stroke="${violet}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M476 ${arrowY} h110" stroke="${violet}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M580 ${arrowY - 6} l8 6 l-8 6" fill="none" stroke="${violet}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- white header bar -->
  <rect x="0" y="0" width="${W}" height="150" fill="${white}"/>
  <line x1="0" y1="150" x2="${W}" y2="150" stroke="#ececf2"/>
  <rect x="80" y="51" width="48" height="48" rx="12" fill="${violet}"/>
  <text x="104" y="84" font-family="${inter}" font-size="22" font-weight="800"
        fill="${white}" text-anchor="middle">AI</text>
  <text x="148" y="84" font-family="${inter}" font-size="26" font-weight="700"
        fill="${ink}">AI Real-Estate Site Builder</text>
  <text x="1120" y="84" font-family="${inter}" font-size="16" font-weight="600"
        letter-spacing="2" fill="#9a9db0" text-anchor="end">GENERATIVE · MULTI-TENANT</text>

  <!-- eyebrow -->
  <text x="80" y="226" font-family="${inter}" font-size="18" font-weight="700"
        letter-spacing="2.5" fill="${violetLight}">INTAKE · TRANSCRIBE · GENERATE · VALIDATE</text>

  <!-- headline -->
  <text x="78" y="300" font-family="${inter}" font-size="42" font-weight="800"
        fill="${white}">Property docs and voice notes in —</text>
  <text x="78" y="350" font-family="${inter}" font-size="42" font-weight="800"
        fill="${white}">a schema-valid marketing site out.</text>

  <!-- pipeline motif -->
  ${inputEls}
  ${core}
  ${output}
  ${arrows}

  <!-- footer -->
  <line x1="80" y1="568" x2="1120" y2="568" stroke="${panelLine}"/>
  <text x="80" y="600" font-family="${inter}" font-size="18" fill="${muted}">
    Next.js · NestJS · FastAPI · OpenAI · Whisper · token cost tracked per artifact</text>`;
}

const cards = [
  { name: "agency-operations-dashboard", body: agencyOps() },
  { name: "render-delivery-platform", body: renderDelivery() },
  { name: "attios-crm", body: attios() },
  { name: "ai-site-builder", body: aiSiteBuilder() },
];

for (const { name, body } of cards) {
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
       xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const out = path.join(ogDir, `${name}.png`);
  await writeFile(out, png);
  console.log(`Wrote ${out} (${png.length} bytes)`);
}
