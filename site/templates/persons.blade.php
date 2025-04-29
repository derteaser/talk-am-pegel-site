@php
    /** @var Page $page */
    /** @var \Kirby\Cms\App $kirby */
@endphp
<x-layout>
    <section class="overflow-hidden text-gray-700 dark:text-gray-400">
        <div class="container px-5 py-24 mx-auto">
            <ul class="grid max-w-(--breakpoint-sm) gap-8 mx-auto sm:grid-cols-2">
                @foreach ($kirby->collection('persons') as $person)
                    <li>
                        <h2 class="mb-2 text-2xl font-medium text-gray-900 dark:text-gray-100">{{ $person->title() }}</h2>
                        <a href="{{ $person->url() }}" class="btn btn-sm btn-soft btn-accent">
                            Mehr erfahren
                            <x-icons.arrow-right-line class="max-sm:hidden size-5" />
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
    </section>
</x-layout>
