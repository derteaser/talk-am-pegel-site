/**
 * One-shot importer: Kirby 3 flat-file content -> Astro content collections.
 *
 * Run once, commit the output, then delete this script (migration phase 6).
 *
 *   node scripts/migrate-kirby.mjs --dry-run
 *   node scripts/migrate-kirby.mjs
 *
 * Why this is more than a file copy:
 *
 *  - Kirby stores references in FOUR dialects, mixed across the same fields:
 *    `file://<uuid>`, `page://<uuid>`, a bare filename (`mronz_michael.jpg`), and a
 *    page path (`persons/joerg-geerlings`). Eleven images have no `.txt` sidecar and
 *    therefore no UUID at all, and one talk has no `Uuid:` field, so a UUID-only
 *    resolver would silently drop content. Hence two passes: index everything, then
 *    convert.
 *  - One field is a YAML folded scalar (`- >\n  name.jpg`), so list values must go
 *    through a real YAML parser rather than a regex.
 *  - Rich text is a JSON array of Kirby "blocks", not Markdown.
 *
 * Everything is asserted at the end; the script exits non-zero rather than leaving a
 * half-migrated tree behind.
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import sharp from 'sharp';

const SRC = 'kirby-content';
const OUT_CONTENT = 'src/content';
const DRY = process.argv.includes('--dry-run');

/** Nothing is displayed above 1800px; cap originals so the repo and build stay sane. */
const MAX_IMAGE_WIDTH = 2400;

/** Kirby page dir -> Astro `pages` collection entry id. */
const SINGLETONS = {
    home: 'home',
    talks: 'talks',
    persons: 'persons',
    kontakt: 'kontakt',
    impressum: 'impressum',
    datenschutz: 'datenschutz',
    error: 'error',
};

const problems = [];
const notes = [];

// ---------------------------------------------------------------- .txt parsing

/**
 * Mirrors Kirby\Data\Txt::decode. Fields are separated by a line of four dashes;
 * keys are normalised the way Kirby does (`Main-image` -> `main_image`), which is
 * what the blueprints and templates refer to.
 */
function parseTxt(raw) {
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    const out = {};
    for (const chunk of raw.split(/\n----\s*\n*/)) {
        const i = chunk.indexOf(':');
        // Kirby uses `if ($pos = strpos(...))`, which is falsy at 0 — a chunk that
        // starts with ':' is skipped, not treated as an empty key.
        if (i <= 0) continue;
        const key = chunk.slice(0, i).trim().toLowerCase().replace(/[- ]/g, '_');
        if (!key) continue;
        out[key] = chunk.slice(i + 1).trim();
    }
    return out;
}

/** Parse a Kirby list field (pages/files) into trimmed string entries. */
function parseList(value) {
    if (!value || !value.trim()) return [];
    const parsed = YAML.parse(value);
    if (parsed == null) return [];
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map((v) => String(v).trim()).filter(Boolean);
}

// ------------------------------------------------------------------ dates

const IMAGE_RE = /\.(jpe?g|png)$/i;

function berlinOffsetMinutes(instantMs) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Berlin',
        timeZoneName: 'longOffset',
    }).formatToParts(new Date(instantMs));
    const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
    if (!m) return 0;
    return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/**
 * "2026-03-26 19:00:00" -> "2026-03-26T19:00:00+01:00".
 *
 * The offset must be explicit: `z.coerce.date()` on a bare "YYYY-MM-DD HH:mm" would
 * be parsed in the BUILD MACHINE's zone (UTC on CI), shifting every displayed time.
 * Production emits +0100 for CET dates, so this matches rather than changes.
 */
