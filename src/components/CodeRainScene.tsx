import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Matrix-style code rain that lives only in the page's side gutters — the empty
 * margins left and right of the centered `max-w-6xl` content column. It never
 * draws over the main column, so reading is untouched.
 *
 * This is the heavy half (it pulls in `three`). It is dynamically imported by
 * `CodeRain` only after that gate decides the device can afford it and the
 * viewport is wide enough to have real gutters — phones, reduced-motion and
 * low-power visitors never download `three`.
 *
 * Rendering is one `THREE.Points` draw call: each point is a glyph, textured
 * from a small atlas via `gl_PointCoord`, tinted by the accent token. The fall
 * is animated in JS each frame (a few hundred points, cheap and easy to follow)
 * and reacts to scroll velocity, easing back to a slow idle drift.
 */

// Code/terminal-flavored glyphs (ASCII only, so JetBrains Mono renders them all
// — no katakana tofu). Drawn white into the atlas; tinted accent in the shader.
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
function useAccentColor(): string {
  return useMemo(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    return value || "#00ff9c";
  }, []);
}

/** Draw every glyph once into a square texture atlas (white on transparent). */
function buildAtlas(): { texture: THREE.CanvasTexture; dim: number } {
  const dim = Math.ceil(Math.sqrt(GLYPHS.length));
  const cell = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = dim * cell;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${Math.floor(cell * 0.78)}px "JetBrains Mono", "Fira Code", monospace`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  GLYPHS.forEach((g, i) => {
    const cx = (i % dim) * cell + cell / 2;
    const cy = Math.floor(i / dim) * cell + cell / 2;
    ctx.fillText(g, cx, cy);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return { texture, dim };
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

type Column = { x: number; headY: number; speed: number };

function Rain({
  texture,
  atlasDim,
  color,
}: {
  texture: THREE.CanvasTexture;
  atlasDim: number;
  color: string;
}) {
  const { size, gl, camera } = useThree();
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const state = useRef<{
    columns: Column[];
    positions: Float32Array;
    bright: Float32Array;
    glyph: Float32Array;
  } | null>(null);
  // Idle drift is 1; scrolling pushes this up, every frame eases it back to 1.
  const speedMul = useRef(1);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAtlas: { value: texture },
        uDim: { value: atlasDim },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: GLYPH_PX * gl.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute float aGlyph;
        attribute float aBright;
        varying float vGlyph;
        varying float vBright;
        uniform float uSize;
        void main() {
          vGlyph = aGlyph;
          vBright = aBright;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform sampler2D uAtlas;
        uniform float uDim;
        uniform vec3 uColor;
        varying float vGlyph;
        varying float vBright;
        void main() {
          float idx = floor(vGlyph + 0.5);
          float cx = mod(idx, uDim);
          float cy = floor(idx / uDim);
          vec2 uv = gl_PointCoord;
          uv.y = 1.0 - uv.y; // canvas atlas is top-down; point coords are not
          vec2 cell = (vec2(cx, cy) + uv) / uDim;
          float mask = texture2D(uAtlas, cell).a;
          float alpha = mask * clamp(vBright, 0.0, 1.0);
          if (alpha < 0.02) discard;
          // The leading glyph (vBright > 1) burns toward white for a hot head.
          vec3 col = mix(uColor, vec3(1.0), clamp(vBright - 1.0, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, [texture, atlasDim, color, gl]);

  // Map world units to CSS pixels: (0,0) top-left, y increasing downward, so the
  // rain literally falls as headY grows. Rebuilt whenever the viewport resizes.
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = 0;
    cam.right = size.width;
    cam.top = 0;
    cam.bottom = size.height;
    cam.near = -10;
    cam.far = 10;
    cam.position.set(0, 0, 1);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  // (Re)allocate the point cloud for the current gutters. Zero columns (a narrow
  // viewport with no gutters) means an empty cloud — nothing drawn.
  useEffect(() => {
    const xs = gutterColumns(size.width);
    const count = xs.length * TRAIL;
    const positions = new Float32Array(count * 3);
    const bright = new Float32Array(count);
    const glyph = new Float32Array(count);
    const columns: Column[] = xs.map((x) => ({
      x,
      headY: -Math.random() * size.height,
      speed: 5 + Math.random() * 7,
    }));
    for (let p = 0; p < count; p++) {
      glyph[p] = Math.floor(Math.random() * GLYPHS.length);
      const i = p % TRAIL;
      bright[p] = i === 0 ? 1.6 : Math.pow(1 - i / TRAIL, 1.4) * 0.9;
    }
    const geom = geomRef.current;
    if (!geom) return;
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("aGlyph", new THREE.BufferAttribute(glyph, 1));
    geom.setAttribute("aBright", new THREE.BufferAttribute(bright, 1));
    state.current = { columns, positions, bright, glyph };
  }, [size.width, size.height]);

  // Scroll velocity boosts the fall; the frame loop decays it back to idle.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      speedMul.current = Math.min(MAX_BOOST, speedMul.current + Math.abs(y - lastY) * 0.015);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, delta) => {
    const s = state.current;
    const geom = geomRef.current;
    if (!s || !geom || s.columns.length === 0) return;

    const dt = Math.min(delta, 0.05); // clamp big tab-switch deltas
    speedMul.current += (1 - speedMul.current) * Math.min(1, dt * 2.5);

    let p = 0;
    for (const col of s.columns) {
      col.headY += col.speed * ROW_SPACING * dt * speedMul.current;
      // Whole drop has cleared the bottom: respawn above with a new pace.
      if (col.headY - TRAIL * ROW_SPACING > size.height) {
        col.headY = -Math.random() * ROW_SPACING * TRAIL;
        col.speed = 5 + Math.random() * 7;
      }
      for (let i = 0; i < TRAIL; i++, p++) {
        s.positions[p * 3] = col.x;
        s.positions[p * 3 + 1] = col.headY - i * ROW_SPACING;
        s.positions[p * 3 + 2] = 0;
        // Occasional flicker keeps the stream alive like terminal noise.
        if (Math.random() < 0.02) s.glyph[p] = Math.floor(Math.random() * GLYPHS.length);
      }
    }

    (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (geom.getAttribute("aGlyph") as THREE.BufferAttribute).needsUpdate = true;
  });

  // Free the GPU buffers/material this component created on unmount.
  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef} />
      <primitive object={material} attach="material" />
    </points>
  );
}

export default function CodeRainScene() {
  const color = useAccentColor();
  const atlas = useMemo(buildAtlas, []);

  useEffect(() => {
    return () => atlas.texture.dispose();
  }, [atlas]);

  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 1] }}
    >
      <Rain texture={atlas.texture} atlasDim={atlas.dim} color={color} />
    </Canvas>
  );
}
