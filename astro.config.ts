import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import { defineConfig, passthroughImageService } from 'astro/config';
import starlightGitHubAlerts from 'starlight-github-alerts';
import starlightLlmsTxt from 'starlight-llms-txt';
import { processor, shared } from './src/markdown/index.ts';
import { syncedIndex } from './src/lib/content.ts';
import { readSite } from './src/lib/site.ts';
import { sidebar } from './src/lib/starlight.ts';

const nav = JSON.parse(readFileSync('./nav.json', 'utf8'));

export default defineConfig({
  site: 'https://xpui.rs',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  // The docs open on the framework's overview, the first page of Start here.
  redirects: { '/docs': '/docs/xpui/' },
  integrations: [
    starlight({
      title: 'XPUI',
      description: readSite().home.hero.headline,
      logo: { light: './content/brand/assets/mark.svg', dark: './content/brand/assets/mark-inverted.svg', alt: 'XPUI' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/XPUI-Framework' }],
      customCss: ['./src/styles/tokens.css', './src/styles/divider.css', './src/styles/starlight.css'],
      sidebar: sidebar(nav, syncedIndex),
      // The site's own 404 page stays until the landing page moves.
      disable404Route: true,
      markdown: { processedDirs: ['./content/'] },
      // One plain frame for every block, its language in the header, tighter lines and less padding inside.
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
        defaultProps: { frame: 'code' },
        styleOverrides: {
          codePaddingBlock: '0.75rem',
          codePaddingInline: '1rem',
          codeLineHeight: '1.5',
          frames: { editorActiveTabIndicatorTopColor: 'transparent', frameBoxShadowCssValue: 'none' },
        },
      },
      plugins: [starlightGitHubAlerts(), starlightLlmsTxt()],
    }),
    sitemap({ filter: (page) => !page.includes('/kit/') }),
  ],
  markdown: { ...shared, processor },
  // A golden in a synced page is served as the bytes the sync copied: never resized or re-encoded.
  image: { service: passthroughImageService() },
  // Goldens are 1-bit PNGs of a few KB: served as files, never inlined as data: URLs.
  vite: { build: { assetsInlineLimit: 0 } },
});
