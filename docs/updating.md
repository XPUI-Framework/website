# Updating the site after a change in another repository

The site never holds documentation of its own. When an API changes in one of the ten
repositories, the change reaches `xpui.rs` in this order: **the repository's own docs change
with its code, then the site copies them.** There is no step where anyone edits the site's
copy of a page.

## The whole path, for one change

1. **In the repository you changed** — say `xpui`, which renamed a method.
   - Change the code, and in the same change update what documents it: the `///` comments,
     `docs/reference.md`, and every guide that uses the old name. Its gate proves it: every
     `rust` fence in its docs is compiled, so a snippet still using the old name fails there,
     not on the website.
   - Run that repository's `./build-and-test.sh`, review, commit, push to `main`.
   - If other repositories use the method, they change and push the same way;
     `xpui-dev`'s gate is how you find them.

2. **Here, see what the site is behind on.**

   ```bash
   npm run status
   ```

   ```text
   xpui             8d5ae9c → 1f2e3d4  3 commits newer, 2 synced files changed
                      docs/reference.md
                      docs/tutorial.md
   xpui-chrome      09bef54  up to date
   ```

   It compares what the site shows with each repository's `origin/main` **as of your last
   fetch** — it never fetches, because fetching changes a repository's state. Fetch or pull
   the repositories yourself first if you want the latest.

3. **Pull each repository that is behind**, so its checkout is at `origin/main`. The sync reads
   the commit your checkout is on, and refuses one that is not on `origin/main`.

4. **Copy the new versions in.**

   ```bash
   npm run sync
   ```

   It prints what changed per repository, draws any diagram whose text changed, and deletes what
   no source produces any more.

5. **Read the diff of `content/`.** It is exactly what will go live.

   ```bash
   git diff --stat content/
   git diff content/xpui/docs/reference.md
   ```

6. **Run the gate.**

   ```bash
   ./build-and-test.sh
   ```

   It tells you if the change needs anything from the site — see the table below.

7. **Commit and push.** One commit per sync, named for what it brings, e.g.
   `Sync xpui 1f2e3d4: the renamed stepper method`. CI runs the same gate and deploys; the
   site is live a couple of minutes later.

## What follows by itself, and what does not

| On the site | Comes from | After a sync |
|---|---|---|
| every documentation page | the repositories' `README.md` and `docs/*.md` | updated |
| diagrams | the `mermaid` fences in those pages | redrawn when their text changes |
| links to source files | the page's links, pinned to the synced commit | re-pinned |
| the home page's code sample | `Controls` in `xpui-gallery`'s `gallery/src/screens.rs` | updated |
| the screenshots | `xpui-gallery`'s goldens for the X3 | updated when the goldens are blessed again |
| the device around them | `public/devices/*.webp`, Xteink's photograph, masked | the site's own file; unchanged by a sync |
| the repository cards' descriptions | the organisation profile's table | updated |
| `llms.txt` and `llms-full.txt` | the pages | regenerated |
| the sidebar's order, groups and labels | `nav.json` | **by hand** |
| the site's own words: the home page and the documentation index | `site.json` | **by hand** |

## When the gate or the build asks for something

| It says | Because | Do |
|---|---|---|
| `synced but not in nav.json` | the repository added a page | give it a place in `nav.json` — see [navigation.md](navigation.md) |
| `nav.json names pages that are not synced` | the repository removed or renamed a page | remove or rename its entry in `nav.json`, and in `site.json` if the home page names it |
| `no id "…" on that page` | a page links to a heading that was renamed | fix the link in the repository that has it, push, sync again |
| `no line starting with "fn body(&self)"` | the gallery's screen was restructured | point `site.json`'s `code.within` and `code.item` at what now holds it |
| `… is not synced — add it to sources.json` | `site.json` names a golden the sync does not copy | add the file to `xpui-gallery`'s patterns in `sources.json` |
| `diagram … still has colours` | a diagram uses a style the palette cannot hold | change the diagram in its repository, or `scripts/mermaid.json` |
| `is not on origin/main` | a source was synced with `--unpushed` | push that repository, sync again |

## The API reference

Each page's prose and examples come from the repositories as above. The per-item reference —
every type, method and trait — is rustdoc's, and lives on docs.rs once the crates are published
to crates.io; until then `xpui`'s `docs/reference.md` is the reference, and it is synced like
any other page.
