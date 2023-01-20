<?php
use Kirby\Cms\File;
/** @var DefaultPage $page */
/** @var File $mainImage */
?>

<?php snippet('layout', slots: true); ?>
<section class="container mx-auto blocks mt-16 px-6">
  <?= $page->text()->toBlocks() ?>
</section>
