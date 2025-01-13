<?php
/** @var Page $page */
/** @var App $kirby */
?>
<?php snippet('layout', slots: true); ?>

<section class="overflow-hidden text-gray-700 dark:text-gray-400">
  <div class="container px-5 py-24 mx-auto">
  <ul class="grid max-w-screen-sm gap-8 mx-auto sm:grid-cols-2">
      <?php foreach ($kirby->collection('persons') as $person): ?>
          <li>
            <h2 class="mb-2 text-2xl font-medium text-gray-900 dark:text-gray-100"><?= $person->title() ?></h2>
            <a href="<?= $person->url() ?>"
               class="inline-flex items-center text-tap-red-500 hover:text-tap-red-400">
              Mehr erfahren
              <?php snippet('icons/arrow-right-line', [
                'class' => 'size-5 ml-2',
              ]); ?>
            </a>
          </li>      
      <?php endforeach; ?>
    </ul>
  </div>
</section>
