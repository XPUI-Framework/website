import { createHash } from 'node:crypto';

export const DIAGRAMS_DIR = 'diagrams';

/** The two colours Mermaid is told to draw with; nothing else in a rendered diagram may be a colour. */
export const SENTINEL = { ink: '#0a0b0c', paper: '#f0f1f2' } as const;

/** A diagram is named by what it says, so an unchanged diagram is never rendered twice. */
export function diagramKey(definition: string): string {
  return createHash('sha256').update(definition.trim()).digest('hex').slice(0, 16);
}

export function mermaidFences(markdown: string): string[] {
  return [...markdown.matchAll(/^```mermaid[ \t]*\n([\s\S]*?)^```[ \t]*$/gm)].map((m) => m[1]);
}

/** `rgb(…)` or `rgba(…, alpha)` of a hex colour: a see-through tone is a grey, so it counts as the tone. */
function hexToRgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return `rgba?\\(\\s*${r}\\s*,\\s*${g}\\s*,\\s*${b}\\s*(,\\s*[0-9.]+\\s*)?\\)`;
}

/** What else counts as each tone: black is ink and white is paper, as on a 1-bit panel. */
const EQUIVALENT = {
  ink: [SENTINEL.ink, '#000000', '#000(?![0-9a-f])', 'black'],
  paper: [SENTINEL.paper, '#ffffff', '#fff(?![0-9a-f])', 'white'],
};

const COLOUR_IN_USE = /(fill|stroke|color|stop-color|flood-color|lighting-color|background(?:-color)?)\s*[:=]\s*"?\s*(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-z]+(?=\s*[;"}]))/gi;
const NOT_A_COLOUR = new Set(['none', 'transparent', 'currentcolor', 'inherit', 'var', 'initial', 'unset', 'revert']);

/**
 * The sentinels become the site's two tones, and `fill`/`stroke` attributes move into `style`,
 * because an SVG presentation attribute cannot hold `var()`.
 */
export function toTwoTones(svg: string): string {
  let out = svg;
  for (const [tone, forms] of Object.entries(EQUIVALENT)) {
    const rgb = forms.filter((f) => /^#[0-9a-f]{6}$/i.test(f)).map(hexToRgb);
    const named = forms.filter((f) => /^[a-z]+$/.test(f)).map((f) => `(?<=[:="]\\s*)${f}(?=\\s*[;"}])`);
    const hex = forms.filter((f) => f.startsWith('#'));
    out = out.replace(new RegExp([...hex, ...rgb, ...named].join('|'), 'gi'), `var(--${tone})`);
  }
  return out.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?(\/?)>/g, (tag, name: string, attrs = '', close: string) => {
    const moved: string[] = [];
    const rest = attrs.replace(/\s(fill|stroke)="(var\([^"]*\))"/g, (_: string, prop: string, value: string) => {
      moved.push(`${prop}:${value}`);
      return '';
    });
    if (!moved.length) return tag;
    const styled = /\sstyle="/.test(rest)
      ? rest.replace(/\sstyle="([^"]*)"/, (_: string, s: string) => ` style="${moved.join(';')};${s}"`)
      : `${rest} style="${moved.join(';')}"`;
    return `<${name}${styled}${close}>`;
  });
}

/** Every colour a diagram still names, other than the two tones: an empty list is two-tone. */
export function strayColours(svg: string): string[] {
  return [...svg.matchAll(COLOUR_IN_USE)]
    .map((m) => m[2])
    .filter((value) => !NOT_A_COLOUR.has(value.toLowerCase()) && !value.toLowerCase().startsWith('var'));
}

/** A diagram keeps its drawn size, so its labels stay readable; a wide one scrolls rather than shrinks. */
export function naturalSize(svg: string): string {
  const box = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!box) return svg;
  const [width, height] = [box[1], box[2]].map((n) => Math.ceil(Number(n)));
  return svg.replace(/<svg\b([^>]*)>/, (_tag, attrs: string) => {
    const kept = attrs.replace(/\s(width|height)="[^"]*"/g, '').replace(/\sstyle="[^"]*"/, '');
    return `<svg${kept} width="${width}" height="${height}">`;
  });
}
