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
 *   4. JSON-LD parses, and the per-page presence map matches Kirby's
 *   5. canonical/og:url are extensionless and absolute
 *   6. German date formatting is present where expected
 *   7. Images: every <img> has alt and intrinsic dimensions
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
}

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${checks} checks passed, ${failures} failure(s)\n`);
process.exit(failures === 0 ? 0 : 1);
