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
  intervalMs = 5000,
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
            className="absolute inset-0 cursor-pointer overflow-hidden"
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

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-2 cursor-pointer font-mono text-xs text-muted transition-colors hover:text-accent"
        aria-label={flipped ? "Show photo" : "Show 3D avatar"}
      >
        <span className="text-accent">$</span>{" "}
        {flipped ? "./photo" : "./avatar --interactive"}
      </button>
    </div>
  );
}
