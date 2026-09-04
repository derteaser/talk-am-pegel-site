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
pnpm verify      # assert dist/ is intact (46 assertions) — also a deploy gate
pnpm verify:live # sweep the LIVE site: URLs, redirects, headers, robots.txt (20 checks)
pnpm check       # astro check
pnpm preview     # serve dist/
pnpm deploy:cf   # build + verify + wrangler deploy
```

`deploy:cf` is namespaced because `pnpm deploy` collides with pnpm's built-in command.

## Docs

`.mcp.json` registers three MCP servers at project scope, so each needs approving once per
user. The **Astro Docs MCP server** (`https://mcp.docs.astro.build/mcp`) serves a live index of
the Astro documentation. **Playwright** (`npx @playwright/mcp@latest`) drives a real browser —
the only way to check the things static output cannot prove: Alpine initialising, the
BigPicture lightbox, FlyOnUI tooltips and the scroll reveals. Prefer it over recalling Astro APIs from memory —
this project runs Astro 7, and several things moved recently: Satteri replaced remark/rehype,
`compressHTML` defaults to `'jsx'`, `z` moved from `astro:content` to `astro/zod`, and the Fonts
API became stable. Project-scoped MCP servers need approving once per user.

**The Website Specification** (`https://mcp.specification.website/mcp`, read-only, no auth) is
[specification.website](https://specification.website) as tools — `search`, `list_topics`,
`get_topic`, `get_checklist`, `get_categories`, `get_changes`, plus an `audit_url` prompt. It is
the reference for the platform-contract layer this repo cares about most: sitemaps, robots.txt,
canonicals, structured data, feeds, `.well-known/`, headers. Items carry one of four statuses —
`required`, `recommended`, `optional`, `avoid` — and the list tools return all four unless you
pass `status`. Note the documented endpoint (`specification.website/mcp/`) is a docs page and
405s on POST; the server lives on the `mcp.` subdomain, which the site's own `Link: rel="mcp"`
header advertises.

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

**View transitions are native and cross-document** — `@view-transition { navigation: auto }` in
`site.css`, no `<ClientRouter />` and not a byte of extra JavaScript, so every page still loads
normally and Alpine/FlyOnUI/BigPicture keep booting once per document. Paired elements are named with
Astro's `transition:name`, which compiles to a bare `view-transition-name` rule. A name must be
unique **per document**, and that dictates the scheme: `site-logo` and `hero-image` everywhere;
`talk-<slug>` on the `/talks` card figure, the home teaser image and the talk detail hero (that page
overrides `heroName`, so it carries no `hero-image`); `person-<slug>` on the `Person.astro` avatar.
Person pages keep the generic `hero-image` because the avatar carries their morph instead.
`PersonAvatarGroup` is deliberately unnamed — the same person recurs across several cards on
`/talks`, and duplicate names abort the whole transition.

Alpine is used entirely as inline attributes in markup (`x-data`, `x-intersect`, `x-transition`,
`x-cloak`); no components are registered. Alpine just needs starting once, which
`src/scripts/site.ts` does.

## Things that will trip you up

- **`astro check` needs TypeScript 6.x.** TS 7's native compiler does not expose the API it uses.
  The pin is deliberate.
- **`astro preview` daemonises and binds IPv6 only.** Use `http://localhost:4321`, not `127.0.0.1`;
  stop it with `astro preview stop`. It also sends `Cache-Control: no-cache`, and Chrome silently
  refuses a cross-document view transition on a `no-cache` response — the outgoing `pageswap` fires
  with a transition, the incoming `pagereveal` gets `null`. **View transitions therefore never appear
  under `pnpm preview`**, and the site is fine: production serves
  `public, max-age=0, must-revalidate`, which works. To check them locally, serve `dist/` with a
  plain static server instead.
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
  `talks/[slug].astro` therefore ships _both_ states and lets Alpine pick, comparing the reader's
  clock against an epoch emitted at build time, so the ticket CTA disappears when the event ends
  rather than at the next deploy. The Alpine bindings use `:class` **object** syntax deliberately:
  only that form removes classes that came from the static `class` attribute, which is what lets the
  server render the build-time state and the client take it back. The Event JSON-LD does _not_
  self-correct — a past talk advertises `SoldOut` as of the next deploy, and `verify.mjs` asserts it.
- **A view transition snapshots the incoming page before `IntersectionObserver` fires**, so an
  element inside an `.aos` wrapper is captured at `opacity: 0` and a shared-element morph lands on
  something invisible. Every reveal therefore sits _beside_ a named element, never above it: on
  `/talks` it is on `.card-body` rather than `.card`, `LatestEvent`'s image has none at all (nor
  `x-cloak` any more), and `Person.astro` reveals the name and socials rather than the whole
  `<article>`, so the avatar stays painted. Keep `transition:name` off anything a reveal can blank
  out — measure it: probe the incoming element's effective opacity at `pagereveal`, not just that
  the transition fired.
