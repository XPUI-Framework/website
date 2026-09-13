# Deploying

`XPUI-Framework/website` is public, `main` is its branch, and `.github/workflows/ci.yml` runs the
gate on every push and pull request. On `main`, a green gate uploads the `dist/` it just checked
and deploys it to GitHub Pages. Nothing deploys from a red gate, and nothing deploys from a pull
request.

## Going live, in order

Do these in this order: the first two are why CI is red today.

### 1. Push `brand`

```bash
git -C ../brand push -u origin main
```

The site serves the mark and the favicon from files synced out of `brand`, and the sync refuses
a commit that is not on `origin/main` — a page must not point at a commit nobody else can see.
Until then, every CI run fails on `synced content matches the manifest`. `brand` may stay
private: the site carries the copies it needs.

### 2. Sync, check, commit, push

```bash
npm run sync          # records brand as pushed
./build-and-test.sh   # every stage green
git add -A && git commit && git push
```

The push runs the gate in CI. It will not deploy yet — Pages has no source — but it must be
green before the next step is worth doing.

### 3. Turn Pages on

**Settings → Pages → Build and deployment → Source: GitHub Actions.** Nothing else there; no
branch, no folder. Re-run the last workflow (Actions → the run → *Re-run all jobs*) and it
deploys. The site is then at `https://xpui-framework.github.io/website/` until the domain is set.

### 4. Verify the domain for the organisation

**Organisation settings → Pages → Add a domain → `xpui.rs`.** GitHub gives a TXT record named
`_github-pages-challenge-XPUI-Framework`; add it in Cloudflare and press verify. This stops
anyone else pointing a GitHub site at the domain later. It is optional, and worth the two minutes.

### 5. The DNS records, at Cloudflare

Create these **DNS only** — the grey cloud. GitHub issues the certificate over HTTP, and the
proxy gets in the way of that.

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `xpui-framework.github.io` |

**Leave the mail records exactly as they are, and never proxy them**: the MX records to
`mx01.mail.icloud.com` and `mx02.mail.icloud.com`, the SPF TXT with `include:icloud.com`, the
`apple-domain` TXT, and the `sig1._domainkey` CNAME. Nothing here touches them.

### 6. Set the custom domain

**Settings → Pages → Custom domain: `xpui.rs` → Save.** GitHub checks the DNS, then asks a
certificate authority for a certificate; that takes a few minutes and sometimes up to an hour.
The site also ships `public/CNAME`, which carries `xpui.rs` into every build, so a deploy can
never drop the domain.

When the certificate is ready, tick **Enforce HTTPS**.

### 7. Check it

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -L https://xpui.rs   # 200
curl -s https://xpui.rs/ | grep -c '<script'                    # 1, the theme script
curl -sI https://www.xpui.rs | grep -i '^location'              # redirects to the apex
dig +short MX xpui.rs                                           # still iCloud
```

### 8. Afterwards, if you want Cloudflare's analytics

Cloudflare counts only what it proxies. Once the certificate is issued and HTTPS is enforced:
set SSL/TLS to **Full (strict)**, then switch the A, AAAA and `www` records to **Proxied**.
Zone analytics then counts requests at the edge and adds nothing to the page.

**Leave these off, permanently.** Each injects a script into every page, which breaks the
one-script rule and which the site's own Content-Security-Policy refuses: Email Address
Obfuscation, Rocket Loader, Web Analytics' automatic setup, Zaraz, Speed Brain.

## Afterwards

- **Every later change** is the loop in [updating.md](updating.md): sync, read the diff, run the
  gate, commit, push. CI deploys what it checked.
- **If the certificate ever fails to renew** behind the proxy, switch the three records back to
  DNS only, let GitHub renew, then proxy them again.
- **Dependabot** opens dependency pull requests here. They run the same gate, so a red one is
  telling you something: `typescript` 7 cannot be merged while `@astrojs/check` asks for 5 or 6.
