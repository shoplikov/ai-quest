// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

export default defineConfig({
  // GitHub Pages serves the site under /ai-quest/; Docker serves it at the root.
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  integrations: [mdx(), preact()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      // Every page lives under /en/ or /ru/. The root page picks a language itself.
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
