@php
    /** @var DefaultPage $page */
@endphp

<x-layout>
    <section class="container mx-auto blocks my-16 px-6">
        {!! $page->text()->toBlocks() !!}
    </section>
</x-layout>
