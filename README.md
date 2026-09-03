# Talk am Pegel

![CI](https://github.com/derteaser/talk-am-pegel-site/actions/workflows/ci.yml/badge.svg)

Event showcase website for **Talk am Pegel** — built with [Astro](https://astro.build),
[Tailwind CSS](https://tailwindcss.com) and [Alpine.js](https://alpinejs.dev), hosted on
[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/).

> Migrated from Kirby CMS 3 in September 2026. Content is authored in this repository
> as MDX — there is no CMS panel. Git history before the migration describes the old
> PHP stack.

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

- Node.js 24 (see `.nvmrc`)
- [pnpm](https://pnpm.io) 11 (pinned via `packageManager`)

## Setup

```bash
pnpm install
```

No environment file is needed.

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

Prettier, with plugins for Astro and Tailwind class sorting. See `.prettierrc.json`.

Two paths are excluded, both for real reasons — see `.prettierignore`:

- `src/components/layout/Header.astro` and `src/pages/talks/index.astro`, because
  `prettier-plugin-astro` corrupts Alpine's `x-intersect.once` when the element sits
  inside a JSX expression block, rewriting it to `x-intersectωP_once` and then failing
  to parse its own output. Re-test on plugin upgrades.
- `src/content/`, because the generated MDX has semantically significant line
  structure: blockquotes are emitted on one line so MDX does not wrap the inner text in
  a `<p>`, which would put `<footer>` inside a `<p>`. Prettier reformats them and
  reintroduces exactly that invalid nesting.

## Deployment

Hosted on **Cloudflare Workers** as static assets. Pushing to `main` triggers a
**Cloudflare Workers Build**, which builds and deploys; every pull request gets its own
preview URL. GitHub Actions does _not_ deploy — `.github/workflows/ci.yml` only runs
checks, so there is no Cloudflare API token stored in the repository.

### Workers Builds settings

These live in the Cloudflare dashboard — the **only** part of the pipeline not in
version control, so they are written down here. Path: **Workers & Pages →
`talk-am-pegel` → Settings → Builds**, then **Git Repository → Manage** to connect.

| Field                                | Value                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| Git repository                       | `derteaser/talk-am-pegel-site`                                                         |
| Production branch                    | `main`                                                                                 |
| Build command                        | `pnpm build && pnpm verify`                                                            |
| Deploy command                       | `npx wrangler deploy`                                                                  |
| Non-production branch deploy command | `npx wrangler versions upload` _(the default — this is what produces PR preview URLs)_ |
| Root directory                       | _(leave empty)_                                                                        |
| Build variables                      | _(none — see below)_                                                                   |

There is **no "build output directory" field** — that is a Pages concept. Workers takes
the asset directory from `assets.directory` in `wrangler.jsonc`.

**No build variables are set, deliberately.** `PNPM_VERSION` was considered and rejected
as unnecessary.

The build image defaults to pnpm 10.x while this repo pins `pnpm@11.25.0` via
`packageManager`, and `pnpm-workspace.yaml` uses `allowBuilds` — pnpm 11 syntax that
pnpm 10 ignores, producing `Ignored build scripts: core-js-pure, esbuild, workerd`.
**That warning is expected and harmless.** Tested directly with a genuine pnpm 10.11.1
install (packageManager pin removed, or corepack redirects to 11 and the test proves
nothing): esbuild ships prebuilt platform packages, and workerd is only needed for
`wrangler dev`, not `deploy`. Result — `dist/` is **byte-identical** to the pnpm 11
build across all 977 files, `verify.mjs` passes 37/37, and `wrangler deploy` succeeds.

Node 24 is already the build image default.

If a build variable is ever needed: it goes under **Settings → Build variables and
secrets**, not the runtime **Variables** panel (an assets-only Worker has no script, so
that panel rejects them), and not `[vars]` in `wrangler.jsonc` (runtime bindings, which
the build never sees).

**Non-production branch builds must be enabled** for pull requests to get preview URLs;
that, plus `preview_urls: true` and `workers_dev: true` in `wrangler.jsonc`, is what
makes previews work. Setting `routes` silently flips those two to `false`, so they are
declared explicitly.

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
pnpm deploy:cf   # build + verify + wrangler deploy
```

Needs `npx wrangler login` once.

### What Cloudflare provides at the zone level

Not in this repo, and not to be duplicated in `public/_headers`: HSTS, the
`X-Content-Type-Options` security-headers managed transform, the apex → `www` redirect,
and the AI-bot block that Cloudflare prepends to `robots.txt`. Setting a response header
in both places joins the values with a comma.

## License

MIT
