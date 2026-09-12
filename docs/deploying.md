# Deploying

## How a change reaches xpui.rs

A push to `main` runs `.github/workflows/ci.yml`: `npm ci`, then `./build-and-test.sh`, then
the `dist/` that passed is uploaded and deployed to GitHub Pages. A pull request runs the gate
and deploys nothing. The actions are pinned to commit SHAs; Dependabot proposes the updates.

The site's content is whatever `content/` holds at that commit, so updating the documentation
is: run `npm run sync` against pushed sibling checkouts, read the diff, commit it.

## One-time setup

All of this is in GitHub's and Cloudflare's web interfaces; nothing here has a command.

**GitHub**

1. `XPUI-Framework/website` is public — GitHub Pages on the free plan serves public
   repositories only.
2. Settings → Pages → Source: **GitHub Actions**.
3. Organisation settings → Pages → add `xpui.rs` as a verified domain. GitHub shows a TXT
   record named `_github-pages-challenge-XPUI-Framework`; add it in Cloudflare.
4. After the first green deploy: Settings → Pages → Custom domain `xpui.rs`. Wait for the
   certificate, then tick **Enforce HTTPS**.

**Cloudflare DNS** — created **DNS only** (grey cloud) so GitHub can issue the certificate:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `xpui-framework.github.io` |

**Mail stays with iCloud.** Leave its records exactly as they are and never proxy them: the MX
records to `mx01.mail.icloud.com` and `mx02.mail.icloud.com`, the SPF TXT with
`include:icloud.com`, the `apple-domain` TXT, and the `sig1._domainkey` CNAME. `contact@` and
`conduct@xpui.rs` must exist as iCloud custom-domain addresses: every code of conduct names
them.

**Then, for analytics without a script:** SSL/TLS mode **Full (strict)**, and switch the A,
AAAA and `www` records to **Proxied**. Cloudflare's zone analytics counts requests at its
edge and adds nothing to the page.

**Leave these switched off**, because each one injects a script into every page, which breaks
the one-script rule and which the CSP refuses: Email Address Obfuscation (the footer carries
`contact@xpui.rs`), Rocket Loader, Web Analytics' automatic setup, Zaraz, Speed Brain.

## Checking it

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -L https://xpui.rs   # 200
curl -s https://xpui.rs/ | grep -c '<script'                    # 1
curl -s https://xpui.rs/ | grep -c cdn-cgi                      # 0: nothing injected
curl -sI https://www.xpui.rs | grep -i '^location'              # redirects to https://xpui.rs/
dig +short MX xpui.rs                                           # still iCloud
```

## When the certificate does not renew

GitHub renews its certificate over HTTP, which Cloudflare's proxy can get in the way of. If
Settings → Pages reports a certificate problem, switch the three records to DNS only, wait for
GitHub to renew, and proxy them again.
