import { useEffect, useState, type ComponentType } from "react";

/**
 * Capability gate for the edge code rain. Renders nothing by default and only
 * mounts the live react-three-fiber scene when the device can afford it: motion
 * not reduced, a fine pointer, enough CPU/memory, and — crucially — a viewport
 * wide enough to actually have side gutters. The heavy scene (which pulls in
 * `three`) is loaded with a dynamic `import()`, so excluded visitors never
 * download it.
 *
 * The rain has no in-gutter fallback by design: where there are no gutters,
 * there is no rain.
 */

// Push the rain into the background so it never competes with the centered
// content: globally dim the canvas and softly defocus the glyphs. Tune here.
const RAIN_OPACITY = 0.7;
const RAIN_BLUR_PX = 1.25;

function isCapable(): boolean {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  // Real gutters only open up once the viewport clears the centered column.
  const hasGutters = window.innerWidth > 1300;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  return !reduce && !coarsePointer && hasGutters && cores > 4 && memory > 4;
}

export default function CodeRain() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!isCapable()) return;
    let active = true;
    import("./CodeRainScene").then((mod) => {
      if (active) setScene(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Scene) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: RAIN_OPACITY,
        filter: `blur(${RAIN_BLUR_PX}px)`,
      }}
    >
      <Scene />
    </div>
  );
}
