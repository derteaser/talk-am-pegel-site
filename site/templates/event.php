<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;

/** @var Page $page */
/** @var File $mainImage */
?>

<?php snippet('header') ?>
<?php snippet('hero-header', ['title' => $page->title(), 'subTitle' => $page->textline(), 'image' => $mainImage]) ?>

<section class="text-gray-700">
  <div class="container px-5 pt-6 pb-12 mx-auto flex flex-col">
    <div class="lg:w-4/6 mx-auto">
      <div class="flex flex-col sm:flex-row mt-10">
        <div class="sm:w-2/3 sm:pr-8 sm:py-8 sm:border-r border-gray-300 sm:border-b-0 border-b mb-4 pb-4 sm:mb-0 text-center sm:text-left">
          <p class="leading-relaxed text-lg mb-4"><?= $page->text()->blocks() ?></p>
        </div>
        <div class="sm:w-1/3 text-center sm:pl-8 sm:py-12">
          <div class="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
            <?php snippet('icon', ['name' => 'ticket', 'cssClasses' => 'fill-current w-16 h-16']) ?>
          </div>
          <div class="flex flex-col items-center text-center justify-center">
            <h2 class="font-medium title-font mt-4 text-gray-900 text-lg">Anmeldung</h2>
            <div class="w-12 h-1 bg-tap-blue-500 rounded mt-2 mb-4"></div>
            <p class="text-base text-gray-600">Für die Teilnahme an unserer Veranstaltung ist eine Anmeldung zwingend erforderlich. Bitte bestellen Sie nachfolgend Ihr kostenloses Ticket über unseren Partner Eventbrite!</p>
            <a class="btn btn-red mt-8" href="<?= $page->eventbrite_url() ?>" target="_blank" rel="noopener noreferrer">Kostenloses Ticket sichern</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-5 py-12 mx-auto">
    <div class="flex flex-wrap -m-4">
      <div class="p-4 w-full md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="100">
        <div class="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => 'calendar', 'cssClasses' => 'fill-current w-5 h-5 m-2']) ?>
            </div>
            <p class="text-gray-900 text-lg font-medium"><?= $page->date()->toDate('%e. %B %Y') ?></p>
          </div>
        </div>
      </div>
      <div class="p-4 w-full md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="300">
        <div class="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => 'clock', 'cssClasses' => 'fill-current w-5 h-5']) ?>
            </div>
            <p class="text-gray-900 text-lg font-medium"><?= $page->date()->toDate('%H:%M') ?> Uhr</p>
          </div>
        </div>
      </div>
      <div class="p-4 w-full lg:w-1/3" data-aos="zoom-in" data-aos-delay="500">
        <div class="flex rounded-lg h-full bg-gray-100 p-8 flex-col">
          <div class="flex items-center">
            <div class="w-8 h-8 mr-3 inline-flex items-center justify-center rounded-full bg-tap-blue-500 text-white flex-shrink-0">
              <?php snippet('icon', ['name' => 'map-marker', 'cssClasses' => 'fill-current w-5 h-5']) ?>
            </div>
            <p class="text-gray-900 text-lg font-medium"><?= $page->location_name() ?></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-5 pt-12 pb-24 mx-auto">
    <div class="flex flex-wrap -m-4">
      <?php foreach ($page->attendants()->toPages() as $person): ?>
        <?php snippet('person', ['person' => $person]) ?>
      <?php endforeach ?>
    </div>
  </div>
</section>
<?php snippet('footer') ?>