function berlinIso(wall) {
    const [datePart, timeRaw = '00:00:00'] = wall.trim().split(/\s+/);
    const timePart = timeRaw.length === 5 ? `${timeRaw}:00` : timeRaw;
    const [Y, M, D] = datePart.split('-').map(Number);
    const [h, mi, s] = timePart.split(':').map(Number);
    const asIfUtc = Date.UTC(Y, M - 1, D, h, mi, s || 0);
    // Two rounds: the first offset guess can be wrong right at a DST boundary.
    let off = berlinOffsetMinutes(asIfUtc);
    off = berlinOffsetMinutes(asIfUtc - off * 60000);
    const sign = off >= 0 ? '+' : '-';
    const abs = Math.abs(off);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${datePart}T${timePart}${sign}${hh}:${mm}`;
}

// -------------------------------------------------------------- pass 1: index

/** uuid -> { dir, filename } for image sidecars. */
const fileByUuid = new Map();
/** uuid -> kirby page dir, relative to SRC. */
const pageByUuid = new Map();
/** kirby page dir -> { collection, id } */
const pageTarget = new Map();
/** kirby page dir -> Set(image filenames present on disk) */
const imagesByDir = new Map();

function relDir(abs) {
    return path.relative(SRC, abs).split(path.sep).join('/');
}

function walk(dir, onFile) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '.git') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, onFile);
        else onFile(full);
    }
}

function buildIndex() {
    walk(SRC, (full) => {
        const dir = relDir(path.dirname(full));
        const base = path.basename(full);

        if (IMAGE_RE.test(base)) {
            if (!imagesByDir.has(dir)) imagesByDir.set(dir, new Set());
            imagesByDir.get(dir).add(base);
            return;
        }
        if (!base.endsWith('.txt')) return;

        const fields = parseTxt(fs.readFileSync(full, 'utf8'));
        const sidecarFor = base.replace(/\.txt$/, '');

        if (IMAGE_RE.test(sidecarFor)) {
            if (fields.uuid) fileByUuid.set(fields.uuid, { dir, filename: sidecarFor });
        } else if (fields.uuid) {
            pageByUuid.set(fields.uuid, dir);
        }
    });

    // Map every Kirby page dir to its destination collection + id.
    for (const [dir] of imagesByDir) void dir;
    for (const dir of listPageDirs()) {
        if (dir.startsWith('talks/0_')) {
            pageTarget.set(dir, { collection: 'talks', id: dir.slice('talks/0_'.length) });
        } else if (dir.startsWith('persons/') && dir !== 'persons') {
            pageTarget.set(dir, { collection: 'persons', id: dir.slice('persons/'.length) });
        } else if (SINGLETONS[dir]) {
            pageTarget.set(dir, { collection: 'pages', id: SINGLETONS[dir] });
        }
    }
}

function listPageDirs() {
    const dirs = new Set();
    walk(SRC, (full) => {
        const base = path.basename(full);
        if (!base.endsWith('.txt') || IMAGE_RE.test(base.replace(/\.txt$/, ''))) return;
        dirs.add(relDir(path.dirname(full)));
    });
    return [...dirs];
}

// ----------------------------------------------------------------- resolvers

/** `page://uuid` | `persons/slug` | `kontakt` -> { collection, id } */
function resolvePageRef(ref, context) {
    const raw = String(ref).trim();
    const dir = raw.startsWith('page://') ? pageByUuid.get(raw.slice(7)) : raw;
    if (!dir) {
        problems.push(`${context}: unresolved page ref ${raw} (unknown uuid)`);
        return null;
    }
    const target = pageTarget.get(dir);
    if (!target) {
        problems.push(`${context}: page ref ${raw} -> "${dir}" is not a known page`);
        return null;
    }
    return target;
}

/** `file://uuid` | `name.jpg` -> filename, scoped to the owning page dir. */
function resolveFileRef(ref, ownerDir, context) {
    const raw = String(ref).trim();
    if (raw.startsWith('file://')) {
        const hit = fileByUuid.get(raw.slice(7));
        if (!hit) {
            problems.push(`${context}: unresolved file ref ${raw} (unknown uuid)`);
            return null;
        }
        if (hit.dir !== ownerDir) {
            // Never happens in this dataset, but a cross-page image reference would
            // break the co-located image layout, so fail loudly rather than guess.
            problems.push(`${context}: file ${raw} lives in "${hit.dir}", not "${ownerDir}"`);
            return null;
        }
        return hit.filename;
    }
    if (imagesByDir.get(ownerDir)?.has(raw)) return raw;
    problems.push(`${context}: file "${raw}" not found in ${ownerDir}`);
    return null;
}

// ------------------------------------------------------------- blocks -> MDX

/**
 * JSX needs void elements closed; the content has two bare <br>.
 *
 * Also breaks the single-line HTML soup Kirby stored into one line per block-level
 * element, so the MDX is actually editable by hand. Only block-level boundaries are
 * split: a newline between INLINE elements would render as a real space and change
 * the output, so <em>/<a>/<u>/<br /> are left strictly alone.
 */
function normalizeHtml(html) {
    return html
        .replace(/<br\s*>/gi, '<br />')
        .replace(/<\/p><p>/g, '</p>\n<p>')
        .replace(/<ul><li>/g, '<ul>\n<li>')
        .replace(/<\/li><li>/g, '</li>\n<li>')
        .replace(/<\/li><\/ul>/g, '</li>\n</ul>')
        .replace(/<\/ul><p>/g, '</ul>\n<p>')
        .replace(/<\/p><ul>/g, '</p>\n<ul>')
        .trim();
}

/** Guard against text that MDX would try to evaluate as an expression. */
function assertMdxSafe(text, context) {
    if (/[{}]/.test(text)) problems.push(`${context}: text contains { or }, which MDX evaluates`);
}

/**
 * Image import names are numbered PER ENTRY, not globally. A global counter meant
 * that adding one image block to a single talk renumbered the variables in every
 * entry processed after it, so re-importing after a content change churned unrelated
 * files. Numbering locally keeps the diff limited to what actually changed.
 */
function blocksToMdx(rawJson, ownerDir, imports, context) {
    let importSeq = 0;
    let blocks;
    try {
        blocks = JSON.parse(rawJson);
    } catch (e) {
        problems.push(`${context}: blocks JSON did not parse (${e.message})`);
        return '';
    }

    const chunks = [];
    for (const block of blocks.filter((b) => b.isHidden !== true)) {
        const c = block.content ?? {};
        switch (block.type) {
            case 'text':
            case 'list': {
                const html = normalizeHtml(c.text ?? '');
                assertMdxSafe(html, context);
                if (html) chunks.push(html);
                break;
            }
            case 'heading': {
                const level = Number(String(c.level || 'h2').slice(1)) || 2;
                const text = (c.text ?? '').trim();
                assertMdxSafe(text, context);
                // Verified plain text (no tags) across all content, so a Markdown
                // heading is lossless and keeps the file editable.
                if (text) chunks.push(`${'#'.repeat(level)} ${text}`);
                break;
            }
            case 'quote': {
                // Kept as explicit HTML, not Markdown '>': the `blocks` utility in
                // site.css has a nested `blockquote footer` rule that Markdown
                // blockquotes cannot produce.
                const text = normalizeHtml(c.text ?? '');
                const cite = (c.citation ?? '').trim();
                assertMdxSafe(text + cite, context);
                // Emitted on a single line on purpose: split across lines, MDX reads
                // the inner text as a paragraph and wraps it in <p>, which both
                // changes the markup Kirby produced and nests <footer> inside a <p>,
                // where it is invalid HTML.
                chunks.push(
                    cite
                        ? `<blockquote>${text}<footer>${cite}</footer></blockquote>`
                        : `<blockquote>${text}</blockquote>`,
                );
                break;
            }
            case 'image': {
                const [ref] = c.image ?? [];
                // Matches the Blade snippet's `@if ($block->image()->isNotEmpty())`.
                if (!ref) break;
                const filename = resolveFileRef(ref, ownerDir, `${context} image block`);
                if (!filename) break;
                const varName = `img${importSeq++}`;
                imports.push({ varName, filename });
                const attrs = [
                    `src={${varName}}`,
                    `alt=${JSON.stringify(c.alt ?? '')}`,
                    (c.caption ?? '') && `caption=${JSON.stringify(c.caption)}`,
                    (c.link ?? '') && `link=${JSON.stringify(c.link)}`,
                    (c.ratio ?? '') && `ratio=${JSON.stringify(c.ratio)}`,
                    // Kirby stores this as the STRING "true"/"false".
                    (c.crop === 'true' || c.crop === true) && 'crop',
                    `width=${JSON.stringify(c.width || 'md')}`,
                ].filter(Boolean);
                chunks.push(`<Figure ${attrs.join(' ')} />`);
                break;
            }
            case 'gallery': {
                const names = (c.images ?? [])
                    .map((r) => resolveFileRef(r, ownerDir, `${context} gallery block`))
                    .filter(Boolean);
                if (!names.length) break;
                const vars = names.map((filename) => {
                    const varName = `img${importSeq++}`;
                    imports.push({ varName, filename });
                    return varName;
                });
                chunks.push(`<Gallery images={[${vars.join(', ')}]} />`);
                break;
            }
            default:
                problems.push(`${context}: unhandled block type "${block.type}"`);
        }
    }
    return chunks.join('\n\n');
}

// -------------------------------------------------------------- file writing

function writeMdx(dest, frontmatter, imports, body) {
    const fm = YAML.stringify(frontmatter, { lineWidth: 0 }).trimEnd();
    // Computed, not hardcoded: talks/<slug>/index.mdx sits one level deeper than
    // pages/<id>.mdx, so a fixed '../../../' would silently break if a legal page
    // ever gained an image block.
    const toBlocks = path
        .relative(path.dirname(dest), path.join('src', 'components', 'blocks'))
        .split(path.sep)
        .join('/');
    const componentImports = [];
    if (body.includes('<Figure ')) {
        componentImports.push(`import Figure from '${toBlocks}/Figure.astro';`);
    }
    if (body.includes('<Gallery ')) {
        componentImports.push(`import Gallery from '${toBlocks}/Gallery.astro';`);
    }
    const imageImports = imports.map((i) => `import ${i.varName} from './${i.filename}';`);
    const head = [...componentImports, ...imageImports];

    const parts = [`---\n${fm}\n---`];
    if (head.length) parts.push(head.join('\n'));
    if (body) parts.push(body);
    const text = parts.join('\n\n') + '\n';

    if (!DRY) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, text, 'utf8');
    }
    return text;
}

