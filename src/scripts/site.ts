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

import BigPicture from 'bigpicture/src/BigPicture';

import 'flyonui/flyonui';

import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';

Alpine.plugin(intersect);

window.Alpine = Alpine;
Alpine.start();

// Gallery lightbox: block navigation to the full-size image and hand the whole
// .image-gallery to BigPicture so it can page through the set.
for (const link of document.querySelectorAll<HTMLAnchorElement>('.image-gallery a')) {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        BigPicture({
            el: event.target as Element,
            imgSrc: link.getAttribute('href') as string,
            gallery: '.image-gallery',
        });
    });
}
