/*
  One-time generator: pull each project's Open Graph image from its live site
  and commit it locally.

  For every project MDX that has `links.live`, this fetches the page, parses the
  <meta property="og:image"> URL, downloads the image into public/og/<slug>.<ext>,
  and writes `image: /og/<slug>.<ext>` into the frontmatter. Projects without a
  live URL (anonymized company systems) are left untouched and keep their
  initials fallback.

  Run with: npm run fetch-og
  Re-run whenever a live site changes its OG image. Results are deterministic and
  committed, so the build itself never touches the network.
*/
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "js-yaml";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projectsDir = path.join(root, "src/content/projects");
const ogDir = path.join(root, "public/og");

const FETCH_TIMEOUT_MS = 15000;

/** Fetch a URL with a timeout, throwing a contextful error on failure. */
async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return res;
  } catch (err) {
    throw new Error(`Failed to fetch ${url}: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

/** Extract the og:image (or twitter:image) URL from a page's HTML. */
function parseOgImage(html, pageUrl) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const property of ["og:image", "twitter:image", "twitter:image:src"]) {
    for (const tag of metaTags) {
      const isMatch = new RegExp(
        `(?:property|name)\\s*=\\s*["']${property.replace(/:/g, "\\:")}["']`,
        "i",
      ).test(tag);
      if (!isMatch) continue;
      const content = tag.match(/content\s*=\s*["']([^"']+)["']/i);
      if (content?.[1]) {
        // Resolve relative URLs against the page they came from.
        return new URL(content[1], pageUrl).href;
      }
    }
  }
  return null;
}

/** Pick a file extension from the content-type header, falling back to the URL. */
function extensionFor(contentType, imageUrl) {
  const fromType = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
  }[contentType?.split(";")[0].trim().toLowerCase()];
  if (fromType) return fromType;
  const fromUrl = path.extname(new URL(imageUrl).pathname).toLowerCase();
  return /^\.(png|jpe?g|webp|gif|avif|svg)$/.test(fromUrl) ? fromUrl : ".png";
}

/** Read the `links.live` URL from a frontmatter block, if present. */
function liveUrlFrom(frontmatter) {
  try {
    const data = yaml.load(frontmatter);
    return data?.links?.live ?? null;
  } catch {
    return null;
  }
}

/**
 * Surgically set the top-level `image:` field in a frontmatter string,
 * preserving the order and formatting of every other line.
 */
function setImageField(frontmatter, imagePath) {
  const line = `image: ${imagePath}`;
  // Replace an existing top-level `image:` line (not nested under another key).
  if (/^image:.*$/m.test(frontmatter)) {
    return frontmatter.replace(/^image:.*$/m, line);
  }
  return `${frontmatter.replace(/\n+$/, "")}\n${line}\n`;
}

async function processFile(filename) {
  const filePath = path.join(projectsDir, filename);
  const raw = await readFile(filePath, "utf8");

  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    console.warn(`  skip ${filename}: no frontmatter block`);
    return { status: "skipped" };
  }
  const frontmatter = match[1];

  const liveUrl = liveUrlFrom(frontmatter);
  if (!liveUrl) {
    console.log(`  skip ${filename}: no links.live`);
    return { status: "skipped" };
  }

  const page = await fetchWithTimeout(liveUrl, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; og-image-fetcher)" },
  });
  const html = await page.text();
  const imageUrl = parseOgImage(html, page.url);
  if (!imageUrl) {
    console.warn(`  warn ${filename}: no og:image found at ${liveUrl}`);
    return { status: "no-image" };
  }

  const imageRes = await fetchWithTimeout(imageUrl);
  const buffer = new Uint8Array(await imageRes.arrayBuffer());
  const slug = path.basename(filename, path.extname(filename));
  const ext = extensionFor(imageRes.headers.get("content-type"), imageUrl);
  const outName = `${slug}${ext}`;

  await writeFile(path.join(ogDir, outName), buffer);

  const publicPath = `/og/${outName}`;
  const updatedFrontmatter = setImageField(frontmatter, publicPath);
  const updated = raw.replace(
    /^---\n[\s\S]*?\n---/,
    `---\n${updatedFrontmatter.replace(/\n+$/, "")}\n---`,
  );
  await writeFile(filePath, updated);

  console.log(`  ok   ${filename} -> ${publicPath}  (${imageUrl})`);
  return { status: "ok" };
}

async function main() {
  await mkdir(ogDir, { recursive: true });
  const files = (await readdir(projectsDir)).filter((f) =>
    /\.mdx?$/.test(f),
  );

  console.log(`Scanning ${files.length} project files...`);
  const counts = { ok: 0, skipped: 0, "no-image": 0, error: 0 };
  for (const file of files) {
    try {
      const { status } = await processFile(file);
      counts[status]++;
    } catch (err) {
      counts.error++;
      console.error(`  fail ${file}: ${err.message}`);
    }
  }

  console.log(
    `\nDone. ${counts.ok} updated, ${counts.skipped} skipped, ` +
      `${counts["no-image"]} without og:image, ${counts.error} failed.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