- **`aria-labelledby` on the repeated "Mehr erfahren" links lists the link's own id first**,
  then the card heading — `aria-labelledby="talk-x-more talk-x-title"`. The self-reference looks
  redundant and is not: naming the heading alone would drop the visible words "Mehr erfahren" out
  of the accessible name, which is what WCAG 2.5.3 (Label in Name) is about. `verify.mjs` asserts
  every link has _a_ name, so deleting the self-id would still pass — the check cannot see this.
- **`#content` lives on `<main>`**, which `Layout.astro` wraps around `<slot />`. It is the target
  of both the skip link and the hero's scroll-down arrow, and it replaced an empty
  `<span id="content">` that used to sit after the header purely as an anchor.
- **Do not set HSTS in `public/_headers`.** The Cloudflare zone owns it and overrides anything set
  there — setting a header in both places joins the values with a comma. `nosniff` is different:
  it survives on a `workers.dev` preview, which is outside the zone, so `public/_headers` is
  demonstrably its source. Keep it there.
- **Tailwind scans only `src/`, and that is deliberate.** `src/styles/site.css` imports Tailwind
  with `source(none)`, which switches off automatic source detection, leaving the single
  `@source "../**/*.{astro,ts,js,mdx,md}"` as the only supplier of class candidates. So the CSS is
  a function of the markup and nothing else — **a class written outside `src/` is not generated**.

    Detection used to scan the whole repo (minus `.gitignore` and `node_modules`), which swept up
    prose: any English word matching a FlyOnUI component name generated that component's entire CSS.
    A code comment cost 4 kB for a component no element here has ever used; the CLAUDE.md paragraph
    documenting that trap then re-added the same 4 kB by naming it; and deleting the Blade templates
    had earlier dropped 57 kB the same way. Scoping it removed a further 12.5 kB (96.5 kB → 84 kB) of
    unused FlyOnUI components — `.input`, `.select`, `.table`, `.filter`, `.validate` and friends.

    If you change the scanning again, the check that actually proves it safe is: for every class used
    in `dist/**/*.html`, assert the emitted CSS carries a rule for it, and diff `getComputedStyle`
    across the pages before and after. Size alone tells you nothing — a drop is usually dead weight,
    not a regression. (Note `@apply` resolves from the theme and is unaffected by detection, so
    `@utility blocks`' `italic` survives even though the standalone `.italic` utility is gone.)

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

**Skills** (`/add-talk`, `/recap-talk`, `/verify-live`, `/spec-audit`) are user-invocable only —
`disable-model-invocation: true` — because each one either publishes content, hits
production or opens issues. `/add-talk` and `/recap-talk` encode the two-pass life of an event
page: the first writes the announcement, the second rewrites it afterwards as a report with the
event photos. `/spec-audit` runs the site against The Website Specification and files the findings
as labelled issues; it carries the audit's scope decisions (required + recommended, i18n excluded)
and a table of the invariants above that an auditor must **not** re-report as bugs. The first pass
was 2026-09-04, tracked in issue #1495.

**Hooks** (`.claude/settings.json`, scripts in `.claude/hooks/`):

- `PreToolUse` on `Edit|Write` → confirmation prompt when `scripts/expected-urls.txt` is
  touched. Adding a line is routine; removing one de-indexes a live page and nothing
  downstream can detect it.
- `Stop` → `pnpm build && pnpm verify`, but only when the turn changed something that
  reaches `dist/` (fingerprinted over `HEAD` _and_ the working tree, so a turn that ends in
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
