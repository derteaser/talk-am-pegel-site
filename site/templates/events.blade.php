@php
    /** @var Kirby\Cms\Page $page */
    /** @var Kirby\Cms\App $kirby */
@endphp

<x-layout>
    <section class="container mx-auto my-16">
        <ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical timeline-centered">
            @php $odd = false; @endphp
            @foreach ($kirby->collection('events') as $event)
                <!-- timeline item -->
                <li>
                    <div class="timeline-middle">
                        <span class="bg-primary/20 flex size-4.5 items-center justify-center rounded-full">
                            <span class="badge badge-primary size-3 rounded-full p-0"></span>
                        </span>
                    </div>
                    <div class="{{ $odd ? 'timeline-start' : 'timeline-end' }} me-4 ms-1 mt-3 max-md:pt-2">
                        <time class="text-base-content/50 text-sm font-normal">{{ $event->date()->toDate('%e. %B %Y') }}</time>
                    </div>
                    <div class="{{ $odd ? 'timeline-end' : 'timeline-start' }} ms-4 mb-8">
                        <div class="card aos aos-fade-up" x-data="{ visible: false }" x-intersect.once="visible = true"
                            :class="visible && 'visible'">
                            <figure>
                                <x-thumbnail :image="$event->mainImage()" :lazy="true" srcset="wide"
                                    class="object-cover object-center aspect-video w-full" alt="" />
                            </figure>
                            <div class="card-body gap-4">
                                <h2 class="card-title text-lg">
                                    <div class="text-base-content/50 text-sm">
                                        {{ $event->textline() }}
                                        <span class="sr-only">:</span>
                                    </div>
                                    {{ $event->title() }}
                                </h2>

                                <x-person-avatar-group :persons="$event->attendants()->toPages()" />

                                <div class="card-actions">
                                    <a href="{{ $event->url() }}" class="btn btn-sm btn-soft btn-accent">
                                        Mehr erfahren
                                        <x-icons.arrow-right-line class="max-sm:hidden size-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                </li>
                <!-- /timeline item -->
                @php $odd = !$odd; @endphp
            @endforeach
        </ul>
    </section>
</x-layout>
