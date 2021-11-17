<?php
use Kirby\Cms\File;

/** @var DefaultPage $page */
/** @var File $mainImage */
?>

<?php snippet('header') ?>
<?php snippet('hero-header', ['title' => $page->title(), 'subTitle' => '', 'image' => $mainImage]) ?>
<section class="container mx-auto prose dark:prose-dark mt-16 px-6">
  <?= $page->text()->toBlocks() ?>
</section>
<?php snippet('footer') ?>
