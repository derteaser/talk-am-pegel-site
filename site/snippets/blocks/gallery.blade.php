@php
    /** @var Kirby\Cms\Block $block */

    /** @var Kirby\Cms\Files $images */
    $images = $block->images()->toFiles();
    $count = $images->count();

    if ($count == 1) {
        $cols = 'grid-cols-1';
    } elseif ($count % 3 == 0) {
        $cols = 'grid-cols-1 sm:grid-cols-3';
    } elseif ($count % 2 == 0) {
        $cols = 'grid-cols-1 sm:grid-cols-2';
    } else {
        $cols = 'grid-cols-1 sm:grid-cols-3';
    }
@endphp
<figure>
    <div class="grid {{ $cols }} gap-2 image-gallery not-prose">
        @foreach ($images as $image)
            <a href="{{ $image->thumb()->url() }}" class="aspect-3/2">
                <x-thumbnail :image="$image" srcset="landscape" :lazy="true" class="w-full h-full object-center object-cover m-0"
                    data-bp="{{ $image->thumb()->url() }}" />
            </a>
        @endforeach
    </div>
</figure>
