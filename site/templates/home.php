<?php
use Kirby\Cms\File;
use Kirby\Cms\Page;

/** @var Page $page */
/** @var Page $latestEvent */
?>

<?php snippet('layout', slots: true); ?>

<?php snippet('latest-event', ['event' => $latestEvent]); ?>
