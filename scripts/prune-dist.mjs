/**
 * Delete emitted assets that nothing in dist/ references.
 *
 *   node scripts/prune-dist.mjs
 *
 * Astro emits the ORIGINAL file for every image imported through a content collection,
 * alongside the resized variants its image service generates. Where only the variants are
 * used — which is everywhere, since Thumbnail always goes through <Picture> — the original
 * is dead weight in the deploy: measured at 37 files and 17.2 MB on a cache-cold build,
 * a fifth of dist/_astro, including one 6.9 MB PNG. Nothing serves them and no page links
 * them; they exist because a Vite asset import emits a file whether or not its URL is
 * ever printed.
 *
 * "Referenced" means the content-hashed filename appears verbatim in some other file in
 * dist/ — HTML, CSS, JS, XML, the sitemap, the manifest, an SVG. Names are content
 * hashes, so a substring match cannot be fooled by coincidence, and anything a template
 * emits ends up in one of those outputs.
 *
 * Runs as part of `pnpm build`, BEFORE scripts/verify.mjs — whose check 2 asserts that
 * every asset reference in dist/ resolves to a file on disk. So a bug here that removed
 * something live fails the build rather than reaching production.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const ASSETS = path.join(DIST, '_astro');
const READABLE = /\.(html|css|js|mjs|cjs|json|webmanifest|xml|txt|svg|map)$/;

if (!fs.existsSync(ASSETS)) {
    console.log('prune: no dist/_astro — nothing to do');
    process.exit(0);
}

const haystack = [];
(function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (READABLE.test(entry.name)) haystack.push(fs.readFileSync(file, 'utf8'));
    }
})(DIST);
const referenced = haystack.join('\n');

let removed = 0;
let freed = 0;
const notable = [];
for (const name of fs.readdirSync(ASSETS)) {
    const file = path.join(ASSETS, name);
    const stat = fs.statSync(file);
    if (!stat.isFile()) continue;
    // Never touch what the page actually loads: only originals go unreferenced, and a
    // referenced name always appears in one of the readable outputs above.
    if (referenced.includes(name)) continue;
    if (stat.size > 200 * 1024) notable.push(`${Math.round(stat.size / 1024)} KB  ${name}`);
    fs.unlinkSync(file);
    removed++;
    freed += stat.size;
}

const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
if (removed === 0) console.log('prune: nothing unreferenced');
else {
    console.log(`prune: removed ${removed} unreferenced asset(s), freed ${mb(freed)}`);
    for (const line of notable.slice(0, 5)) console.log(`  ${line}`);
}
