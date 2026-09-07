/**
 * Verification over dist/. Runs as a gate in the deploy workflow, so unlike
 * parity.mjs and migrate-kirby.mjs this is PERMANENT tooling — it does not get
 * deleted with the rest of the migration scaffolding.
 *
 *   node scripts/verify.mjs
 *
 * It reads scripts/expected-urls.txt (a committed fixture) rather than baseline/,
 * which is a gitignored local artifact absent in CI.
 *
 * Checks, in order of how much they'd hurt if wrong:
 *   1. URL inventory matches the expected public URL list exactly
 *   2. Every internal link and asset reference resolves to a built file
 *   3. HTML sanity: tag balance, no nested anchors, no invalid nesting
 *   4. JSON-LD parses, every page type carries the nodes it should, and no past
 *      event still advertises tickets
 *   5. canonical/og:url are extensionless and absolute
 *   6. German date formatting is present where expected
 *   7. Images: every <img> has alt and intrinsic dimensions, and the hero is not lazy
 *   8. Document structure: one <main>, one <h1>, no skipped heading level, every
 *      link resolving to a non-empty accessible name, and no dangling
 *      aria-labelledby reference
 *   9. Progressive enhancement: the reveals cannot outlive their JavaScript
 *  10. Indexing policy: exactly one noindex page, and it is the error page
 *  11. Contrast tokens: the label on the accent stays dark, accent-strong stays
 *      darker than the accent
 *  12. Deploy weight: nothing large is emitted unreferenced, and structured data
 *      does not advertise unresized originals
 *  13. Head and manifest: description + og:description on every page, a colour
 *      scheme, and an installable manifest whose icons exist
 *  14. Discovery surface: llms.txt, the feed, security.txt and the api-catalog
 *      are well formed, advertised, and not about to expire
 *  15. Script budget: the per-page JavaScript stays within its measured size,
 *      and the libraries stay out of it
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = 'dist';

let failures = 0;
let checks = 0;
const fail = (msg) => {
    failures++;
    console.log(`  ✗ ${msg}`);
};
const pass = (msg) => {
    checks++;
    console.log(`  ✓ ${msg}`);
};

function htmlFiles() {
    const out = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const f = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (e.name !== '_astro') walk(f);
            } else if (e.name.endsWith('.html')) out.push(f);
        }
    })(DIST);
    return out.sort();
}

const toUrl = (f) =>
    f === path.join(DIST, 'index.html')
        ? '/'
        : '/' +
          path
              .relative(DIST, f)
              .replace(/\.html$/, '')
              .split(path.sep)
              .join('/');

const pages = htmlFiles();
const read = (f) => fs.readFileSync(f, 'utf8');

const VOID_TAGS = new Set(['img', 'input', 'br', 'hr', 'source', 'meta', 'link', 'area']);

/**
 * Entities have to be DECODED, not blanked: /kontakt writes its mailto address as
 * numeric character references to frustrate harvesters, and treating those as
 * whitespace makes a perfectly well-named link look nameless.
 */
const ENTITIES = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    shy: '',
    copy: '©',
    ndash: '–',
    mdash: '—',
    hellip: '…',
    laquo: '«',
    raquo: '»',
    bdquo: '„',
    ldquo: '“',
    rdquo: '”',
    euro: '€',
    auml: 'ä',
    ouml: 'ö',
    uuml: 'ü',
    Auml: 'Ä',
    Ouml: 'Ö',
    Uuml: 'Ü',
    szlig: 'ß',
};

const decodeEntities = (s) =>
    s
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        // An unknown named entity is still content, so it must not decode to whitespace.
        .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (_, name) => (name in ENTITIES ? ENTITIES[name] : '\uFFFD'));

/** Visible text of an element, tags stripped and entities decoded. */
const textOf = (html) =>
    decodeEntities(html.replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Text content of the element carrying `id`, or null when no such id exists on the page.
 * Walks forward counting same-name tags rather than regex-matching to the first close tag,
 * so a heading containing a nested <span> resolves to the whole heading.
 *
 * Needed because an aria-labelledby pointing at an id that is not on the page yields an
 * EMPTY accessible name while looking perfectly correct in the markup — the failure mode
 * a presence-only check cannot see.
 */
function textById(html, id) {
    const at = html.search(new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    if (at === -1) return null;
    const open = html.lastIndexOf('<', at);
    const tag = html
        .slice(open + 1)
        .match(/^[a-zA-Z][\w-]*/)?.[0]
        ?.toLowerCase();
    if (!tag) return null;
    const openEnd = html.indexOf('>', at);
    if (openEnd === -1) return null;
    if (VOID_TAGS.has(tag)) {
        // A void element's name comes from its own attributes, not children.
        const alt = html.slice(open, openEnd + 1).match(/\salt="([^"]*)"/)?.[1];
        return alt === undefined ? '' : decodeEntities(alt).trim();
    }
    let depth = 1;
    let i = openEnd + 1;
    const scan = new RegExp(`<(/?)${tag}[\\s>/]`, 'g');
    scan.lastIndex = i;
    let m;
    while ((m = scan.exec(html))) {
        depth += m[1] ? -1 : 1;
        if (depth === 0) return textOf(html.slice(openEnd + 1, m.index));
    }
    return textOf(html.slice(openEnd + 1));
}

// ---------------------------------------------------------------- 1. inventory
console.log('\n1. URL inventory');
{
    // Read from the committed fixture, not baseline/ — baseline/ is a gitignored
    // local artifact, and this script runs as a gate in CI where it does not exist.
    const expected = fs
        .readFileSync(path.join('scripts', 'expected-urls.txt'), 'utf8')
        .split('\n')
        .map((l) => l.trim())
        .filter((u) => u && !u.startsWith('#'));
    const got = pages.map(toUrl).filter((u) => u !== '/404');
    const missing = expected.filter((u) => !got.includes(u));
    const extra = got.filter((u) => !expected.includes(u));
    if (missing.length) fail(`missing pages: ${missing.join(', ')}`);
    if (extra.length) fail(`unexpected pages: ${extra.join(', ')}`);
    if (!missing.length && !extra.length) pass(`all ${expected.length} Kirby URLs built, none extra`);
    if (fs.existsSync(path.join(DIST, '404.html'))) pass('404.html present');
    else fail('404.html missing');
    // Not expected-urls.txt: that fixture is the INDEXED PAGE inventory, compared against
    // the built HTML above, so listing a non-HTML endpoint there reports it as missing.
    // Discovery files belong in this list instead, which leaves the 57-URL invariant alone.
    for (const f of [
        'sitemap.xml',
        'robots.txt',
        'favicon.ico',
        'favicon.svg',
        'site.webmanifest',
        'ads.txt',
        'llms.txt',
        'rss.xml',
        '.well-known/security.txt',
        '.well-known/api-catalog',
    ])
        fs.existsSync(path.join(DIST, f)) ? pass(`${f} present`) : fail(`${f} missing`);
}

// ------------------------------------------------------------------- 2. links
console.log('\n2. Internal links and assets resolve');
{
    const broken = new Map();
    const resolves = (target) => {
        if (target === '/') return fs.existsSync(path.join(DIST, 'index.html'));
        const p = path.join(DIST, target);
        return fs.existsSync(p) || fs.existsSync(`${p}.html`) || fs.existsSync(path.join(p, 'index.html'));
    };
    for (const f of pages) {
        const html = read(f);
        const refs = [
            ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1]),
            ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]),
            ...[...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
        ];
        for (const raw of refs) {
            if (!raw.startsWith('/') || raw.startsWith('//')) continue; // external, mailto, tel, #, data:
            const target = raw.split(/[?#]/)[0];
            if (!resolves(target)) {
                if (!broken.has(target)) broken.set(target, []);
                broken.get(target).push(toUrl(f));
            }
        }
    }
    if (broken.size === 0) pass(`no broken internal references across ${pages.length} pages`);
    else
        for (const [target, where] of broken)
            fail(`${target} — referenced by ${where.slice(0, 3).join(', ')}${where.length > 3 ? ` +${where.length - 3}` : ''}`);
}

