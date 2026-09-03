/**
 * German date formatting, replacing Kirby's `strftime` handler with the locale set to
 * `de_DE.utf-8` in site/config/config.php.
 *
 * Every formatter pins `timeZone: 'Europe/Berlin'` so output does not depend on the
 * build machine's zone (UTC on CI).
 *
 * One intentional difference: `%e` in Kirby's `'%e. %B %Y'` is SPACE-PADDED, so
 * single-digit days rendered as " 3. April 2024" with a leading space (HTML collapsed
 * it, so it was invisible). Intl produces "3. April 2024".
 */

const TZ = 'Europe/Berlin';

/** '%e. %B %Y' -> "26. März 2026" */
const longDate = new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
});

/** '%H:%M' -> "19:00" */
const timeOfDay = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
});

export function formatDate(date: Date): string {
    return longDate.format(date);
}

export function formatTime(date: Date): string {
    return timeOfDay.format(date);
}

/**
 * '%FT%H:%M:00%z' for schema.org `startDate` -> "2026-03-26T19:00:00+01:00".
 *
 * Production currently emits the offset without a colon ("+0100"); both are valid
 * ISO 8601 and schema.org accepts either.
 */
export function isoWithOffset(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'longOffset',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const offset = get('timeZoneName').replace('GMT', '') || '+00:00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}${offset}`;
}
