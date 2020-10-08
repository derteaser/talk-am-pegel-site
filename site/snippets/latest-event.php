<?php

use Kirby\Cms\Html;
use Kirby\Cms\Page;
use Kirby\Toolkit\Str;

/** @var Page $event */

$description = '';
if ($text = $event->text() && $blocks = $event->text()->toBlocks()) {
  if ($block = $blocks->filterBy('type', 'paragraph')->first()) {
    $description = Html::decode(Str::excerpt($block->content(), 400));
  }
}
?>
<section class="text-gray-700">
  <a href="<?= $event->url() ?>">
    <div class="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
      <div class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center" data-aos="fade-in">
        <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900"><?= $event->title()->widont() ?>
        </h1>
        <p class="mb-8 leading-relaxed"><?= $description ?></p>
        <button class="inline-flex text-white bg-tap-red-500 border-0 py-2 px-6 focus:outline-none hover:bg-tap-red-800 rounded text-lg">Mehr erfahren</button>
      </div>
      <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6" data-aos="flip-right" data-aos-delay="400">
        <img class="object-cover object-center rounded" alt="<?= $event->title() ?>" src="<?= $event->main_image()->toFile()->url() ?>">
      </div>
    </div>
  </a>
</section>