// -------------------------------------------------------------- 3. HTML sanity
console.log('\n3. HTML sanity');
{
    const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
    let unbalanced = 0;
    let nestedAnchors = 0;
    let badNesting = 0;

    for (const f of pages) {
        let html = read(f)
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<script[\s\S]*?<\/script>/g, '')
            .replace(/<style[\s\S]*?<\/style>/g, '')
            .replace(/<svg[\s\S]*?<\/svg>/g, '');

        const stack = [];
        for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>/g)) {
            const [, close, tag, attrs, selfClose] = m;
            const name = tag.toLowerCase();
            if (VOID.has(name) || selfClose) continue;
            if (close) {
                const i = stack.lastIndexOf(name);
                if (i === -1) unbalanced++;
                else stack.length = i;
            } else {
                if (name === 'a' && stack.includes('a')) nestedAnchors++;
                // footer/div/p are not phrasing content and must not sit inside <p>
                if (['footer', 'div', 'p', 'ul', 'ol', 'blockquote'].includes(name) && stack.includes('p')) badNesting++;
                stack.push(name);
            }
        }
        if (stack.length) unbalanced++;
    }
    unbalanced === 0 ? pass('all pages have balanced tags') : fail(`${unbalanced} page(s) with unbalanced tags`);
    nestedAnchors === 0 ? pass('no nested <a> elements') : fail(`${nestedAnchors} nested <a> element(s)`);
    badNesting === 0 ? pass('no block elements nested inside <p>') : fail(`${badNesting} block element(s) inside <p>`);
}

