/*
  Projects content collection — the single source of truth for the portfolio.

  Adding a project is exactly one MDX file under `src/content/projects/`:
  frontmatter drives the index card and detail header; the MDX body holds the
  fixed-template narrative (Overview · Scope · Role · Stack · Challenges ·
  Outcomes). The Zod schema is strict on purpose — an incomplete project fails
  the build instead of shipping a half-rendered card.
*/

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    // Engineering nature of the work.
    type: z.enum(["System", "Frontend"]),
    // Who it was built for — drives the Company/Personal badge.
    origin: z.enum(["Company", "Personal"]),
    // Index filter bucket.
    category: z.enum(["Systems", "Frontend"]),
    stack: z.array(z.string()).min(1),
    role: z.string(),
    links: z
      .object({
        live: z.url().optional(),
        repo: z.url().optional(),
        // True when there is no usable live URL yet (e.g. Attios).
        comingSoon: z.boolean().optional(),
      })
      .default({}),
    // Optional OG image; absent → branded fallback component.
    image: z.string().optional(),
  }),
});

export const collections = { projects };
