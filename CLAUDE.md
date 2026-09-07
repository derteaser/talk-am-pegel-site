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
pnpm build       # -> dist/, then prunes unreferenced assets
pnpm verify      # assert dist/ is intact (64 assertions) — also a deploy gate
pnpm verify:live # sweep the LIVE site: URLs, redirects, headers, robots.txt (38 checks)
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

    The **hero** could not be moved out of the way like that — it is the root snapshot. So the
    inline script in `Layout.astro` marks a document entered through a transition with `vt-nav`, and
    `:root.vt-nav header .aos` skips the reveal there. Without it the outgoing page's headline (at
    full opacity) crossfades into this one's (at zero) and then fades in again, which reads as the
    headline blanking out and restarting. `verify.mjs` asserts the rule still exists.

- **The reveals are gated on `.js`**, added by that same inline script. `.aos` hides content in CSS
  and reveals it with JavaScript, so ungating it means anyone whose script does not run gets a
  permanently invisible page — the spec's own listed graceful-degradation mistake. `verify.mjs`
  asserts every `.aos` hiding rule carries the gate and every page carries the bootstrap.
- **Put both the property and the duration behind `motion-safe:`.** `transition-property`'s initial
  value is `all`, so a bare `duration-1000` animates on its own: `motion-safe:transition-all` was
  restating a default and gating nothing, and the reveals ran at full length under
  `prefers-reduced-motion: reduce` for the whole life of the migration. Measure it in a browser
  (`reducedMotion: 'reduce'` and count distinct opacity values) rather than reading the classes.
- **A reveal must not start off-screen horizontally.** `aos-fade-left` used `translate-x-2/5` — 40%
  of a full-width headline — which put the hero 86px past the viewport for the first ~280ms of
  every load and flashed a horizontal scrollbar. Fixed offsets now, plus `overflow-x: clip` on
  `html` as a guard. `body`'s `overflow-x: hidden` does **not** cover this; the document still
  reported the overflow with it set.
- **`/rss.xml` exists because three spec items pointed at it, one of them circularly.**
  `machine-readable-formats` asks for a feed; `feed-discovery` and `feed-hygiene` had been graded
  N/A _because no feed existed_, which decided the question by assuming it. A series publishing
  two or three times a year is what RSS is actually for, so the feed is for readers first and
  agents second. Its shape follows the feed-hygiene page and every part earns its place:
  `atom:link rel="self"` (both validators warn without it), `<guid isPermaLink="true">` equal to
  the link and **never** changing (readers key read-state off it), RFC 822 dates, absolute URLs
  inside items, and `<content:encoded>` carrying the whole text so the feed is not a teaser.
  `lastBuildDate` is the newest talk's date, not the build time — a typo fix in the footer is not
  a content change. `_headers` types it `application/rss+xml`, because readers branch on the MIME
  type and Cloudflare would otherwise serve `.xml` as `application/xml`.
- **The CSP allows `'unsafe-eval'` deliberately, and `'unsafe-inline'` for scripts never.**
  Alpine evaluates its inline expressions with `new Function`; the alternative is
  `@alpinejs/csp`, which means registering components and rewriting every `x-data` — a
  documented decision reversed for a policy that would still need `'unsafe-inline'` for styles.
  `script-src` instead carries a **sha256 for the one inline script** on the site, so an
  injected `<script>` cannot run. `verify.mjs` recomputes that hash from `dist/` and fails with
  the replacement value if the bootstrap is edited: a stale hash blocks the script silently, and
  the only symptom is the hero's double-fade returning on navigation.
- **Fathom's beacon is an IMAGE request.** `cdn.usefathom.com` therefore has to be in `img-src`,
  not only `connect-src` — measured by watching the network, and confirmed on a preview that the
  beacon fires under the policy. A `connect-src`-only allowance loses analytics while breaking
  nothing visible, which is why `verify.mjs` asserts the origin is in `img-src` whenever the
  script is present.
- **`style-src` needs `'unsafe-inline'`**: 4-6 inline `<style>` blocks per page, plus `style`
  attributes on the logo SVG and the ticket panel. Hashing is not available — the scoped
  view-transition styles differ per page.
