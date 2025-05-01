@php
    /** @var Kirby\Cms\Block $block */

    /** @var Kirby\Cms\Files $images */
    $images = $block->images()->toFiles();
@endphp
<figure id="centered" data-carousel='{ "loadingClasses": "opacity-0", "isCentered": true, "slidesQty": { "xs": 1, "lg": 2 } }'
    class="relative w-full">
    <div class="carousel">
        <div class="carousel-body">
            @foreach ($images as $image)
                <a href="{{ $image->thumb()->url() }}" class="carousel-slide aspect-3/2">
                    <x-thumbnail :image="$image" srcset="landscape" :lazy="true" class="w-full h-full object-center object-cover m-0"
                        data-bp="{{ $image->thumb()->url() }}" />
                </a>
            @endforeach
        </div>
    </div>
    <button type="button" class="carousel-prev">
        <span class="size-9.5 bg-base-100 flex items-center justify-center rounded-full shadow-base-300/20 shadow-sm">
            <x-icons.arrow-left-s-line class="size-5 cursor-pointer" />
        </span>
        <span class="sr-only">Zurück</span>
    </button>
    <!-- Next Slide -->
    <button type="button" class="carousel-next">
        <span class="sr-only">Weiter</span>
        <span class="size-9.5 bg-base-100 flex items-center justify-center rounded-full shadow-base-300/20 shadow-sm">
            <x-icons.arrow-right-s-line class="size-5 cursor-pointer" />
        </span>
    </button>
</figure>