// ---------------------------------------------------------------- 4. JSON-LD
console.log('\n4. JSON-LD');
{
    const seen = new Map();
    let unparseable = 0;
    for (const f of pages) {
        const types = [];
        for (const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            try {
                const o = JSON.parse(m[1]);
                types.push(o['@type']);
            } catch {
                unparseable++;
                fail(`${toUrl(f)}: JSON-LD does not parse`);
            }
        }
        seen.set(toUrl(f), types);
    }
    if (!unparseable) pass('every JSON-LD block parses');

    // The blocks go out through set:html, and JSON.stringify does not escape `<` — so a
    // value containing `</script>` would close the block and the rest would be parsed as
    // markup. Seo.astro escapes it to \u003c; this asserts the escaping is still there,
    // since the values come from content and the day one of them contains a tag is the
    // day nobody is looking.
    const unescaped = [];
    for (const f of pages) {
        for (const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
            if (m[1].includes('<')) unescaped.push(toUrl(f));
        }
    }
    unescaped.length === 0
        ? pass('no JSON-LD block contains an unescaped <')
        : fail(`${unescaped.length} JSON-LD block(s) with a literal <: ${[...new Set(unescaped)].slice(0, 3).join(', ')}`);

    const count = (t) => [...seen.values()].filter((v) => v.includes(t)).length;
    const expect = { Event: 11, WebSite: 1, ContactPage: 1, WebPage: 2 };
    for (const [t, n] of Object.entries(expect)) count(t) === n ? pass(`${n}× ${t}`) : fail(`expected ${n}× ${t}, found ${count(t)}`);

    // The presence map used to assert the OPPOSITE of this: /talks, /persons and the 40
    // person pages had no JSON-LD because Kirby emitted none, and the migration matched
    // that faithfully. #1489 filled the gap, so the assertion is now positive — and
    // derived from the page inventory rather than hardcoded, so adding a talk or a person
    // does not require editing a number here.
    const personPages = [...seen].filter(([u]) => u.startsWith('/persons/'));
    const talkPages = [...seen].filter(([u]) => u.startsWith('/talks/'));

    const personMissing = personPages.filter(([, t]) => !t.includes('Person')).map(([u]) => u);
    personMissing.length === 0
        ? pass(`Person schema on all ${personPages.length} person pages`)
        : fail(`${personMissing.length} person page(s) without Person: ${personMissing.slice(0, 3).join(', ')}`);

    const crumbless = [...personPages, ...talkPages].filter(([, t]) => !t.includes('BreadcrumbList')).map(([u]) => u);
    crumbless.length === 0
        ? pass(`BreadcrumbList on all ${personPages.length + talkPages.length} detail pages`)
        : fail(`${crumbless.length} detail page(s) without BreadcrumbList: ${crumbless.slice(0, 3).join(', ')}`);

    // The index pages exist to present a list, so the list has to be in the node — and
    // as long as the page count, since an ItemList that silently drops entries is worse
    // than none.
    for (const [url, expectedCount] of [
        ['/talks', talkPages.length],
        ['/persons', personPages.length],
    ]) {
        const file = pages.find((f) => toUrl(f) === url);
        const nodes = [...read(file).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
        const collection = nodes.find((n) => n['@type'] === 'CollectionPage');
        const list = collection?.mainEntity;
        if (!collection) fail(`${url} has no CollectionPage node`);
        else if (list?.['@type'] !== 'ItemList') fail(`${url}: CollectionPage.mainEntity is not an ItemList`);
        else if (list.itemListElement?.length !== expectedCount)
            fail(`${url}: ItemList holds ${list.itemListElement?.length} of ${expectedCount} entries`);
        else pass(`${url} lists all ${expectedCount} entries as an ItemList`);
    }

    // /404 is the one page that should carry nothing: it is noindex, so there is no
    // consumer to describe it to.
    const bare = [...seen].filter(([, t]) => t.length === 0).map(([u]) => u);
    bare.length === 1 && bare[0] === '/404'
        ? pass('/404 is the only page without JSON-LD')
        : fail(`pages without JSON-LD: ${bare.join(', ') || '(none — /404 gained some?)'}`);

    // Event schema completeness
    const talkFile = pages.find((f) => toUrl(f).startsWith('/talks/'));
    const ev = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(read(talkFile))[1]);
    for (const k of [
        'name',
        'description',
        'eventStatus',
        'eventAttendanceMode',
        'location',
        'url',
        'image',
        'startDate',
        'organizer',
        'offers',
        'performer',
        'isAccessibleForFree',
        'inLanguage',
    ])
        k in ev ? pass(`Event.${k}`) : fail(`Event.${k} missing`);

    // A finished event must not still advertise tickets. Derived entirely from the
    // emitted JSON-LD — startDate is in there — so this needs no knowledge of the
    // content collection, and it keeps working as talks move into the past.
    //
    // It is deliberately one-directional: SoldOut is required once startDate has
    // passed, but an upcoming talk is not asserted to be InStock, because on a normal
    // day there are no upcoming talks and the check would have nothing to run against.
    const stale = [];
    for (const f of pages) {
        if (!toUrl(f).startsWith('/talks/')) continue;
        const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(read(f));
        if (!json) continue;
        const e = JSON.parse(json[1]);
        if (e['@type'] !== 'Event' || !e.startDate) continue;
        if (Date.parse(e.startDate) >= Date.now()) continue;
        if (e.offers?.availability !== 'https://schema.org/SoldOut') stale.push(toUrl(f));
    }
    stale.length === 0
        ? pass('every past Event advertises SoldOut, not InStock')
        : fail(`past Events still advertising tickets: ${stale.join(', ')}`);
}

// ------------------------------------------------------------- 5. canonical/og
console.log('\n5. Canonical and og:url');
{
    let bad = 0;
    for (const f of pages) {
        if (toUrl(f) === '/404') continue;
        const html = read(f);
        const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
        const ogUrl = /<meta property="og:url" content="([^"]+)"/.exec(html)?.[1];
        const want = `https://www.talk-am-pegel.de${toUrl(f) === '/' ? '/' : toUrl(f)}`;
        if (canonical !== want) {
            fail(`${toUrl(f)}: canonical is ${canonical}, expected ${want}`);
            bad++;
        }
        if (ogUrl !== want) {
            fail(`${toUrl(f)}: og:url is ${ogUrl}, expected ${want}`);
            bad++;
        }
    }
    if (!bad) pass('canonical and og:url absolute, extensionless and self-consistent on every page');
}

// ------------------------------------------------------------------- 6. dates
console.log('\n6. German date formatting');
{
    const talk = read(path.join(DIST, 'talks', 'talk-am-pegel-11-sicherheit-als-standortfaktor.html'));
    /26\. März 2026/.test(talk) ? pass('"26. März 2026" renders') : fail('German long date missing');
    /19:00 Uhr/.test(talk) ? pass('"19:00 Uhr" renders') : fail('time missing');
    // No leading-space artefact from Kirby's %e, and no English month names.
    /(January|February|March|April|May|June|July|August|September|October|November|December)/.test(talk)
        ? fail('English month name found — locale not applied')
        : pass('no English month names');
}

// ------------------------------------------------------------------ 7. images
console.log('\n7. Images');
{
    let noAlt = 0;
    let noDims = 0;
    let total = 0;
    for (const f of pages) {
        for (const m of read(f).matchAll(/<img\s[^>]*>/g)) {
            total++;
            const tag = m[0];
            if (!/\salt(=|\s|>)/.test(tag)) noAlt++;
            if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) noDims++;
        }
    }
    noAlt === 0 ? pass(`all ${total} <img> have an alt attribute`) : fail(`${noAlt}/${total} <img> without alt`);
    noDims === 0 ? pass('all <img> declare width and height') : fail(`${noDims}/${total} <img> without intrinsic dimensions`);

    // The hero backdrop is the LCP element on every page, and Thumbnail defaults to
    // lazy — so a page that loses its `lazy={false}` would silently defer its own
    // largest paint. Target the first <picture> rather than the first <img>: the
    // sticky logo bar's plain <img> comes earlier in the markup.
    let lazyHero = 0;
    let noPriority = 0;
    let missing = 0;
    for (const f of pages) {
        const hero = read(f).match(/<picture[\s\S]*?<\/picture>/)?.[0];
        if (!hero) {
            missing++;
            continue;
        }
        const img = hero.match(/<img\s[^>]*>/)?.[0] ?? '';
        if (/loading="lazy"/.test(img)) lazyHero++;
        if (!/fetchpriority="high"/.test(img)) noPriority++;
    }
    missing === 0 ? pass(`all ${pages.length} pages render a hero <picture>`) : fail(`${missing} page(s) without a hero <picture>`);
    lazyHero === 0 ? pass('no page lazy-loads its hero (LCP) image') : fail(`${lazyHero} page(s) lazy-load the LCP image`);
    noPriority === 0
        ? pass('every hero image is fetchpriority="high"')
        : fail(`${noPriority} page(s) hero image without fetchpriority="high"`);
}

