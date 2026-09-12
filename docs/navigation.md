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

A page's URL is its path with the repository's `docs/` folder and `.md` dropped, and a README
standing for its folder: `xpui/docs/tutorial.md` is `/docs/xpui/tutorial/`,
`xpui-boards/core/README.md` is `/docs/xpui-boards/core/`. The URL uses the directory name,
`xpui`, not the GitHub name, `xpui-framework`. Two pages on one URL stop the build.
