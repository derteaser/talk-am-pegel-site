<?php
/** @var PersonPage $page */
?>

<?php snippet('layout', slots: true); ?>
<section class="mx-auto mt-16 px-6 lg:px-24 xl:px-32 flex flex-col md:flex-row md:space-x-12 md:justify-center">
  <?php snippet('person', ['person' => $page]); ?>

  <ul class="space-y-6 pt-6">
    <?php foreach ($page->events() as $event): ?>
      <li>
        <p class="font-medium text-sm text-gray-600"><?= $event->date()->toDate('%e. %B %Y') ?></p>
        <a href="<?= $event->url() ?>" class="text-tap-red-500 hover:text-tap-red-400 inline-flex items-center">
          <?= $event->title() ?>
          <?php snippet('icon', ['name' => 'arrow-right', 'cssClasses' => 'fill-current w-4 h-4 ml-2']); ?>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
</section>