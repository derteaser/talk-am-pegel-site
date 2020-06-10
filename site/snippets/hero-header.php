<?php

use Kirby\Cms\Field;
use Kirby\Cms\File;
use Kirby\Cms\Site;

/** @var Field $title */
/** @var Field $subTitle */
/** @var File $image */
/** @var Site $site */

$imageUrl = $image ? $image->url() : "/assets/tap-tailwind/dist/img/pegelbar.jpg";
?>

<header class="bg-gray-900 flex-no-wrap relative h-screen md:h-auto">
  <img class="w-full h-full object-cover object-center block opacity-25 inset-0 absolute" src="<?= $imageUrl ?>" alt="">

  <div class="relative z-10 pt-10 text-center w-full">
    <a href="<?= $site->url() ?>"><img class="inline-block" src="/assets/tap-tailwind/dist/img/logo.svg" alt="<?= $site->title() ?>"></a>
  </div>
  <div class="relative text-center z-10 py-40 mx-auto container">
    <h1 class="p-6 text-white font-hairline leading-tight break-words text-5xl md:text-6xl" data-aos="fade-left"><?= $title ?></h1>
    <?php if ($subTitle->isNotEmpty()): ?>
      <p class="text-2xl text-gray-400 font-light" data-aos="fade-left" data-aos-delay="500"><?= $subTitle ?></p>
    <?php endif ?>
  </div>
</header>
