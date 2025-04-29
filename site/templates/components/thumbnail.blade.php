@props(['image', 'srcset' => 'default', 'alt' => null, 'sizes' => '(min-width: 600px) 50vw, 100vw', 'lazy' => true])

@if ($image && $srcset)
    @php
        switch ($srcset) {
            case 'wide':
                $originalSrcset = $image->srcset('wide');
                $webpSrcset = $image->srcset('webp_wide');
                //$avifSrcset = $image->srcset('avif_wide');
                $width = 1800;
                $height = 1013;
                break;
            case 'landscape':
                $originalSrcset = $image->srcset('landscape');
                $webpSrcset = $image->srcset('webp_landscape');
                //$avifSrcset = $image->srcset('avif_landscape');
                $width = 1800;
                $height = 1200;
                break;
            case 'portrait':
                $originalSrcset = $image->srcset('portrait');
                $webpSrcset = $image->srcset('webp_portrait');
                //$avifSrcset = $image->srcset('avif_portrait');
                $width = 1200;
                $height = 1800;
                break;
            case 'square':
                $originalSrcset = $image->srcset('square');
                $webpSrcset = $image->srcset('webp_square');
                //$avifSrcset = $image->srcset('avif_square');
                $width = 1800;
                $height = 1800;
                break;
            case 'default':
            default:
                $originalSrcset = $image->srcset();
                $webpSrcset = $image->srcset('webp');
                //$avifSrcset = $image->srcset('avif');
                $width = $image->resize(1800)->width();
                $height = $image->resize(1800)->height();
                break;
        }
    @endphp
    <picture>
        <source srcset="{{ $webpSrcset }}" sizes="{{ $sizes }}" type="image/webp">
        <img src="{{ $image->resize(600)->url() }}" srcset="{{ $originalSrcset }}" width="{{ $width }}" height="{{ $width }}"
            alt="{{ $alt ?? $image->description() }}" sizes="{{ $sizes }}" @if ($lazy) loading="lazy" @endif
            {{ $attributes }}>
    </picture>
@endif
