# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talk am Pegel is an event/talk showcase website: a **static Astro 7** build with **Tailwind CSS 4**
(FlyOnUI theme "TAP"), **Alpine.js 3**, hosted on **Cloudflare Workers** static assets. German
language only, ~57 pages, updated two or three times a year.

Migrated from **Kirby CMS 3** (EOL) in September 2026; the PHP stack has been removed. Git history
before that describes the old setup, so treat pre-migration commits as archaeology rather than
guidance.

## Commands

```bash
pnpm dev        # Astro dev server, http://localhost:4321
pnpm build      # -> dist/
pnpm verify     # assert the output is intact (37 assertions) — also a deploy gate
pnpm check      # astro check
pnpm preview    # serve dist/
pnpm deploy:cf  # build + verify + wrangler deploy
```

`deploy:cf` is namespaced because `pnpm deploy` collides with pnpm's built-in command.

## Non-negotiable invariant: URL parity

All 57 public URLs are indexed and must keep working **without a redirect**. The whole migration was
built around this.

- `scripts/expected-urls.txt` is the guard. `scripts/verify.mjs` asserts `dist/` contains exactly
  those pages. **Removing a line is a deliberate SEO decision, not a cleanup.**
- URLs are extensionless with no trailing slash. `astro.config.mjs` sets `trailingSlash: 'never'`
  and `build.format: 'file'`; `wrangler.jsonc` sets `html_handling: "drop-trailing-slash"`. Changing
  any of those three requires re-checking every URL.
- `src/pages/sitemap.xml.ts` is hand-rolled because `@astrojs/sitemap` would emit
  `sitemap-index.xml` and change the URL robots.txt and Search Console point at.

## Architecture

```
src/content/            MDX content collections; the DIRECTORY NAME IS THE URL SLUG
  talks/<slug>/index.mdx + co-located images
  persons/<slug>/index.mdx + portrait
  pages/*.mdx           home, talks, persons, kontakt, impressum, datenschutz, error
src/content.config.ts   Zod schemas. Import `z` from 'astro/zod', NOT 'astro:content' (deprecated)
src/data/site.ts        site-wide values that were Kirby's site fields
src/pages/              routes; [slug].astro serves impressum + datenschutz
src/components/         Thumbnail, Seo, Person, PersonAvatarGroup, LatestEvent, blocks/, layout/
src/lib/                content.ts (collections, prev/next, excerpt), dates.ts, jsonld.ts, talkBody.ts
src/styles/site.css     Tailwind 4 CSS-first config + the FlyOnUI "tap" theme
src/scripts/site.ts     Alpine + @alpinejs/intersect + FlyOnUI + BigPicture
public/                 static passthrough: _headers, robots.txt, favicons, img/logo.svg
```

Images go through `Thumbnail.astro`, which wraps Astro's `<Picture>` with four presets
(`default`/`wide`/`landscape`/`square`) reproducing Kirby's srcsets. `widths` and `sizes` are
explicit — do **not** add `layout`, which auto-generates a `sizes` that is wrong for the 50vw
two-column layouts and inflates the width ladder.

Alpine is used entirely as inline attributes in markup (`x-data`, `x-intersect`, `x-transition`,
`x-cloak`); no components are registered. Alpine just needs starting once, which
`src/scripts/site.ts` does.

## Things that will trip you up

- **`astro check` needs TypeScript 6.x.** TS 7's native compiler does not expose the API it uses.
  The pin is deliberate.
- **`astro preview` daemonises and binds IPv6 only.** Use `http://localhost:4321`, not `127.0.0.1`;
  stop it with `astro preview stop`.
- **Two paths are excluded from Prettier**, both deliberately (`.prettierignore`):
  `Header.astro` and `pages/talks/index.astro`, because `prettier-plugin-astro` corrupts
  `x-intersect.once` inside JSX expression blocks; and `src/content/`, because the generated MDX
  emits blockquotes on ONE line on purpose — splitting them makes MDX wrap the inner text in a
  `<p>`, putting `<footer>` inside a `<p>`, which `verify.mjs` catches as 90 invalid nestings.
- **GFM and smart punctuation are off** (`markdown.processor` in `astro.config.mjs`). Astro 7 uses
  Satteri, not remark. GFM autolinks rewrote a URL already inside an `<a>` into nested anchors, and
  smart punctuation rewrote straight quotes in panel-authored headings.
- **`src/pages/` files starting with `_` are not routed.** A throwaway test page named `__x.astro`
  silently produces nothing.
- **A `*/` inside a comment** (e.g. writing `text-gray-*/dark:`) closes the block comment and breaks
  the Astro compile.
- **`past()` is a build-time decision** (`isPast` in `src/lib/content.ts`), where Kirby evaluated it
  per request. Every talk is currently past, so the Eventbrite branch in `talks/[slug].astro` is
  unreachable — exercise it by temporarily dating a talk into the future before changing that file.
- **Do not set HSTS in `public/_headers`.** The Cloudflare zone owns it and overrides anything set
  there. `nosniff` IS set there; its source is ambiguous, so leave it.
- **Tailwind also auto-detects sources beyond `@source`.** Deleting the Blade templates shrank the
  CSS by 57 kB (156 kB → 98 kB), because auto-detection had been generating FlyOnUI classes that
  only appeared in them.

## Content

Adding a talk means adding `src/content/talks/<slug>/index.mdx` plus its images, as a pull request
(Cloudflare gives it a preview URL). Image imports in generated MDX are numbered **per entry** so a
change to one talk does not churn others.

**This repository is the source of record.** There is no CMS.

## Verification

`scripts/verify.mjs` is the only verification tooling and it is load-bearing: it runs in CI
(`.github/workflows/ci.yml`) and as part of the Cloudflare build command, so a failure blocks the
deploy. `pnpm verify` runs it against `dist/`.

The migration-era importer and parity harness (`migrate-kirby.mjs`, `parity.mjs`) were deleted with
the PHP stack; recover them from git history if ever needed.

## Deployment

Cloudflare **Workers Builds** builds and deploys on push to `main`, and gives each pull request a
preview URL. GitHub Actions (`.github/workflows/ci.yml`) runs checks only and holds no secrets. The
dashboard build settings are documented in `README.md` — they are the only part of the pipeline not
in version control.

`wrangler.jsonc` declares `routes`, `workers_dev` and `preview_urls` explicitly: setting `routes`
silently flips the latter two to `false`, which would remove PR previews.
