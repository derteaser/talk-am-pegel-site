/**
 * JSON-LD builders, replacing the `wearejust.meta-tags.templates` block in
 * site/config/config.php.
 *
 * Changes from the Kirby output — two corrections and one modernisation:
 *  - `@context` was `http://schema.org`; now https.
 *  - `eventStatus` was the object `{ '@type': 'EventScheduled' }`, which is not how
 *    schema.org expresses the enum; now the enum URL.
 *  - the Event carried `performers`. That IS a real schema.org property on Event,
 *    but it is marked "superseded by performer", so the current spelling is used.
 *    This is modernisation, not a fix — consumers likely still read the old term.
 */

import { site } from '../data/site';
import { isoWithOffset } from './dates';
import type { Talk } from './content';

const CONTEXT = 'https://schema.org';

export function webPage(name: string, url: string, image: string) {
    return { '@context': CONTEXT, '@type': 'WebPage', name, url, inLanguage: 'de_DE', image };
}

export function webSite(name: string, url: string, image: string) {
    return {
        '@context': CONTEXT,
        '@type': 'WebSite',
        name,
        url,
        inLanguage: 'de_DE',
        image,
        sameAs: [
            `https://www.facebook.com/${site.facebook}`,
            // Kirby concatenated 'https://twitter.com' + handle with no slash,
            // emitting "https://twitter.comtalkampegel".
            `https://twitter.com/${site.twitter}`,
        ],
    };
}

export function contactPage(name: string, url: string, image: string) {
    return { '@context': CONTEXT, '@type': 'ContactPage', name, url, inLanguage: 'de_DE', image };
}

/**
 * Person, for the 40 detail pages. Kirby emitted nothing here; the talk pages already
 * describe these people as an Event's `performer`, so this is the same subject getting a
 * node of its own with the links the content collection actually holds.
 *
 * `image` must be a DERIVED image, never `mainImage.src` — that is the untouched original
 * and this is exactly where 10.8 MB of them ended up being advertised before. verify.mjs
 * fails on any JSON-LD image over 400 kB.
 */
export function person(opts: {
    name: string;
    jobTitle: string;
    url: string;
    image: string | null;
    sameAs: string[];
    performerIn: { name: string; url: string }[];
}) {
    const { name, jobTitle, url, image, sameAs, performerIn } = opts;
    return {
        '@context': CONTEXT,
        '@type': 'Person',
        name,
        jobTitle,
        url,
        ...(image ? { image } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        ...(performerIn.length ? { performerIn: performerIn.map((e) => ({ '@type': 'Event', name: e.name, url: e.url })) } : {}),
    };
}

/**
 * Index pages: the page itself, plus the list it exists to present.
 *
 * Each ListItem wraps a TYPED `item` rather than carrying a bare `url`. Google documents
 * both shapes — a summary-page carousel puts `url` on the ListItem, an all-in-one page
 * nests an `item` — but carousel rich results are limited to Recipe/Movie/Course/
 * Restaurant, so neither of these lists is eligible either way. What is left is which
 * shape says more: `item` is the schema.org property for "the thing being listed", it is
 * what Google's event-listing guidance wants on a page listing events, and it carries a
 * type, so a consumer learns "this entry is an Event called X" rather than just a URL.
 * `startDate` rides along where the collection has one.
 */
export function collectionPage(opts: {
    name: string;
    url: string;
    description: string;
    itemType: 'Event' | 'Person';
    items: { name: string; url: string; startDate?: string }[];
}) {
    const { name, url, description, itemType, items } = opts;
    // No `image`: Seo.astro already declares the social image as meta tags, and repeating
    // it inside the node tells a consumer nothing new.
    return {
        '@context': CONTEXT,
        '@type': 'CollectionPage',
        name,
        url,
        description,
        inLanguage: 'de_DE',
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items.map((entry, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': itemType,
                    name: entry.name,
                    url: entry.url,
                    ...(entry.startDate ? { startDate: entry.startDate } : {}),
                },
            })),
        },
    };
}

