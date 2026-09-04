---
name: verify-live
description: Sweep the production site (or a PR preview) for URL parity, redirects, cache regimes, security headers and the Cloudflare-owned robots.txt block. Use after a deploy or a Cloudflare settings change.
disable-model-invocation: true
---

# Verify the live site

`pnpm verify` proves `dist/` is correct. This proves the **edge serves it correctly** —
a different question, because everything it checks comes from outside the build:
`html_handling` in `wrangler.jsonc`, and a set of Cloudflare zone settings that are not
in this repo at all.

```bash
scripts/verify-live.sh                                   # production
scripts/verify-live.sh https://<hash>.talk-am-pegel.workers.dev   # a PR preview
```

27 checks, read-only, ~30 seconds. Exit 0 on PASS, 1 on FAIL.

Against a `workers.dev` preview it runs 24 and marks 3 as skipped (`-`), because the
apex redirect, HSTS and the managed `robots.txt` block are zone behaviours and a preview
hostname is outside the zone. That is expected, not a regression — the script detects the
host itself, so a preview run should still say PASS.

A preview run is the _only_ way to test a `public/_headers` change before it reaches
production: `dist/_headers` is an instruction file for Cloudflare rather than output, so
`verify.mjs` cannot tell whether the platform accepted it, and a typo in that file fails
silently. Run this script against the PR's preview URL.

## When to run it

- **After a deploy that changed URLs** — a new talk or person. Section 1 is the real
  check: 57 pages, all 200, none redirecting.
- **After touching `wrangler.jsonc`** — `routes`, `html_handling` and
  `not_found_handling` all change edge behaviour invisibly to the build.
- **After any Cloudflare dashboard change.** This is the main reason the script exists.
  Four things the repo cannot see live in the zone: the apex→www redirect, HSTS, the
  security-headers transform, and the managed AI-bot block that Cloudflare _prepends_ to
  `robots.txt`. That last one has silently stopped firing once already, and nothing in
  CI would have noticed.

## Reading a failure

| Failing section               | What it usually means                                                                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1, some URLs 404              | The deploy did not include them, or a slug changed. Compare against `scripts/expected-urls.txt`.                                                                                                                                                  |
| 1, a URL **redirects**        | The regression this whole repo is built to prevent. Check `trailingSlash`/`build.format` in `astro.config.mjs` and `html_handling` in `wrangler.jsonc`; all three have to agree.                                                                  |
| 2, `/talks` or `/persons` 404 | `dist/` holds both `talks.html` and a `talks/` directory. Resolution order puts the file first — no Cloudflare doc covers the collision, so treat a change here as undocumented behaviour that must be re-established empirically.                |
| 3, no 307                     | Canonicalisation is off; `.html` and trailing-slash variants would be indexable duplicates.                                                                                                                                                       |
| 4                             | The apex DNS record lost its proxied hostname. It must stay a proxied `A` record for the redirect to attach.                                                                                                                                      |
| 5, bodyless 404               | `not_found_handling` fell back to its `"none"` default.                                                                                                                                                                                           |
| 6, HTML cached                | Static HTML being cached at the edge means content changes stop appearing.                                                                                                                                                                        |
| 7, HSTS                       | A zone setting was switched off. **Do not fix this in `public/_headers`** — the zone wins, and setting a header in both places joins the values with a comma.                                                                                     |
| 7, anything else              | These come from the `/*` block in `public/_headers`, so the fix _is_ in this repo. A missing one usually means the file was mis-parsed — Cloudflare drops a malformed line and keeps the rest, so the neighbours still passing tells you nothing. |
| 8, no `Content-Signal`        | Cloudflare has stopped prepending its managed block. Re-enable the toggle in the dashboard; it is not a repo change.                                                                                                                              |

## What it deliberately does not check

- **Rendering and interactivity.** Alpine, the BigPicture lightbox, FlyOnUI tooltips and
  the scroll reveals need a browser. The Playwright MCP server is configured for that.
- **Anything requiring a non-browser user agent.** Production 403s unusual UAs, so the
  script presents a Chrome UA. A bare `curl` sweep returns 403 everywhere and reads like
  a total outage — if you probe by hand, pass `-A`.
