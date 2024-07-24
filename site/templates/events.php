<?php

use Kirby\Cms\App;
use Kirby\Cms\Page;
use Kirby\Toolkit\Str;

/** @var Page $page */
/** @var App $kirby */
?>

<?php snippet('layout', slots: true); ?>

<section class="text-gray-700 dark:text-gray-400 overflow-hidden">
  <div class="container px-5 py-24 mx-auto">
    <?php foreach ($kirby->collection('events') as $event): ?>
      <div class="-my-8">
        <div class="py-8 flex flex-wrap md:flex-nowrap">
          <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
            <span class="tracking-widest font-medium text-gray-900 dark:text-gray-100"><?= $event
                ->date()
                ->toDate('%e. %B %Y') ?></span>
            <span class="mt-1 text-gray-500 text-sm"><?= $event->textline() ?></span>
          </div>
          <div class="md:flex-grow">
            <h2 class="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2"><?= $event->title() ?></h2>
            <p class="leading-relaxed">
              <?= Str::excerpt(
                $event
                  ->text()
                  ->toBlocks()
                  ->first(),
                400,
                true,
              ) ?>
            </p>
            <a href="<?= $event->url() ?>"
               class="text-tap-red-500 hover:text-tap-red-400 inline-flex items-center mt-4">
              Mehr erfahren
              <?php snippet('icons/arrow-right-line', ['class' => 'size-5 ml-2']); ?>
            </a>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</section>
