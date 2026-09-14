import { type AstroMarkdownOptions, rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { codeIndent } from './code-indent.ts';
import { codeTitles } from './code-titles.ts';
import { headlessTables } from './headless-tables.ts';
import { links } from './links.ts';
import { mermaid } from './mermaid.ts';
import { pixelRules } from './pixel-rules.ts';
import { rustdocFences } from './rustdoc-fences.ts';
import { sectionDividers } from './section-dividers.ts';
import { stripBadges } from './strip-badges.ts';
import { stripSections } from './strip-sections.ts';
import { stripTitle } from './strip-title.ts';

/** One pipeline for every page and every fragment, so a synced file renders the same wherever it lands. */
export const shared: AstroMarkdownOptions = {
  syntaxHighlight: 'shiki',
  shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
};

export const processor = unified({
  gfm: true,
  smartypants: false,
  remarkPlugins: [stripBadges, stripSections, rustdocFences, mermaid, codeIndent, codeTitles, links],
  // Heading ids with GitHub's slugger, counted with the H1 still there; Starlight's heading links build on them.
  rehypePlugins: [rehypeHeadingIds, stripTitle, headlessTables, pixelRules, sectionDividers],
});
