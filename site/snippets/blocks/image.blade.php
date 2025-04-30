@php
    /** @var \Kirby\Cms\Block $block */
@endphp
@if ($block->image()->isNotEmpty())
    @php
        $caption = $block->caption();
        $crop = $block->crop()->isTrue();
        $link = $block->link();
        $ratio = $block->ratio()->or('auto');
        $image = $block->image()->toFile();
        $credits = $image->credits();
        $alt = $block->alt()->or($image->alt()->or($image->description()));
        $width = $block->width()->or('md');

        $aspectClass = match ($ratio->value()) {
            '16/9' => 'aspect-video object-contain',
            '3/2' => 'aspect-3/2 object-contain',
            '1/1' => 'aspect-square object-contain',
            default => null,
        };

        $srcset = 'default';
        if ($crop) {
            $srcset = match ($ratio->value()) {
                '16/9' => 'wide',
                '3/2' => 'landscape',
                '1/1' => 'square',
                default => 'default',
            };
        }

        $widthClass = match ($width->value()) {
            'sm' => 'max-w-(--breakpoint-sm)!',
            'md' => 'max-w-(--breakpoint-md)!',
            'lg' => 'max-w-(--breakpoint-lg)!',
            'xl' => 'max-w-(--breakpoint-xl)!',
            default => null,
        };
    @endphp

    <figure class="{{ $widthClass }}">
        @if ($link->isNotEmpty())
            <a href="{!! Str::esc($link->toUrl()) !!}">
        @endif
        <x-thumbnail :image="$image" :srcset="$srcset" :alt="$alt->esc()" :class="$aspectClass" />
        @if ($link->isNotEmpty())
            </a>
        @endif

        @if ($caption->isNotEmpty())
            <figcaption>
                {{ $caption }}
            </figcaption>
        @endif

        @if ($credits->isNotEmpty())
            <aside class="credits">
                Foto: {{ $credits }}
            </aside>
        @endif
    </figure>
@endif
