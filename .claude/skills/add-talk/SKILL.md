---
name: add-talk
description: Add a new Talk am Pegel event as an MDX content entry — frontmatter, co-located images, speaker references, and the expected-urls.txt line. Use when a new talk is announced.
disable-model-invocation: true
---

# Add a talk

This repository **is** the CMS. Adding a talk means adding one directory and opening a
pull request; Cloudflare gives the PR a preview URL, and merging to `main` deploys it.

**The directory name is the URL slug.** `src/content/talks/<slug>/index.mdx` publishes at
`/talks/<slug>`. There is no separate routing table and no way to change the URL later
without losing the indexed page, so choose the slug once and deliberately.

## 1. Gather what the schema requires

Every field below is **required** — `src/content.config.ts` has no defaults for them, and
a missing one fails `astro check` rather than rendering blank. Ask the user for anything
not supplied; do not invent values.

| Field | Notes |
| --- | --- |
| `title` | The talk's own title, without the "Talk am Pegel #N" prefix |
| `textline` | The kicker, `"Talk am Pegel #12"` — quote it, the `#` starts a YAML comment |
| `date` | Start datetime **with an explicit Europe/Berlin offset** (see step 2) |
| `locationName` | `Pegelbar` for the usual venue |
| `eventbriteUrl` | Must be a real URL — see the constraint below |
| `mainImage` | Relative path to a co-located image, `./name.jpg` |
| `attendants` | Person slugs, in the order they should appear |

Optional: `isVirtual` (default `false`), `locationUrl` (default `""`), `location`
(the geo block — **omit it entirely for a virtual event**, which is what the three
virtual talks do).

> **`eventbriteUrl` has no optional form.** The schema is `z.url()`, so you cannot create
> a talk entry before the Eventbrite listing exists. If the user needs to publish an
> announcement first, say so and offer the real fix — make it `optionalUrl` in
> `src/content.config.ts` and guard the CTA in `src/pages/talks/[slug].astro` — rather
> than committing a placeholder URL that would ship as a live broken button.

## 2. Get the date offset right

A bare local datetime is parsed in the **build machine's** timezone, which is UTC on
CI — shifting every displayed time and the Event JSON-LD `startDate`. Always write the
offset. Germany switches, so it is `+01:00` in winter and `+02:00` in summer:

```bash
node -e 'const s=process.argv[1];const p=new Intl.DateTimeFormat("en",{timeZone:"Europe/Berlin",timeZoneName:"longOffset"}).formatToParts(new Date(s+"T12:00:00Z"));console.log(p.find(x=>x.type==="timeZoneName").value.replace("GMT",""))' 2027-03-29
# => +02:00
```

Kirby got this wrong — it emitted a fixed `+0100` for all 11 talks, so 6 of them
advertised the wrong start time for years. Do not reintroduce it.

## 3. Check the speakers exist

`attendants` uses `reference('persons')`, so each entry must be an existing directory
name under `src/content/persons/`:

```bash
ls src/content/persons/ | grep -i <surname>
```

A speaker who is not there yet needs their own entry **first**, or the build fails with
an unresolved reference:

```
src/content/persons/<slug>/index.mdx      # title, subHeading, website/linkedin/xing ("" if unused), mainImage
src/content/persons/<slug>/<portrait>.jpg
```
A person entry has **no body** — frontmatter only (see any existing one). `mainImage` is
the one optional field; two persons have none and fall back to rendered initials. A new
person publishes at `/persons/<slug>`, so it needs its **own** `expected-urls.txt` line
as well as the talk's.

## 4. Create the directory

Copy `template/index.mdx` from this skill and fill it in. Images go **next to** the MDX
file, not in `public/` — they must be `import`ed so Astro can optimize them, and
`public/` is unprocessed passthrough.

Downscale anything huge on the way in; nothing renders above 1800px and the repo already
carries the cost of one 7.2MB PNG:

```bash
# long edge capped at 2400, matching what the importer did
sips -Z 2400 ~/Downloads/photo.jpg --out src/content/talks/<slug>/photo.jpg
```

**Body conventions**, in the order they matter:

- Headings are `##` (`###` for a sub-heading). Nothing uses `#` — the page title is the
  hero.
- Prose can be plain Markdown paragraphs. Existing entries carry verbatim `<p>` tags
  because the importer preserved Kirby's HTML; both render identically, so use Markdown
  in a new file and leave existing files alone rather than reformatting them.
- **GFM and smart punctuation are off.** Bare URLs are not autolinked, and quotes are not
  converted — type the German typographic quotes („…“) literally.
- Images use `<Figure src={img0} alt="…" caption="…" width="md" />`, and galleries
  `<Gallery images={[img1, img2, …]} />`. Both need an explicit `import` at the top of the
  body, and **image import numbers are per entry** — always start at `img0` in a new
  file. They are not globally unique, and making them so caused churn across seven
  unrelated talks once already.
- A blockquote must be **one single line** of explicit HTML:
  `<blockquote><p>…</p><footer>…</footer></blockquote>`. Split across lines, MDX wraps the
  text in a `<p>` and puts `<footer>` inside it — invalid nesting that `verify.mjs`
  fails on. This is also why `src/content/` is in `.prettierignore`; do not run Prettier
  over it.

## 5. Register the URL

Add `/talks/<slug>` to `scripts/expected-urls.txt`, plus a `/persons/<slug>` line for each
newly created person. Keep the file sorted (`LC_ALL=C`); `verify.mjs` compares as a set,
so order is cosmetic but the file stays readable.

Editing that file prompts for confirmation — a hook guards it, because removing a line
silently de-indexes a live page. Adding one is exactly what it expects.

## 6. Verify

```bash
pnpm check && pnpm build && pnpm verify
```

`verify.mjs` must report **PASS** with the check count risen by one (it counts the URL
inventory as a single assertion, so watch for `all N Kirby URLs built, none extra`
reflecting the new total). Then look at the page:

```bash
pnpm dev   # http://localhost:4321/talks/<slug>
```

A **future-dated** talk renders the Eventbrite signup card and the two-column layout;
a past-dated one renders full-width prose with no CTA. That branch is decided at build
time, so if you are adding an upcoming talk you are exercising code that is otherwise
dead — confirm the card, the ticket icon and the `fathom.trackGoal` button all appear.

## 7. Ship it

Open a pull request. Cloudflare attaches a preview URL; check the new page and `/talks`
there before merging. Merging to `main` deploys.
