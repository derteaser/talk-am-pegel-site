/**
 * Helpers for pulling plain text out of an imported MDX body.
 *
 * Kirby could ask a Blocks object for `filterBy('type', 'text')`; the body is now MDX,
 * so the equivalent is to work on the raw source. The importer emits each `text` block
 * as one or more consecutive `<p>` lines and every other block type in a recognisably
 * different shape, so paragraphs are a reliable proxy for "the text blocks".
 */

/** The first text block's HTML — the source for the home teaser and Event description. */
export function firstTextBlockHtml(body: string): string {
    // Blocks are separated by blank lines; the first chunk of <p> tags is block one.
    for (const chunk of body.split(/\n{2,}/)) {
        const trimmed = chunk.trim();
        if (trimmed.startsWith('<p>')) return trimmed;
    }
    return '';
}

/** Every text block concatenated — what Kirby's Blocks::excerpt() operated on. */
export function allTextBlocksHtml(body: string): string {
    return body
        .split(/\n{2,}/)
        .map((c) => c.trim())
        .filter((c) => c.startsWith('<p>') || c.startsWith('<ul>'))
        .join(' ');
}
