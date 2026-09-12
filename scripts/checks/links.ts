import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, type Findings, pages } from './files.ts';

const SITE_URL = 'https://xpui.rs';

function unescape(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function ids(html: string): string[] {
  return [...html.matchAll(/\sid="([^"]*)"/g)].map((m) => unescape(m[1]));
}

/** The URL path of a built page: `docs/xpui/index.html` is `/docs/xpui/`, `404.html` is itself. */
function urlOf(path: string): string {
  return `/${path.replace(/(^|\/)index\.html$/, '$1')}`;
}

/** Every link inside the site reaches a page, and every #fragment reaches an id on it; no page repeats an id. */
export function internalLinksResolve(): Findings {
  const findings: Findings = [];
  const built = pages();
  const idsByUrl = new Map(built.map(({ path, html }) => [urlOf(path), new Set(ids(html))]));

  for (const { path, html } of built) {
    const own = ids(html);
    for (const id of new Set(own.filter((id, i) => own.indexOf(id) !== i))) findings.push(`${path}: id "${id}" appears more than once`);

    const here = urlOf(path);
    for (const match of html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
      let href = unescape(match[1]);
      if (href.startsWith('#')) {
        if (!own.includes(decodeURIComponent(href.slice(1)))) findings.push(`${path}: ${href} — no such id on this page`);
        continue;
      }
      if (href.startsWith(SITE_URL)) href = href.slice(SITE_URL.length) || '/';
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) continue;
      const url = new URL(href, `http://site${here}`);
      const target = decodeURIComponent(url.pathname);
      const fragment = decodeURIComponent(url.hash.slice(1));

      if (target.endsWith('/')) {
        const page = idsByUrl.get(target);
        if (!page) findings.push(`${path}: ${href} — no page there`);
        else if (fragment && !page.has(fragment)) findings.push(`${path}: ${href} — no id "${fragment}" on that page`);
      } else if (!existsSync(join(DIST, target))) {
        findings.push(`${path}: ${href} — ${existsSync(join(DIST, target, 'index.html')) ? 'missing its trailing slash' : 'no file there'}`);
      }
    }
  }
  return findings;
}
