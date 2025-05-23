@php

    use Kirby\Cms\Page;
    use Kirby\Cms\Site;

    /** @var Page $page */
    /** @var Site $site */

    $image = asset('/img/pegelbar.jpg');
    if ($page instanceof \App\Interfaces\MainImageHolder && $page->mainImage()) {
        $image = $page->mainImage();
    }
    $title = $page->herotitle() && $page->herotitle()->isNotEmpty() ? $page->herotitle() : $page->title();
    $subTitle = $page->textline() ?: null;
@endphp

<header class="bg-neutral relative h-svh md:h-auto" x-data="{ scrolledAway: false }">
    <div class="fixed bg-tap-alpha-blue-light/80 dark:bg-tap-alpha-blue-dark/80 backdrop-blur-md w-full p-2 z-50" x-show="scrolledAway"
        x-transition:enter="transition ease-out duration-300 origin-top" x-transition:enter-start="opacity-0 -translate-y-12"
        x-transition:enter-end="opacity-100 scale-100 translate-y-0" x-transition:leave="transition ease-in duration-300 origin-top"
        x-transition:leave-start="opacity-100 translate-y-0" x-transition:leave-end="opacity-0 -translate-y-12" x-cloak>
        <a href="<?= $site->url() ?>" class="flex justify-center">
            <img src="{{ asset('/img/logo.svg')->url() }}" class="h-8" alt="">
        </a>
    </div>

    <x-thumbnail :image="$image" sizes="100vw" class="w-full h-full object-cover object-center block opacity-20 inset-0 absolute"
        alt="" />

    <div class="h-full flex flex-col justify-around items-center">
        <div class="relative z-10 pt-10 text-center w-full" x-intersect:leave="scrolledAway = true"
            x-intersect:enter="scrolledAway = false">
            <a href="<?= $site->url() ?>" class="flex justify-center">
                @svg('/img/logo.svg')
            </a>
        </div>
        <div class="flex flex-col items-center justify-center text-center z-10 flex-1 mx-auto container md:py-40">
            <h1 class="p-6 text-white font-thin leading-tight break-words text-5xl md:text-6xl xl:text-7xl aos aos-fade-left"
                x-data="{ visible: false }" x-intersect.once="visible = true" :class="visible && 'visible'">
                {{ $title }}
            </h1>
            @if ($subTitle && $subTitle->isNotEmpty())
                <p class="text-2xl text-gray-300 font-light aos aos-fade-left" x-data="{ visible: false }"
                    x-intersect.once="setTimeout(function() { visible = true }, 500)" :class="visible && 'visible'">
                    {{ $subTitle }}
                </p>
            @endif
        </div>
        <div class="z-10 text-center w-full md:hidden py-6">
            <a href="#content" class="btn btn-accent btn-circle btn-lg">
                <x-icons.arrow-down-line class="size-6 shrink-0" />
            </a>
        </div>
    </div>
</header>

<span id="content"></span>