let imagesCopied = 0;
let bytesBefore = 0;
let bytesAfter = 0;

async function copyImage(srcDir, filename, destDir) {
    const from = path.join(SRC, srcDir, filename);
    const to = path.join(destDir, filename);
    const before = fs.statSync(from).size;
    bytesBefore += before;

    if (DRY) {
        bytesAfter += before;
        imagesCopied++;
        return;
    }
    fs.mkdirSync(destDir, { recursive: true });

    const image = sharp(from);
    const meta = await image.metadata();
    if (meta.width > MAX_IMAGE_WIDTH) {
        // Re-encode at the cap. Nothing renders above 1800px, so this is invisible.
        const pipeline = image.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });
        const buf = await (/\.png$/i.test(filename)
            ? pipeline.png({ compressionLevel: 9 })
            : pipeline.jpeg({ quality: 90, mozjpeg: true })
        ).toBuffer();
        fs.writeFileSync(to, buf);
        notes.push(
            `downscaled ${srcDir}/${filename}: ${meta.width}px -> ${MAX_IMAGE_WIDTH}px, ` +
                `${(before / 1e6).toFixed(1)}MB -> ${(buf.length / 1e6).toFixed(1)}MB`,
        );
    } else {
        fs.copyFileSync(from, to);
    }
    bytesAfter += fs.statSync(to).size;
    imagesCopied++;
}

