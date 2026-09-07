import type { APIRoute } from 'astro';
import { talks, excerpt, decodeEntities } from '../lib/content';
import { allTextBlocksHtml } from '../lib/talkBody';
import { site } from '../data/site';

/**
 * RSS 2.0 feed of the talks.
 *
 * Why a feed on a site that publishes two or three times a year: that cadence is exactly
 * what RSS is for — "tell me when the next Talk am Pegel is announced" — and it is a
 * human use case, not a speculative agent one. It also closes three spec items at once:
 * machine-readable-formats asks for a feed, and feed-discovery and feed-hygiene had been
 * recorded as N/A *because no feed existed*, which was circular.
 *
 * Shape follows the feed-hygiene spec page: atom:link rel="self", per-item GUIDs that
 * never change, RFC 822 dates, absolute URLs everywhere, and an honest sy:updatePeriod.
 */
const rfc822 = (d: Date) => d.toUTCString();

/**
 * A CDATA section cannot contain `]]>`, and it cannot be escaped either: entities are not
 * parsed inside CDATA, so `]]&gt;` would reach the reader as those literal characters. The
 * fix is to SPLIT the section — close it after the `]]`, reopen for the `>` — which leaves
 * the parsed text byte-identical. Verified against a real XML parser: the entity form
 * round-trips to `a]]&gt;b`, the split form to `a]]>b`.
 */
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site: astroSite }) => {
    const base = astroSite!.origin;
    const all = await talks();
    const feedUrl = `${base}/rss.xml`;

    const items = all
        .map((talk) => {
            const url = `${base}/talks/${talk.id}`;
            const body = allTextBlocksHtml(talk.body ?? '');
            // description is the list-view summary; content:encoded carries the whole
            // thing, because "truncating feed items to a one-line teaser" is the first
            // mistake that spec page names.
            const summary = decodeEntities(excerpt(body, 300));
            return `        <item>
            <title>${escapeXml(talk.data.title)}</title>
            <link>${url}</link>
            <guid isPermaLink="true">${url}</guid>
            <pubDate>${rfc822(new Date(talk.data.date))}</pubDate>
            <category>${escapeXml(talk.data.textline)}</category>
            <description>${cdata(summary)}</description>
            <content:encoded>${cdata(body)}</content:encoded>
        </item>`;
        })
        .join('\n');

    // The newest talk's date, not the build time: a reader that polls should see
    // lastBuildDate change when the CONTENT changes, and a deploy that fixes a typo in
    // the footer is not a content change.
    const newest = all[0] ? new Date(all[0].data.date) : new Date();

    const body = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>${escapeXml(site.title)} — Talks</title>
        <link>${base}/talks</link>
        <description>Die Gesprächsreihe ${escapeXml(site.title)} in Neuss: neue Ausgaben, Gäste und Themen.</description>
        <language>de-DE</language>
        <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
        <lastBuildDate>${rfc822(newest)}</lastBuildDate>
        <sy:updatePeriod>yearly</sy:updatePeriod>
        <sy:updateFrequency>3</sy:updateFrequency>
${items}
    </channel>
</rss>
`;

    return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
