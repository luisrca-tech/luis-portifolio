# Plan: Luis Felipe Portfolio Site

> Source PRD: `plans/portfolio-site-prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**:
  - `/` — Home (hero, about summary, featured projects, skills, contact anchor).
  - `/projects` — projects index (card grid + filters).
  - `/projects/[slug]` — one detail page per project (fixed labeled template).
  - English served at root (no `/en/` prefix); `/pt/` prefix **reserved** for a future Brazilian Portuguese version. No language-switcher UI in v1.
  - Contact is an **anchored section** on Home + footer — not a separate route.
- **Content model**: Astro Content Collections, **one MDX file per project**, typed Zod schema.
  - Frontmatter (card/structured fields): `title`, `blurb`, `type` (`System` | `Frontend`), `origin` (`Company` | `Personal`), `category` (filter: `Systems` | `Frontend`), `stack[]`, `role`, `links` (`live?`, `repo?`, `comingSoon?`), `image?`.
  - Body (MDX): detail narrative following the fixed template — **Overview · Scope · Role · Stack · Challenges · Outcomes**.
  - Cards read frontmatter; detail pages render the body. Schema is the single source of truth — incomplete projects fail the build.
- **Stack**: Astro static shell + **React islands only where interactivity is needed** · Tailwind v4 · Motion (reveals/transitions/micro-interactions) · MagicUI (Icon Cloud + curated card/bento/text components) · react-three-fiber (single 3D hero) · TypeScript throughout.
- **i18n**: Astro built-in i18n routing; UI strings live in a **typed dictionary** (`en` now, `pt` reserved).
- **Visual identity**: "terminal / engineer" — dark base (~`#0C0C0C`), monospace-forward, neon-green accent (`#00FF9C`, swappable as a token), grid/scanline motifs. Guardrail: **terminal-flavored, not terminal-trapped** — nav/labels/hero are terminal-styled, but body copy and outcomes stay highly readable for non-technical recruiters.
- **Motion & performance**: motion everywhere + one 3D hero, **performance-guarded**. All motion respects `prefers-reduced-motion`; 3D hero is lazy-loaded and disabled/falls back on low-power & mobile. A mobile Lighthouse performance budget is held.
- **Images**: project OG image from live URL when available; otherwise a **branded fallback component** (gradient + initials/logo + stack chips). Company systems **always** use the fallback (no real screenshots).
- **Disclosure rules** (enforced through content + schema):
  - Repo link (`links.repo`) appears **only** on Epictetus Blog.
  - Personal SaaS (DeliveryChat, Attios) → live product link, no source. Attios → `comingSoon` until URL provided.
  - Company frontends → live site link only, never repo.
  - Company systems → **no link, no real screenshots, hard-anonymized** (industry-level scope + architecture + stack only; no client name, no figures, no URL).
- **Contact & deploy**: hosted on **Vercel**. Contact form posts to a Vercel serverless function → **Resend**, with Zod-validated input, success/error states, and spam protection (honeypot + rate limiting). `RESEND_API_KEY` + destination email via environment variables. CV PDF served from public assets.
- **Build order** (per PRD): scaffold + design system → personal/public projects → anonymized company systems → contact form.

---

## Phase 1: Foundation & terminal design system

**User stories**: 16, 17, 24

### What to build

Turn the bare Astro scaffold into a deployable, themed shell. Wire the core integrations (Tailwind v4, React islands, Motion) and the i18n string-dictionary scaffold. Build the base `Layout` with shared nav and footer using the terminal theme tokens (dark base, mono font, neon-green accent as a swappable token, grid/scanline motif). Establish the `prefers-reduced-motion` baseline so every later animation inherits it. Deploy the result to Vercel so there is a live URL from day one.

### Acceptance criteria

- [x] Tailwind v4, React, and Motion are installed and configured in `astro.config`; a trivial React island renders on the page.
- [x] Terminal design tokens (background `~#0C0C0C`, monospace stack, accent `#00FF9C` defined as a single swappable token) are centralized and consumed by the Layout.
- [x] Base `Layout` renders shared nav + footer; the default Welcome scaffold is removed.
- [x] UI strings render from a typed `en` dictionary (not hardcoded in markup); a `pt` slot exists but is unused. English serves at root; `/pt/` routing is reserved.
- [x] A global `prefers-reduced-motion` rule disables/reduces motion; verified by toggling the OS setting.
- [x] The site builds and is deployed to Vercel with a working live URL.

---

## Phase 2: Content collection + one project end-to-end

**User stories**: 10, 11, 13, 15, 21, 22, 23

### What to build

The core content tracer: define the typed Zod content collection and prove the full path from a single MDX file to both a rendered index card and a rendered detail page. Author **Epictetus Blog** (Personal — the only project with a repo link) as the first project. Render `/projects` showing its card and `/projects/[slug]` rendering the fixed detail template from the MDX body. Build the **branded fallback-image component** now (used wherever `image` is absent) and the link-rendering logic that conditionally shows the "View Code" repo link.

### Acceptance criteria

- [x] A Zod-typed content collection enforces required fields (`title`, `blurb`, `type`, `origin`, `category`, `stack`, `role`); omitting any required field fails the build.
- [x] Adding a project requires creating **one MDX file** and nothing else.
- [x] `/projects` renders Epictetus Blog as a card from frontmatter (title, blurb, stack, badges).
- [x] `/projects/epictetus-blog` renders the detail page using the fixed template (Overview · Scope · Role · Stack · Challenges · Outcomes) from the MDX body.
- [x] The detail page shows technologies/stack and the "View Code" repo link (Epictetus is the one project where `links.repo` is set).
- [x] A project with no `image` renders the branded fallback component (not a broken/empty image), and it looks polished.

