import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Vector3 } from "three";

/**
 * Interactive 3D mailbox terminal for the contact section, mirroring the
 * avatar bust's lazy-load + on-demand render strategy. The model is the raw
 * Tripo export (~56 MB) so it is never downloaded until the section scrolls
 * into view, and the render loop drops to on-demand whenever it is offscreen
 * or the user prefers reduced motion.
 */

const MODEL_URL = "/models/mailbox.glb";
useGLTF.preload(MODEL_URL);

function MailboxModel() {
  const { scene } = useGLTF(MODEL_URL);

  // Normalize Tripo's arbitrary export scale to a known size centered on the
  // origin so camera framing is deterministic.
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

export default function Mailbox3D() {
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
      className="relative aspect-square w-full max-w-[28rem]"
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
            <MailboxModel />
            <OrbitControls
              target={[0, 0, 0]}
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
