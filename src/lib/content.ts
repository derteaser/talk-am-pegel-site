import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Collection helpers, replacing site/collections/*.php and the page models in
 * site/models/. Kept in one place so the pages stay declarative.
 */

export type Talk = CollectionEntry<'talks'>;
export type Person = CollectionEntry<'persons'>;

/**
 * Talks, newest first — the `events` collection from site/collections/events.php.
 *
 * Kirby did `children()->listed()->flip()`, which relied on a natsort of the `0_*`
 * folder names because every folder's `num` was 0. Sorting on `date` reproduces the
 * same order for the current data (verified in phase 2) and is robust to a future
 * talk being added out of sequence.
 */
export async function talks(): Promise<Talk[]> {
    const all = await getCollection('talks');
    return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Same list oldest first — the order Kirby's prev/next navigation walked. */
export async function talksAsc(): Promise<Talk[]> {
    return (await talks()).reverse();
}

/** Persons by name — site/collections/persons.php did sortBy('title'). */
export async function persons(): Promise<Person[]> {
    const all = await getCollection('persons');
    return all.sort((a, b) => a.data.title.localeCompare(b.data.title, 'de'));
}

/**
 * Talks a person attended — the reverse lookup from PersonPage::events().
 * Newest first, matching the `events` collection it filtered.
 */
export async function talksOf(personId: string): Promise<Talk[]> {
    return (await talks()).filter((talk) => talk.data.attendants.some((ref) => ref.id === personId));
}

/**
 * Previous/next siblings for a talk detail page.
 *
 * Kirby used $page->prev()/$page->next() over sibling inventory order, which was
 * oldest-first — so `prev` is the older talk and `next` the newer one.
 */
export async function neighbours(talkId: string): Promise<{ prev?: Talk; next?: Talk }> {
    const asc = await talksAsc();
    const i = asc.findIndex((t) => t.id === talkId);
    if (i === -1) return {};
    return { prev: asc[i - 1], next: asc[i + 1] };
}

/**
 * Whether a talk has already happened — EventPage::past().
 *
 * Note this is now evaluated at BUILD time, where Kirby evaluated it per request.
 * A talk flipping from upcoming to past therefore needs a rebuild; the daily
 * scheduled build covers that.
 */
export function isPast(talk: Talk, now: Date = new Date()): boolean {
    return talk.data.date.getTime() < now.getTime();
}

/** First letter of each space-separated word — PersonPage::initials(). */
export function initials(title: string): string {
    return title
        .split(' ')
        .map((word) => [...word][0] ?? '')
        .join('');
}

/**
 * Port of Kirby's Str::excerpt() as used by Blocks::excerpt().
 *
 * Faithful to kirby/src/Toolkit/Str.php: tags are replaced by spaces so words do not
 * fuse, whitespace is collapsed, and truncation happens at the last space before the
 * limit with ' …' appended (space + U+2026).
 */
export function excerpt(html: string, chars = 140): string {
    const text = html
        .replace(/<\/?[^>]+>/g, ' ')
        // Collapse ASCII whitespace only. \s would also match U+00A0, and the content
        // contains deliberate non-breaking spaces (e.g. binding "7. April 2025"
        // together) that Kirby preserved.
        .replace(/[ \t\n\r\f\v]+/g, ' ')
        .trim();
    if (chars === 0 || text.length <= chars) return text;
    const cut = text.slice(0, chars);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()} …`;
}

/** Decode the handful of HTML entities the content uses (only &amp; occurs today). */
export function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

/**
 * Port of Kirby's Str::widont() (kirby/src/Toolkit/Str.php), used on the home page's
 * event title to stop the last word wrapping alone.
 *
 * Two passes, matching the original: first bind a trailing single character to the
 * word before it, then bind the last two words — converting hyphens in that last
 * word to non-breaking hyphens so it cannot break either.
 *
 * Emits raw entities, so the result must be rendered with set:html.
 */
export function widont(text: string): string {
    let s = text ?? '';
    s = s.replace(/(\S)\s(\S?)$/u, (_, a, b) => `${a}&nbsp;${b}`);
    return s.replace(/(\s)(?=\S*$)(\S+)/u, (_, __, word) => {
        const w = word.includes('-') ? word.replace(/-/g, '&#8209;') : word;
        return `&nbsp;${w}`;
    });
}
