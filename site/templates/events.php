<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;
use Kirby\Toolkit\Str;

/** @var Page $page */
/** @var File $mainImage */
?>

<?php snippet('header') ?>
<?php snippet('hero-header', ['title' => $page->title(), 'subTitle' => $page->textline(), 'image' => $mainImage]) ?>

<section class="text-gray-700 body-font overflow-hidden">
  <div class="container px-5 py-24 mx-auto">
    <?php foreach ($page->children()->flip() as $event): ?>
      <div class="-my-8">
        <div class="py-8 flex flex-wrap md:flex-no-wrap">
          <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
            <span class="tracking-widest font-medium text-gray-900"><?= $event->date()->toDate('%e. %B %Y') ?></span>
            <span class="mt-1 text-gray-500 text-sm"><?= $event->textline() ?></span>
          </div>
          <div class="md:flex-grow">
            <h2 class="text-2xl font-medium text-gray-900 mb-2"><?= $event->title() ?></h2>
            <p class="leading-relaxed"><?= Str::excerpt($event->text()->toBlocks()->first(), 200, true) ?></p>
            <a href="<?= $event->url() ?>" class="text-tap-red-500 hover:text-tap-red-800 inline-flex items-center mt-4">Mehr erfahren
              <?php snippet('icon', ['name' => 'arrow-right', 'cssClasses' => 'fill-current w-4 h-4 ml-2']) ?>
            </a>
          </div>
        </div>
      </div>
    <?php endforeach ?>
  </div>
</section>

<?php snippet('footer') ?>