// ------------------------------------------------------------------- convert

const written = { talks: 0, persons: 0, pages: 0 };
const producedIds = { talks: [], persons: [], pages: [] };
const referencedFiles = [];

async function convertTalk(dir, fields) {
    const { id } = pageTarget.get(dir);
    const destDir = path.join(OUT_CONTENT, 'talks', id);
    const context = `talks/${id}`;
    const imports = [];

    const mainImage = resolveFileRef(
        parseList(fields.main_image)[0] ?? '',
        dir,
        `${context} main_image`,
    );
    const geo = fields.location_geo?.trim() ? YAML.parse(fields.location_geo) : null;

    const attendants = parseList(fields.attendants)
        .map((r) => resolvePageRef(r, `${context} attendants`))
        .filter(Boolean)
        .map((t) => t.id);

    const frontmatter = {
        title: fields.title,
        textline: fields.textline ?? '',
        date: berlinIso(fields.date),
        isVirtual: fields.is_virtual === 'true',
        locationName: fields.location_name ?? '',
        locationUrl: fields.location_url ?? '',
        eventbriteUrl: fields.eventbrite_url ?? '',
        mainImage: mainImage ? `./${mainImage}` : undefined,
        attendants,
    };
    if (geo && typeof geo === 'object') {
        frontmatter.location = {
            lat: Number(geo.lat),
            lon: Number(geo.lon),
            address: String(geo.address ?? ''),
            number: String(geo.number ?? ''),
            postcode: String(geo.postcode ?? ''),
            city: String(geo.city ?? ''),
            ...(geo.region ? { region: String(geo.region) } : {}),
            ...(geo.country ? { country: String(geo.country) } : {}),
            ...(geo.countryCode ? { countryCode: String(geo.countryCode) } : {}),
        };
    }

    const body = fields.text ? blocksToMdx(fields.text, dir, imports, context) : '';

    if (mainImage) referencedFiles.push({ dir, filename: mainImage });
    for (const i of imports) referencedFiles.push({ dir, filename: i.filename });

    writeMdx(path.join(destDir, 'index.mdx'), frontmatter, imports, body);
    for (const filename of new Set([
        ...(mainImage ? [mainImage] : []),
        ...imports.map((i) => i.filename),
    ])) {
        await copyImage(dir, filename, destDir);
    }
    written.talks++;
    producedIds.talks.push(id);
}

