# Navigation

`nav.json` is the one part of the documentation the site decides: which group a page belongs
to, in what order, and under what label. Everything else comes from the repositories.

```json
{
  "groups": [
    {
      "label": "Start here",
      "pages": [{ "page": "xpui/README.md", "label": "Overview" }, "xpui/docs/tutorial.md"]
    }
  ]
}
```

- A page is named by its path in `content/`: the repository's directory, then the path inside it.
- A string entry takes the page's own title, its first `#` heading. An object sets a label; the
  overview pages and crate READMEs use one, because a README's title is its crate's name.
- Groups appear in order in the sidebar, and **previous** and **next** follow the same order
  from the first page of the first group to the last page of the last.
- The group's label is the eyebrow above a page's title.

## When a repository gains, loses or renames a page

`npm run sync` reports it: `not in nav.json: …` for a new page, and the build stops for a page
`nav.json` names that the sync did not copy. A rename is both.

| What changed | What fails | What to do |
|---|---|---|
| a new page is synced | the gate: `every synced page is in the nav` | add it to the right group |
| a page is gone | the build: `nav.json names pages that are not synced` | remove its entry |
| a page is listed twice | the build | remove one |
| a page should not be on the site | — | exclude it in `sources.json` with a `!` pattern, then sync |

A page not in `nav.json` still gets its URL, so links to it resolve while it waits for a place.

## URLs

A page's URL is its path with the last `docs/` folder and `.md` dropped, and a README
standing for its folder: `xpui/docs/tutorial.md` is `/docs/xpui/tutorial/`,
`xpui/docs/reference/lists.md` is `/docs/xpui/reference/lists/`,
`xpui-boards/core/README.md` is `/docs/xpui-boards/core/`. The URL uses the directory name,
`xpui`, not the GitHub name, `xpui-framework`. Two pages on one URL stop the build: a
`docs/reference/README.md` would land on `docs/reference.md`'s URL, which is why a reference
index is always `reference.md`.

## What the site carries

The site carries what a **user** of XPUI needs: someone building screens, applications or
firmware, or writing a backend or a board. A document written for the maintainers of a
repository — gate internals, review process, golden bookkeeping, the reasoning behind a choice —
stays in that repository and is kept off the site.

The rule is applied in `sources.json`, with a `!` pattern for the file, and in `nav.json`, by
removing its entry, **in the same change**: a synced page with no nav entry fails the gate, and a
nav entry for a page that is not synced stops the build. If `site.json` names the repository or
page, it goes from there too, or the home page links to a URL that is gone. Nothing is deleted
from the repository, and a link to the page from one the site keeps still works: `rewrite` in
`src/lib/links.ts` sends it to the file on GitHub at the synced commit.

When an excluded page's content moves into a page the site keeps, the exclusion lands in the
same website change as the page that took the content, never before.

## Reference pages and their screenshots

A repository's API reference is an index, `docs/reference.md`, and one page per category in
`docs/reference/`; a nested crate such as `xpui-backends/fui` has its own under
`<crate>/docs/`. They arrive like any other page, with two steps the site takes by hand:

1. **In the change that syncs a repository's first category page**, add `"docs/reference/*.md"`
   to its entry in `sources.json` (`"<crate>/docs/reference/*.md"` for a nested crate) and give
   the pages a `Reference` group in `nav.json`, after the repository's guides: the index first,
   then the categories. Not earlier: `*` stays within one folder, so `docs/*.md` does not reach
   them, and a pattern that matches nothing stops the sync.
2. **In the change that syncs the first screenshot a page embeds**, add
   `"gallery/tests/screenshots/reference/*.png"` to `xpui-gallery`'s entry. `xpui-gallery` is
   pushed first, since the sync reads `origin/main`.

A page embeds a golden by its raw URL,
`https://raw.githubusercontent.com/XPUI-Framework/xpui-gallery/main/gallery/tests/screenshots/…`,
so it renders on GitHub too. The site serves its own synced copy, never the raw URL; a raw URL
for a file the sync did not copy stops the build with `… is not synced — add it to
sources.json`. How the image is drawn is in [design.md](design.md).
