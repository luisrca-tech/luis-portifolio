import { useState } from "react";

interface ProjectFilterProps {
  /** id of the grid container whose `data-filter` attribute this drives. */
  targetId: string;
  label: string;
  options: readonly { value: "all" | "Systems" | "Frontend"; label: string }[];
}

/**
 * Projects-index filter. The only interactive piece on the page, so it ships as
 * a small React island: it renders the buttons and writes the active value onto
 * the grid container's `data-filter` attribute. CSS (global.css) does the actual
 * hiding by matching `data-filter` against each card's `data-category`.
 *
 * Cards stay server-rendered Astro components — the island never re-renders
 * them, so there is no duplicate card markup and the grid works (showing all)
 * before hydration.
 */
export default function ProjectFilter({
  targetId,
  label,
  options,
}: ProjectFilterProps) {
  const [active, setActive] = useState<string>("all");

  const select = (value: string) => {
    setActive(value);
    const grid = document.getElementById(targetId);
    if (grid) grid.dataset.filter = value;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
      <span className="text-accent">{label}:</span>
      {options.map((option) => {
        const isActive = active === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => select(option.value)}
            className={`border px-3 py-1 transition-colors ${
              isActive
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