// ------------------------------------------------------- 8. document structure
console.log('\n8. Document structure');
{
    let noMain = 0;
    let manyMain = 0;
    let wrongH1 = 0;
    let skipped = 0;
    let nameless = 0;
    let anchors = 0;
    let references = 0;
    let dangling = 0;

    for (const f of pages) {
        const html = read(f);

        const mains = (html.match(/<main[\s>]/g) ?? []).length;
        if (mains === 0) noMain++;
        else if (mains > 1) manyMain++;

        // Exactly one — zero leaves the page without a top-level heading, more than one
        // flattens the outline. The home page shipped two for the whole of the migration.
        if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) wrongH1++;

        // Headings must nest, not jump: h2 -> h4 leaves a hole in the outline that a
        // screen-reader user navigating by heading level cannot see past.
        let prev = 0;
        for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
            const level = Number(m[1]);
            if (prev && level > prev + 1) skipped++;
            prev = level;
        }

        // An <a> whose name is empty is unusable in a screen reader's link list. Resolve
        // the name the way the accessibility tree does, in precedence order — the mere
        // PRESENCE of aria-labelledby or aria-label is not a name: the referenced ids can
        // be absent from the page, and the attribute value can be empty.
        for (const m of html.matchAll(/<a\s[^>]*>([\s\S]*?)<\/a>/g)) {
            anchors++;
            const tag = m[0].slice(0, m[0].indexOf('>') + 1);
            const inner = m[1];

            const labelledby = tag.match(/\saria-labelledby="([^"]*)"/)?.[1];
            let name = '';

            if (labelledby !== undefined) {
                for (const id of labelledby.split(/\s+/).filter(Boolean)) {
                    const text = textById(html, id);
                    if (text === null) dangling++;
                    else name += ` ${text}`;
                }
                references += labelledby.split(/\s+/).filter(Boolean).length;
            }
            if (!name.trim()) name = tag.match(/\saria-label="([^"]*)"/)?.[1] ?? '';
            if (!name.trim()) name = textOf(inner);
            if (!name.trim()) name = inner.match(/\salt="([^"]*)"/)?.[1] ?? '';
            if (!name.trim()) name = inner.match(/\saria-label="([^"]*)"/)?.[1] ?? '';
            if (!name.trim()) name = tag.match(/\stitle="([^"]*)"/)?.[1] ?? '';

            if (!name.trim()) nameless++;
        }
    }

    noMain === 0 && manyMain === 0
        ? pass(`all ${pages.length} pages have exactly one <main>`)
        : fail(`${noMain} page(s) without <main>, ${manyMain} with more than one`);
    wrongH1 === 0 ? pass('every page has exactly one <h1>') : fail(`${wrongH1} page(s) without exactly one <h1>`);
    skipped === 0 ? pass('no page skips a heading level') : fail(`${skipped} skipped heading level(s)`);
    nameless === 0
        ? pass(`all ${anchors} <a> elements resolve to a non-empty accessible name`)
        : fail(`${nameless}/${anchors} <a> without an accessible name`);
    dangling === 0
        ? pass(`all ${references} aria-labelledby references resolve to an element on the page`)
        : fail(`${dangling}/${references} aria-labelledby references point at a missing id`);
}

