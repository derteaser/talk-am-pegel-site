# Talk am Pegel

![CI](https://github.com/derteaser/talk-am-pegel-site/actions/workflows/ci.yml/badge.svg)

Event showcase website for **Talk am Pegel** — built with [Astro](https://astro.build),
[Tailwind CSS](https://tailwindcss.com) and [Alpine.js](https://alpinejs.dev), hosted on
[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/).

> **Migration in progress.** The site has been ported from Kirby CMS 3 to Astro. The
> Kirby stack is still present so the two can be diffed, and is removed in the final
> step. The "Reference Kirby site" section below covers running the old site; every
> other section describes Astro.

## Tech Stack

| Layer     | Technology                                       |
| --------- | ------------------------------------------------ |
| Framework | Astro 7 (static output)                          |
| Content   | MDX in `src/content/`, Astro content collections |
| Styling   | Tailwind CSS 4, FlyOnUI                          |
| JS        | Alpine.js 3, BigPicture (lightbox)               |
| Icons     | Remix Icon (via astro-icon)                      |
| Fonts     | Astro Fonts API, self-hosted Roboto              |
| Hosting   | Cloudflare Workers (static assets)               |
| Analytics | Fathom Analytics                                 |

## Prerequisites

- Node.js 24
- [pnpm](https://pnpm.io) 11 (pinned via `packageManager`)

For the reference Kirby site only: PHP 8.3. Note `composer.json` pins
`~8.2 || ~8.3`, so a newer local PHP will refuse to install — see below.

## Setup

```bash
pnpm install
```

No environment file is needed. `.env` exists only for the reference Kirby site.

## Development

```bash
pnpm dev       # Astro dev server, http://localhost:4321
```

## Production Build

```bash
pnpm build     # -> dist/
pnpm verify    # assert the output is intact (see below)
pnpm preview   # serve dist/ locally
```

`astro preview` daemonises and binds IPv6 only — use `http://localhost:4321`, not
`127.0.0.1`, and stop it with `astro preview stop`.

To exercise the real Cloudflare routing locally, which is what actually serves the
extensionless URLs:

```bash
npx wrangler dev --port 8788
curl -sI http://127.0.0.1:8788/talks/talk-am-pegel-11-sicherheit-als-standortfaktor
```

## Content

Content lives in `src/content/` as MDX with co-located images, one directory per entry;
the directory name **is** the URL slug. Schemas are in `src/content.config.ts`.

Adding a talk means adding `src/content/talks/<slug>/index.mdx` plus its images. Open it
as a pull request and Cloudflare will build a preview URL to check before merging.

`src/data/site.ts` holds the site-wide values (address, phone, socials, footer nav) that
used to be Kirby's site fields.

## Verification

```bash
pnpm verify
```

`scripts/verify.mjs` asserts the URL inventory against `scripts/expected-urls.txt`, that
internal links and assets resolve, HTML sanity (tag balance, no nested anchors, no block
elements inside `<p>`), that JSON-LD parses and appears on the right pages, that
`canonical`/`og:url` are absolute and extensionless, German date formatting, and that
every `<img>` has `alt` plus intrinsic dimensions.

**`scripts/expected-urls.txt` is the SEO guard.** Every line is an indexed URL. Removing
one is a deliberate decision, not a cleanup.

## Formatting

```bash
pnpm prettier --write .
```

Prettier, with plugins for Astro, PHP/Blade and Tailwind class sorting. See
`.prettierrc.json`.

**`.astro` files are excluded for now** — see `.prettierignore` for why. In short:
`prettier-plugin-astro` corrupts Alpine's `x-intersect.once` inside JSX expression
blocks, and `prettier-plugin-tailwindcss` re-sorts utility classes, which changes the
emitted class order and breaks byte comparison against the Kirby baseline. Neither
affects rendering; both are worth fixing only once that baseline is retired.

## Reference Kirby site

Kept runnable until the PHP stack is deleted, so the port can be diffed against it.
`composer.json` pins `php ~8.2 || ~8.3`, so `composer install` fails on a newer PHP —
but `vendor/`, `kirby/` and `site/plugins/` are already installed, so Composer is not
needed:

```bash
"$HOME/Library/Application Support/Herd/bin/php83" -S 127.0.0.1:8000 -t public kirby/router.php
```

Set `APP_DEBUG=false` in `.env` before capturing a comparison baseline, or the robots-txt
plugin serves `disallow: /`. Restore it afterwards.

`scripts/parity.mjs` diffs the built output against a captured baseline, classifying
differences against an allowlist of intended fixes. Both it and `scripts/migrate-kirby.mjs`
are one-shot migration tooling and go away with the PHP stack; `scripts/verify.mjs` stays,
because it runs as a deploy gate.

## Deployment

Hosted on **Cloudflare Workers** as static assets. Pushing to `main` triggers a
**Cloudflare Workers Build**, which builds and deploys; every pull request gets its own
preview URL. GitHub Actions does *not* deploy — `.github/workflows/ci.yml` only runs
checks, so there is no Cloudflare API token stored in the repository.

### Workers Builds settings

These live in the Cloudflare dashboard (Workers & Pages → `talk-am-pegel` → Settings →
Builds) and are the **only** part of the pipeline not in version control, so they are
written down here:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build && pnpm verify` |
| Deploy command | `npx wrangler deploy` |
| Build output directory | *(leave empty — `wrangler.jsonc` sets `assets.directory`)* |
| `PNPM_VERSION` | `11.25.0` |

`PNPM_VERSION` matters: the build image defaults to pnpm 10.x, and this repo pins
`pnpm@11.25.0` via `packageManager`. Node 24 is already the build image default.

`pnpm verify` runs `scripts/verify.mjs`, which asserts that all 57 public URLs exist,
internal links resolve, `canonical`/`og:url` are extensionless, and the JSON-LD is
intact. Because it is part of the build command, a failure blocks the deploy.

### Routing

`wrangler.jsonc` sets `html_handling: "drop-trailing-slash"`, which is what serves the
extensionless URLs (`/talks/<slug>`) from `talks/<slug>.html` at 200 with no redirect.
Do not change it without re-checking every URL — the entire migration was built around
preserving them. `not_found_handling: "404-page"` serves `dist/404.html`.

### Deploying by hand

```bash
pnpm deploy   # build + verify + wrangler deploy
```

Needs `npx wrangler login` once.

### What Cloudflare provides at the zone level

Not in this repo, and not to be duplicated in `static/_headers`: HSTS, the
`X-Content-Type-Options` security-headers managed transform, the apex → `www` redirect,
and the AI-bot block that Cloudflare prepends to `robots.txt`. Setting a response header
in both places joins the values with a comma.

## License

MIT