- **`require-trusted-types-for` is NOT set, on evidence.** The built bundles use `innerHTML`
  twice in Alpine and once in BigPicture, so enforcing it would break the reveals and the
  lightbox. Re-check that count before trying again.
- **Import `flyonui/dist/tooltip.js`, never `flyonui/flyonui` — and never the `.mjs`.** The
  site uses one of FlyOnUI's 24 JS components; the full bundle costs 48.2 kB brotli against the
  tooltip build's 10.4, and per-page JavaScript went 66.2 kB → 28.2 kB by changing that one
  import. The `.mjs` variant of the same component is a trap: it externalises
  `@floating-ui/dom`, so it builds clean, is 3 kB smaller, and throws
  `(0 , i.BN) is not a function` on every page while the tooltip silently never opens. Only
  hovering one in a real browser catches that. `verify.mjs` budgets per-page JS at 35 kB brotli
  and fails if the other components' names (`HSDataTable`, `HSCarousel`, …) reappear in the
  bundle.
- **BigPicture is dynamically imported**, because 2 of 58 pages have a gallery. It lands in its
  own 3.5 kB chunk that the other 56 never fetch — verified by watching the network, not by
  reading the bundle. `verify.mjs` asserts it stays out of the entry script.
- **The JS win here is bytes, not main-thread time.** Measured at 4× CPU throttling, median of
  five runs: long tasks were **0 ms before and after**, and `domInteractive` moved 41 ms → 34 ms.
  There was no long task to remove. Do not claim a responsiveness improvement from this change;
  the saving is transfer size on a slow connection.
- **`]]>` in feed content is SPLIT, never escaped.** Entities are not parsed inside a CDATA
  section, so `]]&gt;` reaches the reader as those five literal characters; closing the section
  after the `]]` and reopening for the `>` leaves the parsed text byte-identical. Verified
  against a real XML parser both ways. `verify.mjs` fails if a CDATA section ever contains
  `]]&gt;`, or if the sections stop balancing.
- **Machine-readable titles are English, and carry no derived values.** The `Link` header and
  the api-catalog label resources for whatever fetches them — they are not page content, so they
  stay English even though the site is German. And a title must not restate a computed fact: this
  shipped as "Alle 57 öffentlichen URLs", a second copy of a number that lives in `sitemap.xml`
  and goes stale the moment a talk is added, silently, because the file still parses and still
  validates. `verify.mjs` fails on a digit in any api-catalog title. `llms.txt` is the exception
  and stays German: it is prose about German content, and that spec page wants it readable by
  humans too.
- **`public/_redirects` beats `html_handling`, and that is not documented anywhere.**
  Cloudflare documents `_redirects` for Workers static assets (301/302/303/307/308, 2,000 static
  and 100 dynamic rules) and says redirects run before _headers_ — it says nothing about
  precedence over `html_handling`, which emits **307** for the trailing-slash and `.html`
  variants. Measured on a preview deployment: `_redirects` wins, and the two splat rules turn
  those into **308**, which is what a permanent canonicalisation should be. `/` does not match
  the trailing-slash rule, query strings survive the redirect, and all 57 indexed URLs still
  return 200 with no redirect. `verify-live.sh` section 3 now demands **308 specifically** —
  accepting any 3xx is what let the 307s go unnoticed in the first place.
