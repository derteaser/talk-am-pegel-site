<article class="p-4 w-full lg:w-1/5 md:w-1/3 sm:w-1/2 relative {{ $animate ? 'aos aos-fade-up' : '' }}"
    @if ($animate) x-data="{ visible: false }"
    x-intersect.once="setTimeout(function() { visible = true }, {{ $animationDelay }})" :class="visible && 'visible'" @endif>
    <div class="h-full flex flex-col items-center text-center pb-2">
        @if ($person->mainImage())
            <figure class="avatar">
                <div class="size-full rounded-full">
                    <x-thumbnail :image="$person->mainImage()" srcset="square" class="size-full" alt="" />
                </div>
            </figure>
        @else
            <figure class="avatar avatar-placeholder w-full">
                <div class="bg-neutral text-neutral-content size-full rounded-full">
                    <span class="text-9xl uppercase" aria-hidden="true">{{ $person->initials() }}</span>
                </div>
            </figure>
        @endif

        <div class="w-full mt-4">
            <h2 class="font-medium text-lg text-base-content/90">{{ $person->title() }}</h2>
            <p class="mb-4 text-base-content/60">{{ $person->sub_heading() }}</p>
        </div>
        <div class="w-full absolute bottom-0">
            <span class="inline-flex">
                @if ($person->website()->isNotEmpty())
                    <a class="text-base-content/50 hover:text-base-content/70 tooltip" href="<?= $person->website() ?>">
                        <x-icons.global-line class="size-5 tooltip-toggle" />
                        <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                            <span class="tooltip-body">Website von {{ $person->title() }}</span>
                        </span>
                    </a>
                @endif
                @if ($person->linkedin()->isNotEmpty())
                    <a class="ml-2 text-base-content/50 hover:text-base-content/70 tooltip" href="<?= $person->linkedin() ?>">
                        <x-icons.linkedin-box-fill class="size-5 tooltip-toggle" />
                        <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                            <span class="tooltip-body">{{ $person->title() }} bei LinkedIn</span>
                        </span>
                    </a>
                @endif
                @if ($person->xing()->isNotEmpty())
                    <a class="ml-2 text-base-content/50 hover:text-base-content/70 tooltip" href="<?= $person->xing() ?>">
                        <x-icons.xing-fill class="size-5 tooltip-toggle" />
                        <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                            <span class="tooltip-body">{{ $person->title() }} bei Xing</span>
                        </span>
                    </a>
                @endif
            </span>
        </div>
    </div>
</article>
