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
 *   4. JSON-LD parses, the per-page presence map matches Kirby's, and no past event
 *      still advertises tickets
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
 */

import fs from 'node:fs';
import path from 'node:path';

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
    for (const f of ['sitemap.xml', 'robots.txt', 'favicon.ico', 'favicon.svg', 'site.webmanifest', 'ads.txt'])
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

    const count = (t) => [...seen.values()].filter((v) => v.includes(t)).length;
    const expect = { Event: 11, WebSite: 1, ContactPage: 1, WebPage: 2 };
    for (const [t, n] of Object.entries(expect)) count(t) === n ? pass(`${n}× ${t}`) : fail(`expected ${n}× ${t}, found ${count(t)}`);

    // Kirby emitted none on these; confirm we match.
    const shouldHaveNone = [...seen].filter(([u]) => u === '/talks' || u === '/persons' || u.startsWith('/persons/') || u === '/404');
    const wrong = shouldHaveNone.filter(([, t]) => t.length > 0).map(([u]) => u);
    wrong.length === 0
        ? pass(`no JSON-LD on the ${shouldHaveNone.length} pages Kirby left bare`)
        : fail(`unexpected JSON-LD on: ${wrong.join(', ')}`);

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

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${checks} checks passed, ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
