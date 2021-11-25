<?php
use Kirby\Cms\File;
use Kirby\Cms\Html;
use Kirby\Cms\Page;
use Kirby\Cms\Site;

/** @var Page $page */
/** @var Site $site */
?>

<?php layout() ?>
<section class="container mx-auto mt-16 px-6 lg:px-24 xl:px-32 text-center dark:text-gray-200">
  <h2 class="text-xl mb-4 leading-relaxed"><?= $site->title() ?></h2>
  <p><?= $site->address1() ?></p>
  <p><?= $site->address2() ?></p>
  <p><?= $site->postal_code() ?> <?= $site->city() ?></p>
  <p class="mt-3"><?= Html::tel($site->phone(), null, ['class' => 'text-tap-red-500 hover:text-tap-red-600']) ?></p>
  <p><?= Html::email($site->email(), null, ['class' => 'text-tap-red-500 hover:text-tap-red-600']) ?></p>

  <div class="flex justify-center mt-6">
    <?php foreach ($page->contact_persons()->toPages() as $person): ?>
      <?php snippet('person', ['person' => $person]) ?>
    <?php endforeach ?>
  </div>
</section>