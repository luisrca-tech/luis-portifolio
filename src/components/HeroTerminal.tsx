import { useEffect, useState } from "react";

interface HeroTerminalProps {
  name: string;
  role: string;
  promptWhoami: string;
  promptContact: string;
}

/**
 * Terminal-boot hero. Types the name and role on as the "output" of a short
 * command sequence — the site's signature boot/type-on motion.
 *
 * Robustness: every segment is rendered fully on the server (so the name and
 * role are real HTML for SEO and no-JS), then re-typed from empty after
 * hydration. When the visitor asks for reduced motion, it stays fully revealed
 * and only the cursor is static.
 */
export default function HeroTerminal({
  name,
  role,
  promptWhoami,
  promptContact,
}: HeroTerminalProps) {
  const segments = [
    { kind: "cmd", text: promptWhoami },
    { kind: "name", text: name },
    { kind: "role", text: role },
    { kind: "cmd", text: promptContact },
  ] as const;

  const totalLen = segments.reduce((sum, s) => sum + s.text.length, 0);

  // SSR + reduced-motion: render every character. After mount we drop to 0 and
  // type up to `totalLen`.
  const [typed, setTyped] = useState(totalLen);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    setAnimating(true);
    setTyped(0);
  }, []);

  useEffect(() => {
    if (!animating || typed >= totalLen) return;
    // Pause longer at a segment boundary (a "line" just finished typing).
    let boundary = false;
    let acc = 0;
    for (const s of segments) {
      acc += s.text.length;
      if (typed === acc) {
        boundary = true;
        break;
      }
    }
    const delay = boundary ? 320 : 26;
    const id = setTimeout(() => setTyped((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [animating, typed, totalLen]);

  // How many characters of segment `i` are currently visible.
  const shown = (i: number) => {
    let offset = 0;
    for (let j = 0; j < i; j++) offset += segments[j].text.length;
    return Math.max(0, Math.min(segments[i].text.length, typed - offset));
  };

  const fullyTyped = !animating || typed >= totalLen;
  // The segment that currently owns the cursor.
  const cursorSeg = fullyTyped
    ? segments.length - 1
    : segments.findIndex((s, i) => shown(i) < s.text.length);

  const Cursor = () => (
    <span aria-hidden="true" className="hero-cursor" />
  );

  const text = (i: number) => segments[i].text.slice(0, shown(i));
  const visible = (i: number) => fullyTyped || shown(i) > 0;

  return (
    <div className="flex flex-col gap-3 font-mono">
      {/* $ whoami */}
      <p className="text-sm text-muted">
        <span className="text-accent">$</span> {text(0)}
        {cursorSeg === 0 && <Cursor />}
      </p>

      {/* name + role (rendered as the output of `whoami`) */}
      <h1
        aria-label={`${name} — ${role}`}
        className="text-4xl font-semibold tracking-tight sm:text-5xl"
      >
        <span>
          {text(1)}
          {cursorSeg === 1 && <Cursor />}
        </span>
        {visible(2) && (
          <span className="block text-accent">
            {text(2)}
            {cursorSeg === 2 && <Cursor />}
          </span>
        )}
      </h1>

      {/* $ ./open-to-work (trailing prompt, holds the resting cursor) */}
      {visible(3) && (
        <p className="text-sm text-muted">
          <span className="text-accent">$</span> {text(3)}
          {cursorSeg === 3 && <Cursor />}
        </p>
      )}
    </div>
  );
}
