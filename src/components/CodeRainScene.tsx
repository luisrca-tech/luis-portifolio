import { useEffect, useRef } from "react";

/**
 * Matrix-style code rain that lives only in the page's side gutters — the empty
 * margins left and right of the centered `max-w-6xl` content column. It never
 * draws over the main column, so reading is untouched.
 *
 * Rendered on a plain 2D canvas — no WebGL, no three.js. It is dynamically
 * imported by `CodeRain` only after that gate decides the device can afford it
 * and the viewport is wide enough to have real gutters, so it stays off the
 * first-load path entirely and pulls in no extra libraries.
 *
 * Every glyph is baked once into an offscreen sprite atlas (one row per color)
 * and the loop blits cells with `drawImage` instead of rasterizing text with
 * `fillText` each frame — the same pixels for a fraction of the per-frame cost,
 * since ~120-140 columns x 30 glyphs is thousands of draws per frame. The loop
 * is also capped to ~60 FPS so high-refresh panels don't over-render a blurred
 * background.
 *
 * Each gutter column is a falling drop: a white-hot head with an accent-tinted
 * tail that fades out. The fall reacts to scroll velocity, easing back to a slow
 * idle drift, and the loop pauses whenever the tab is backgrounded.
 */

// Code/terminal-flavored glyphs (ASCII only, so JetBrains Mono renders them all
// — no katakana tofu).
const GLYPH_STR = "01<>/\\{}[]()=+-*;:.$#%&|!?ABCDEF0123456789";
const GLYPHS = GLYPH_STR.split("");

// Layout of the rain, in CSS pixels.
const COL_SPACING = 14; // horizontal gap between falling columns
const ROW_SPACING = 22; // vertical gap between glyphs in a column
const GLYPH_PX = 17; // rendered glyph size
const CELL = Math.ceil(GLYPH_PX * 1.8); // square atlas cell that fully holds a bold glyph
const TRAIL = 30; // glyphs per falling drop (head + fading tail)
const CONTENT_MAX = 1152; // max-w-6xl — the centered column we must avoid
const EDGE_GAP = 12; // breathing room from the content edge
const VIEWPORT_PAD = 8; // breathing room from the viewport edge
const MAX_BOOST = 4; // scroll can speed the rain up to 4x idle

/** Read the swappable accent token so the rain follows the theme. */
function accentColor(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();
  return value || "#00ff9c";
}

/** Compute the X centers of every rain column inside the two gutters. */
function gutterColumns(width: number): number[] {
  const center = width / 2;
  const contentHalf = Math.min(width, CONTENT_MAX) / 2;
  const leftEnd = center - contentHalf - EDGE_GAP;
  const rightStart = center + contentHalf + EDGE_GAP;
  const xs: number[] = [];
  for (let x = VIEWPORT_PAD; x <= leftEnd; x += COL_SPACING) xs.push(x);
  for (let x = rightStart; x <= width - VIEWPORT_PAD; x += COL_SPACING) xs.push(x);
  return xs;
}

type Column = { x: number; headY: number; speed: number; glyphs: number[] };

export default function CodeRainScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const color = accentColor();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let columns: Column[] = [];
    // Idle drift is 1; scrolling pushes this up, every frame eases it back to 1.
    let speedMul = 1;

    // Tail opacity by depth — independent of glyph or column, so bake it once.
    const tailAlpha = Array.from(
      { length: TRAIL },
      (_, i) => Math.pow(1 - i / TRAIL, 1.4) * 0.9,
    );

    // Each glyph baked once per color into a sprite atlas: row 0 = accent tail,
    // row 1 = white head. Built at device resolution so blits stay crisp under
    // DPR. Rebuilt once the web font loads, since baking before then would lock
    // in the monospace fallback.
    const cell = Math.ceil(CELL * dpr);
    const atlas = document.createElement("canvas");
    atlas.width = cell * GLYPHS.length;
    atlas.height = cell * 2;
    const atlasCtx = atlas.getContext("2d");
    const buildAtlas = () => {
      if (!atlasCtx) return;
      atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
      atlasCtx.font = `bold ${GLYPH_PX * dpr}px "JetBrains Mono", "Fira Code", monospace`;
      atlasCtx.textAlign = "center";
      atlasCtx.textBaseline = "middle";
      const paintRow = (row: number, fill: string) => {
        atlasCtx.fillStyle = fill;
        for (let g = 0; g < GLYPHS.length; g++)
          atlasCtx.fillText(GLYPHS[g], g * cell + cell / 2, row * cell + cell / 2);
      };
      paintRow(0, color);
      paintRow(1, "#ffffff");
    };
    buildAtlas();
    document.fonts?.ready.then(buildAtlas);

    // (Re)size the canvas and lay out the gutter columns for the viewport.
    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = gutterColumns(width).map((x) => ({
        x,
        headY: -Math.random() * height,
        speed: 5 + Math.random() * 7,
        glyphs: Array.from({ length: TRAIL }, () =>
          Math.floor(Math.random() * GLYPHS.length),
        ),
      }));
    };
    setup();

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    // Scroll velocity boosts the fall; the frame loop decays it back to idle.
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      speedMul = Math.min(
        MAX_BOOST,
        speedMul + Math.abs(y - lastScrollY) * 0.015,
      );
      lastScrollY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Cap rendering to ~60 FPS. Motion stays time-based off `dt`, so the fall
    // speed is identical at any refresh rate — this only stops 120/144 Hz panels
    // from drawing frames nobody can tell apart on a blurred background.
    const FRAME_MS = 1000 / 60 - 2;

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const elapsed = now - last;
      if (elapsed < FRAME_MS) return;
      const dt = Math.min(elapsed / 1000, 0.05); // clamp big tab-switch deltas
      last = now;
      speedMul += (1 - speedMul) * Math.min(1, dt * 2.5);

      ctx.clearRect(0, 0, width, height);
      for (const col of columns) {
        col.headY += col.speed * ROW_SPACING * dt * speedMul;
        // Whole drop has cleared the bottom: respawn above with a new pace.
        if (col.headY - TRAIL * ROW_SPACING > height) {
          col.headY = -Math.random() * ROW_SPACING * TRAIL;
          col.speed = 5 + Math.random() * 7;
        }
        const dx = Math.round(col.x - CELL / 2);
        for (let i = 0; i < TRAIL; i++) {
          const y = col.headY - i * ROW_SPACING;
          if (y < -ROW_SPACING || y > height + ROW_SPACING) continue;
          // Occasional flicker keeps the stream alive like terminal noise.
          if (Math.random() < 0.02)
            col.glyphs[i] = Math.floor(Math.random() * GLYPHS.length);
          // Head burns white at full strength; tail uses the accent row, fading
          // out with depth.
          const row = i === 0 ? 1 : 0;
          ctx.globalAlpha = i === 0 ? 1 : tailAlpha[i];
          ctx.drawImage(
            atlas,
            col.glyphs[i] * cell, row * cell, cell, cell,
            dx, Math.round(y - CELL / 2), CELL, CELL,
          );
        }
      }
      ctx.globalAlpha = 1;
    };

    // Pause the loop entirely while the tab is backgrounded — no point animating
    // rain nobody can see, and it frees the CPU for other tabs.
    const start = () => {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
