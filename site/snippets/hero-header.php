<?php

use Kirby\Cms\Field;
use Kirby\Cms\File;
use Kirby\Cms\Page;
use Kirby\Cms\Site;

/** @var Page $page */
/** @var ?File $mainImage */
/** @var Site $site */

$image = $mainImage ?: asset('/img/pegelbar.jpg');
$title = $page->herotitle() && $page->herotitle()->isNotEmpty() ? $page->herotitle() : $page->title();
$subTitle = $page->textline() ?: null;
$logo = asset('/img/logo.svg');
?>

<header class="bg-gray-900 flex-nowrap relative h-screen md:h-auto" x-data="{ scrolledAway: false }">
  <div class="fixed bg-tap-blue-600 bg-opacity-80 backdrop-blur-md w-full p-2 z-50"
       x-show="scrolledAway"
       x-transition:enter="transition ease-out duration-300 origin-top"
       x-transition:enter-start="opacity-0 -translate-y-12"
       x-transition:enter-end="opacity-100 scale-100 translate-y-0"
       x-transition:leave="transition ease-in duration-300 origin-top"
       x-transition:leave-start="opacity-100 translate-y-0"
       x-transition:leave-end="opacity-0 -translate-y-12"
       x-cloak>
    <a href="<?= $site->url() ?>" class="flex justify-center">
      <img src="<?= $logo->url() ?>" class="h-8" alt="">
    </a>
  </div>
  <picture>
    <source srcset="<?= $image->thumb(['format' => 'avif'])->url() ?>" type="image/avif">
    <source srcset="<?= $image->thumb(['format' => 'webp'])->url() ?>" type="image/webp">
    <img src="<?= $image->thumb(['format' => 'jpg'])->url() ?>" class="w-full h-full object-cover object-center block opacity-25 inset-0 absolute" alt="">
  </picture>

  <div class="relative z-10 pt-10 text-center w-full" x-intersect:leave="scrolledAway = true" x-intersect:enter="scrolledAway = false">
    <a href="<?= $site->url() ?>" class="flex justify-center">
      <?=
      svg('/img/logo.svg');
      ?>
    </a>
  </div>
  <div class="relative text-center z-10 py-40 mx-auto container">
    <h1 class="p-6 text-white font-thin leading-tight break-words text-5xl md:text-6xl xl:text-7xl" data-aos="fade-left"><?= $title ?></h1>
    <?php if ($subTitle && $subTitle->isNotEmpty()): ?>
      <p class="text-2xl text-gray-300 font-light" data-aos="fade-left" data-aos-delay="500"><?= $subTitle ?></p>
    <?php endif ?>
  </div>
  <div class="absolute bottom-0 z-10 text-center w-full pb-10 md:hidden">
    <a href="#content" class="w-10 h-10 inline-flex items-center justify-center rounded-full bg-tap-red-500 hover:bg-tap-red-800 text-white flex-shrink-0">
      <?php snippet('icon', ['name' => 'arrow-down', 'cssClasses' => 'stroke-current w-6 h-6']) ?>
    </a>
  </div>
</header>

<span id="content"></span>