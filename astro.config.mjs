// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Static by default; the contact API route opts into on-demand rendering
  // with `export const prerender = false`. The Vercel adapter makes that route
  // a serverless function while every page stays prerendered.
  output: 'static',
  adapter: vercel(),

  // Server-only secrets for the contact route, validated at startup. `secret`
  // access is resolved at runtime (not inlined at build), so values set in the
  // Vercel dashboard are picked up by the deployed serverless function.
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret' }),
    },
  },

  // English serves at root; `/pt/` is reserved for a future Brazilian
  // Portuguese version. No language-switcher UI in v1.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss()]
  }
});