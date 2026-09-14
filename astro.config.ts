import sitemap from '@astrojs/sitemap';
import { defineConfig, passthroughImageService } from 'astro/config';
import { processor, shared } from './src/markdown/index.ts';

export default defineConfig({
  site: 'https://xpui.rs',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/kit/') })],
  markdown: { ...shared, processor },
  // A golden in a synced page is served as the bytes the sync copied: never resized or re-encoded.
  image: { service: passthroughImageService() },
  // Goldens are 1-bit PNGs of a few KB: served as files, never inlined as data: URLs.
  vite: { build: { assetsInlineLimit: 0 } },
});
