# PRD — Luis Felipe Portfolio Site

## Problem Statement

I'm a Full Stack / AI Engineer (working since 2022) and I don't have a single,
credible place that shows recruiters and hiring managers who I am, the projects
I've worked on, and how I work. My experience is spread across a CV, scattered
repositories, and live client sites. Recruiters evaluating me for opportunities
(full-time, contract, freelance, or part-time) have no fast way to scan my
background, see real shipped work, and reach out.

I need a portfolio site that presents my experience clearly, showcases a curated
set of personal and company projects, protects confidential company information,
and makes it effortless for a recruiter to contact me or download my CV.

## Solution

A fast, recruiter-first portfolio website built with Astro, featuring a
distinctive "terminal / engineer" visual identity with tasteful motion and one
signature 3D hero moment. The site presents:

- A 30-second scannable home page (hero, about summary, featured projects,
  interactive skills cloud, contact).
- A projects index with card grid and filtering, where each card carries badges
  identifying it as a System or Frontend project and as Company or Personal work.
- A dedicated detail page per project using a consistent, labeled template.
- A clear "selected work" disclaimer so viewers understand these are *some* of
  the projects I've worked on — representative of my experience, not exhaustive.
- A frictionless contact path (Resend-backed form + direct links) and a one-click
  CV (PDF) download.

The site is architected to be internationalization-ready (English now, Brazilian
Portuguese later) and is deployed on Vercel.

## User Stories

1. As a recruiter, I want to understand within 30 seconds who Luis is and what he
   does, so that I can quickly decide if he fits an opportunity.
2. As a recruiter, I want a one-line pitch and clear job title in the hero, so
   that I immediately grasp his seniority and focus.
3. As a recruiter, I want to download his CV as a PDF, so that I can share it
   internally or review it offline.
4. As a recruiter, I want multiple ways to contact him (form, email, LinkedIn,
   GitHub), so that I can reach out through my preferred channel.
5. As a recruiter, I want to send a message through a contact form without opening
   my email client, so that contacting him is frictionless.
6. As a recruiter, I want to see a curated list of his projects as cards with a
   brief description, so that I can scan his experience quickly.
7. As a recruiter, I want a clear note that the listed projects are a selection
   (not all of his work), so that I understand the breadth of his experience is
   larger than what's shown.
8. As a recruiter, I want to filter projects by type (All, Systems, Frontend), so
   that I can focus on the kind of work relevant to my role.
9. As a recruiter, I want each project card to show a badge indicating Company vs
   Personal work, so that I understand the context in which it was built.
10. As a recruiter, I want to open a dedicated page for any project, so that I can
    read deeper detail about scope, role, stack, challenges, and outcomes.
11. As a recruiter, I want every project detail page to follow the same structure,
    so that I can compare projects easily and find information predictably.
12. As a recruiter, I want to see the live version of public projects, so that I
    can verify the work is real and shipped.
13. As a recruiter, I want to see the technologies used in each project, so that I
    can match his stack to my requirements.
14. As a developer or technical lead, I want an interactive visualization of his
    tech stack (icon cloud), so that I can quickly gauge his technical breadth.
15. As a developer, I want to see the source code of his open personal project
    (Epictetus Blog), so that I can assess his code quality.
16. As a visitor on mobile or a low-power device, I want the site to remain fast
    and usable, so that the experience isn't degraded by heavy animations.
17. As a visitor who prefers reduced motion, I want animations to respect my
    system setting, so that the site is comfortable and accessible.
18. As a visitor, I want a memorable but non-distracting 3D hero moment, so that
    the site feels crafted without getting in the way of the content.
19. As Luis (site owner), I want company systems anonymized, so that no client
    name, pricing, or confidential information is exposed.
20. As Luis, I want to approve the copy for confidential company projects before
    it is published, so that nothing sensitive leaks.
21. As Luis, I want to add a new project by creating a single content file, so
    that maintaining the portfolio is low-effort.
22. As Luis, I want the project content to be type-checked (required fields like
    stack and badges enforced), so that I can't accidentally publish an
    incomplete project.
23. As Luis, I want projects without a usable image to render a branded fallback,
    so that the grid always looks polished while I add real screenshots later.
24. As Luis, I want the site structured for a future Brazilian Portuguese version,
    so that adding PT-BR later doesn't require a rewrite.
25. As Luis, I want to know which projects recruiters engage with (deferred), so
    that I can later improve the site — captured as a future enhancement.
26. As Luis, I want the contact form protected against spam, so that I only
    receive genuine messages.
27. As a visitor, I want to copy his email address with one click, so that I can
    reach him without retyping.
28. As Luis, I want a project that has no public URL yet (Attios CRM) to display a
    "coming soon" state, so that it can be listed before its link exists.

## Implementation Decisions

### Audience & positioning
- Primary audience: recruiters / hiring managers, opportunity-agnostic (full-time,
  contract, freelance, part-time). Primary CTA framing: "open to roles &
  projects — let's talk."
- Tone: third-person-light, outcome-first, mirroring the CV voice
  ("Architected…", "Cut latency 66%…").

### Site structure (3 routes)
- Home: terminal-boot hero (name, title, one-line pitch, CTAs), short about
  summary, featured projects strip (3–4 best), skills section (interactive icon
  cloud), contact section.
- Projects index: card grid with filters **All · Systems · Frontend**;
  **Company** and **Personal** shown as visual badges (not filters); includes a
  visible "selected work" disclaimer.
- Project detail (one per project): fixed labeled template — Overview, Scope,
  Role, Stack, Challenges, Outcomes.
