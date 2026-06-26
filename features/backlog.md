# Features Backlog (post-v1)

Deferred features intentionally excluded from v1. Each entry notes the decision and why.

## Analytics — PostHog + custom events
- **Status:** Deferred (not in v1).
- **v1 instead:** none (Vercel Web Analytics also skipped for v1).
- **Scope when picked up:** PostHog wired in as a deliberate product-analytics skill showcase
  (it's on the CV). Track custom events: `cv_download`, `contact_submit`, `project_card_click`.
- **Caveat:** may require a cookie-consent banner depending on configuration.

## Internationalization — PT-BR content + language switcher
- **Status:** Architecture ready in v1 (Astro i18n routing, EN at root, typed string dictionary),
  but PT-BR content NOT authored and NO switcher UI built.
- **Scope when picked up:** add `/pt/` locale content (one MDX file per project per locale),
  add `pt.ts` dictionary, build the language switcher UI.

## Scheduling (Calendly or similar)
- **Status:** Deferred. v1 contact = Resend form + direct links + CV download.
