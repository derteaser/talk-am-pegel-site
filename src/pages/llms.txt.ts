import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { talks } from '../lib/content';
import { site } from '../data/site';
import { formatDate } from '../lib/dates';

/**
 * /llms.txt — a curated index for agents, in the format llmstxt.org describes: an H1
 * with the site name, a blockquote summary, then `##` sections of markdown links.
 *
 * CURATED, not exhaustive. The spec's first listed mistake is "treating it like a
 * sitemap and listing every URL" — /sitemap.xml already enumerates all 57. So the 11
 * talks are listed individually, because they are the substance of the site, and the 40
 * guest pages are represented by /persons rather than 40 lines of names.
 *
 * v2 of the convention requires the file be ADVERTISED rather than guessed at:
 * `Link: </llms.txt>; rel="describedby"; type="text/markdown"` comes from public/_headers,
 * which also overrides the Content-Type — Cloudflare would otherwise serve a .txt file as
 * text/plain, which the convention allows but which contradicts the `type` we advertise.
 */
export const GET: APIRoute = async ({ site: astroSite }) => {
    const base = astroSite!.origin;
    const all = await talks();
    const pages = await getCollection('pages');
    const pageTitle = (id: string) => pages.find((p) => p.id === id)?.data.title ?? id;

    const talkLines = all
        .map((talk) => `- [${talk.data.title}](${base}/talks/${talk.id}): ${talk.data.textline}, ${formatDate(talk.data.date)}.`)
        .join('\n');

    const body = `# ${site.title}

> ${site.title} ist eine Gesprächsreihe in Neuss: Abende mit Gästen aus Politik, Wirtschaft und Gesellschaft, veranstaltet von ${site.address1}.

Diese Datei ist ein kuratierter Index für Sprachmodelle und Agenten. Die vollständige
URL-Liste steht in [sitemap.xml](${base}/sitemap.xml).

## Talks

${talkLines}

## Seiten

- [Alle Talks](${base}/talks): Übersicht aller Ausgaben, chronologisch.
- [Personen](${base}/persons): Gäste der Reihe, mit je einer eigenen Seite.
- [${pageTitle('kontakt')}](${base}/kontakt): Anschrift, Telefon und E-Mail der Veranstalter.

## Optional

- [${pageTitle('impressum')}](${base}/impressum)
- [${pageTitle('datenschutz')}](${base}/datenschutz)
`;

    return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
