<?php

use Kirby\Cms\Html;
use Kirby\Toolkit\Str;

/** @var EventPage $event */

$description = '';
$text = $event->text();
$blocks = $event->text()->toBlocks();
if ($text && $blocks) {
    $block = $blocks->filterBy('type', 'text')->first();
    if ($block) {
        $description = Html::decode(Str::excerpt($block, 400));
    }
}
?>
<section>
    <article class="container mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div class="lg:row-span-2 xl:col-span-2 lg:order-last aos aos-fade-up" x-data="{ visible: false }" x-intersect="visible = true"
            :class="visible && 'visible'" x-cloak>
            <x-thumbnail :image="$event->mainImage()" srcset="wide" class="object-cover object-center rounded-sm w-full" alt="" />
        </div>
        <div class="lg:col-span-2 xl:col-span-3 flex flex-col items-start space-y-8 aos" x-data="{ visible: false }"
            x-intersect="setTimeout(function() { visible = true }, 200)" :class="visible && 'visible'">
            <h1 class="sm:text-4xl text-3xl font-semibold text-base-content">{!! $event->title()->widont() !!}</h1>
            <p class="text-base-content/60 text-sm">{{ $event->textline() }} am {{ $event->date()->toDate('%e. %B %Y') }}</p>
            <p class="text-base-content leading-relaxed max-w-xl">{{ $description }}</p>
            <a href="{{ $event->url() }}" class="btn btn-accent">Mehr erfahren</a>
        </div>
    </article>

    <aside class="text-center">
        <a href="{{ $event->parent()->url() }}" class="btn btn-primary btn-outline">Frühere Talks</a>
    </aside>
</section>
