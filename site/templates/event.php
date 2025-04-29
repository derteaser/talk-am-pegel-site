<?php
/** @var EventPage $page */
?>

<?php snippet('layout', slots: true); ?>

<section class="text-gray-700">
  <div class="container flex flex-col px-5 pt-6 pb-12 mx-auto">
    <div class="mx-auto lg:w-4/6">
      <?php if ($page->date()->toDate() > time()): ?>
        <div class="flex flex-col mt-10 sm:flex-row">
          <div class="pb-4 mb-4 border-b border-base-100 sm:w-2/3 sm:pr-8 sm:py-8 sm:border-r sm:border-b-0 sm:mb-0">
            <div class="mb-4 blocks"><?= $page->text()->toBlocks() ?></div>
          </div>
          <div class="text-center sm:w-1/3 sm:pl-8 sm:py-12">
            <div
              class="inline-flex items-center justify-center w-20 h-20 text-gray-400 bg-gray-200 rounded-full dark:bg-gray-700">
              <?php snippet('icons/ticket-2-line', ['class' => 'fill-current size-16']); ?>
            </div>
            <div class="flex flex-col items-center justify-center text-center">
              <h2 class="mt-4 text-lg font-medium text-gray-900 title-font">Anmeldung</h2>
              <div class="w-12 h-1 mt-2 mb-4 rounded-sm bg-primary"></div>
              <p class="text-base text-gray-600 dark:text-gray-300">Für die Teilnahme an unserer Veranstaltung ist eine
                Anmeldung zwingend erforderlich. Bitte bestellen Sie nachfolgend Ihr kostenloses Ticket über unseren
                Partner Eventbrite!</p>
              <a class="mt-8 btn btn-red" href="<?= $page->eventbrite_url() ?>" target="_blank"
                 rel="noopener noreferrer" onclick="fathom.trackGoal('DZC4R54V', 0);">Kostenloses Ticket sichern</a>
            </div>
          </div>
        </div>
      <?php else: ?>
        <div class="mx-auto mt-10 mb-4 blocks"><?= $page->text()->toBlocks() ?></div>
      <?php endif; ?>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-5 py-12 mx-auto">
    <div class="flex flex-wrap -m-4">
      <div class="w-full p-4 md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="100">
        <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
          <div class="flex items-center">
            <div
              class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
              <?php snippet('icons/calendar-event-fill', ['class' => 'size-5']); ?>
            </div>
            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page
              ->date()
              ->toDate('%e. %B %Y') ?></p>
          </div>
        </div>
      </div>
      <div class="w-full p-4 md:w-1/2 lg:w-1/3" data-aos="zoom-in" data-aos-delay="300">
        <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
          <div class="flex items-center">
            <div
              class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
              <?php snippet('icons/time-fill', ['class' => 'size-5']); ?>
            </div>
            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page
              ->date()
              ->toDate('%H:%M') ?> Uhr</p>
          </div>
        </div>
      </div>
      <div class="w-full p-4 lg:w-1/3" data-aos="zoom-in" data-aos-delay="500">
        <div class="flex flex-col h-full p-8 bg-base-300 rounded-lg dark:bg-gray-800">
          <div class="flex items-center">
            <div
              class="inline-flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-white rounded-full bg-primary">
              <?php if ($page->is_virtual()->toBool()): ?>
                <?php snippet('icons/live-fill', ['class' => 'size-5']); ?>
              <?php else: ?>
                <?php snippet('icons/map-pin-2-fill', ['class' => 'size-5']); ?>
              <?php endif; ?>
            </div>
            <p class="text-lg font-medium text-gray-900 dark:text-gray-200"><?= $page->location_name() ?></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="text-gray-700">
  <div class="container px-12 pt-12 pb-24 mx-auto sm: md:px-5">
    <div class="flex flex-wrap justify-center -m-4">
      <?php foreach ($page->attendants()->toPages() as $person): ?>
        <?php snippet('person', ['person' => $person]); ?>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<nav class="px-3 py-4 bg-gray-300 dark:bg-gray-800 md:px-8">
  <div class="grid items-center grid-cols-2 divide-x divide-gray-400 dark:divide-gray-700">
    <?php if ($prev = $page->prev()): ?>
      <div class="p-2">
        <a href="<?= $prev->url() ?>" rel="prev"
           class="flex flex-row items-center text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
          <?php snippet('icons/arrow-left-s-line', ['class' => 'size-16 float-right mr-4']); ?>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase dark:text-gray-400"><?= $prev->textline() ?></p>
            <p><?= $prev->title() ?></p>
          </div>
        </a>
      </div>
    <?php else: ?>
      <div></div>
    <?php endif; ?>
    <?php if ($next = $page->next()): ?>
      <div class="p-2 text-right">
        <a href="<?= $next->url() ?>" rel="next"
           class="flex flex-row-reverse items-center text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100">
          <?php snippet('icons/arrow-right-s-line', ['class' => 'size-16 float-right ml-4']); ?>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase dark:text-gray-400"><?= $next->textline() ?></p>
            <p><?= $next->title() ?></p>
          </div>
        </a>
      </div>
    <?php endif; ?>
  </div>
</nav>
