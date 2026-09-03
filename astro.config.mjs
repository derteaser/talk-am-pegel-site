import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
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

    integrations: [mdx(), icon({ include: { ri: ['*'] } })],

    vite: { plugins: [tailwindcss()] },
});
