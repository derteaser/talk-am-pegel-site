@php
    /** @var EventPage $page */
@endphp
<x-layout>
    <section>
        <div class="container flex flex-col px-5 pt-6 pb-12 mx-auto">
            <div class="mx-auto lg:w-4/6">
                @if (!$page->past())
                    <div class="flex flex-col mt-10 sm:flex-row">
                        <div class="pb-4 mb-4 border-b border-base-200 sm:w-2/3 sm:pr-8 sm:py-8 sm:border-r sm:border-b-0 sm:mb-0">
                            <div class="mb-4 blocks">{!! $page->text()->toBlocks() !!}</div>
                        </div>
                        <aside class="text-center sm:w-1/3 sm:pl-8 sm:py-12">
                            <div class="card">
                                <div class="card-header">
                                    <div
                                        class="inline-flex items-center justify-center size-22 text-base-content/50 bg-base-300 rounded-full">
                                        <x-icons.ticket-2-line class="size-16" />
                                    </div>
                                    <h2 class="card-title mt-4 text-lg font-medium text-base-content/90">Anmeldung</h2>
                                    <div class="w-12 h-1 mt-2 mb-4 rounded-sm bg-primary mx-auto"></div>
                                </div>
                                <div class="card-body">
                                    <p class="text-base text-base-content/80">Für die Teilnahme an unserer Veranstaltung ist eine
                                        Anmeldung zwingend erforderlich. Bitte bestellen Sie nachfolgend Ihr <strong>kostenloses</strong>
                                        Ticket über unseren
                                        Partner Eventbrite!</p>

                                </div>
                                <div class="card-footer">
                                    <a class="btn btn-accent" href="<?= $page->eventbrite_url() ?>" target="_blank"
                                        rel="noopener noreferrer" onclick="fathom.trackGoal('DZC4R54V', 0);">
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
        </div>
    </section>

    <section class="text-gray-700">
        <div class="container px-5 py-12 mx-auto">
            <div class="flex flex-wrap -m-4">
                <div class="w-full p-4 md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="100">
                    <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
                        <div class="flex items-center">
                            <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
                                <x-icons.calendar-event-fill class="size-5" />
                            </div>
                            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page->date()->toDate('%e. %B %Y') ?></p>
                        </div>
                    </div>
                </div>
                <div class="w-full p-4 md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="300">
                    <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
                        <div class="flex items-center">
                            <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
                                <x-icons.time-fill class="size-5" />
                            </div>
                            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page->date()->toDate('%H:%M') ?> Uhr</p>
                        </div>
                    </div>
                </div>
                <div class="w-full p-4 lg:w-1/3" data-aos="zoom-in" data-aos-delay="500">
                    <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
                        <div class="flex items-center">
                            <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
                                @if ($page->is_virtual()->toBool())
                                    <x-icons.live-fill class="size-5" />
                                @else
                                    <x-icons.map-pin-2-fill class="size-5" />
                                @endif
                            </div>
                            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page->location_name() ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="text-gray-700">
        <div class="container px-12 pt-12 pb-24 mx-auto sm: md:px-5">
            <div class="flex flex-wrap justify-center -m-4">
                @foreach ($page->attendants()->toPages() as $person)
                    <x-person :person="$person" />
                @endforeach
            </div>
        </div>
    </section>

    <nav class="px-3 py-4 bg-gray-300 md:px-8">
        <div class="grid items-center grid-cols-2 divide-x divide-gray-400">
            @if ($prev = $page->prev())
                <div class="p-2">
                    <a href="<?= $prev->url() ?>" rel="prev" class="flex flex-row items-center text-gray-600 hover:text-gray-700">
                        <x-icons.arrow-left-s-line class="size-16 float-right mr-4" />
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase"><?= $prev->textline() ?></p>
                            <p><?= $prev->title() ?></p>
                        </div>
                    </a>
                </div>
            @else
                <div></div>
            @endif
            @if ($next = $page->next())
                <div class="p-2 text-right">
                    <a href="<?= $next->url() ?>" rel="next"
                        class="flex flex-row-reverse items-center text-gray-600 hover:text-gray-700">
                        <?php snippet('icons/arrow-right-s-line', ['class' => 'size-16 float-right ml-4']); ?>
                        <div>
                            <p class="text-sm font-medium text-gray-500 uppercase"><?= $next->textline() ?></p>
                            <p><?= $next->title() ?></p>
                        </div>
                    </a>
                </div>
            @endif
        </div>
    </nav>
</x-layout>
