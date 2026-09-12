import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { naturalSize, strayColours, toTwoTones } from '../src/lib/diagrams.ts';
import { findChromium } from './chromium.ts';

const CONFIG = join(import.meta.dirname, 'mermaid.json');

export function mermaidConfigText(): string {
  return readFileSync(CONFIG, 'utf8');
}

/** Renders each definition to a two-tone SVG with one browser; a diagram with any third colour is an error. */
export async function renderDiagrams(definitions: Map<string, string>): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (!definitions.size) return out;
  const executablePath = await findChromium();
  if (!executablePath) throw new Error('diagrams need a Chromium: set CHROME, or run npx puppeteer browsers install chrome');
  const { default: puppeteer } = await import('puppeteer');
  const { renderMermaid } = await import('@mermaid-js/mermaid-cli');
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    for (const [key, definition] of definitions) {
      const { data } = await renderMermaid(browser, definition, 'svg', {
        backgroundColor: 'transparent',
        mermaidConfig: JSON.parse(mermaidConfigText()),
        svgId: `d${key}`,
      });
      const svg = naturalSize(toTwoTones(new TextDecoder().decode(data)));
      const stray = strayColours(svg);
      if (stray.length) throw new Error(`diagram ${key} still has colours ${[...new Set(stray)].join(', ')} — adjust scripts/mermaid.json`);
      out.set(key, svg);
    }
  } finally {
    await browser.close();
  }
  return out;
}