- Contact is an anchored section on Home + footer, not a separate route.

### "Selected work" disclaimer
- The projects index (and/or featured strip) carries a clear, concise note
  stating the displayed projects are a representative selection of the work Luis
  has done — not a complete list — to communicate that his real experience is
  broader.

### Tech stack
- Astro static shell with React islands used only where interactivity is needed.
- Tailwind v4 for styling.
- Motion for reveals, transitions, and micro-interactions.
- MagicUI components (e.g. Icon Cloud for skills, plus a curated set for cards,
  bento/featured layout, text animations).
- react-three-fiber (Three.js) for a single signature 3D hero moment.
- TypeScript throughout.

### Content model
- Astro Content Collections with a typed Zod schema; one MDX file per project.
- Frontmatter holds structured fields (title, blurb, badges, filter category,
  stack, role, links, image); MDX body holds the detail-page narrative following
  the fixed template.
- Cards read frontmatter; detail pages render the body.

### Internationalization
- Astro built-in i18n routing. English served at root (no `/en/` prefix);
  Brazilian Portuguese reserved for a future `/pt/` prefix.
- UI strings live in a typed dictionary (`en` now, `pt` later).
- No language switcher UI in v1.

### Visual & motion
- "Terminal / engineer" aesthetic: dark base (~`#0C0C0C`), monospace-forward,
  neon green accent (`#00FF9C`, swappable), grid/scanline motifs, type-on / boot
  hero motion.
- Guardrail: "terminal-flavored, not terminal-trapped" — section labels, nav, and
  hero use terminal styling, but project descriptions, outcomes, and body copy
  stay highly readable with clear hierarchy for non-technical recruiters.
- Motion level: motion everywhere + one 3D hero, performance-guarded.
- 3D hero is lazy-loaded and disabled / falls back on low-power and mobile
  devices; all motion respects `prefers-reduced-motion`.
- A Lighthouse mobile performance budget is held; the 3D/animation cost must not
  undercut the "fast, credible" goal.

### Images
- Primary image source: each project's OG image fetched/referenced from its live
  URL.
- Projects without a usable image render a branded fallback component (e.g.
  gradient + initials/logo + stack chips). Real screenshots swapped in later.
- Company systems (no public URL) always use the fallback / abstract visual — no
  real screenshots — to avoid exposing confidential UI.

### Contact & deployment
- Hosted on Vercel.
- Contact form posts to a Vercel serverless function → Resend email, with
  Zod-validated input, success/error states, and spam protection (e.g. honeypot /
  rate limiting). Resend API key and destination email provided via environment
  variables.
- Secondary contact: direct email (copy-to-clipboard + mailto), LinkedIn, GitHub.
- "Download CV (PDF)" button serves the existing CV file from the public assets.

### Project inventory & disclosure rules
- Systems: DeliveryChat (Personal, live link only), Attios CRM (Personal, live
  link only — "coming soon" until URL provided), Perfect Renders (Company,
  anonymized, no link), Homepages (Company, anonymized, no link), Financial
  Dashboard (Company, anonymized, no link).
- Frontends: 63 West (Company, live link only — 63weststreet.com), Arlow
  Roslindale / "375 Cummings" (Company, live link only — arlowroslindale.com),
  Riva Boston (Company, live link only — rivaboston.com), The Elle Group
  (Company, live link only — theellegroup.com), Epictetus Blog (Personal, live
  link **+ repo link**).
- "View Code" repo link appears only on Epictetus Blog. Personal SaaS
  (DeliveryChat, Attios) show the live product, not source. Company frontends
  show the live site, never the repo. Company systems show no link.
- Company systems are hard-anonymized: industry-level scope + architecture +
  stack only; no client name, no figures, no URL, no real screenshots.

### Content production workflow
- Drafts authored from local repos (dependencies/architecture) and live URLs;
  owner approves. A hard approval gate applies before committing the 3 company
  systems' copy.
- Build order: scaffold + design system first → personal/public projects →
  anonymized company systems last.
- Stack lists inferred from each repo's dependencies.

## Out of Scope

- Brazilian Portuguese (PT-BR) content and the language switcher UI (architecture
  is prepared, but content/switcher are deferred).
- Analytics: both PostHog (with custom events `cv_download`, `contact_submit`,
  `project_card_click`) and Vercel Web Analytics are deferred from v1.
- Scheduling integration (e.g. Calendly).
- A standalone About page and a separate Experience/timeline page (covered by the
  Home summary + CV download).
- A blog (the Epictetus Blog is linked as an external project, not rebuilt here).
- Public source links for personal SaaS and company projects (only Epictetus Blog
  exposes code).
- Exhaustive listing of every project Luis has worked on — the site shows a
  curated selection by design.

## Further Notes

- Deferred features are tracked in `features/backlog.md` (analytics, PT-BR
  content/switcher, scheduling).
- Follow-ups needed during implementation: Resend API key + destination email;
  Attios live URL when ready; screenshots for projects lacking usable OG images;
  an owner gut-check on the terminal hero once prototyped.
- Key risks: terminal aesthetic vs. non-technical recruiter readability (mitigated
  by the "not terminal-trapped" rule); 3D/animation performance cost (mitigated by
  lazy-load, fallbacks, and a mobile Lighthouse budget); confidential data leakage
  in anonymized company projects (mitigated by the approval gate); fallback image
  component must look good as the default, not an afterthought.
- Current state: fresh Astro 7 install (Bun) with only the default scaffold;
  Tailwind, React, Motion, MagicUI, and react-three-fiber are not yet configured.
