import { useEffect, useState } from "react";

interface TerminalPromptProps {
  command: string;
}

/**
 * A small React island: a terminal prompt with a blinking block cursor.
 * State-driven so it proves client hydration; the blink honors
 * `prefers-reduced-motion` (stays solid when motion is reduced).
 */
export default function TerminalPrompt({ command }: TerminalPromptProps) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-sm text-muted">
      <a
        href="https://github.com/luisrca-tech"
        target="_blank"
        rel="noreferrer"
        className="text-accent hover:underline"
      >
        luisrca-tech
      </a>
      <span className="text-muted">:~$ </span>
      <span className="text-fg">{command}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block w-[0.6ch] bg-accent align-baseline"
        style={{ opacity: on ? 1 : 0 }}
      >
        &nbsp;
      </span>
    </p>
  );
}
