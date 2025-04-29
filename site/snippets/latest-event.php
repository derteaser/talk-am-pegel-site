<?php

use Kirby\Cms\Html;
use Kirby\Toolkit\Str;

/** @var EventPage $event */

$image = $event->main_image()->toFile();

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
  <div class="container mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
    <div class="lg:row-span-2 xl:col-span-2 lg:order-last" data-aos="fade-up" data-aos-delay="100">
      <picture>
        <source srcset="<?= $image->thumb(['format' => 'avif'])->url() ?>" type="image/avif">
        <source srcset="<?= $image->thumb(['format' => 'webp'])->url() ?>" type="image/webp">
        <img class="object-cover object-center rounded-sm w-full" alt="<?= $event->title() ?>" src="<?= $image
  ->thumb(['format' => 'jpg'])
  ->url() ?>">
      </picture>
    </div>
    <div class="lg:col-span-2 xl:col-span-3 flex flex-col items-start space-y-8" data-aos="fade-in">
      <h1 class="sm:text-4xl text-3xl font-semibold text-base-content"><?= $event->title()->widont() ?></h1>
      <p class="text-base-content leading-relaxed max-w-xl"><?= $description ?></p>
      <a href="<?= $event->url() ?>" class="btn btn-accent">Mehr erfahren</a>
    </div>
  </div>
</section>
