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
pnpm dev         # Astro dev server, http://localhost:4321
pnpm build       # -> dist/
pnpm verify      # assert dist/ is intact (37 assertions) — also a deploy gate
pnpm verify:live # sweep the LIVE site: URLs, redirects, headers, robots.txt (20 checks)
pnpm check       # astro check
pnpm preview     # serve dist/
pnpm deploy:cf   # build + verify + wrangler deploy
```

`deploy:cf` is namespaced because `pnpm deploy` collides with pnpm's built-in command.

## Docs

`.mcp.json` registers two MCP servers at project scope, so both need approving once per
user. The **Astro Docs MCP server** (`https://mcp.docs.astro.build/mcp`) serves a live index of
the Astro documentation. **Playwright** (`npx @playwright/mcp@latest`) drives a real browser —
the only way to check the things static output cannot prove: Alpine initialising, the
BigPicture lightbox, FlyOnUI tooltips and the scroll reveals. Prefer it over recalling Astro APIs from memory —
this project runs Astro 7, and several things moved recently: Satteri replaced remark/rehype,
`compressHTML` defaults to `'jsx'`, `z` moved from `astro:content` to `astro/zod`, and the Fonts
API became stable. Project-scoped MCP servers need approving once per user.

## Non-negotiable invariant: URL parity

All 57 public URLs are indexed and must keep working **without a redirect**. The whole migration was
built around this.

- `scripts/expected-urls.txt` is the guard. `scripts/verify.mjs` asserts `dist/` contains exactly
  those pages. **Removing a line is a deliberate SEO decision, not a cleanup.** A `PreToolUse`
  hook turns every edit of that file into a confirmation prompt for exactly this reason.
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
  per request, and **there is no scheduled rebuild** — Cloudflare deploys on push and nothing else.
  `talks/[slug].astro` therefore ships *both* states and lets Alpine pick, comparing the reader's
  clock against an epoch emitted at build time, so the ticket CTA disappears when the event ends
  rather than at the next deploy. The Alpine bindings use `:class` **object** syntax deliberately:
  only that form removes classes that came from the static `class` attribute, which is what lets the
  server render the build-time state and the client take it back. The Event JSON-LD does *not*
  self-correct — a past talk advertises `SoldOut` as of the next deploy, and `verify.mjs` asserts it.
- **Do not set HSTS in `public/_headers`.** The Cloudflare zone owns it and overrides anything set
  there — setting a header in both places joins the values with a comma. `nosniff` is different:
  it survives on a `workers.dev` preview, which is outside the zone, so `public/_headers` is
  demonstrably its source. Keep it there.
- **Tailwind also auto-detects sources beyond `@source`.** Deleting the Blade templates shrank the
  CSS by 57 kB (156 kB → 98 kB), because auto-detection had been generating FlyOnUI classes that
  only appeared in them. This reaches **prose in comments and docs**, not just markup: one code
  comment happened to contain the name of FlyOnUI's toggle-switch component as an ordinary English
  verb, which generated that component's entire CSS — 4 kB, for a class no element here has ever
  used. Rewording the comment removed it. So a CSS size change after an edit that touched no
  classes is not necessarily a lost-class regression; `grep` the built CSS for the component before
  assuming either way.

  This paragraph therefore **avoids writing that component's name**, because writing it here brings
  the 4 kB straight back — this file is scanned too. Verified both ways.

## Content

Adding a talk means adding `src/content/talks/<slug>/index.mdx` plus its images, as a pull request
(Cloudflare gives it a preview URL). Image imports in generated MDX are numbered **per entry** so a
change to one talk does not churn others.

**This repository is the source of record.** There is no CMS.

## Verification

`scripts/verify.mjs` is load-bearing: it runs in CI (`.github/workflows/ci.yml`) and as part of
the Cloudflare build command, so a failure blocks the deploy. `pnpm verify` runs it against
`dist/`.

`scripts/verify-live.sh` is the other half, and answers a different question: not "is `dist/`
correct" but "does the edge serve it correctly". Everything it checks originates outside the
build — `html_handling` in `wrangler.jsonc` plus four Cloudflare zone settings that are not in
this repo (apex→www, HSTS, the security-headers transform, and the managed AI-bot block
prepended to `robots.txt`). 20 read-only checks, ~30s. Run it after a deploy that changed URLs
and after any Cloudflare dashboard change. It presents a browser user agent on purpose:
**production 403s unusual UAs**, so a bare `curl` sweep reads like a total outage.

The migration-era importer and parity harness (`migrate-kirby.mjs`, `parity.mjs`) were deleted with
the PHP stack; recover them from git history if ever needed.

## Claude Code setup

`.claude/` is committed, so the whole authoring workflow travels with the repo.

**Skills** (`/add-talk`, `/recap-talk`, `/verify-live`) are user-invocable only —
`disable-model-invocation: true` — because each one either publishes content or hits
production. They encode the two-pass life of an event page: `/add-talk` writes the
announcement, `/recap-talk` rewrites it afterwards as a report with the event photos.

**Hooks** (`.claude/settings.json`, scripts in `.claude/hooks/`):

- `PreToolUse` on `Edit|Write` → confirmation prompt when `scripts/expected-urls.txt` is
  touched. Adding a line is routine; removing one de-indexes a live page and nothing
  downstream can detect it.
- `Stop` → `pnpm build && pnpm verify`, but only when the turn changed something that
  reaches `dist/` (fingerprinted over `HEAD` *and* the working tree, so a turn that ends in
  a commit still counts). It runs with `asyncRewake`, so it costs the turn nothing and only
  interrupts on failure. ~14s warm, ~45s when `dist/` is absent.

Both hook scripts are plain bash and safe to run by hand — pipe them the payload shape
documented in their header comments.

## Deployment

Cloudflare **Workers Builds** builds and deploys on push to `main`, and gives each pull request a
preview URL. GitHub Actions (`.github/workflows/ci.yml`) runs checks only and holds no secrets. The
dashboard build settings are documented in `README.md` — they are the only part of the pipeline not
in version control.

`wrangler.jsonc` declares `routes`, `workers_dev` and `preview_urls` explicitly: setting `routes`
silently flips the latter two to `false`, which would remove PR previews.
