# `website`

## What this is, and what it may not become

`xpui.rs`: the XPUI home page and the ten repositories' own documentation, rendered as one
site. **The site holds no documentation of its own.** Every
page is a file synced from a repository at a pinned commit; a correction goes to that
repository, never to `content/`. The brand files come from `brand` the same way.

## The gate

```bash
./build-and-test.sh
```

```text
synced content matches the manifest · types · unit tests · build · every synced page is in the nav · no menu label is a crate name · internal links resolve · pages within budget · two tones · site copy follows the standard · the gate is documented
```

CI runs the same command and deploys the `dist/` it built. What each stage proves, and how to
read a failure, is in [docs/gate.md](docs/gate.md).

## Style that bites here

- **One script.** `src/client/site.js` — the theme, the sidebar's scroll and the copy buttons —
  and nothing else runs in a browser; the CSP carries its hash, so any other script is refused.
- **Two tones and their tints.** A colour literal or tint lives in `src/styles/tokens.css` or
  nowhere; components use the tokens. The mark, the screenshots and the diagrams stay two-tone.
- **The kit first.** A new piece of the page is a component in `src/components/kit/`, shown on
  `/kit/`, before it is used.
- **`content/` is written by `npm run sync` only.** Its bytes are checked against the manifest.
- **One job per file.** `src/lib/` is pure and tested with `node --test`; components render,
  pages compose.

## Where the documentation lives

| | |
|---|---|
| [docs/updating.md](docs/updating.md) | from a change in another repository to the live site |
| [docs/architecture.md](docs/architecture.md) | the layers, each file's job, and how a synced link resolves |
| [docs/syncing.md](docs/syncing.md) | `sources.json`, the sync, its report, and the diagrams |
| [docs/navigation.md](docs/navigation.md) | `nav.json`, and what to do when a repository's pages change |
| [docs/design.md](docs/design.md) | tokens and tints, the kit, dividers, the theme, devices, fonts, browsers |
| [docs/gate.md](docs/gate.md) | every stage and what it proves |
| [docs/deploying.md](docs/deploying.md) | CI, GitHub Pages, DNS on Cloudflare, what to leave switched off |

## Git

Never stage, never commit, never push without being asked, each time. No assistant
self-attribution in a commit message. Never rewrite a commit that exists.
