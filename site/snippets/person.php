<?php
/** @var PersonPage $person */
?>
<article class="p-4 lg:w-1/5 md:w-1/3 sm:w-1/2 relative" data-aos="flip-right">
  <div class="h-full flex flex-col items-center text-center pb-2">
    <img alt="<?= $person->title() ?>" class="flex-shrink-0 rounded-full object-cover object-center mb-4" src="<?= $person->main_image()->toFile()->thumb('person')->url() ?>">
    <div class="w-full">
      <h2 class="font-medium text-lg text-gray-900 dark:text-gray-100"><?= $person->title() ?></h2>
      <p class="mb-4 text-gray-600 dark:text-gray-400"><?= $person->sub_heading() ?></p>
    </div>
    <div class="w-full absolute bottom-0">
      <span class="inline-flex">
        <?php if ($person->website()->isNotEmpty()): ?>
          <a class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200" href="<?= $person->website() ?>">
            <?php snippet('icon', ['name' => 'globe-alt', 'cssClasses' => 'stroke-current w-5 h-5']) ?>
          </a>
        <?php endif ?>
        <?php if ($person->linkedin()->isNotEmpty()): ?>
          <a class="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200" href="<?= $person->linkedin() ?>">
            <?php snippet('icon', ['name' => 'linkedin', 'cssClasses' => 'fill-current w-5 h-5']) ?>
          </a>
        <?php endif ?>
        <?php if ($person->xing()->isNotEmpty()): ?>
          <a class="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200" href="<?= $person->xing() ?>">
            <?php snippet('icon', ['name' => 'xing', 'cssClasses' => 'fill-current w-5 h-5']) ?>
          </a>
        <?php endif ?>
      </span>
    </div>
  </div>
</article>
