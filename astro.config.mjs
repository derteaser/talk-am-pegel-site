import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://www.talk-am-pegel.de',

    // URL parity with the Kirby site is SEO-critical: every one of the 57 indexed
    // URLs is served without a trailing slash. Astro's default 'directory' format
    // would emit talks/<slug>/index.html, and Apache's mod_dir then 301s
    // /talks/<slug> -> /talks/<slug>/ — a redirect on every page. 'file' emits
    // talks/<slug>.html instead, which public/.htaccess rewrites to extensionless.
    trailingSlash: 'never',
    build: { format: 'file' },

    // Kirby still owns public/ as its docroot while both stacks coexist. Without
    // this override, `astro build` would copy index.php, media/ and build/ into
    // dist/. Renamed to public/ in phase 6, when Kirby is deleted.
    publicDir: './static',
    outDir: './dist',

    // Replaces the plain `@fontsource/roboto/latin.css` import. Astro self-hosts the
    // files and — because `fallbacks` ends in a generic family — generates
    // size-adjusted fallback metrics. That is the real win: the Kirby site had no
    // metrics, so every page shifted once Roboto swapped in.
    //
    // Weights are the six the templates actually use (thin/light/normal/medium via
    // utility classes, semibold+bold via the `prose` h2/h3 rules) rather than all
    // nine Fontsource ships — 18 files / 216 kB of woff2+woff becomes 6 files /
    // 144 kB. `styles` stays normal-only, matching latin.css: real italics would be
    // an improvement but would change rendering versus the parity baseline, so that
    // is left until after cutover.
    //
    // The `fontsource` provider resolves over the network at build time (the `npm`
    // provider reads the installed package offline, but self-hosts it wholesale and
    // ignores the weight filter — it produced all nine weights). Fetches are cached
    // in node_modules/.astro/fonts, the same cacheDir that caches processed images,
    // so persisting that one directory in CI covers both.
    fonts: [
        {
            name: 'Roboto',
            cssVariable: '--font-roboto',
            provider: fontProviders.fontsource(),
            weights: [100, 300, 400, 500, 600, 700],
            // `styles` would otherwise default to ['normal', 'italic'].
            styles: ['normal'],
            // subsets ['latin'], formats ['woff2'] and fallbacks ['sans-serif'] are
            // already the defaults; woff2-only also drops the 9 legacy .woff files
            // the Fontsource CSS import was shipping.
        },
    ],

    // Not on by default: `prefetchAll` only defaults to true alongside <ClientRouter />.
    // Worthwhile on a 57-page site whose whole purpose is browsing between talks and people.
    prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

    // The imported bodies carry final HTML from Kirby, so Markdown extensions that
    // rewrite text are a liability rather than a feature:
    //
    //  - GFM's autolink literals turned a bare URL that already sat inside an
    //    <a href> on /datenschutz into a SECOND, nested anchor — invalid HTML. None
    //    of GFM's other extensions (tables, task lists, strikethrough) appear here.
    //  - smartPunctuation rewrote the straight quotes in a heading
    //    ("Talk am Pegel") into typographic ones, silently altering content that had
    //    been authored in the panel.
    markdown: { processor: satteri({ features: { gfm: false, smartPunctuation: false } }) },

    integrations: [mdx(), icon({ include: { ri: ['*'] } })],

    vite: { plugins: [tailwindcss()] },
});
