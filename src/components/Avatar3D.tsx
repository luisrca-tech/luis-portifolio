import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Vector3 } from "three";

/**
 * Interactive 3D bust for the about section, floating transparently on the
 * page. The model is the raw Tripo export (~56 MB, ~2M tris, 4K textures) and
 * is intentionally unoptimized for now — first load is slow and mobile may
 * stutter. To contain the cost we never download it until the island scrolls
 * into view, and we drop the render loop to on-demand whenever it is offscreen
 * or motion is reduced.
 */

const MODEL_URL = "/models/avatar.glb";
useGLTF.preload(MODEL_URL);

function AvatarModel() {
  const { scene } = useGLTF(MODEL_URL);

  // Normalize the export to a known size centered on the origin so the camera
  // framing is deterministic regardless of Tripo's arbitrary scale, and rotate
  // it so the bust faces the camera (front) instead of off to the side.
  useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2 / maxDim;
    scene.scale.setScalar(scale);
    scene.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    );
    scene.rotation.y = -Math.PI / 2;
  }, [scene]);

  return <primitive object={scene} />;
}

/** DOM loader matching the site's terminal prompt + blinking cursor. */
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="font-mono text-sm text-muted">
        <span className="text-accent">$</span> loading model…
        <span aria-hidden="true" className="hero-cursor" />
      </p>
    </div>
  );
}

export default function Avatar3D() {
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Only download + render the heavy model once the section is in view, and
  // pause the auto-rotate whenever it scrolls back out.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const autoRotate = inView && !reduceMotion;

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[32rem]"
    >
      {mounted ? (
        <Suspense fallback={<Loader />}>
          <Canvas
            camera={{ position: [0, 0.2, 3], fov: 35 }}
            dpr={[1, 2]}
            gl={{ alpha: true, antialias: true }}
            frameloop={autoRotate ? "always" : "demand"}
            style={{ width: "100%", height: "100%" }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 3, 4]} intensity={1.6} />
            <AvatarModel />
            <OrbitControls
              target={[0, 0.3, 0]}
              autoRotate={autoRotate}
              autoRotateSpeed={0.6}
              enableDamping
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI * 0.25}
              maxPolarAngle={Math.PI * 0.7}
            />
          </Canvas>
        </Suspense>
      ) : (
        <Loader />
      )}
    </div>
  );
}
