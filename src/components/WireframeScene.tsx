import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

/**
 * The terminal-themed 3D hero moment: a slowly auto-rotating neon-green
 * wireframe icosahedron with a subtle pointer parallax. `meshBasicMaterial`
 * is unlit (no lights to compute) which keeps the scene cheap.
 *
 * This module is the heavy half of the hero — it pulls in `three`. It is
 * loaded lazily via a dynamic import from `Hero3D`, and only after that island
 * has decided the device can afford it (not mobile, not low-power, motion not
 * reduced). So phones and reduced-motion visitors never download `three`.
 */

/** Read the swappable accent token so the mesh follows the theme. */
function useAccentColor(): string {
  return useMemo(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    return value || "#00ff9c";
  }, []);
}

function WireframeIcosahedron({ color }: { color: string }) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Continuous slow spin keeps it alive without demanding attention.
    g.rotation.y += delta * 0.25;
    // Ease the whole group toward the pointer for a gentle parallax tilt.
    const targetX = state.pointer.y * 0.3;
    const targetY = g.rotation.y + state.pointer.x * 0.3;
    g.rotation.x += (targetX - g.rotation.x) * 0.05;
    g.rotation.z += (state.pointer.x * 0.1 - g.rotation.z) * 0.05;
    void targetY;
  });

  return (
    <group ref={group}>
      <mesh scale={1.7}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.9} />
      </mesh>
      {/* A smaller inner shell adds depth without extra geometry cost. */}
      <mesh scale={0.95}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

export default function WireframeScene() {
  const color = useAccentColor();

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <WireframeIcosahedron color={color} />
    </Canvas>
  );
}
