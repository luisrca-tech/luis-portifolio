/*
  Typed UI string dictionary.

  All visible UI strings live here, never hardcoded in markup. `en` is the
  source of truth and the only authored locale in v1; `pt` is a reserved slot
  for a future Brazilian Portuguese version (see astro.config i18n).
*/

export type Locale = "en" | "pt";

export const defaultLocale: Locale = "en";

export interface UIStrings {
  brand: string;
  role: string;
  nav: {
    home: string;
    projects: string;
    contact: string;
  };
  cta: {
    talk: string;
  };
  footer: {
    builtWith: string;
    rights: string;
  };
}

const en: UIStrings = {
  brand: "Luis Felipe",
  role: "Full Stack / AI Engineer",
  nav: {
    home: "home",
    projects: "projects",
    contact: "contact",
  },
  cta: {
    talk: "open to roles & projects — let's talk",
  },
  footer: {
    builtWith: "Built with Astro, React & Tailwind",
    rights: "All rights reserved.",
  },
};

// Reserved for PT-BR. Intentionally empty in v1 — falls back to `en`.
const pt: Partial<UIStrings> = {};

const dictionaries: Record<Locale, Partial<UIStrings>> = { en, pt };

/** Resolve the string table for a locale, falling back to English. */
export function useStrings(locale: Locale = defaultLocale): UIStrings {
  return { ...en, ...dictionaries[locale] };
}