async function convertPerson(dir, fields) {
    const { id } = pageTarget.get(dir);
    const destDir = path.join(OUT_CONTENT, 'persons', id);
    const context = `persons/${id}`;

    const ref = parseList(fields.main_image)[0];
    const mainImage = ref ? resolveFileRef(ref, dir, `${context} main_image`) : null;

    const frontmatter = {
        title: fields.title,
        subHeading: fields.sub_heading ?? '',
        website: fields.website ?? '',
        linkedin: fields.linkedin ?? '',
        xing: fields.xing ?? '',
        mainImage: mainImage ? `./${mainImage}` : undefined,
    };

    writeMdx(path.join(destDir, 'index.mdx'), frontmatter, [], '');
    if (mainImage) {
        referencedFiles.push({ dir, filename: mainImage });
        await copyImage(dir, mainImage, destDir);
    } else {
        notes.push(`${context}: no portrait — will render the initials placeholder`);
    }
    written.persons++;
    producedIds.persons.push(id);
}

async function convertPage(dir, fields) {
    const { id } = pageTarget.get(dir);
    const destDir = path.join(OUT_CONTENT, 'pages');
    const context = `pages/${id}`;
    const imports = [];

    const frontmatter = { title: fields.title };
    if (fields.herotitle) frontmatter.herotitle = fields.herotitle;
    if (fields.textline) frontmatter.textline = fields.textline;
    if (fields.contact_persons) {
        frontmatter.contactPersons = parseList(fields.contact_persons)
            .map((r) => resolvePageRef(r, `${context} contact_persons`))
            .filter(Boolean)
            .map((t) => t.id);
    }

    const body = fields.text ? blocksToMdx(fields.text, dir, imports, context) : '';
    for (const i of imports) referencedFiles.push({ dir, filename: i.filename });

    writeMdx(path.join(destDir, `${id}.mdx`), frontmatter, imports, body);
    for (const i of imports) await copyImage(dir, i.filename, destDir);
    written.pages++;
    producedIds.pages.push(id);
}

// ---------------------------------------------------------------------- main

