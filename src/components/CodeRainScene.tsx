import { useEffect, useRef } from "react";

/**
 * Matrix-style code rain that lives only in the page's side gutters — the empty
 * margins left and right of the centered `max-w-6xl` content column. It never
 * draws over the main column, so reading is untouched.
 *
 * Rendered on a plain 2D canvas (`ctx.fillText`) — no WebGL, no three.js. It is
 * dynamically imported by `CodeRain` only after that gate decides the device can
 * afford it and the viewport is wide enough to have real gutters, so it stays
 * off the first-load path entirely and pulls in no extra libraries.
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

    // (Re)size the canvas and lay out the gutter columns for the viewport.
    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `bold ${GLYPH_PX}px "JetBrains Mono", "Fira Code", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
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

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp big tab-switch deltas
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
        for (let i = 0; i < TRAIL; i++) {
          const y = col.headY - i * ROW_SPACING;
          if (y < -ROW_SPACING || y > height + ROW_SPACING) continue;
          // Occasional flicker keeps the stream alive like terminal noise.
          if (Math.random() < 0.02)
            col.glyphs[i] = Math.floor(Math.random() * GLYPHS.length);
          if (i === 0) {
            // The leading glyph burns toward white for a hot head.
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = color;
            ctx.globalAlpha = Math.pow(1 - i / TRAIL, 1.4) * 0.9;
          }
          ctx.fillText(GLYPHS[col.glyphs[i]], col.x, y);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
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
