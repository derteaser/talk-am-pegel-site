<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;

/** @var Page $page */
/** @var File $mainImage */
?>

<?php snippet('header') ?>
<?php snippet('hero-header', ['title' => $page->title(), 'subTitle' => $page->textline(), 'image' => $mainImage]) ?>
<section class="container mx-auto prose dark:prose-dark mt-16 px-6">
  <?= $page->text()->blocks() ?>
</section>
<?php snippet('footer') ?>
