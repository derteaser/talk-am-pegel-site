---
name: recap-talk
description: Turn a past Talk am Pegel entry from an announcement into a post-event report — add the recap photos and gallery, rewrite the body, and drop the stale Eventbrite CTA. Use after an event has happened.
disable-model-invocation: true
---

# Recap a talk after it happened

An event's page is written twice. Before the talk it announces it and sells tickets;
afterwards it becomes the report of what was said. This is the second pass: same
directory, same URL, new content.

Two entries in the repo are worked examples — read one before starting:

- `src/content/talks/talk-am-pegel-9-jetzt-durchstarten-deutschland-im-wettbewerb/` —
  the full shape: `##` heading, a captioned lead photo, the report, then a nine-image
  gallery.
- `src/content/talks/talk-am-pegel-11-sicherheit-als-standortfaktor/` — the minimal
  shape: heading, one photo, the report, a photo-credit line.

## Nothing about the URL changes

The slug, the directory and `/talks/<slug>` all stay as they are. **Do not touch
`scripts/expected-urls.txt`** — the page count is unchanged, and there is nothing to
add. Keep `date` at the real event datetime too; it is the sort key and the JSON-LD
`startDate`.

## Why this is time-sensitive

`isPast()` is evaluated **at build time**, not per request. There is no scheduled
rebuild — Cloudflare Workers Builds deploys on push to `main` and nothing else. So
between the event happening and this recap being merged, the live page still shows the
"Anmeldung" card and a **Ticket sichern** button for a talk that is over.

Shipping the recap is what removes it. Mention that to the user if the event was a while
ago.

## 1. Collect the footage

Photos go **next to** the MDX file, not in `public/` — they have to be `import`ed to be
optimized, and `public/` is unprocessed passthrough. Downscale on the way in; nothing
renders above 1800px:

```bash
cd src/content/talks/<slug>
for f in ~/Downloads/recap/*.jpg; do sips -Z 2400 "$f" --out "$(basename "$f")"; done
```

Keep the announcement's `mainImage` unless the user wants a real event photo there
instead — it is the hero, the OG image and the Event JSON-LD image, so swapping it
changes what social previews show.

### Video is not supported

There is no video renderer. Kirby's blueprint permitted a `video` block type but no
entry ever used one, so the port has only `Figure` (single image) and `Gallery`
(lightbox set). If the recap material includes video, stop and tell the user rather than
improvising: it needs a new `src/components/blocks/Video.astro`, and for a German site
an embedded YouTube or Vimeo player also means a `src/content/pages/datenschutz.mdx`
update, because the embed sets third-party cookies before consent. That is a feature
decision, not part of a recap.

## 2. Rewrite the body

Replace the announcement prose with the report. The structure that both precedents use:

```mdx
import Figure from '../../../components/blocks/Figure.astro';
import Gallery from '../../../components/blocks/Gallery.astro';
import img0 from './lead-photo.jpg';
import img1 from './event-1.jpg';

## A heading that says what happened

<Figure src={img0} alt="" caption="v.l.n.r.: Name, Name, Name" width="md" />

Report paragraphs…

<Gallery images={[img1, img2, img3]} />

<p><em>Foto: Credit / source</em></p>
```

Things that will bite:

- **Image imports are numbered per entry.** Continue from the highest `img` already in
  *this* file; never renumber the existing ones. The numbers are not globally unique —
  making them so once renumbered variables across seven unrelated talks.
- **A blockquote must be one single line**:
  `<blockquote><p>…</p><footer>…</footer></blockquote>`. Split over several lines, MDX
  wraps the text in a `<p>` and nests `<footer>` inside it, which `verify.mjs` fails.
  Speaker quotes in these reports are usually inline in the prose with „…“ instead.
- **GFM and smart punctuation are off.** Type „…“ literally; bare URLs are not linked.
- **`src/content/` is in `.prettierignore` on purpose.** Do not format it.
- `alt` may be `""` for a decorative photo — `verify.mjs` requires the attribute to be
  present, not non-empty — but write real alt text when the photo carries information.

## 3. Speakers who changed

Talk 11 is the precedent: Papperger cancelled and von Brandenstein stood in. `attendants`
was left exactly as announced and the substitution was explained in the prose; no person
entry was created for the stand-in.

Follow that unless the user asks otherwise. Adding a person entry is the alternative, and
it is a bigger change — a new `/persons/<slug>` URL, which does need an
`expected-urls.txt` line and shows up in the sitemap. Ask before doing it; don't decide
silently.

## 4. Verify

```bash
pnpm check && pnpm build && pnpm verify
```

`verify.mjs` must still report **PASS**, with the same check count as before — a recap
adds no pages. The assertions most likely to catch a mistake here are `all <img> have an
alt attribute`, `no block elements nested inside <p>` (the blockquote trap) and `all
pages have balanced tags`.

Then look at it:

```bash
pnpm dev   # http://localhost:4321/talks/<slug>
```

Confirm the Eventbrite card is **gone** and the prose is full-width, the lead photo
renders at the `md` width, and each gallery image opens in the BigPicture lightbox on
click.

## 5. Ship it

Open a pull request; Cloudflare gives it a preview URL. Check the talk page and `/talks`
there — the timeline card uses `mainImage` and the excerpt comes from the first text
block, so a rewritten body changes the listing too. Merging to `main` deploys.
