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
    downloadCv: string;
  };
  home: {
    hero: {
      promptWhoami: string;
      promptPitch: string;
      promptContact: string;
      pitch: string;
    };
    about: {
      heading: string;
      body: string[];
    };
    skills: {
      heading: string;
      lead: string;
    };
    featured: {
      heading: string;
      viewAll: string;
    };
    contact: {
      heading: string;
      lead: string;
      email: string;
      copyEmail: string;
      copied: string;
      form: {
        name: string;
        namePlaceholder: string;
        email: string;
        emailPlaceholder: string;
        company: string;
        companyPlaceholder: string;
        type: string;
        typeOptions: { value: "Role" | "Project" | "Other"; label: string }[];
        details: string;
        detailsPlaceholder: Record<"Role" | "Project" | "Other", string>;
        submit: string;
        sending: string;
        success: string;
        error: string;
      };
    };
  };
  socials: {
    linkedin: string;
    github: string;
  };
  projects: {
    title: string;
    intro: string;
    viewCode: string;
    viewLive: string;
    comingSoon: string;
    back: string;
    filter: {
      label: string;
      all: string;
      systems: string;
      frontend: string;
    };
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
    downloadCv: "Download CV (PDF)",
  },
  home: {
    hero: {
      promptWhoami: "whoami",
      promptPitch: "cat pitch.txt",
      promptContact: "./open-to-work --roles --projects",
      pitch:
        "I build production systems where the architecture decision is the business outcome — from a US studio's 3D-rendering pipeline to multi-tenant SaaS shipped to sell.",
    },
    about: {
      heading: "about",
      body: [
        "Full Stack / AI Engineer who builds production systems where the architecture decision is the business outcome. Promoted from Junior to Mid-Level in six months at Naranja Labs by owning end-to-end solutions for US-market clients — including the platform that runs a US studio's 3D-rendering pipeline from proposal through stage-based production to delivery and billing across 300+ projects.",
        "Independently architects complete multi-tenant SaaS products — from CRMs to real-time chat-as-a-service — built to sell, with billing, auth, and per-tenant data isolation. Pairs strong fundamentals (TDD, type-safe APIs, clean architecture) with a disciplined AI-augmented workflow that treats AI as an instrument under engineering control, not autopilot.",
      ],
    },
    skills: {
      heading: "skills",
      lead: "The stack I reach for across the stack — frontend, backend, data, infra, and AI. Drag the cloud to spin it.",
    },
    featured: {
      heading: "featured work",
      viewAll: "view all projects",
    },
    contact: {
      heading: "contact",
      lead: "Open to full-time, contract, and freelance work. Tell me about a role or a project below — or reach me directly through any channel.",
      email: "luisrochacruzalves@gmail.com",
      copyEmail: "Copy email",
      copied: "Copied!",
      form: {
        name: "Name",
        namePlaceholder: "Jane Doe",
        email: "Email",
        emailPlaceholder: "jane@company.com",
        company: "Company / Organization",
        companyPlaceholder: "Acme Inc (optional)",
        type: "What's this about?",
        typeOptions: [
          { value: "Role", label: "A role" },
          { value: "Project", label: "A project" },
          { value: "Other", label: "Something else" },
        ],
        details: "Details",
        detailsPlaceholder: {
          Role: "Tell me about the role — team, stack, seniority, location / remote, and what you're hiring for.",
          Project: "Tell me about the project — goals, scope, rough timeline, and budget range if you have one.",
          Other: "What's on your mind?",
        },
        submit: "Send message",
        sending: "Sending…",
        success: "Thanks — your message is on its way. I'll reply by email soon.",
        error: "Something went wrong sending your message. Please email me directly.",
      },
    },
  },
  socials: {
    linkedin: "https://www.linkedin.com/in/luisfelipedarocha/",
    github: "https://github.com/luisrca-tech",
  },
  projects: {
    title: "projects",
    intro: "Selected work — a representative slice, not an exhaustive list.",
    viewCode: "View Code",
    viewLive: "View Live",
    comingSoon: "Coming soon",
    back: "back to projects",
    filter: {
      label: "filter",
      all: "all",
      systems: "systems",
      frontend: "frontend",
    },
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
