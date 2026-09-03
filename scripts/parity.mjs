/**
 * Compares built Astro output against the Kirby baseline captured in phase 0.
 *
 *   node scripts/parity.mjs                 # all baseline URLs that exist in dist/
 *   node scripts/parity.mjs /impressum      # just these
 *   node scripts/parity.mjs --raw /kontakt  # show the normalized text, don't diff
 *
 * Dev-only; deleted with the rest of the migration scaffolding in phase 6.
 *
 * Normalization exists because a byte diff is meaningless here — several differences
 * are known, intended, or literally random. Each rule below corresponds to one.
 */

import fs from 'node:fs';
import path from 'node:path';

const BASE = 'baseline';
const DIST = 'dist';

const args = process.argv.slice(2);
const RAW = args.includes('--raw');
const only = args.filter((a) => !a.startsWith('--'));

/** '/a/b' -> 'a__b', '/' -> 'index' — the phase-0 baseline naming. */
const fileFor = (url) => (url === '/' ? 'index' : url.replace(/^\//, '').replace(/\//g, '__'));

const ENTITIES = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'",
    '&nbsp;': ' ', '&auml;': 'ä', '&ouml;': 'ö', '&uuml;': 'ü', '&Auml;': 'Ä',
    '&Ouml;': 'Ö', '&Uuml;': 'Ü', '&szlig;': 'ß', '&eacute;': 'é', '&egrave;': 'è',
    '&ndash;': '–', '&mdash;': '—', '&hellip;': '…', '&copy;': '©', '&laquo;': '«',
    '&raquo;': '»', '&bdquo;': '„', '&ldquo;': '“', '&rdquo;': '”', '&sbquo;': '‚',
    '&lsquo;': '‘', '&rsquo;': '’', '&#8209;': '‑',
};

function decodeEntities(s) {
    return s
        .replace(/&[a-zA-Z]+;|&#\d+;/g, (m) => ENTITIES[m] ?? m)
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

function normalize(html) {
    let s = html;

    // Kirby's meta-tags plugin htmlentities-encodes every umlaut; Astro escapes only
    // &<>"'. Decode both sides so the comparison is about text, not encoding.
    s = decodeEntities(s);

    // JSON-LD is compared structurally, not textually (see reportJsonLd below).
    s = s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '<!--JSONLD-->');

    // Image URLs necessarily change: Kirby served /media/<hash>/<name>-600x.jpg,
    // Astro serves /_astro/<name>.<hash>.webp. Reduce both to a marker plus the
    // width descriptor, which is the part that carries meaning.
    s = s.replace(/(?:https?:\/\/[^/"\s]+)?\/(?:media|_astro)\/[^\s"']+/g, 'IMG');
    s = s.replace(/srcset="[^"]*"/g, (m) => {
        const widths = [...m.matchAll(/(\d+)w/g)].map((x) => x[1]);
        return `srcset="${widths.join(',')}"`;
    });

    // Font asset URLs and the font-face metrics Astro adds have no Kirby counterpart.
    s = s.replace(/<style>[\s\S]*?@font-face[\s\S]*?<\/style>/g, '<!--FONTFACES-->');
    s = s.replace(/<link rel="preload"[^>]*>/g, '');

    // Hashed CSS/JS bundle names differ by construction.
    s = s.replace(/\/(?:build|_astro)\/[^"']*\.(?:css|js)/g, 'BUNDLE');
    s = s.replace(/<link rel="stylesheet"[^>]*>/g, '<!--CSS-->');
    s = s.replace(/<script[^>]*type="module"[^>]*><\/script>/g, '<!--JS-->');

    // Absolute vs root-relative internal links: Kirby emitted the full origin.
    s = s.replace(/https?:\/\/(?:127\.0\.0\.1:8000|localhost:4321|www\.talk-am-pegel\.de)/g, '');

    // Intrinsic dimensions deliberately changed: the Blade thumbnail emitted
    // height={width}, a square box on every image.
    s = s.replace(/\s(?:width|height)="\d+"/g, '');

    // Kirby's Html::email() picks &#dec; vs &#xhex; per character with random_int(),
    // so /kontakt differs on every single request. Compare the decoded address.
    s = s.replace(/mailto:[^"']+/g, (m) => decodeEntities(m));

    // Astro adds these; they carry no Kirby equivalent.
    s = s.replace(/\sdecoding="async"/g, '').replace(/\sdata-astro-[a-z-]+(?:="[^"]*")?/g, '');

    // --- known-intended differences, collapsed so real regressions stay visible ---

    // Kirby printed absolute URLs ($site->url(), asset()->url()); stripping the origin
    // above leaves href="" and src="//img/…" where Astro writes root-relative paths.
    s = s.replace(/(?:href|content)=""/g, (m) => m.replace('""', '"/"'));
    s = s.replace(/(src|href)="\/\//g, '$1="/');

    // Empty alt: Astro renders the attribute bare.
    s = s.replace(/\salt=""/g, ' alt');

    // Void-element style: the importer wrote <br />, Satteri emits <br/>, Kirby <br>.
    s = s.replace(/<(br|hr|img|source|link|meta)([^>]*?)\s*\/>/g, '<$1$2>');

    // Authored HTML comments (Kirby's templates had "<!-- timeline item -->"), which
    // are invisible. The markers this script inserts have no inner spaces, so they
    // are left alone.
    s = s.replace(/<!--\s[\s\S]*?\s-->/g, '');

    // Satteri adds github-slugger ids to Markdown headings; Kirby's block snippet
    // emitted bare <h2>/<h3>. Extra ids are harmless (they enable anchors).
    s = s.replace(/<(h[1-6]) id="[^"]*"/g, '<$1');

    // Icons: Kirby inlined the raw Remixicon path, astro-icon emits <symbol>+<use>
    // with an optimized path. Same glyph, different plumbing.
    s = s.replace(/<svg[^>]*(?:data-icon="[^"]*"|aria-hidden="true")[^>]*>[\s\S]*?<\/svg>/g, '<!--ICON-->');
    s = s.replace(/<\?xml[^>]*\?>/g, '');
    s = s.replace(/\sxmlns(?::[a-z]+)?="[^"]*"/g, '');

    // Stylesheet/script plumbing differs by construction on both sides.
    s = s.replace(/<link[^>]*rel="(?:preload|modulepreload|stylesheet)"[^>]*>/g, '<!--CSS-->');
    s = s.replace(/(<!--CSS-->\s*)+/g, '<!--CSS-->');

    // Blade's empty ternaries left stray whitespace in class lists and before the
    // closing bracket (class="… relative " >); Astro's class:list omits falsy entries.
    // Semantically identical, so normalize both sides.
    s = s.replace(/class="([^"]*)"/g, (_, c) => `class="${c.trim().replace(/\s+/g, ' ')}"`);
    s = s.replace(/\s+>/g, '>');

    // %e was space-padded in Kirby ("  3. April 2024").
    s = s.replace(/>\s+(\d{1,2}\. )/g, '>$1');

    // Whitespace: Kirby's output is newline-rich, Astro's compressHTML is 'jsx'.
    // Also trim inside text nodes, so "> Impressum <" matches ">Impressum<".
    s = s
        .replace(/>\s+</g, '><')
        .replace(/>\s+([^<\s])/g, '>$1')
        .replace(/([^>\s])\s+</g, '$1<')
        .replace(/\s+/g, ' ')
        .trim();

    // One tag per line so a diff points at something readable.
    return s.replace(/></g, '>\n<');
}

function extractJsonLd(html) {
    const out = [];
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        try {
            out.push(JSON.parse(decodeEntities(m[1])));
        } catch {
            out.push({ __unparseable: m[1].slice(0, 80) });
        }
    }
    // Normalize the deltas that are deliberate, so only structural changes show up:
    // the https @context fix, absolute-URL origin, and the OG image path.
    return JSON.parse(
        JSON.stringify(out)
            .replace(/http:\/\/schema\.org/g, 'https://schema.org')
            .replace(/https?:\/\/(?:127\.0\.0\.1:8000|localhost:4321|www\.talk-am-pegel\.de)/g, '')
            .replace(/\/(?:media|_astro)\/[^"']+/g, 'IMG')
            // Origin-stripping leaves "" where Astro writes "/".
            .replace(/"url":""/g, '"url":"/"')
            // Kirby's sameAs was missing a slash: "https://twitter.comtalkampegel".
            .replace(/https:\/\/twitter\.comtalkampegel/g, 'https://twitter.com/talkampegel')
            // eventStatus was an object, which is not how schema.org spells the enum.
            .replace(/"eventStatus":\{"@type":"EventScheduled"\}/g, '"eventStatus":"https://schema.org/EventScheduled"')
            // startDate: Kirby emitted a FIXED +0100 for every talk, because PHP's
            // default timezone was never set — wrong for the 6 events that fall in
            // CEST. The port computes the real Europe/Berlin offset per date, so the
            // offsets legitimately differ; the local wall time is what must match.
            .replace(/("startDate":"[^"+]+)[+-]\d{2}:?\d{2}"/g, '$1"')
            // `performers` is a real schema.org Event property but is superseded by
            // `performer`; the port uses the current spelling.
            .replace(/"performers":/g, '"performer":'),
    );
}

/**
 * Differences that are intended fixes, not regressions. Every entry corresponds to
 * something documented in the migration plan; a diff line matching one of these is
 * counted and suppressed so genuine changes stay visible.
 */
const ACCEPTED = [
    // The Blade head linked /icon.svg, but the file in public/ is favicon.svg — a live 404.
    [/^- <link rel="icon" href="\/icon\.svg"/, 'icon.svg 404 fixed'],
    [/^\+ <link rel="icon" href="\/favicon\.svg"/, 'icon.svg 404 fixed'],
    // Fonts API adds self-hosted @font-face plus size-adjusted fallback metrics.
    [/^\+ <!--FONTFACES-->/, 'font fallback metrics added'],
    // Kirby's description extraction filtered a block type that does not exist, so
    // every page shipped without one.
    [/^\+ <meta name="description"/, 'description added'],
    [/^\+ <meta property="og:description"/, 'og:description added'],
    // twitter:site needs the @ prefix.
    [/^- <meta name="twitter:site" content="talkampegel">/, 'twitter:site @-prefixed'],
    [/^\+ <meta name="twitter:site" content="@talkampegel">/, 'twitter:site @-prefixed'],
    // Kirby advertised 1200w/1800w descriptors for sources that small; the ladder is
    // now capped at the real source width.
    [/^[-+] <source srcset="[\d,]+"/, 'srcset ladder honest'],
    [/^[-+] <img src="IMG" srcset="[\d,]+"/, 'srcset ladder honest'],
    // The inline logo gained an accessible name, which set:html could not express.
    [/^[-+] <svg viewBox="0 0 212 40"/, 'logo aria-label added'],
    // The OG crop is always JPEG now; Kirby preserved the source mime, so the one
    // person whose portrait is a PNG emitted og:image:type image/png.
    [/^- <meta property="og:image:type" content="image\/png">/, 'og:image always jpeg'],
    [/^\+ <meta property="og:image:type" content="image\/jpeg">/, 'og:image always jpeg'],
    [/^- <meta name="twitter:title" content="Home">/, 'twitter:title matches og:title on home'],
    [/^\+ <meta name="twitter:title" content="Talk am Pegel">/, 'twitter:title matches og:title on home'],
    // One text block on talk 2 has a bare text run between two <p> elements —
    // malformed authored HTML that Kirby passed through unwrapped, so it rendered
    // without paragraph spacing. MDX wraps it in <p>, as intended.
    // Scoped to that one talk, so the same reshaping elsewhere would still be flagged.
    [
        /^[-+] <\/?p>/,
        'malformed source HTML wrapped in <p>',
        /^\/talks\/2020-02-06-talk-am-pegel-2$/,
    ],
    // Kirby's Str::excerpt() fused the last word of one paragraph into the first of
    // the next ("gerufen hat.Der Diplom-Ingenieur"); the port inserts the space.
    [/^[-+] <p class="text-base-content leading-relaxed max-w-xl">/, 'excerpt word-fusing fixed'],
    // The sticky-bar logo <img> now declares its intrinsic size; Kirby set neither
    // width nor height, leaving it without an aspect ratio.
    [/^[-+] <img src="\/img\/logo\.svg"/, 'sticky logo intrinsic size added'],
    // Stylesheet/script plumbing.
    [/^[-+] <!--CSS-->/, 'asset plumbing'],
    [/^[-+] <!--JS-->/, 'asset plumbing'],

    // Person detail pages: the Blade template called snippet('person'), but no such
    // snippet exists, so all 40 live pages render the card as an empty gap. The card
    // is restored here, so these pages legitimately gain markup. Scoped to
    // /persons/* so the same lines elsewhere would still be flagged.
    [
        /^\+ <(?:article class="p-4 w-full lg:w-1\/5|div class="h-full flex flex-col items-center|figure class="avatar|div class="size-full rounded-full"|div class="bg-neutral text-neutral-content size-full rounded-full"|div class="w-full mt-4"|h2 class="font-medium text-lg|p class="mb-4 text-base-content\/60"|div class="w-full absolute bottom-0"|span class="inline-flex"|span class="text-9xl uppercase"|a class="(?:ml-2 )?text-base-content\/50|span class="tooltip-(?:content|body)|picture>|\/picture>|\/article>|\/figure>|\/div>|\/span>|\/a>|!--ICON--)/,
        'person card restored (was rendering empty)',
        /^\/persons\/./,
    ],
];

function classify(lines, url) {
    const real = [];
    const accepted = new Map();

    // A line present on both sides but at a different position is a reorder, which
    // the naive resync reports as a +/- pair. Not a content change.
    const added = new Set(lines.filter((l) => l.trim().startsWith('+ ')).map((l) => l.trim().slice(2)));
    const removed = new Set(lines.filter((l) => l.trim().startsWith('- ')).map((l) => l.trim().slice(2)));
    const reordered = new Set([...added].filter((l) => removed.has(l)));
    for (const line of lines) {
        // diffLines indents each line, so match against the trimmed form.
        const body = line.trim().slice(2);
        if (reordered.has(body)) {
            accepted.set('tag order', (accepted.get('tag order') ?? 0) + 1);
            continue;
        }
        const hit = ACCEPTED.find(
            ([re, , when]) => re.test(line.trim()) && (!when || when.test(url)),
        );
        if (hit) accepted.set(hit[1], (accepted.get(hit[1]) ?? 0) + 1);
        else real.push(line);
    }
    return { real, accepted };
}

function diffLines(a, b) {
    const A = a.split('\n');
    const B = b.split('\n');
    const out = [];
    let i = 0;
    let j = 0;
    while (i < A.length || j < B.length) {
        if (A[i] === B[j]) {
            i++;
            j++;
            continue;
        }
        // Resync: find the next line that matches, within a small window.
        const at = B.indexOf(A[i], j);
        const bt = A.indexOf(B[j], i);
        if (at !== -1 && (bt === -1 || at - j <= bt - i)) {
            while (j < at) out.push(`  + ${B[j++]}`);
        } else if (bt !== -1) {
            while (i < bt) out.push(`  - ${A[i++]}`);
        } else {
            out.push(`  - ${A[i++]}`);
            out.push(`  + ${B[j++]}`);
        }
    }
    return out;
}

const urls = fs
    .readFileSync(path.join(BASE, 'urls.txt'), 'utf8')
    .split('\n')
    .filter((u) => u && !/\.(xml|txt)$/.test(u))
    .filter((u) => (only.length ? only.includes(u) : true));

let compared = 0;
let clean = 0;
const skipped = [];

for (const url of urls) {
    const name = fileFor(url);
    const basePath = path.join(BASE, 'html', `${name}.html`);
    // The baseline flattens paths ('a__b.html'), but `build.format: 'file'` keeps the
    // directory structure: /persons -> persons.html, /persons/x -> persons/x.html.
    const distPath = url === '/' ? path.join(DIST, 'index.html') : path.join(DIST, `${url.slice(1)}.html`);
    if (!fs.existsSync(distPath)) {
        skipped.push(url);
        continue;
    }
    if (!fs.existsSync(basePath)) {
        console.log(`?  ${url}: no baseline capture`);
        continue;
    }
    compared++;

    const kirbyRaw = fs.readFileSync(basePath, 'utf8');
    const astroRaw = fs.readFileSync(distPath, 'utf8');

    if (RAW) {
        console.log(`\n===== ${url} (kirby) =====\n${normalize(kirbyRaw)}`);
        console.log(`\n===== ${url} (astro) =====\n${normalize(astroRaw)}`);
        continue;
    }

    const { real, accepted } = classify(diffLines(normalize(kirbyRaw), normalize(astroRaw)), url);
    const kLd = JSON.stringify(extractJsonLd(kirbyRaw));
    const aLd = JSON.stringify(extractJsonLd(astroRaw));

    const acceptedNote = accepted.size
        ? `  [accepted: ${[...accepted.keys()].join('; ')}]`
        : '';

    if (!real.length && kLd === aLd) {
        clean++;
        console.log(`✓  ${url}${acceptedNote}`);
        continue;
    }
    console.log(`\n✗  ${url}  (${real.length} unexplained line(s))${acceptedNote}`);
    for (const l of real.slice(0, 40)) console.log(l);
    if (real.length > 40) console.log(`  … ${real.length - 40} more`);
    if (kLd !== aLd) {
        console.log('  JSON-LD differs:');
        console.log(`    kirby: ${kLd.slice(0, 300)}`);
        console.log(`    astro: ${aLd.slice(0, 300)}`);
    }
}

console.log(
    `\n${clean}/${compared} clean` +
        (skipped.length ? `; ${skipped.length} not built yet: ${skipped.slice(0, 6).join(' ')}${skipped.length > 6 ? ' …' : ''}` : ''),
);