async function main() {
    if (!fs.existsSync(SRC)) {
        console.error(`Source "${SRC}" not found. Run from the repo root.`);
        process.exit(1);
    }
    buildIndex();
    console.log(
        `indexed: ${pageByUuid.size} page uuids, ${fileByUuid.size} file uuids, ` +
            `${[...imagesByDir.values()].reduce((n, s) => n + s.size, 0)} images on disk`,
    );

    for (const [dir, target] of [...pageTarget].sort()) {
        const txt = fs
            .readdirSync(path.join(SRC, dir))
            .find((f) => f.endsWith('.txt') && !IMAGE_RE.test(f.replace(/\.txt$/, '')));
        if (!txt) {
            problems.push(`${dir}: no page .txt found`);
            continue;
        }
        const fields = parseTxt(fs.readFileSync(path.join(SRC, dir, txt), 'utf8'));
        if (target.collection === 'talks') await convertTalk(dir, fields);
        else if (target.collection === 'persons') await convertPerson(dir, fields);
        else await convertPage(dir, fields);
    }

    // Site globals are already hand-written in src/data/site.ts; report drift only.
    const siteFields = parseTxt(fs.readFileSync(path.join(SRC, 'site.txt'), 'utf8'));
    const nav = parseList(siteFields.footer_navigation).map((r) =>
        resolvePageRef(r, 'site.txt footer_navigation'),
    );
    notes.push(
        `site.txt footer_navigation -> ${nav.filter(Boolean).map((t) => `/${t.id}`).join(', ')}`,
    );

    // ----- assertions
    const expect = (cond, msg) => { if (!cond) problems.push(msg); };
    expect(written.talks === 11, `expected 11 talks, wrote ${written.talks}`);
    expect(written.persons === 40, `expected 40 persons, wrote ${written.persons}`);
    expect(written.pages === 7, `expected 7 pages, wrote ${written.pages}`);

    // Every referenced image must exist at its destination.
    if (!DRY) {
        for (const { dir, filename } of referencedFiles) {
            const target = pageTarget.get(dir);
            const dest =
                target.collection === 'pages'
                    ? path.join(OUT_CONTENT, 'pages', filename)
                    : path.join(OUT_CONTENT, target.collection, target.id, filename);
            expect(fs.existsSync(dest), `missing copied image: ${dest}`);
        }
    }

    // Produced slugs must match the live Kirby URLs exactly — this is the assertion
    // that actually protects SEO, since every talk and person URL is indexed. The
    // baseline list is captured from the running Kirby site in phase 0.
    if (fs.existsSync('baseline/urls.txt')) {
        const urls = fs.readFileSync('baseline/urls.txt', 'utf8').split('\n').filter(Boolean);
        for (const [prefix, collection] of [
            ['/talks/', 'talks'],
            ['/persons/', 'persons'],
        ]) {
            const want = urls.filter((u) => u.startsWith(prefix)).map((u) => u.slice(prefix.length));
            const got = producedIds[collection];
            const missing = want.filter((s) => !got.includes(s));
            const extra = got.filter((s) => !want.includes(s));
            expect(
                missing.length === 0 && extra.length === 0,
                `${collection} slugs differ from the Kirby URLs` +
                    (missing.length ? `\n  missing: ${missing.join(', ')}` : '') +
                    (extra.length ? `\n  unexpected: ${extra.join(', ')}` : ''),
            );
        }
    } else {
        notes.push('baseline/urls.txt absent — skipped the URL parity assertion');
    }

    // Talk order by date must equal the natural order of the original 0_* folders,
    // which is what Kirby's Dir::inventory natsort + flip produced.
    const talkDirs = [...pageTarget]
        .filter(([d]) => d.startsWith('talks/0_'))
        .map(([d]) => d.slice('talks/0_'.length))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const byDate = producedIds.talks
        .map((id) => ({
            id,
            date: YAML.parse(
                fs.existsSync(path.join(OUT_CONTENT, 'talks', id, 'index.mdx'))
                    ? fs
                          .readFileSync(path.join(OUT_CONTENT, 'talks', id, 'index.mdx'), 'utf8')
                          .split('---')[1]
                    : 'date: 1970-01-01',
            ).date,
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)))
        .map((t) => t.id);
    if (!DRY) {
        expect(
            JSON.stringify(byDate) === JSON.stringify(talkDirs),
            `date order != Kirby folder order\n  by date:   ${byDate.join(', ')}\n  by folder: ${talkDirs.join(', ')}`,
        );
    }

    // ----- report
    console.log(
        `\n${DRY ? '[dry run] would write' : 'wrote'}: ` +
            `${written.talks} talks, ${written.persons} persons, ${written.pages} pages, ` +
            `${imagesCopied} images (${(bytesBefore / 1e6).toFixed(1)}MB -> ${(bytesAfter / 1e6).toFixed(1)}MB)`,
    );
    if (notes.length) {
        console.log(`\nnotes (${notes.length}):`);
        for (const n of notes) console.log(`  - ${n}`);
    }
    if (problems.length) {
        console.error(`\nFAILED with ${problems.length} problem(s):`);
        for (const p of problems) console.error(`  ! ${p}`);
        process.exit(1);
    }
    console.log('\nall assertions passed');
}

await main();
