# `website`

The source of [xpui.rs](https://xpui.rs): the XPUI home page and the ten repositories'
documentation, built with Astro into static HTML with one small script.

```bash
npm ci              # install
npm run status      # what the site is behind on, per repository
npm run sync        # copy the sources from the sibling checkouts, at their pushed commits
npm run dev         # http://localhost:4321
./build-and-test.sh # the gate: what CI runs before it deploys
```

After a change in another repository, [docs/updating.md](docs/updating.md) is the path to the
live site. How the site is put together, how it is synced, what the gate checks, and how it
reaches `xpui.rs` are in [`docs/`](docs/architecture.md). The sync needs a Chromium for diagrams
and `cargo` for the device drawings.

## License

MIT — see [LICENSE](LICENSE). The font is Geist Mono, under the
[SIL Open Font License](public/fonts/OFL.txt).
