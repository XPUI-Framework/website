# Architecture

The site renders other repositories' markdown and holds none of its own. Every layer has one
job, and each depends only on the layers before it.

```text
sources.json ──► scripts/sync.ts ──► content/            the synced files, the diagrams, boards.json, manifest.json
                                         │
                src/lib/        pure functions over content/: routes, links, nav, sections, panels
                src/markdown/   one remark or rehype plugin per job, and the pipeline that orders them
                src/components/ render one thing each; kit/ is the design system
                site.json       every word and choice the site makes for itself
                src/layouts/    Base (every page), Doc (a documentation page)
                src/pages/      compose: the home page, /docs/, each page, the endpoints
```

## The layers

**`scripts/`** runs on a developer's machine, never in a browser and never at build time:
`sync.ts` copies from the sibling checkouts (see [syncing.md](syncing.md)), `diagrams.ts` draws
Mermaid, `boards.ts` builds `tools/boards` to export the device data, `status.ts` reports what the
site is behind on (see [updating.md](updating.md)), `git.ts` holds the read-only git queries, and
`gate.ts` with `checks/` is the gate (see [gate.md](gate.md)).

**`tools/boards/`** is a dependency-free Rust program that prints every board `xpui-boards`
describes as JSON. The sync builds it against `xpui-boards` and `xpui` unpacked from their synced
commits, offline.

**`content/`** is written by the sync alone. `manifest.json` names, for each repository, the
commit it was read at and every file's git blob id, and for each diagram the blob id of its SVG.

**`src/lib/`** is pure and tested with `node --test`: nothing in it imports from `astro:`.

| Module | Its job |
|---|---|
| `manifest.ts` | read the manifest, compute a git blob id, list the pages |
| `content.ts` | read a synced file, and say where it came from |
| `routes.ts` | a page's id to its URL, and URL clashes |
| `links.ts` | where one link in a synced page points on the site |
| `nav.ts`, `docs.ts` | `nav.json` into the sidebar order, labels, previous and next |
| `sections.ts` | titles, first paragraphs, sections and alerts out of markdown, without rendering it |
| `render.ts` | render a fragment through the site's own pipeline |
| `diagrams.ts` | find Mermaid fences, and hold a rendered SVG to two tones |
| `extract.ts` | a Rust item cut out of a file for the home page, dedented |
| `boards.ts` | the boards' data, and where a panel sits in a drawn device |
| `site.ts`, `repos.ts` | `site.json`, and the organisation profile's repository table |
| `icons.ts`, `dividers.ts` | the pixel icons and the pixel dividers, as grids |
| `llms.ts`, `glob.ts`, `warning.ts`, `assets.ts` | `llms.txt`, file patterns, the standard's warning, brand endpoints |

`src/images.ts` is the one module outside `lib/` that the build depends on: it hands the synced
goldens to Vite with `import.meta.glob`, which only Vite understands.

**`src/markdown/`** is the pipeline, in the order `index.ts` gives it:

| Plugin | Its job |
|---|---|
| `strip-badges` | drop a README's first line of badges |
| `strip-sections` | drop the licence section |
| `alerts` | turn `> [!WARNING]` into the `Callout` markup |
| `rustdoc-fences` | show a `rust` fence the way rustdoc does: `# ` lines hidden, `rust,no_run` highlighted as rust |
| `mermaid` | replace a `mermaid` fence with the SVG the sync drew for it |
| `links` | send every link through `lib/links.ts` |
| `rehypeHeadingIds` | GitHub's heading slugs, so `#the-host-façades` means what it means on GitHub |
| `heading-anchors` | a section heading links to itself |
| `headless-tables` | drop the empty header row of a `| | |` table |
| `pixel-rules` | draw a `---` as the site's pixel divider |
| `strip-sections` | drop a page's own licence section; the site carries it once, in the footer |

Shiki highlights code between the markdown and HTML stages, with both themes' colours as CSS
variables; `tokens.css` chooses which one shows.

## How a synced link resolves

| The link in the markdown | On the site |
|---|---|
| `#fragment`, `mailto:`, another site | unchanged |
| a relative path to a synced page, or to a folder whose README is one | that page's URL |
| a relative path to anything else in the repository | GitHub, at the synced commit: `blob/<sha>/…`, or `tree/<sha>/…` for a path ending in `/` |
| `github.com/XPUI-Framework/<repo>/blob/main/…` naming a synced page | that page's URL |
| `github.com/XPUI-Framework/<repo>`, alone | that repository's overview page |
| any other GitHub URL | unchanged |
| a relative path out of the repository, or a relative image | the build stops |

A relative path without a trailing slash is always sent to `blob/`; GitHub redirects a folder
there to `tree/`.

## Why the sync, not the build, reads the sources

The build runs in CI with no sibling checkouts, and must give the same site from the same
commit every time. So the sync pins each source to a commit and copies it in, the author
reads the diff, and the build reads only `content/`. Mermaid is drawn by the sync for the same
reason: the build never starts a browser.
