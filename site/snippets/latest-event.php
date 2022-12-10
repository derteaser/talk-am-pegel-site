<?php

use Kirby\Cms\Html;
use Kirby\Toolkit\Str;

/** @var EventPage $event */

$image = $event->main_image()->toFile();

$description = '';
if ($text = $event->text() && $blocks = $event->text()->toBlocks()) {
  if ($block = $blocks->filterBy('type', 'text')->first()) {
    $description = Html::decode(Str::excerpt($block, 400));
  }
}
?>
<section class="text-gray-700 dark:text-gray-300">
  <a href="<?= $event->url() ?>" class="group">
    <div class="container mx-auto flex px-5 py-24 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      <h1 class="title-font sm:text-4xl text-3xl font-medium text-gray-900 dark:text-gray-100 lg:col-span-2 xl:col-span-3"><?= $event->title()->widont() ?></h1>
      <div class="lg:row-span-2 xl:col-span-2 lg:order-last" data-aos="fade-up" data-aos-delay="400">
        <picture>
          <source srcset="<?= $image->thumb(['format' => 'avif'])->url() ?>" type="image/avif">
          <source srcset="<?= $image->thumb(['format' => 'webp'])->url() ?>" type="image/webp">
          <img class="object-cover object-center rounded w-full" alt="<?= $event->title() ?>" src="<?= $image->thumb(['format' => 'jpg'])->url() ?>">
        </picture>
      </div>
      <div class="lg:col-span-2 xl:col-span-3 flex flex-col items-start" data-aos="fade-in">
        <p class="mb-8 leading-relaxed max-w-screen-sm"><?= $description ?></p>
        <button type="button" class="inline-flex text-white bg-tap-red-500 border-0 py-2 px-6 focus:outline-none group-hover:bg-tap-red-800 rounded text-lg">Mehr erfahren</button>
      </div>
    </div>
  </a>
</section>