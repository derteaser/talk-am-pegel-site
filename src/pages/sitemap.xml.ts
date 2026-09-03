import type { APIRoute } from 'astro';
import { talks, persons } from '../lib/content';

/**
 * Hand-rolled rather than using @astrojs/sitemap, which emits
 * `sitemap-index.xml` + `sitemap-0.xml`. The live robots.txt and Search Console both
 * point at `/sitemap.xml`, and that URL must not change.
 *
 * Matches the Kirby sitemap's shape (`<loc>` + `<lastmod>`, no changefreq/priority)
 * and keeps the person pages, which were included there despite being "unlisted".
 *
 * One deliberate omission: Kirby listed `/error`, a URL that returns 404 — it was in
 * the submitted sitemap but never a usable page. It is dropped here.
 */
export const GET: APIRoute = async ({ site }) => {
    const base = site!.origin;

    const staticPaths = ['/', '/talks', '/persons', '/kontakt', '/impressum', '/datenschutz'];
    const talkPaths = (await talks()).map((t) => `/talks/${t.id}`);
    const personPaths = (await persons()).map((p) => `/persons/${p.id}`);

    // Kirby used the content file's modification time. There is no per-entry
    // equivalent at build time, so the build timestamp stands in for all entries.
    const lastmod = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');

    const urls = [...staticPaths, ...talkPaths, ...personPaths]
        .map(
            (p) =>
                `    <url>\n        <loc>${base}${p}</loc>\n        <lastmod>${lastmod}</lastmod>\n    </url>`,
        )
        .join('\n');

    const body = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

    return new Response(body, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};
