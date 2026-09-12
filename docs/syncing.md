# Syncing

```bash
npm run sync                # every source, at a commit that is on its origin/main
npm run sync -- --unpushed  # the same, allowing unpushed commits, for a local preview only
```

## What it reads

`sources.json` lists each repository: its directory beside this one, its GitHub name, and the
files to copy as patterns. `*` stays within a path segment, `**` crosses them, and a pattern
starting with `!` excludes. `"pages": false` marks a source that is copied but is not
documentation — the organisation profile and the brand files.

For each repository, the sync:

1. reads the commit at `HEAD`, and refuses it unless it is on `origin/main` — a page links to
   its source at that commit, and the link must work for everyone;
2. lists that commit's files and keeps those the patterns choose; a pattern that matches
   nothing is an error, because it means the configuration has rotted;
3. copies each file **from the commit, with `git cat-file`**, never from the working tree:
   an uncommitted edit is left out and named in the report;
4. deletes anything in `content/` that no source produced this time;
5. writes `content/manifest.json`, sorted and without timestamps, so a second run with the same
   commits changes nothing.

Every git command it runs is a read, with `--no-optional-locks`, so it never touches a sibling's
index.

## The report

```text
xpui             8d5ae9c  11 files, 0 changed
brand            a44da1b  5 files, 0 changed  (NOT PUSHED)
boards           7 described, unchanged
diagrams         13 distinct, 0 rendered
```

`NOT PUSHED` appears only with `--unpushed`, and the gate fails on it until that repository is
pushed and the sync runs again. Read the diff of `content/` before committing it: it is the
documentation that will go live.

## The boards

The home page draws each device from `xpui-boards`' own bezel data. That data is Rust
constants built by `const fn`, so the sync does not parse it: it unpacks `xpui-boards` and `xpui`
at their synced commits with `git archive`, builds `tools/boards` against them offline, and
writes what it prints to `content/boards.json`. It does this again only when either commit or
the exporter changes. It needs `cargo`, and installs nothing: the toolchain is the one
`xpui-boards`' `rust-toolchain.toml` names.

## Diagrams

Every `mermaid` fence in a synced page is drawn to SVG by `scripts/diagrams.ts`, one browser for
all of them, and saved as `content/diagrams/<key>.svg`, where the key is a hash of the diagram's
text. A diagram whose text has not changed is not drawn again, unless `scripts/mermaid.json` or
the version of `@mermaid-js/mermaid-cli` changed, which redraws them all.

Mermaid is told to draw in two sentinel colours. The sync replaces them with the site's two
tones, `var(--ink)` and `var(--paper)`, counts black as ink and white as paper, and **stops if any
other colour is left**, naming the diagram and the colour. The SVG is inlined, so it follows the
theme.

Drawing needs a Chromium. The sync uses `CHROME` if it is set, then puppeteer's own browser,
then Playwright's, then an installed Chrome. Without one, and with a diagram to draw, it stops
and says so; `npx puppeteer browsers install chrome` fetches one. CI never syncs, so it never
needs one.

## Before a sync

`npm run status` shows, per repository, whether `origin/main` has commits the site does not
show yet and which synced files they change. [updating.md](updating.md) is the whole path from a
change in a repository to the live site.
