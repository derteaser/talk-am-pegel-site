@php
    /** @var EventPage $page */
@endphp
<x-layout>
    <section class="container flex flex-col px-5 pt-6 pb-12 mx-auto">
        <div class="mx-auto lg:w-4/6">
            @if (!$page->past())
                <div class="flex flex-col mt-10 sm:flex-row">
                    <div class="pb-4 mb-4 border-b border-base-200 sm:w-2/3 sm:pr-8 sm:py-8 sm:border-r sm:border-b-0 sm:mb-0">
                        <div class="mb-4 blocks">{!! $page->text()->toBlocks() !!}</div>
                    </div>
                    <aside class="text-center sm:w-1/3 sm:pl-8 sm:py-12">
                        <div class="card">
                            <div class="card-header">
                                <div class="inline-flex items-center justify-center size-22 text-base-content/50 bg-base-300 rounded-full">
                                    <x-icons.ticket-2-line class="size-16" />
                                </div>
                                <h2 class="card-title mt-4 text-lg font-medium text-base-content/90">Anmeldung</h2>
                                <div class="w-12 h-1 mt-2 mb-4 rounded-sm bg-primary mx-auto"></div>
                            </div>
                            <div class="card-body">
                                <p class="text-base text-base-content/80">
                                    Für die Teilnahme an unserer Veranstaltung ist eine
                                    Anmeldung zwingend erforderlich. Bitte bestellen Sie nachfolgend Ihr <strong>kostenloses</strong>
                                    Ticket über unseren Partner Eventbrite!
                                </p>
                            </div>
                            <div class="card-footer">
                                <a class="btn btn-accent" href="{{ $page->eventbrite_url() }}" target="_blank" rel="noopener noreferrer"
                                    onclick="fathom.trackGoal('DZC4R54V', 0);">
                                    Ticket sichern
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            @else
                <div class="mx-auto mt-10 mb-4 blocks">{!! $page->text()->toBlocks() !!}</div>
            @endif
        </div>
    </section>

    <section class="container px-5 py-12 mx-auto flex flex-wrap ">
        <dl class="w-full p-4 md:w-1/2 lg:w-1/3 aos aos-zoom-in" x-data="{ visible: false }"
            x-intersect.once="setTimeout(function() { visible = true }, 100)" :class="visible && 'visible'">
            <div class="card h-full bg-base-300">
                <dt class="sr-only">Datum</dt>
                <div class="card-body flex-row items-center space-x-3">
                    <x-icons.calendar-event-fill class="bg-primary text-white rounded-full p-2 size-10" />
                    <dd class="text-lg font-medium text-base-content/90">{{ $page->date()->toDate('%e. %B %Y') }}</dd>
                </div>
            </div>
        </dl>
        <dl class="w-full p-4 md:w-1/2 lg:w-1/3 aos aos-zoom-in" x-data="{ visible: false }"
            x-intersect.once="setTimeout(function() { visible = true }, 300)" :class="visible && 'visible'">
            <div class="card h-full bg-base-300">
                <dt class="sr-only">Uhrzeit</dt>
                <div class="card-body flex-row items-center space-x-3">
                    <x-icons.time-fill class="bg-primary text-white rounded-full p-2 size-10" />
                    <dd class="text-lg font-medium text-base-content/90">{{ $page->date()->toDate('%H:%M') }} Uhr</dd>
                </div>
            </div>
        </dl>
        <dl class="w-full p-4 lg:w-1/3 aos aos-zoom-in" x-data="{ visible: false }"
            x-intersect.once="setTimeout(function() { visible = true }, 500)" :class="visible && 'visible'">
            <div class="card h-full bg-base-300">
                <dt class="sr-only">Ort</dt>
                <div class="card-body flex-row items-center space-x-3">
                    @if ($page->is_virtual()->toBool())
                        <x-icons.live-fill class="bg-primary text-white rounded-full p-2 size-10" />
                    @else
                        <x-icons.map-pin-2-fill class="bg-primary text-white rounded-full p-2 size-10" />
                    @endif
                    <dd class="text-lg font-medium text-base-content/90">{{ $page->location_name() }}</dd>
                </div>
            </div>
        </dl>
    </section>

    <section class="container px-12 pt-12 pb-24 mx-auto sm: md:px-5 flex flex-wrap justify-center">
        @php $animationDelay = 100; @endphp
        @foreach ($page->attendants()->toPages() as $person)
            <x-person :person="$person" :animate="true" :animation-delay="$animationDelay" />
            @php $animationDelay += 100; @endphp
        @endforeach
    </section>

    <nav class="px-3 py-4 bg-base-300 md:px-8">
        <div class="grid items-center lg:grid-cols-2 lg:divide-x divide-primary/60">
            @if ($prev = $page->prev())
                <div class="p-2">
                    <a href="{{ $prev->url() }}" rel="prev" class="btn btn-neutral/80 btn-text btn-xl text-left">
                        <x-icons.arrow-left-s-line class="size-12 shrink-0" />
                        <div>
                            <span class="block text-sm font-medium text-neutral/50 uppercase">{{ $prev->textline() }}</span>
                            <span class="sr-only">:</span>
                            <span>{{ $prev->title() }}</span>
                        </div>
                    </a>
                </div>
            @else
                <div></div>
            @endif
            @if ($next = $page->next())
                <div class="p-2 text-right">
                    <a href="{{ $next->url() }}" rel="next" class="btn btn-neutral/80 btn-text btn-xl text-right">
                        <div>
                            <span class="text-sm font-medium text-neutral/50 uppercase">{{ $next->textline() }}</span>
                            <span class="sr-only">:</span>
                            <span>{{ $next->title() }}</span>
                        </div>
                        <x-icons.arrow-right-s-line class="size-12 shrink-0" />
                    </a>
                </div>
            @endif
        </div>
    </nav>
</x-layout>
