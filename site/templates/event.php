<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;

/** @var Page $page */
?>

<?php layout() ?>

<section class="text-gray-700">
  <div class="container px-5 pt-6 pb-12 mx-auto flex flex-col">
    <div class="lg:w-4/6 mx-auto">
      <?php if ($page->date()->toDate() > time()): ?>
        <div class="flex flex-col sm:flex-row mt-10">
          <div class="sm:w-2/3 sm:pr-8 sm:py-8 sm:border-r border-gray-300 sm:border-b-0 border-b mb-4 pb-4 sm:mb-0">
            <div class="mb-4 prose dark:prose-dark"><?= $page->text()->toBlocks() ?></div>
          </div>
          <div class="sm:w-1/3 text-center sm:pl-8 sm:py-12">
            <div class="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400">
              <?php snippet('icon', ['name' => 'ticket', 'cssClasses' => 'fill-current w-16 h-16']) ?>
            </div>
            <div class="flex flex-col items-center text-center justify-center">
              <h2 class="font-medium title-font mt-4 text-gray-900 text-lg">Anmeldung</h2>
              <div class="w-12 h-1 bg-tap-blue-500 rounded mt-2 mb-4"></div>
              <p class="text-base text-gray-600 dark:text-gray-300">Für die Teilnahme an unserer Veranstaltung ist eine Anmeldung zwingend erforderlich. Bitte bestellen Sie nachfolgend Ihr kostenloses Ticket über unseren Partner Eventbrite!</p>
              <a class="btn btn-red mt-8" href="<?= $page->eventbrite_url() ?>" target="_blank" rel="noopener noreferrer">Kostenloses Ticket sichern</a>
            </div>
          </div>
        </div>
      <?php else: ?>
        <div class="mt-10 mb-4 prose dark:prose-dark mx-auto"><?= $page->text()->toBlocks() ?></div>
      <?php endif ?>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-5 py-12 mx-auto">
    <div class="flex flex-wrap -m-4">
      <div class="p-4 w-full md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="100">
        <div class="flex rounded-lg h-full bg-gray-100 dark:bg-gray-800 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => 'calendar', 'cssClasses' => 'fill-current w-5 h-5 m-2']) ?>
            </div>
            <p class="text-gray-900 dark:text-gray-200 text-lg font-medium"><?= $page->date()->toDate('%e. %B %Y') ?></p>
          </div>
        </div>
      </div>
      <div class="p-4 w-full md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="300">
        <div class="flex rounded-lg h-full bg-gray-100 dark:bg-gray-800 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => 'clock', 'cssClasses' => 'fill-current w-5 h-5']) ?>
            </div>
            <p class="text-gray-900 dark:text-gray-200 text-lg font-medium"><?= $page->date()->toDate('%H:%M') ?> Uhr</p>
          </div>
        </div>
      </div>
      <div class="p-4 w-full lg:w-1/3" data-aos="zoom-in" data-aos-delay="500">
        <div class="flex rounded-lg h-full bg-gray-100 dark:bg-gray-800 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => $page->is_virtual()->toBool() ? 'video-camera' : 'location-marker', 'cssClasses' => 'fill-current w-5 h-5']) ?>
            </div>
            <p class="text-gray-900 dark:text-gray-200 text-lg font-medium"><?= $page->location_name() ?></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-20 sm: px-12 md:px-5 pt-12 pb-24 mx-auto">
    <div class="flex flex-wrap justify-center -m-4">
      <?php foreach ($page->attendants()->toPages() as $person): ?>
        <?php snippet('person', ['person' => $person]) ?>
      <?php endforeach ?>
    </div>
  </div>
</section>

<nav class="bg-gray-300 dark:bg-gray-800 py-4 px-3 md:px-8">
  <div class="grid grid-cols-2 divide-x divide-gray-400 dark:divide-gray-700 items-center">
    <?php if ($prev = $page->prev()): ?>
      <div class="p-2">
        <a href="<?= $prev->url() ?>" class="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 flex flex-row items-center">
          <?php snippet('icon', ['name' => 'chevron-left', 'cssClasses' => 'stroke-current w-12 h-12 float-right mr-4']) ?>
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium"><?= $prev->textline() ?></p>
            <p><?= $prev->title() ?></p>
          </div>
        </a>
      </div>
    <?php else: ?>
      <div></div>
    <?php endif ?>
    <?php if ($next = $page->next()): ?>
      <div class="p-2 text-right">
        <a href="<?= $next->url() ?>" class="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 flex flex-row-reverse items-center">
          <?php snippet('icon', ['name' => 'chevron-right', 'cssClasses' => 'stroke-current w-12 h-12 float-right ml-4']) ?>
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm uppercase font-medium"><?= $next->textline() ?></p>
            <p><?= $next->title() ?></p>
          </div>
        </a>
      </div>
    <?php endif ?>
  </div>
</nav>