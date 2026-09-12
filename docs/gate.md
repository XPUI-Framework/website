# The gate

```bash
./build-and-test.sh
```

`scripts/gate.ts` runs every stage, even after one fails, and exits non-zero if any did. The
checks are one file each in `scripts/checks/`. CI runs the same command.

| Stage | What it proves | When it fails |
|---|---|---|
| synced content matches the manifest | every file in `content/`, diagrams included, is byte for byte the git blob `manifest.json` names, nothing else is there, and every source commit is on its `origin/main` | run `npm run sync`; if a repository is not pushed, push it first |
| types | `astro check` | a type error, named with its file |
| unit tests | `node --test` over `src/**/*.test.ts` | a pure function changed behaviour |
| build | `astro build --force` | a page threw: a nav entry naming no page, two pages on one URL, a link out of its repository, a diagram not drawn. `--force` because Astro caches rendered markdown by its text, and a synced page's links change with the commit even when its text does not |
| every synced page is in the nav | each page the manifest lists has a place in `nav.json` | give it one — see [navigation.md](navigation.md) |
| internal links resolve | every link inside the site reaches a page or file, every `#fragment` reaches an id on that page, and no page repeats an id | a synced page links to a heading that moved, or the site's own ids collide with a heading's |
| one script, the site's | each page has exactly one `<script>`, identical to `src/client/site.js` — the theme, the sidebar's scroll and the copy buttons; no script file and no `on…=` handler anywhere in `dist/` | something added a script; the CSP would refuse it anyway |
| pages within budget | each page is at most 32 KB gzipped, and the font at most 80 KB | a page grew; the figure is in the message. The limits are a ratchet: the largest page, `/docs/xpui/reference/`, is 25.9 KB |
| two tones | no colour, `opacity` or `color-mix` in any CSS or component style outside `src/styles/tokens.css` | a colour appeared somewhere else |
| site copy follows the standard | none of the standard's five phrases (`used to`, `for a while`, `spec` and a number, `previously`, `was found`) in anything this repository wrote, and the framework's overview page, `/docs/xpui/`, carries the warning verbatim | reword it. `content/` is never read, because its words belong to their repositories, and a phrase in backticks in this repository's markdown is quoted rather than said |
| the gate is documented | `AGENTS.md` lists exactly these stages, in order | a stage was added or renamed without `AGENTS.md` |

The copy stage also prints `this replaces`, `before this`, `the first time` and `no longer`
where it finds them. Those are for a reviewer to read once, not failures.

External links are not checked: the gate stays offline, and the repositories' own gates check
their links.
