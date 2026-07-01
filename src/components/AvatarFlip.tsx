import { useEffect, useState } from "react";
import Avatar3D from "./Avatar3D";

/**
 * About-section identity slot that auto-flips between the real photo (front)
 * and the interactive 3D bust (back) on a timer. Hovering pauses the rotation
 * so the visitor can settle on a face, and a terminal-style button flips
 * manually. Reduced-motion visitors get no auto-flip — they drive it by click.
 */

interface Props {
  photoSrc: string;
  photoSrcSet?: string;
  alt: string;
  /** Milliseconds each face stays up before auto-flipping. */
  intervalMs?: number;
}

export default function AvatarFlip({
  photoSrc,
  photoSrcSet,
  alt,
  intervalMs = 8000,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // Auto-flip on an interval, paused on hover/focus and under reduced motion.
  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(
      () => setFlipped((f) => !f),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, intervalMs]);

  const label = flipped ? "avatar.glb" : "luis-felipe.jpg";

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Terminal header; filename tracks the visible face. */}
      <div className="flex items-center gap-2 border border-b-0 border-border bg-elevated px-3 py-2 font-mono text-xs text-muted">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <span>
          <span className="text-accent">~/</span>
          {label}
        </span>
      </div>

      <div
        className="relative aspect-square w-full border border-border"
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — photo (click to flip; avatar face stays drag-interactive) */}
          <div
            className="group absolute inset-0 cursor-pointer overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
            onClick={() => setFlipped(true)}
          >
            <img
              src={photoSrc}
              srcSet={photoSrcSet}
              sizes="(max-width: 768px) 80vw, 32rem"
              alt={alt}
              className="size-full object-cover"
            />
            {/* Affordance: makes it obvious the photo flips to the 3D bust. */}
            <span className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1.5 border border-border bg-base/80 px-2 py-1 font-mono text-[10px] text-muted backdrop-blur-sm transition-colors group-hover:border-accent group-hover:text-accent">
              <svg
                viewBox="0 0 24 24"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              click to flip
            </span>
          </div>

          {/* Back — interactive 3D bust (click to flip; drag still rotates) */}
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-base"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            onClick={() => setFlipped(false)}
          >
            <Avatar3D active={flipped} />
          </div>
        </div>
      </div>

    </div>
  );
}
