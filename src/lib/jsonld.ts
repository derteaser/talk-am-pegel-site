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
