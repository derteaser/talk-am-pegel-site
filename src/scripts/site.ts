// Client entry, ported from resources/js/site.js.
//
// Two deliberate differences from the Kirby version:
//  - The CSS import moved out to Layout.astro's frontmatter, so Astro emits a real
//    <link rel="stylesheet"> instead of having JS pull the stylesheet in.
//  - The stray console.log of the clicked node is gone.
//
// All Alpine usage on this site is inline in markup (x-data, x-show, x-intersect,
// x-transition, x-cloak) with no registered components, so Alpine only needs to be
// started once globally — nothing else to port.

/*
 * FlyOnUI's tooltip, and nothing else. `flyonui/flyonui` registers 24 components —
 * accordion, carousel, datatable, combobox, file-upload, tree-view and the rest — to
 * render the six tooltips on the person cards and in the footer. The per-component build
 * self-initialises on `load` exactly as the full bundle does, so there is no init call and
 * no markup change: 28.2 kB of JS per page instead of 66.2 (brotli).
 *
 * `dist/tooltip.js`, NOT `dist/tooltip.mjs`. The ESM build externalises @floating-ui/dom
 * — FlyOnUI's own dependency, which nothing here installs at the top level — so it builds
 * clean, ships 3 kB smaller, and throws `(0 , i.BN) is not a function` on every page while
 * the tooltip silently never opens. The CJS build inlines the positioning engine. This was
 * caught by hovering a tooltip in a real browser; nothing in the build output or the type
 * checker said a word.
 */
import 'flyonui/dist/tooltip.js';

import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';

Alpine.plugin(intersect);

window.Alpine = Alpine;
Alpine.start();

// Gallery lightbox: block navigation to the full-size image and hand the whole
// .image-gallery to BigPicture so it can page through the set.
//
// Imported dynamically, because only the recap pages that have a Gallery block carry
// `.image-gallery` — two pages out of 58. It used to load on all of them.
const galleryLinks = document.querySelectorAll<HTMLAnchorElement>('.image-gallery a');
if (galleryLinks.length > 0) {
    const { default: BigPicture } = await import('bigpicture/src/BigPicture');
    for (const link of galleryLinks) {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            BigPicture({
                el: event.target as Element,
                imgSrc: link.getAttribute('href') as string,
                gallery: '.image-gallery',
            });
        });
    }
}