/**
 * BreadcrumbList for the two detail page types.
 *
 * DELIBERATE DEVIATION, decided by the site owner: there is no visible breadcrumb trail
 * to match this. The spec wants both and lists "visible trail and JSON-LD list disagree"
 * as a mistake — with no trail at all there is nothing to disagree with, but this is
 * still half of what it asks for. The hierarchy itself is honest: it mirrors the URL
 * structure rather than any click path.
 */
export function breadcrumbList(items: { name: string; url: string }[]) {
    return {
        '@context': CONTEXT,
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export interface PerformerInput {
    name: string;
    jobTitle: string;
    url: string | null;
    image: string | null;
}

export function eventSchema(opts: {
    talk: Talk;
    description: string;
    pageUrl: string;
    imageUrl: string;
    performers: PerformerInput[];
    /**
     * Whether the event has already happened, at BUILD time. Only affects `offers`.
     *
     * Unlike the page's ticket panel, which corrects itself on the client, this is
     * frozen until the next deploy — accepted, because that deploy is in practice the
     * recap push. The two therefore disagree between the event ending and that deploy:
     * the CTA is already gone while the offer still reads InStock.
     */
    past: boolean;
}) {
    const { talk, description, pageUrl, imageUrl, performers, past } = opts;
    const d = talk.data;
    const geo = d.location;

    return {
        '@context': CONTEXT,
        '@type': 'Event',
        name: d.title,
        description,
        eventStatus: `${CONTEXT}/EventScheduled`,
        eventAttendanceMode: d.isVirtual ? `${CONTEXT}/OnlineEventAttendanceMode` : `${CONTEXT}/OfflineEventAttendanceMode`,
        location: d.isVirtual
            ? { '@type': 'VirtualLocation', name: d.locationName, url: d.locationUrl }
            : {
                  '@type': 'Place',
                  name: d.locationName,
                  address: {
                      '@type': 'PostalAddress',
                      addressCountry: geo?.countryCode ?? 'de',
                      addressLocality: geo?.city ?? '',
                      postalCode: geo?.postcode ?? '',
                      streetAddress: `${geo?.address ?? ''} ${geo?.number ?? ''}`.trim(),
                  },
                  geo: {
                      '@type': 'GeoCoordinates',
                      latitude: geo?.lat ?? '',
                      longitude: geo?.lon ?? '',
                  },
              },
        url: pageUrl,
        image: imageUrl,
        isAccessibleForFree: true,
        inLanguage: 'de_DE',
        startDate: isoWithOffset(d.date),
        organizer: {
            '@type': 'Person',
            name: 'Dr. Jörg Geerlings MdL',
            url: 'https://www.geerlings.de',
        },
        /**
         * `eventStatus` deliberately stays EventScheduled for a past event:
         * EventStatusType has no "completed" member (only Cancelled, MovedOnline,
         * Postponed, Rescheduled, Scheduled), and an event that took place as planned
         * was, indeed, scheduled.
         *
         * The offer is the part that goes stale. ItemAvailability has no "expired"
         * member either, so SoldOut is the closest — it is the convention for closed
         * ticketing, and `validThrough` states the actual expiry alongside it.
         * Keeping the key rather than dropping it also keeps the Event.offers
         * assertion in scripts/verify.mjs meaningful.
         */
        offers: {
            '@type': 'Offer',
            url: d.eventbriteUrl,
            price: '0',
            priceCurrency: 'EUR',
            availability: past ? `${CONTEXT}/SoldOut` : `${CONTEXT}/InStock`,
            ...(past && { validThrough: isoWithOffset(d.date) }),
        },
        performer: performers.map((p) => ({
            '@type': 'Person',
            name: p.name,
            jobTitle: p.jobTitle,
            url: p.url,
            image: p.image,
        })),
    };
}
