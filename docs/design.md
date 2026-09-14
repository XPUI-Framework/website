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
| `EditLink` | "Edit this page on GitHub", at the foot of every synced page |
| `Divider` | a pixel-art rule from `src/lib/dividers.ts`, optionally flanked by hairlines |
| `Device` | the photographed X3, with a golden behind its cut-out screen |

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

Everything on a documentation page shares one column of `--measure`: prose, code, tables and
diagrams line up on both edges, because a page that changes width down its length reads as
several pages. A table that needs more room scrolls inside itself, and inline code in a table
never wraps, so a repository's name stays one word.

Sizes agree too: prose at 1rem, code at 0.9375rem, inline code at 0.9em of its line. The first
paragraph of a page is its lede, one step larger, on every page.

## Screenshots and the device

The home page shows the gallery's goldens for the **Xteink X3** — the PNGs its tests compare
against — inside Xteink's own photograph of the device, masked so that the screen is a hole: the
background is transparent, and the promotional screen is cut out. `public/devices/x3-black.webp`
is the black body, shown on paper; `x3-white.webp` is the white one, shown on ink. Both are made
by `tools/devices/mask.sh` from the photographs beside it, which carries the measurements. Which one is
used is `--device-frame`, a token, so it follows the theme like every other colour.

A golden sits behind the hole at **half a CSS pixel per panel pixel**: 264 CSS pixels for the
X3's 528, one device pixel each on a 2× screen, where it is drawn `pixelated`. The frame's own
proportions size the rest, so the picture cannot drift out of its window. It is shown in ink on
paper in both themes — `--panel-ink` and `--panel-paper` never swap — through `mix-blend-mode`.

The photograph is Xteink's work, and the site says so in the footer: the project is not
affiliated with, endorsed by or sponsored by Xteink.

The goldens reach the page through Vite (`src/images.ts`), which serves them the same way in
`npm run dev` and in the build, as files, never inlined.

## Screenshots in a documentation page

A golden a synced page embeds (see [navigation.md](navigation.md)) is drawn without the device:
a `span.golden` around the image, styled in `prose.css`. The build reads the PNG's own size from
its header and sets the image's `width` and `height` from it:

| The golden | Drawn at | Class |
|---|---|---|
| a whole panel: at least the X3's 528 × 792, either way up | half a CSS pixel per panel pixel, as on the home page; `pixelated` on a 2× screen | `golden-panel` |
| anything smaller: a component cropped out of a panel | two CSS pixels per panel pixel, `pixelated` at every density | `golden-crop` |

Its tones follow the page. The blend is the device's: the image multiplies onto `--panel-paper`
and `--panel-ink` lightens over it, so black is drawn as ink and white as paper. In the dark
theme `--golden-filter` inverts the golden first, so the page's ink, which is then the light
tone, is still what the golden's black becomes.

## Diagrams

A dependency graph is drawn the right way up: a `flowchart BT`, which puts the depended-upon
crate at the top, is read as `flowchart TD`, so `xpui` sits at the foot of the drawing with every
arrow pointing down into it. Same nodes, same arrows, the base at the base.

Mermaid diagrams are drawn by the sync with the **ELK** layout: nodes in layers and edges routed
orthogonally, which is what keeps a graph of thirteen repositories legible instead of a bundle of
curves. They are inlined and use the two tones, so they invert with the theme.

A diagram is shown at the size it was drawn where there is room. On a narrower screen it shrinks
to a floor of 32rem and scrolls beyond that, rather than shrinking until its labels vanish.

## What a card does, and what a hover may not do

A card carries its border at rest and changes its colour on hover, so nothing shifts under the
pointer. Where the whole card is a link, the title's link is stretched across it; any other link
inside sits above that, and hovering it keeps the card lit rather than stealing the state.

On a documentation page the contents on the right mark the section being read, and the sidebar
opens scrolled to the page you are on. Both are in `src/client/site.js`, the one script.