- **Two platform limits are ACCEPTED, not open work** (decided on #1494, 2026-09-07). Both need
  a Worker in the request path, which this deployment deliberately does not have, and both were
  chased to the documentation before being accepted rather than assumed:

    **HTML carries no validator, so it never 304s.** Astro 7 has a route-caching API that sets
    `etag`/`lastModified`, but the docs scope it to **on-demand rendered** routes with a cache
    provider — an adapter and a Worker. For a prerendered site Astro writes files and the server
    owns validators, and Workers static assets sends none for HTML. So `/_astro/*` revalidates
    with a 304 and HTML re-fetches in full: measured at 5.8–10.7 kB brotli per repeat view, on a
    site that deploys two or three times a year. `public/_headers` says the same in its own
    comment; do not "fix" that comment back.

    **No `Redirect-By` header on the apex redirect.** Cloudflare does not apply `_headers` to
    redirect responses, and the apex→www redirect is a zone rule that never reaches this Worker.
    The header is diagnostic only — "which layer redirected me" — on the one redirect the site
    has that is not a canonicalisation.

    Revisit both only if a Worker arrives for another reason; a CSP reporting endpoint (#1487) is
    the plausible one, and then they ride along nearly free.

- **The discovery files are NOT in `scripts/expected-urls.txt`.** That fixture is the indexed
  _page_ inventory and check 1 compares it against the built HTML, so listing a non-HTML
  endpoint there reports it as missing. `/llms.txt`, `/.well-known/security.txt` and
  `/.well-known/api-catalog` live in check 1's second list, beside `sitemap.xml` and
  `robots.txt` — which leaves the 57-URL invariant exactly where it was.
- **`security.txt`'s `Expires` is a build gate, not a calendar note.** RFC 9116 requires the
  field and the file is invalid once it lapses, so `verify.mjs` fails when it is under 30 days
  out and says so. If a build starts failing with "security.txt expires in 12 days", the fix is
  to set a new date in `public/.well-known/security.txt`, not to weaken the check.
- **Two `Content-Type` overrides in `public/_headers` are load-bearing.** `/.well-known/api-catalog`
  has no extension, so it would be served as `application/octet-stream` where RFC 9727 requires
  `application/linkset+json`; and `/llms.txt` is typed `text/markdown` to match what the `Link`
  header advertises. `verify-live.sh` asserts both, because only the edge can show them.
- **JSON-LD goes out through `set:html`, so `<` must stay escaped.** `JSON.stringify` does not
  escape it, and a value containing `</script>` would close the block and turn the rest into
  markup. `Seo.astro` replaces `<` with `\u003c` — byte-identical data to a consumer — and
  `verify.mjs` fails if any emitted block contains a literal `<`. The values come from content,
  so the day one of them holds a tag is the day nobody is watching.
- **`Seo.astro` takes one JSON-LD node or an array of them**, emitting one `<script>` per node
  rather than a single array-valued block. On a talk page the **Event must come first**:
  `verify.mjs` reads the first block for its Event completeness checks and for the past-event
  `SoldOut` assertion, both of which bail out if it is not an Event.
- **Section 4's presence map is now positive, and derived.** It used to assert that `/talks`,
  `/persons` and the 40 person pages carried _no_ JSON-LD, because Kirby emitted none and the
  migration matched it. Those pages now carry `Person`, `CollectionPage`/`ItemList` and
  `BreadcrumbList`, and the counts come from the page inventory rather than literals — so adding
  a talk or a person does not require editing a number. `/404` is the one page that should carry
  nothing, and that is asserted.
- **The `BreadcrumbList` has no visible trail to match, by decision.** The spec wants both and
  lists a disagreement between them as a mistake; with no trail there is nothing to disagree
  with, but this is still half the item, chosen deliberately over a visual change to 51 pages.
  If a visible breadcrumb is ever added it must match the JSON-LD exactly — same items, same
  order, same names, same URLs — and the current page must not link to itself.
- **`color-scheme` is already set in CSS — the theme block is not dead.** FlyOnUI compiles the
  `tap` theme to `:where(:root),:root:has(input.theme-controller[value=tap]:checked),[data-theme=tap]`,
  and the leading `:where(:root)` is what makes it apply: every colour token and
  `color-scheme: light` are live, on a document with no `data-theme` attribute. A grep that
  truncates the selector makes it look scoped to `[data-theme=tap]` and therefore dead — the
  audit made exactly that mistake. Ask the browser (`getComputedStyle(document.documentElement)
.colorScheme`) before touching it. The `<meta name="color-scheme">` in `Layout.astro` is the
  other half the spec asks for: it applies before the stylesheet parses.
- **The manifest ships three icons for two reasons.** 192 and 512 are what Chromium wants for
  installability; `icon-maskable.png` exists separately because the wordmark runs nearly edge to
  edge and Android masks to a circle, so its artwork is inset to 72% on the same `#3b5883` the
  icon already uses — invisible padding. Regenerate it with sharp if the source icon changes;
  do not just resize the square one into the maskable slot. `verify.mjs` asserts both sizes, the
  maskable purpose, that every declared icon exists, that `display` is not `fullscreen`, and that
  `start_url` stays relative (an absolute one breaks every preview deployment).
- **`browserconfig.xml`, `mstile.png` and `mask-icon.svg` are gone, and should stay gone.** The
  first two were Windows 8 live tiles. `mask-icon` was Safari's pinned-tab mechanism for Safari
  9–14: Safari 15+ uses the standard `favicon.svg` instead, MDN does not document the relation at
  all, the spec's recommended five-file icon set omits it, and it is reported to override the real
  favicon in some setups. The five files that remain — `favicon.svg`, `favicon.ico`,
  `apple-touch-icon.png`, and the manifest's `icon-192.png` / `google-touch-icon.png` /
  `icon-maskable.png` — are the whole modern set.
- **Astro emits the original of every imported image**, alongside the resized variants its
  image service generates — a Vite asset import emits a file whether or not its URL is ever
  printed. On this site that was **26.5 MB of dist/, a fifth of `_astro`**, including a 6.9 MB
  PNG that no page linked. `scripts/prune-dist.mjs` deletes assets whose content-hashed name
  appears in no other file in `dist/`, and it runs inside `pnpm build` **before** `verify.mjs`,
  whose check 2 asserts every asset reference resolves — so a prune bug fails the build instead
  of shipping. `verify.mjs` also fails if anything unreferenced over 100 kB survives, which is
  how you find out the prune step was dropped.
- **Structured data must not reference `image.src`.** That is the untouched original: the talk
  pages were advertising 49 images totalling **10.8 MB** to crawlers, the largest a single 1.9 MB
  portrait. `talks/[slug].astro` runs performer portraits through `getImage()` at 800px instead
  (10.8 MB → 3.2 MB), and `verify.mjs` fails on any JSON-LD image over 400 kB.
- **Three performance items were measured and declined** — the numbers, so they need not be
  re-derived. **AVIF**: `<Picture>` takes one `quality` for all formats, so AVIF at 85 lands
  +11% at 300w, −3% at 900w against WebP — no useful win — while a cold build goes from 14s to
  118s. **Critical CSS**: the render-blocking stylesheet is 86 kB raw but **11.4 kB brotli**;
  splitting it buys nothing worth the machinery. **Speculation Rules**: Astro's hover prefetcher
  is **956 bytes brotli** (`page.*.js`), and native rules would add an inline script needing a
  CSP hash. Revisit AVIF only if Astro gains per-format quality.
- **The accent is a fill colour, not a text colour.** `--color-accent` is the brand red and is
  deliberately unchanged; white on it measures **3.29:1**, which fails AA for every button label
  here (18px, weight 500 — the large-text exemption needs 18.66px _and_ bold). So
  `--color-accent-content` is the dark base-content instead: 5.39:1, dark-on-coral. Soft buttons
  take their text from `--btn-color`, not `--btn-fg`, so that change does not reach them —
  `--color-accent-strong` exists for that one case (accent on its own 10% tint was 2.82:1, the
  worst pairing on the site; the darker red reads 5.26:1). `verify.mjs` asserts the label token
  stays dark and that accent-strong stays darker than the accent.
- **Do not measure contrast by overriding a token at runtime.** FlyOnUI derives button colours
  through registered custom properties and `color-mix()`, which Chrome resolves eagerly: injecting
  a new `--color-accent` moves the solid button and leaves the soft variant frozen at the old
  value, so a sweep of candidate colours silently reports the same number for every one of them.
  Change the token in `site.css`, rebuild, and measure the built output. Also note computed colours
  come back as `oklch()`/`oklab()` now, so parsing `rgb(...)` finds nothing — rasterise through a
  canvas instead.
- **Opacity-suffixed text below `/65` fails AA.** `text-base-content/50` measured 3.31:1 and
  `text-neutral/50` 3.07:1 on the page background; `/60` scrapes 4.51 and `/65` gives 4.74. Icons
  at `/50` are fine — non-text contrast only needs 3:1 — which is why `Person.astro`'s socials and
  the ticket glyph keep theirs.
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
