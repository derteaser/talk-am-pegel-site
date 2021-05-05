<?php

use Kirby\Cms\Field;
use Kirby\Cms\File;
use Kirby\Cms\Site;

/** @var Field $title */
/** @var Field $subTitle */
/** @var File $image */
/** @var Site $site */

$imageUrl = $image ? $image->url() : url('/img/pegelbar.jpg');
?>

<header class="bg-gray-900 flex-nowrap relative h-screen md:h-auto">
  <img class="w-full h-full object-cover object-center block opacity-25 inset-0 absolute" src="<?= $imageUrl ?>" alt="">

  <div class="relative z-10 pt-10 text-center w-full">
    <a href="<?= $site->url() ?>"><img class="inline-block" src="<?= url('/img/logo.svg') ?>" alt="<?= $site->title() ?>"></a>
  </div>
  <div class="relative text-center z-10 py-40 mx-auto container">
    <h1 class="p-6 text-white font-thin leading-tight break-words text-5xl md:text-6xl xl:text-7xl" data-aos="fade-left"><?= $title ?></h1>
    <?php if ($subTitle->isNotEmpty()): ?>
      <p class="text-2xl text-gray-300 font-light" data-aos="fade-left" data-aos-delay="500"><?= $subTitle ?></p>
    <?php endif ?>
  </div>
  <div class="absolute bottom-0 z-10 text-center w-full pb-10 md:hidden">
    <a href="#content" class="w-10 h-10 inline-flex items-center justify-center rounded-full bg-tap-red-500 hover:bg-tap-red-800 text-white flex-shrink-0">
      <?php snippet('icon', ['name' => 'arrow-down', 'cssClasses' => 'fill-current w-6 h-6']) ?>
    </a>
  </div>
</header>

<span id="content"></span>