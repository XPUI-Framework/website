# Design

## Two tones, and their tints

Ink `#1A1A1A` on paper `#F2F2EE`, swapped in dark mode — the palette the framework draws with.
Everything else on the page is a **tint of ink on paper**, derived in `src/styles/tokens.css` and
nowhere else:

| Token | What it is | Used for |
|---|---|---|
| `--ink`, `--paper` | the two tones | text and ground |
| `--ink-soft` | ink at 72% | secondary text, ledes, summaries |
| `--ink-faint` | ink at 50% | icons at rest, link underlines, dividers |
| `--line` | ink at 14% | hairlines, card edges |
| `--tint`, `--tint-strong` | ink at 5% and 9% | tinted bands, code, inline code, the theme switch |
| `--code-ink` | ink at 82% | inline code, a shade softer than the prose around it |
| `--device-body`, `--device-key` | ink at 90% and 66% | a drawn device's shell and keys |

A band is `paper` or `tint`: the page changes tone without changing brightness, because a light
band in a dark room is a torch in the face. The `ink` tone exists — `.inverted` swaps ink and
paper and recomputes every tint, so anything inside it inverts with no change of its own — and
the site keeps it for small surfaces rather than whole sections.

The tints use `color-mix()`. A browser without it drops those declarations and shows the two
tones alone, which still reads.

**What stays strictly two-tone:** the mark, the screenshots and the diagrams. Code is the one
place with colour: Shiki's `github-light` and `github-dark`, on a tinted surface.

## The kit

Every piece of the site is a component in `src/components/kit/`, shown on each ground at
[`/kit/`](../src/pages/kit.astro) — an unlisted page, out of the sitemap and marked `noindex`,
for maintaining the site.

| Component | What it is |
|---|---|
| `Band` | a full-width section on `paper`, `tint` or `ink` |
| `SectionTitle` | eyebrow, title, optional lede and pixel ornament |
| `Eyebrow` | a small uppercase label led by two pixels, one ink and one dither |
| `Button` | a rounded link, `solid` or `soft`, with an optional icon |
| `Card` | a rounded surface with a hairline; as a link it lifts a pixel on hover |
| `Tag` | a small rounded label |
| `Icon` | a pixel icon from `src/lib/icons.ts`: sun, moon, monitor, arrow, external |
| `ThemeSwitch` | light · system · dark, as three icons in one rounded control |
| `Divider` | a pixel-art rule from `src/lib/dividers.ts`, optionally flanked by hairlines |
| `Device` | a board's body, drawn from `xpui-boards`' bezel data, with a golden in its panel |

Corners: `--radius-s` (6 px) for small things, `--radius-m` (12 px) for callouts and menus,
`--radius-l` (20 px) for cards and code, `--radius-full` for buttons and the switch.

## Dividers

Pixel art, drawn as grids in `src/lib/dividers.ts` like the mark and the icons: `fade`,
`stitch`, `mark`, `refresh` and `stair`, each shown on `/kit/`. `DEFAULT_DIVIDER` is the one the
site uses — above each home-page section, and for every `---` in a synced page, which the
`pixel-rules` plugin replaces with the same drawing. Changing that one constant changes them all.

## The theme

The page follows the operating system by default. `ThemeSwitch` offers **light · system · dark**
as three pixel icons — sun, monitor, moon — with light and dark at the ends and the system
between them. `src/client/site.js` remembers the choice in `localStorage` (choosing system
clears it) and sets `data-theme` on `<html>` before first paint, so there is no flash.

`tokens.css` swaps the two tones under `prefers-color-scheme: dark` unless `data-theme="light"`,
and under `data-theme="dark"`. Without JavaScript the switch stays `hidden` and the page
follows the system.

That script is the only code that runs in a browser: it also scrolls the sidebar to the page you are on, and puts a copy button on each code block. `Head.astro` puts its SHA-256 in a
Content-Security-Policy `<meta>`, so a browser refuses any other script — including one a CDN
might inject. The policy is emitted by production builds only: `npm run dev` runs through
Vite's own scripts, which it would refuse.

## The mark

`Mark.astro` inlines `brand`'s `mark.svg` with its fill set to `currentColor`: in the top bar,
in the footer, and large at the head of the home page, in place of the name set in type. The square takes
the text colour and the letters, which are holes, show the ground, so the mark inverts with the
theme. The favicon files are served from the synced `brand/assets/` by the endpoints in
`src/pages/`; the site keeps no copy of its own. Which file goes where is `brand`'s manual.

## Type

Geist Mono (variable, 71 KB, OFL) for the mark's neighbours: navigation, labels, headings and
code. The system's sans for prose, which costs no download. The font is preloaded and swaps
in when ready.

Geist Mono has every box-drawing character the documentation's text diagrams use except `►`
and `◄`, which appear on four lines of `xpui-cpp/docs/tutorial.md`. Those two fall back to the
system's monospace, and those lines can end a fraction of a character out.

## Browsers and sizes

The full design needs a browser from about 2021 on: current Chrome, Edge, Firefox and Safari,
iOS Safari 15 and Android Chrome. Older browsers and text browsers get the same semantic HTML
— header, navigation, main, footer, a skip link — with their default colours, because a
declaration using `var()` that a browser cannot read is dropped, not half-applied.

Every page is usable from 320 px wide. Touch targets are at least 44 px (`--touch`), nothing
depends on hover, and zoom is never disabled.

## Ids

The site's own elements use ids with a `site-` prefix (`site-main`, `site-theme`). A synced page's
headings take GitHub's slugs, and `reference.md` alone has a heading whose slug is `theme`; the
gate's link stage reports any id that appears twice on a page.

## The reading column

A documentation page is a grid: prose keeps a `--measure` column so lines stay readable, and
anything that needs room — a table, a code block, a diagram, a figure — spans the whole article.
Inline code in a table never wraps, so a repository's name stays one word.

## Screenshots and devices

The home page shows the gallery's goldens for the **Xteink X3** — the PNGs its tests compare
against — inside devices drawn from each board's own bezel data: the body, the panel well and every key, in tenths of a
millimetre, exported from `xpui-boards` by `tools/boards` at sync time. The shell's corners and a key's are
the simulator's own proportions; the well is a thin recess rather than a frame, and a hairline
edge gives the body its depth.

A golden is shown at **half a CSS pixel per panel pixel**: one device pixel each on a 2× screen,
where it is drawn `pixelated` and exact; on any other screen it is scaled smoothly. It is shown
in ink on paper in both themes — `--panel-ink` and `--panel-paper` never swap — through
`mix-blend-mode`, so a panel holds exactly those two colours at its native size.

The goldens reach the page through Vite (`src/images.ts`), which serves them the same way in
`npm run dev` and in the build, as files, never inlined.

## Diagrams

Mermaid diagrams are drawn by the sync with the **ELK** layout: nodes in layers and edges routed
orthogonally, which is what keeps a graph of thirteen repositories legible instead of a bundle of
curves. They are inlined and use the two tones, so they invert with the theme.

A diagram is shown at the size it was drawn where there is room. On a narrower screen it shrinks
to a floor of 32rem and scrolls beyond that, rather than shrinking until its labels vanish.
