<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;

/** @var Page $page */
/** @var Page $latestEvent */
/** @var File $mainImage */
?>

<?php snippet('header') ?>

<?php snippet('hero-header', ['title' => $page->herotitle(), 'subTitle' => $page->textline(), 'image' => $mainImage]) ?>

<?php snippet('latest-event', ['event' => $latestEvent]) ?>

<?php snippet('footer') ?>