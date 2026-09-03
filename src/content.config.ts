import { defineCollection, reference } from 'astro:content';
// NOT from 'astro:content': `z` there is deprecated and slated for removal in Astro 8.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Content collections, imported from Kirby by scripts/migrate-kirby.mjs.
 *
 * Talks and persons are one directory per entry with images co-located, mirroring
 * Kirby's model where a page's files live in its own folder. The glob loader derives
 * each entry id from the directory name, so the folder name *is* the URL slug — which
 * is what keeps URL parity with the Kirby site.
 */

/**
 * Kirby stored unset URL fields as empty strings, and the importer preserves that
 * rather than inventing nulls. Zod 4's `z.url()` rejects '', so allow it explicitly.
 */
const optionalUrl = z.union([z.url(), z.literal('')]).default('');

const talks = defineCollection({
    loader: glob({ base: './src/content/talks', pattern: '**/index.mdx' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            /** Kicker, e.g. "Talk am Pegel #11". Required by the Kirby blueprint. */
            textline: z.string(),
            /**
             * Written by the importer with an explicit Europe/Berlin offset
             * ("2026-03-26T19:00:00+01:00"). A bare local datetime would be parsed in
             * the build machine's zone — UTC on CI — shifting every displayed time.
             *
             * Also the sort key: it replaces Kirby's `num`, which was nominally the
             * date but 0 on every folder on disk, leaving order to a natsort of
             * directory names.
             */
            date: z.coerce.date(),
            isVirtual: z.boolean().default(false),
            locationName: z.string(),
            locationUrl: optionalUrl,
            eventbriteUrl: z.url(),
            mainImage: image(),
            attendants: z.array(reference('persons')).default([]),
            /**
             * From Kirby's `locator` field. Absent on the three virtual events, whose
             * Location-geo held a single space.
             */
            location: z
                .object({
                    lat: z.number(),
                    lon: z.number(),
                    address: z.string().default(''),
                    number: z.string().default(''),
                    postcode: z.string().default(''),
                    city: z.string().default(''),
                    region: z.string().optional(),
                    country: z.string().optional(),
                    countryCode: z.string().optional(),
                })
                .optional(),
        }),
});

const persons = defineCollection({
    loader: glob({ base: './src/content/persons', pattern: '**/index.mdx' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            /** Job title, shown under the name. Required by the Kirby blueprint. */
            subHeading: z.string(),
            website: optionalUrl,
            linkedin: optionalUrl,
            xing: optionalUrl,
            /** Absent for alexandra-klein and lena-behr — they fall back to initials. */
            mainImage: image().optional(),
        }),
});

const pages = defineCollection({
    loader: glob({ base: './src/content/pages', pattern: '*.mdx' }),
    schema: () =>
        z.object({
            title: z.string(),
            /** home only — the hero heading, used in place of the title. */
            herotitle: z.string().optional(),
            /** home only — hero sub-line. */
            textline: z.string().optional(),
            /** kontakt only. */
            contactPersons: z.array(reference('persons')).default([]),
        }),
});

export const collections = { talks, persons, pages };
