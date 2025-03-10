<?php
use Kirby\Cms\Block;
use Kirby\Cms\File;
use Kirby\Cms\Files;

/** @var Block $block */

/** @var Files $images */
$images = $block->images()->toFiles();
$count = $images->count();

if ($count == 1) {
  $cols = 'grid-cols-1';
} elseif ($count % 3 == 0) {
  $cols = 'grid-cols-1 sm:grid-cols-3';
} elseif ($count % 2 == 0) {
  $cols = 'grid-cols-1 sm:grid-cols-2';
} else {
  $cols = 'grid-cols-1 sm:grid-cols-3';
}
?>
<figure>
  <div class="grid <?= $cols ?> gap-2 image-gallery not-prose">
    <?php /** @var File $image */ foreach ($images as $image): ?>
      <a href="<?= $image->thumb()->url() ?>" class="aspect-3/2">
        <img class="w-full h-full object-center object-cover m-0" src="<?= $image->thumb('gallery')->url() ?>" data-bp="<?= $image->thumb()->url() ?>" alt="">
      </a>
    <?php endforeach ?>
  </div>
</figure>
