@php
    /** @var HomePage $page */
    /** @var EventPage $latestEvent */
@endphp

<x-layout>
    <x-latest-event :event="$latestEvent" />
</x-layout>