---

## Phase 3: Home page

**User stories**: 1, 2, 3

### What to build

The 30-second scannable home page. Build the terminal-boot hero (name, job title, one-line pitch, primary "open to roles & projects — let's talk" CTA), a short about summary mirroring the CV voice, a featured-projects strip pulling 3–4 projects from the content collection, the CV PDF download button (serving the existing file from public assets), and the contact section anchor + footer links. (Skills cloud and 3D hero arrive in Phase 5; contact form in Phase 7 — anchors/placeholders are wired here.)

### Acceptance criteria

- [x] Hero shows name, clear job title, and a one-line pitch with the primary CTA; a recruiter can grasp seniority/focus immediately.
- [x] Hero motion is a "boot / type-on" effect that respects `prefers-reduced-motion`.
- [x] An about summary renders in outcome-first, CV-mirroring voice.
- [x] A featured-projects strip renders 3–4 cards sourced from the content collection (reusing Phase 2 card rendering).
- [x] A "Download CV (PDF)" button serves the existing CV file and downloads successfully.
- [x] A contact section anchor and footer exist on Home (form/social wired in later phases).

---

## Phase 4: Projects index — filters, badges & disclaimer

**User stories**: 6, 7, 8, 9, 28

### What to build

Make the projects index a real, scannable, filterable grid. Add the **All · Systems · Frontend** filter (interactive island), **Company / Personal** visual badges (display only, not filters), the visible **"selected work" disclaimer**, and the **coming-soon** state for projects without a live URL. Author the remaining personal projects — **DeliveryChat** (live link only) and **Attios CRM** (coming-soon until URL provided) — so the grid and filters have real content to exercise.

### Acceptance criteria

- [x] Filter control toggles All · Systems · Frontend and correctly filters the grid by `category`.
- [x] Each card displays a Company-vs-Personal badge derived from `origin`.
- [x] A clear, concise "selected work" disclaimer is visible on the index, communicating the list is a representative selection.
- [x] Attios CRM renders a "coming soon" state (no live link) driven by `links.comingSoon`; DeliveryChat shows its live link.
- [x] DeliveryChat and Attios CRM exist as MDX files and render as cards + detail pages.

---

## Phase 5: Skills cloud + 3D hero moment

**User stories**: 14, 16, 17, 18

### What to build

The two signature interactive moments, both performance-guarded. Add the MagicUI **interactive icon cloud** in the Home skills section (technical breadth at a glance). Add the **react-three-fiber 3D hero moment**: memorable but non-distracting, **lazy-loaded**, **disabled with a static fallback on low-power and mobile devices**, and honoring `prefers-reduced-motion`. Hold the mobile Lighthouse budget — the 3D/animation cost must not undercut the "fast, credible" goal.

### Acceptance criteria

- [x] An interactive skills icon cloud renders in the Home skills section and is usable on desktop.
- [x] The r3f 3D hero loads lazily (not in the critical path) and degrades to a static/fallback visual on low-power & mobile devices.
- [x] Both the skills cloud and 3D hero respect `prefers-reduced-motion`.
- [x] Mobile Lighthouse performance stays within the agreed budget with the 3D/animations present.
- [x] On a low-power/mobile device the page remains fast and usable (no heavy-animation degradation).

---

## Phase 6: Company projects (anonymized) — last content

**User stories**: 12, 19, 20

### What to build

Author the remaining company work through the existing template, applying the hard-anonymization and disclosure rules. **Systems** (no link, no screenshots, anonymized): Perfect Renders, Homepages, Financial Dashboard. **Frontends** (live link only, never repo): 63 West, Arlow Roslindale / "375 Cummings", Riva Boston, The Elle Group. A **hard approval gate** applies before committing the 3 company systems' copy — owner approves anonymized drafts first.

### Acceptance criteria

- [ ] Company frontends (63 West, Arlow Roslindale, Riva Boston, The Elle Group) render with their live-site link and **no repo link**.
- [ ] Company systems (Perfect Renders, Homepages, Financial Dashboard) render with **no link**, the branded fallback visual (no real screenshots), and industry-level anonymized copy (no client name, no figures, no URL).
- [ ] Owner has explicitly approved the anonymized copy for all 3 company systems before their content is committed.
- [ ] All company projects appear correctly in the index grid, filters, and badges from prior phases.

---

## Phase 7: Contact form (Resend) & contact channels

**User stories**: 4, 5, 26, 27

### What to build

Close the recruiter loop: a frictionless contact path. Build the contact form posting to a **Vercel serverless function → Resend**, with **Zod-validated** input, explicit success/error states, and **spam protection** (honeypot + rate limiting). Wire the secondary channels in the contact section/footer: **copy-email-to-clipboard** + mailto, **LinkedIn**, and **GitHub**. API key and destination email come from environment variables.

### Acceptance criteria

- [ ] Submitting the form posts to the Vercel serverless function and delivers an email via Resend to the configured destination.
- [ ] Input is Zod-validated on the server; invalid submissions are rejected with a clear error state, valid ones show a success state.
- [ ] Honeypot + rate limiting are in place and reject obvious spam without blocking genuine messages.
- [ ] `RESEND_API_KEY` and destination email are read from environment variables (no secrets in code).
- [ ] Copy-email-to-clipboard works with one click; mailto, LinkedIn, and GitHub links are present and correct.
