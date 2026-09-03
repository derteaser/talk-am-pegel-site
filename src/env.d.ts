/// <reference types="astro/client" />

// Ambient declarations for the three client libraries that ship no types.
// This file has no top-level import/export on purpose, so it stays a global
// script and `interface Window` merges without a `declare global` wrapper.

/** Alpine 3.16 ships no .d.ts. Only the surface site.ts actually uses. */
interface AlpineApi {
    plugin(plugin: unknown): void;
    start(): void;
}

declare module 'alpinejs' {
    const Alpine: AlpineApi;
    export default Alpine;
}

declare module '@alpinejs/intersect' {
    const intersect: unknown;
    export default intersect;
}

declare module 'flyonui/flyonui';

declare module 'bigpicture/src/BigPicture' {
    interface BigPictureOptions {
        el: Element;
        imgSrc?: string;
        gallery?: string;
        galleryAttribute?: string;
    }
    export default function BigPicture(options: BigPictureOptions): void;
}

// Alpine is exposed globally so the inline x-* directives in markup can reach it.
interface Window {
    Alpine: AlpineApi;
}
