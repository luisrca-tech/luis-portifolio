/**
 * Terminal-style motion enhancements, applied progressively over server-rendered
 * HTML so every page stays complete and readable without JavaScript.
 *
 *  - `[data-typewriter]`: re-type the element's text on scroll into view, as if it
 *    were being entered at a terminal. Also targets `.tw-scope h2`, so headings
 *    inside rendered MDX get the same treatment without per-heading markup.
 *  - `[data-reveal]`: fade + slide a block into place on scroll. `--reveal-i`
 *    staggers siblings into a quick line-by-line cascade.
 *  - `[data-reveal-children]`: tag each non-heading child block with `data-reveal`
 *    (and a stagger index) — used for long-form bodies where we cannot annotate
 *    every paragraph by hand (e.g. rendered MDX).
 *
 * Everything bows out under `prefers-reduced-motion`: text stays fully typed and
 * blocks stay fully visible. All passes are idempotent so a client-side
 * navigation (View Transitions) can safely re-run them.
 */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TYPE_CHAR_DELAY = 28;
const STAGGER_CAP = 6;

function typeText(el: HTMLElement) {
  const full = el.dataset.twText ?? "";
  let i = 0;
  el.classList.add("tw-active");
  const tick = () => {
    el.textContent = full.slice(0, i);
    if (i >= full.length) {
      el.classList.remove("tw-active");
      return;
    }
    i += 1;
    window.setTimeout(tick, TYPE_CHAR_DELAY);
  };
  tick();
}

function initTypewriter() {
  const targets = [
    ...document.querySelectorAll<HTMLElement>("[data-typewriter]"),
    ...document.querySelectorAll<HTMLElement>(".tw-scope h2"),
  ].filter((el) => el.dataset.twInit !== "1");
  if (!targets.length) return;

  // Snapshot the rendered text first; under reduced motion we keep it as-is.
  for (const el of targets) {
    el.dataset.twInit = "1";
    el.dataset.twText = el.textContent ?? "";
  }
  if (reduceMotion) return;

  // Clear now so there is no flash of full text before typing begins.
  for (const el of targets) el.textContent = "";

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        obs.unobserve(entry.target);
        typeText(entry.target as HTMLElement);
      }
    },
    { threshold: 0.2 },
  );
  targets.forEach((el) => io.observe(el));
}

function tagRevealChildren() {
  const scopes = document.querySelectorAll<HTMLElement>("[data-reveal-children]");
  scopes.forEach((scope) => {
    let i = 0;
    for (const child of Array.from(scope.children)) {
      if (!(child instanceof HTMLElement)) continue;
      // Headings (and anything typing out) are handled by the typewriter pass.
      if (/^H[1-3]$/.test(child.tagName)) continue;
      if (child.hasAttribute("data-typewriter")) continue;
      if (child.querySelector("[data-typewriter]")) continue;
      if (child.hasAttribute("data-reveal")) continue;
      child.setAttribute("data-reveal", "");
      child.style.setProperty("--reveal-i", String(i % STAGGER_CAP));
      i += 1;
    }
  });
}

function initReveal() {
  const blocks = [
    ...document.querySelectorAll<HTMLElement>("[data-reveal]"),
  ].filter((el) => !el.classList.contains("reveal-bound"));
  if (!blocks.length || reduceMotion) return;

  document.documentElement.classList.add("reveal-ready");
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  blocks.forEach((el) => {
    el.classList.add("reveal-bound");
    io.observe(el);
  });
}

function init() {
  initTypewriter();
  tagRevealChildren();
  initReveal();
  // Typewriter text is now cleared and reveals are bound (opacity held by
  // `.reveal-ready`), so it is safe to drop the pre-paint guard without any
  // flash of the original full-text content.
  document.documentElement.classList.remove("tw-pending");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
// Re-run after client-side navigations when the View Transitions router is used.
document.addEventListener("astro:page-load", init);
