import { useEffect, useState, type ComponentType } from "react";

/**
 * Capability gate for the 3D hero. Renders a cheap static wireframe (inline SVG,
 * no `three`) by default, and only upgrades to the live react-three-fiber scene
 * when the device can afford it: a fine pointer, a wide enough viewport, enough
 * CPU/memory, and motion not reduced. The heavy scene is pulled in with a
 * dynamic `import()` so excluded visitors never download `three` at all.
 */

function isCapable(): boolean {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const cores = navigator.hardwareConcurrency ?? 8;
  // `deviceMemory` is a non-standard but widely shipped hint (in GB).
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  return !reduce && !coarsePointer && !narrow && cores > 4 && memory > 4;
}

/** Static neon-green wireframe — the low-power / mobile / reduced-motion visual. */
function StaticWireframe() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full text-accent"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {/* Outer hexagonal silhouette of an icosahedron. */}
      <polygon
        points="100,20 169,60 169,140 100,180 31,140 31,60"
        strokeWidth="1.2"
        opacity="0.9"
      />
      {/* Inner rotated hexagon for facet depth. */}
      <polygon
        points="100,58 135,80 135,120 100,142 65,120 65,80"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Spokes tying outer vertices to the inner shell. */}
      <g strokeWidth="0.9" opacity="0.4">
        <line x1="100" y1="20" x2="100" y2="58" />
        <line x1="169" y1="60" x2="135" y2="80" />
        <line x1="169" y1="140" x2="135" y2="120" />
        <line x1="100" y1="180" x2="100" y2="142" />
        <line x1="31" y1="140" x2="65" y2="120" />
        <line x1="31" y1="60" x2="65" y2="80" />
      </g>
    </svg>
  );
}

export default function Hero3D() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!isCapable()) return;
    let active = true;
    import("./WireframeScene").then((mod) => {
      if (active) setScene(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="aspect-square w-full max-w-[220px] md:max-w-sm">
      {Scene ? <Scene /> : <StaticWireframe />}
    </div>
  );
}
