<?php
use Kirby\Cms\File;

/** @var DefaultPage $page */
/** @var File $mainImage */
?>

<?php layout() ?>
<section class="container mx-auto prose dark:prose-dark mt-16 px-6">
  <?= $page->text()->toBlocks() ?>
</section>
