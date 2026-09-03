// Site-wide fields, ported from content/site.txt (the Kirby `site` object).
// These are global settings that changed never in 7 years, so they live in code
// rather than a content collection.

export const site = {
    title: 'Talk am Pegel',
    address1: 'Dr. Jörg Geerlings MdL',
    address2: 'Platz des Landtags 1',
    postalCode: '40221',
    city: 'Düsseldorf',
    phone: '+49 211/884-4051',
    email: 'info@talk-am-pegel.de',
    facebook: 'talkampegel',
    twitter: 'talkampegel',
} as const;

/**
 * Footer navigation, from site.txt's `Footer-navigation` pages field.
 * Kirby resolved each entry to a page and read its title; the titles are inlined
 * here so the footer does not depend on the `pages` collection, which phase 2
 * creates. Swap to getEntry('pages', …) in phase 3 if it ever needs to vary.
 */
export const footerNavigation = [
    { href: '/kontakt', title: 'Kontakt' },
    { href: '/impressum', title: 'Impressum' },
    { href: '/datenschutz', title: 'Datenschutz' },
] as const;

/** `tel:` needs the number stripped to dialable characters — Kirby's Html::tel() did this. */
export const telHref = `tel:${site.phone.replace(/[^0-9+]/g, '')}`;
