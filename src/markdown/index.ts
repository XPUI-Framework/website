import { type AstroMarkdownOptions, rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { alerts } from './alerts.ts';
import { headingAnchors } from './heading-anchors.ts';
import { headlessTables } from './headless-tables.ts';
import { links } from './links.ts';
import { mermaid } from './mermaid.ts';
import { pixelRules } from './pixel-rules.ts';
import { rustdocFences } from './rustdoc-fences.ts';
import { stripBadges } from './strip-badges.ts';
import { stripSections } from './strip-sections.ts';

/** One pipeline for every page and every fragment, so a synced file renders the same wherever it lands. */
export const shared: AstroMarkdownOptions = {
  syntaxHighlight: 'shiki',
  shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
};

export const processor = unified({
  gfm: true,
  smartypants: false,
  remarkPlugins: [stripBadges, stripSections, alerts, rustdocFences, mermaid, links],
  // Heading ids first, with GitHub's slugger, so the anchors can link to them.
  rehypePlugins: [rehypeHeadingIds, headingAnchors, headlessTables, pixelRules],
});