// -------------------------------------------------- 9. progressive enhancement
console.log('\n9. Progressive enhancement');
{
    // The reveals hide content in CSS and reveal it with JavaScript, which is only safe
    // because the hidden state is gated on `.js` — set by an inline script in the head.
    // Break either half and content disappears for anyone whose JS does not run, which
    // no other check here can see.
    const css = fs
        .readdirSync(path.join(DIST, '_astro'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => read(path.join(DIST, '_astro', f)))
        .join('\n');

    // Matched loosely on purpose: the exact quoting and spacing of the inline script is
    // the minifier's business (compressHTML defaults to 'jsx'), not something this check
    // should pin.
    const BOOTSTRAP = /classList\s*\.\s*add\(\s*(['"`])js\1\s*\)/;
    const missingBootstrap = pages.filter((f) => !BOOTSTRAP.test(read(f)));
    missingBootstrap.length === 0
        ? pass(`all ${pages.length} pages carry the inline .js bootstrap`)
        : fail(`${missingBootstrap.length} page(s) without the inline .js bootstrap: ${missingBootstrap[0]}`);

    // Any rule that hides an .aos element must be behind the gate — and there is more
    // than one way to hide: `opacity: 0` for the fades, `scale: 0` for aos-zoom-in, which
    // collapses the element to a 0x0 box. (A translate only moves it, so it does not
    // count.) Checking opacity alone is the same gap the forced-colors rule had.
    // Tailwind compiles `scale-0` to `--tw-scale-x:0%` plus `scale:var(--tw-scale-x) …`,
    // so the literal `scale:0` never appears — match the custom property instead. This
    // check passed a mutated stylesheet until that was fixed.
    const HIDES = /opacity:\s*0(?![.\d])|--tw-scale-[xy]:\s*0(?:%|px)?(?![.\d])/;
    const ungated = [];
    for (const m of css.matchAll(/([^{}]*\.aos[^{}]*)\{([^}]*)\}/g)) {
        const [, selector, body] = m;
        if (!HIDES.test(body)) continue;
        // The forced-colors block deliberately un-hides without a gate.
        if (/forced-colors/.test(selector)) continue;
        if (!selector.includes('.js ')) ungated.push(selector.trim().slice(0, 60));
    }
    ungated.length === 0
        ? pass('every rule hiding an .aos element is gated on .js')
        : fail(`${ungated.length} ungated .aos hiding rule(s): ${ungated.join(' | ')}`);

    // Arriving through a view transition must skip the hero reveal, or the outgoing
    // page's headline crossfades into an invisible one and appears to restart.
    /\.vt-nav header \.aos/.test(css)
        ? pass('the hero reveal is suppressed on view-transition navigations')
        : fail('no .vt-nav rule — the hero will re-fade on every navigation');
}

// ------------------------------------------------------- 10. indexing policy
console.log('\n10. Indexing policy');
{
    // Every page states its policy explicitly, and exactly one page opts out: the error
    // page. It shipped `index,follow` for the whole of the migration, because Seo.astro
    // hardcoded the string with no way to override it.
    const noindexed = pages.filter((f) => /<meta name="robots"[^>]*noindex/.test(read(f)));
    const missing = pages.filter((f) => !/<meta name="robots"/.test(read(f)));
    const expected = path.join(DIST, '404.html');

    missing.length === 0
        ? pass(`all ${pages.length} pages declare a robots policy`)
        : fail(`${missing.length} page(s) with no robots meta: ${missing[0]}`);
    noindexed.length === 1 && noindexed[0] === expected
        ? pass('404.html is the only noindex page')
        : fail(
              noindexed.length === 0
                  ? '404.html is indexable — nothing declares noindex'
                  : `unexpected noindex pages: ${noindexed.filter((f) => f !== expected).join(', ') || '(404 missing from the list)'}`,
          );
    // The directory this referred to closed in 2017.
    pages.every((f) => !read(f).includes('noodp'))
        ? pass('no page still sends the dead noodp directive')
        : fail('noodp is still being emitted');
}

// ------------------------------------------------------- 11. contrast tokens
console.log('\n11. Contrast tokens');
{
    // Contrast itself needs a browser — these are the two token invariants the measured
    // ratios rest on, so a change that would quietly reintroduce a 3.29:1 button fails
    // here instead. The accent FILL is deliberately unconstrained: it is the brand
    // colour and it only has to clear the 3:1 non-text bar.
    const css = fs
        .readdirSync(path.join(DIST, '_astro'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => read(path.join(DIST, '_astro', f)))
        .join('\n');

    // The declared value of a custom property, following `var(--other)` aliases so a
    // token defined by reference — the tempting way to write accent-content, since it is
    // literally base-content — still resolves instead of reading as missing.
    const declared = (token, seen = new Set()) => {
        if (seen.has(token)) return null; // a cycle in the CSS, not our problem to resolve
        seen.add(token);
        const name = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = css.match(new RegExp(`${name}:\\s*([^;}]+)`));
        if (!m) return null;
        const value = m[1].trim();
        const alias = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/);
        if (!alias) return value;
        return declared(alias[1], seen) ?? alias[2]?.trim() ?? null;
    };

    // oklch lightness, written either as a percentage or a 0-1 number
    const lightness = (token) => {
        const value = declared(token);
        const m = value?.match(/^oklch\(\s*([0-9.]+)(%?)/);
        if (!m) return null;
        return m[2] === '%' ? Number(m[1]) / 100 : Number(m[1]);
    };

    const content = lightness('--color-accent-content');
    const accent = lightness('--color-accent');
    const strong = lightness('--color-accent-strong');

    content !== null && content < 0.5
        ? pass(`the label on the accent is dark (L=${content})`)
        : fail(
              content === null
                  ? '--color-accent-content not found'
                  : `--color-accent-content is light (L=${content}) — white on this accent measures 3.29:1`,
          );
    strong !== null && accent !== null && strong < accent
        ? pass(`--color-accent-strong is darker than the accent (L=${strong} < ${accent})`)
        : fail('--color-accent-strong is missing or not darker than --color-accent');
}

// ---------------------------------------------------------- 12. deploy weight
console.log('\n12. Deploy weight');
{
    // scripts/prune-dist.mjs runs before this and removes assets nothing references —
    // Astro emits the original of every imported image whether or not a URL is printed,
    // which was 26.5 MB of the deploy. This asserts the prune still happens: without it
    // the check fails rather than the waste quietly returning.
    const readable = /\.(html|css|js|mjs|cjs|json|webmanifest|xml|txt|svg|map)$/;
    const texts = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const f = path.join(dir, e.name);
            if (e.isDirectory()) walk(f);
            else if (readable.test(e.name)) texts.push(read(f));
        }
    })(DIST);
    const referenced = texts.join('\n');

    const assets = path.join(DIST, '_astro');
    const strays = [];
    let scanned = 0;
    (function scan(dir) {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const file = path.join(dir, e.name);
            if (e.isDirectory()) {
                scan(file);
                continue;
            }
            if (!e.isFile()) continue;
            scanned++;
            if (referenced.includes(e.name)) continue;
            const st = fs.statSync(file);
            if (st.size > 100 * 1024) strays.push(`${Math.round(st.size / 1024)} KB ${e.name}`);
        }
    })(assets);
    strays.length === 0
        ? pass(`no unreferenced asset over 100 KB among the ${scanned} files under _astro`)
        : fail(`${strays.length} unreferenced asset(s) over 100 KB — did the prune step run? ${strays[0]}`);

    // Structured data used to hand crawlers the untouched originals: 49 images, 10.8 MB,
    // the largest a 1.9 MB portrait. Derived images keep every one of them small.
    const LIMIT = 400 * 1024;
    const heavy = [];
    for (const f of pages) {
        for (const m of read(f).matchAll(/"image":\s*"[^"]*\/_astro\/([^"]+)"/g)) {
            const img = path.join(assets, m[1]);
            if (fs.existsSync(img) && fs.statSync(img).size > LIMIT) heavy.push(`${Math.round(fs.statSync(img).size / 1024)} KB ${m[1]}`);
        }
    }
    heavy.length === 0
        ? pass('every image referenced from JSON-LD is under 400 KB')
        : fail(`${heavy.length} JSON-LD image(s) over 400 KB — an unresized original? ${heavy[0]}`);
}

// ------------------------------------------------------ 13. head and manifest
console.log('\n13. Head and manifest');
{
    const attr = (html, re) => html.match(re)?.[1]?.trim() ?? '';
    const noDesc = [];
    const noOg = [];
    const noScheme = [];
    for (const f of pages) {
        const html = read(f);
        if (!attr(html, /<meta name="description" content="([^"]*)"/)) noDesc.push(toUrl(f));
        if (!attr(html, /<meta property="og:description" content="([^"]*)"/)) noOg.push(toUrl(f));
        if (!attr(html, /<meta name="color-scheme" content="([^"]*)"/)) noScheme.push(toUrl(f));
    }
    // /kontakt and /404 shipped without either for the whole of the migration, because
    // Seo.astro emits og:description only when a description is passed.
    noDesc.length === 0
        ? pass(`all ${pages.length} pages have a non-empty description`)
        : fail(`${noDesc.length} page(s) without a description: ${noDesc.join(', ')}`);
    noOg.length === 0 ? pass('all pages have og:description') : fail(`${noOg.length} page(s) without og:description: ${noOg.join(', ')}`);
    noScheme.length === 0
        ? pass('all pages declare a colour scheme')
        : fail(`${noScheme.length} page(s) without <meta name="color-scheme">`);

    // The manifest is only useful if it parses, if the icons it names exist, and if it
    // does not repeat the mistakes the spec calls out: a fullscreen display mode that
    // takes away the way back, and no maskable icon so Android crops the wordmark.
    const manifestPath = path.join(DIST, 'site.webmanifest');
    let manifest = null;
    try {
        manifest = JSON.parse(read(manifestPath));
    } catch {
        /* reported below */
    }
    if (!manifest) fail('site.webmanifest is missing or does not parse');
    else {
        // Validate the shape before reading it: a hand-edited manifest can put anything
        // in here, and an entry without a string `src` would otherwise crash this script
        // with a stack trace instead of reporting a failure.
        const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
        const malformed = icons.filter((i) => typeof i?.src !== 'string' || typeof i?.sizes !== 'string');
        const wellFormed = icons.filter((i) => typeof i?.src === 'string' && typeof i?.sizes === 'string');

        if (!Array.isArray(manifest.icons)) fail('manifest has no icons array');
        else if (malformed.length) fail(`${malformed.length} manifest icon entr(y/ies) missing a string src or sizes`);
        else pass(`manifest icons array is well formed (${icons.length} entries)`);

        const sizes = new Set(wellFormed.map((i) => i.sizes));
        const missing = wellFormed.map((i) => i.src).filter((src) => !fs.existsSync(path.join(DIST, src.replace(/^\//, ''))));
        const maskable = wellFormed.some((i) => (typeof i.purpose === 'string' ? i.purpose : '').split(/\s+/).includes('maskable'));

        sizes.has('192x192') && sizes.has('512x512')
            ? pass('manifest declares both a 192 and a 512 icon')
            : fail(`manifest icon sizes are ${[...sizes].join(', ') || '(none)'} — installability wants 192 and 512`);
        maskable ? pass('manifest ships a maskable icon') : fail('no icon with purpose "maskable" — Android will crop the wordmark');
        missing.length === 0
            ? pass(`all ${wellFormed.length} manifest icons exist in dist`)
            : fail(`manifest icon(s) not built: ${missing.join(', ')}`);

        // Chromium installs only `standalone`, `minimal-ui` or `fullscreen`, and
        // fullscreen is the mistake the spec calls out — it removes the way back. So the
        // invariant is the pair that is both installable and escapable, which rejects
        // `browser` (not installable at all) as well as fullscreen.
        const INSTALLABLE = ['standalone', 'minimal-ui'];
        INSTALLABLE.includes(manifest.display)
            ? pass(`manifest display is "${manifest.display}"`)
            : fail(`manifest display is "${manifest.display}" — expected one of ${INSTALLABLE.join(' / ')}`);

        // Relative, and pointing at a page that exists. Not pinned to exactly "/": the
        // spec's own example is "/?utm_source=pwa", to count installed launches
        // separately, and "start_url pointing to a 404" is the failure it actually warns
        // about — so resolve the path instead of matching the string.
        const startUrl = typeof manifest.start_url === 'string' ? manifest.start_url : '';
        const startPath = startUrl.split(/[?#]/)[0];
        const startTargets = startPath === '/' ? ['index.html'] : [startPath.replace(/^\//, ''), `${startPath.replace(/^\//, '')}.html`];
        const startResolves = startTargets.some((t) => fs.existsSync(path.join(DIST, t)));

        if (!startUrl.startsWith('/'))
            fail(`manifest start_url "${startUrl}" is not root-relative — it breaks on any other origin, including previews`);
        else if (!startResolves) fail(`manifest start_url "${startUrl}" does not resolve to a built page`);
        else pass(`manifest start_url "${startUrl}" is root-relative and resolves`);
    }
}

// -------------------------------------------------------- 14. discovery surface
console.log('\n14. Discovery surface');
{
    const resolves = (url) => {
        const p = url.replace(/^https:\/\/www\.talk-am-pegel\.de/, '').split(/[?#]/)[0];
        const targets = p === '/' ? ['index.html'] : [p.replace(/^\//, ''), `${p.replace(/^\//, '')}.html`];
        return targets.some((t) => fs.existsSync(path.join(DIST, t)));
    };

    // --- llms.txt: the format llmstxt.org describes, and curated rather than exhaustive
    const llms = read(path.join(DIST, 'llms.txt'));
    llms.startsWith(`# `) ? pass('llms.txt opens with an H1') : fail('llms.txt does not start with "# "');
    /^>\s+\S/m.test(llms) ? pass('llms.txt carries a blockquote summary') : fail('llms.txt has no "> summary" line');
    const llmsLinks = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
    const llmsBroken = llmsLinks.filter((u) => !resolves(u));
    llmsBroken.length === 0
        ? pass(`all ${llmsLinks.length} llms.txt links resolve`)
        : fail(`llms.txt links that do not resolve: ${llmsBroken.slice(0, 3).join(', ')}`);
    // A stale llms.txt teaches models wrong things, and the failure mode is silent: it
    // still parses, it just describes a site that no longer exists. Every talk must be in
    // it, so adding one without touching this file fails here rather than in a model.
    const talkPageCount = pages.filter((f) => toUrl(f).startsWith('/talks/')).length;
    const listedTalks = llmsLinks.filter((u) => u.includes('/talks/')).length;
    listedTalks === talkPageCount
        ? pass(`llms.txt lists all ${talkPageCount} talks`)
        : fail(`llms.txt lists ${listedTalks} of ${talkPageCount} talks — has a talk been added without updating it?`);

    // --- security.txt: RFC 9116 requires Contact and Expires, and is invalid once
    // Expires lapses. Failing 30 days out puts the reminder in the deploy gate.
    const sec = read(path.join(DIST, '.well-known', 'security.txt'));
    /^Contact:\s*\S/m.test(sec) ? pass('security.txt has a Contact') : fail('security.txt has no Contact field');
    const expires = sec.match(/^Expires:\s*(\S+)/m)?.[1];
    const days = expires ? Math.floor((Date.parse(expires) - Date.now()) / 86400000) : null;
    if (!expires) fail('security.txt has no Expires field — the file is invalid per RFC 9116 without it');
    else if (Number.isNaN(Date.parse(expires))) fail(`security.txt Expires is not a parseable timestamp: ${expires}`);
    else if (days < 0) fail(`security.txt EXPIRED ${-days} days ago (${expires}) — the file is invalid; set a new Expires`);
    else if (days < 30) fail(`security.txt expires in ${days} days (${expires}) — set a new Expires now`);
    else pass(`security.txt expires in ${days} days`);

    // --- api-catalog: RFC 9727 wants a Linkset, and every href in it has to exist
    let catalog = null;
    try {
        catalog = JSON.parse(read(path.join(DIST, '.well-known', 'api-catalog')));
    } catch {
        fail('.well-known/api-catalog does not parse as JSON');
    }
    if (catalog) {
        const entries = Array.isArray(catalog.linkset) ? catalog.linkset : [];
        const hrefs = entries.flatMap((e) =>
            Object.entries(e)
                .filter(([k]) => k !== 'anchor')
                .flatMap(([, links]) => (Array.isArray(links) ? links.map((l) => l.href) : [])),
        );
        const broken = hrefs.filter((u) => typeof u !== 'string' || !resolves(u));
        entries.length > 0 && entries.every((e) => typeof e.anchor === 'string')
            ? pass(`api-catalog is a Linkset with ${entries.length} anchored entr(y/ies)`)
            : fail('api-catalog has no linkset array, or an entry without an anchor');
        broken.length === 0
            ? pass(`all ${hrefs.length} api-catalog links resolve`)
            : fail(`api-catalog links that do not resolve: ${broken.slice(0, 3).join(', ')}`);

        // No derived values in the titles. This shipped as "Alle 57 öffentlichen URLs",
        // which is a second copy of a number that lives in sitemap.xml — and the copy
        // goes stale the moment a talk is added, silently, because the file still parses
        // and still validates. A reviewer caught it by eye; this is cheaper than a
        // reviewer. Relax it if a versioned API ever needs "OpenAPI 3.1" in a title.
        const titles = entries.flatMap((e) =>
            Object.entries(e)
                .filter(([k]) => k !== 'anchor')
                .flatMap(([, links]) => (Array.isArray(links) ? links.map((l) => l.title).filter(Boolean) : [])),
        );
        const numeric = titles.filter((t) => /\d/.test(t));
        numeric.length === 0
            ? pass(`all ${titles.length} api-catalog titles are free of derived values`)
            : fail(`api-catalog title(s) contain a number that will drift: ${numeric.join(' | ')}`);
    }

    // --- the feed. Its shape comes from the feed-hygiene spec page, and every one of
    // these has a named failure mode there: a missing self-link is flagged by both
    // validators, a GUID that changes breaks every reader's read state, a relative URL
    // inside an item resolves against the reader rather than the site, and truncating to
    // a teaser is the first listed mistake.
    const feed = read(path.join(DIST, 'rss.xml'));
    const feedItems = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    const talkCount = pages.filter((f) => toUrl(f).startsWith('/talks/')).length;

    feedItems.length === talkCount
        ? pass(`feed carries all ${talkCount} talks`)
        : fail(`feed has ${feedItems.length} items for ${talkCount} talks`);

    // CDATA sections must balance, and must never carry an escaped `]]&gt;`: entities are
    // not parsed inside CDATA, so that sequence reaches the reader as those literal
    // characters. Content containing `]]>` has to SPLIT the section instead.
    const opens = (feed.match(/<!\[CDATA\[/g) ?? []).length;
    const closes = (feed.match(/]]>/g) ?? []).length;
    const escapedInside = /<!\[CDATA\[[\s\S]*?]]&gt;[\s\S]*?]]>/.test(feed);
    opens === closes && !escapedInside
        ? pass(`feed has ${opens} balanced CDATA sections, none with an escaped ]]&gt;`)
        : fail(
              escapedInside
                  ? 'a CDATA section contains ]]&gt; — entities are not parsed inside CDATA, split the section instead'
                  : `CDATA sections do not balance: ${opens} open, ${closes} close`,
          );
    // Attribute order is not significant in XML, so match the tag and then test its
    // attributes — the first version of this check demanded rel before href and failed on
    // a feed that xmllint and a real XML parser both accepted.
    const selfLink = [...feed.matchAll(/<atom:link\b[^>]*>/g)].find(
        (m) => /rel="self"/.test(m[0]) && /href="https:\/\/[^"]+\/rss\.xml"/.test(m[0]),
    );
    selfLink ? pass('feed has an atom:link rel="self"') : fail('feed has no atom:link rel="self" pointing at its own URL');

    const feedProblems = [];
    let previousDate = Infinity;
    for (const item of feedItems) {
        const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? '';
        const guid = item.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1] ?? '';
        const pub = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? '';
        const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? '';
        const full = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] ?? '';
        if (!link.startsWith('https://')) feedProblems.push(`relative or missing link: ${link}`);
        if (guid !== link) feedProblems.push(`guid does not match link: ${guid}`);
        if (Number.isNaN(Date.parse(pub))) feedProblems.push(`unparseable pubDate: ${pub}`);
        else if (Date.parse(pub) > previousDate) feedProblems.push('items are not newest-first');
        else previousDate = Date.parse(pub);
        if (full.length < desc.length) feedProblems.push(`content:encoded shorter than description for ${link}`);
    }
    feedProblems.length === 0
        ? pass(`all ${feedItems.length} feed items are absolute, GUID-stable, dated and un-truncated`)
        : fail(`feed problems: ${feedProblems.slice(0, 3).join(' | ')}`);

    // Discovery: a feed nobody can find is a file nobody fetches.
    const undiscoverable = pages.filter((f) => !/<link rel="alternate"[^>]+application\/rss\+xml[^>]+title="[^"]+"/.test(read(f)));
    undiscoverable.length === 0
        ? pass(`all ${pages.length} pages link the feed with a title`)
        : fail(`${undiscoverable.length} page(s) without a titled rel="alternate" feed link`);

    // --- the canonicalisation rules. Like _headers, dist/_redirects is an instruction
    // file rather than output, so this only proves we asked for 308s; verify-live.sh
    // section 3 proves Cloudflare applied them, which is the half that can actually
    // regress — html_handling would silently go back to emitting 307.
    const redirects = read(path.join(DIST, '_redirects'))
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
    const permanent = redirects.filter((l) => / 308$/.test(l));
    permanent.length === redirects.length && redirects.length >= 2
        ? pass(`all ${redirects.length} redirect rules are 308 (permanent)`)
        : fail(
              redirects.length === 0
                  ? '_redirects has no rules — the canonicalisation variants fall back to html_handling 307s'
                  : `redirect rule(s) that are not 308: ${redirects.filter((l) => !/ 308$/.test(l)).join(' | ')}`,
          );

    // --- and the header that makes any of it discoverable. dist/_headers is a Cloudflare
    // instruction file, so this only proves we asked; verify-live.sh proves it applied.
    const headers = read(path.join(DIST, '_headers'));
    const rels = ['describedby', 'api-catalog', 'sitemap', 'security', 'alternate'];
    const missingRels = rels.filter((r) => !new RegExp(`rel="${r}"`).test(headers));
    missingRels.length === 0
        ? pass(`_headers advertises ${rels.join(', ')}`)
        : fail(`_headers Link header missing rel(s): ${missingRels.join(', ')}`);
}

// ----------------------------------------------------------- 15. script budget
console.log('\n15. Script budget');
{
    // What a visitor actually downloads: every <script src> a page references, brotli'd,
    // which is how it arrives. The budget is not a round number — it is the measured cost
    // plus headroom, and the failure it exists to catch is a one-line import going back
    // to the whole of a library.
    const BUDGET = 35 * 1024;
    const brotli = (f) => zlib.brotliCompressSync(read(f)).length;
    const perPage = new Map();
    for (const f of pages) {
        const refs = [...read(f).matchAll(/<script[^>]+src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
        perPage.set(
            toUrl(f),
            refs.reduce((sum, r) => sum + brotli(path.join(DIST, r.replace(/^\//, ''))), 0),
        );
    }
    const worst = [...perPage].sort((a, b) => b[1] - a[1])[0];
    worst[1] <= BUDGET
        ? pass(`heaviest page ships ${(worst[1] / 1024).toFixed(1)} kB of JS brotli (budget ${BUDGET / 1024} kB)`)
        : fail(`${worst[0]} ships ${(worst[1] / 1024).toFixed(1)} kB of JS brotli, over the ${BUDGET / 1024} kB budget`);

    const bundles = fs
        .readdirSync(path.join(DIST, '_astro'))
        .filter((f) => f.endsWith('.js'))
        .map((f) => [f, read(path.join(DIST, '_astro', f))]);

    // FlyOnUI ships 24 components; this site uses the tooltip. Importing
    // `flyonui/flyonui` instead of the per-component build pulls in all of them — 48.2 kB
    // brotli against 10.4 — so the other components' names are the fingerprint of that
    // regression. Note `flyonui/dist/tooltip.mjs` is NOT the answer: it externalises
    // @floating-ui/dom and throws at runtime.
    const others = ['HSDataTable', 'HSCarousel', 'HSSelect', 'HSComboBox', 'HSFileUpload', 'HSTreeView'];
    const leaked = bundles.flatMap(([name, code]) => others.filter((c) => code.includes(c)).map((c) => `${c} in ${name}`));
    leaked.length === 0
        ? pass('only the tooltip component of FlyOnUI is bundled')
        : fail(`the full FlyOnUI bundle is back: ${leaked.slice(0, 3).join(', ')}`);

    // BigPicture belongs in its own chunk: two pages of 58 have a gallery.
    const entry = bundles.find(([name]) => name.startsWith('Layout.astro'));
    const chunk = bundles.find(([name]) => name.startsWith('BigPicture'));
    entry && !entry[1].includes('bigPicture') && !/BigPicture\s*=/.test(entry[1]) && chunk
        ? pass('BigPicture is a separate chunk, not in the entry bundle')
        : fail('BigPicture is bundled into the entry script — it should be dynamically imported');

    const galleryPages = pages.filter((f) => read(f).includes('image-gallery')).length;
    galleryPages > 0 && galleryPages < pages.length
        ? pass(`${galleryPages} of ${pages.length} pages have a gallery, so the split earns its keep`)
        : fail(`${galleryPages} of ${pages.length} pages have a gallery — reconsider the dynamic import`);
}

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${checks} checks passed, ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
